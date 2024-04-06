import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import {Col, Divider, Flex, FloatButton, Row} from "antd";
import {
    MenuOutlined,
    SettingOutlined,
    EuroOutlined,
    TikTokOutlined, UserOutlined, QrcodeOutlined
} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import ModalLogin from "@/components/login";
import {useTranslations} from 'next-intl';
import TaskPanel from "@/components/taskPanel";
import ProgressBarComponent from "@/components/ProgressBar";
import HeaderPanel from "@/components/header";
import MaskedHighlight from "@/components/MaskedHighlight";
import ISSForm from "@/components/iss";
import commandDataContainer from "@/container/command";
import Deposit from "@/components/deposit";
import LiveChat from "@/components/LiveChat";
import {getMQTTBroker, Streaming_Server} from "@/common";
import AIInstructComponent from "@/components/AIInstruct";
import QRCodeComponent from "@/components/QRCode";
import mqtt from "mqtt";

export default function Layout({ children, title, description, onChangeId, onRefresh }) {
    const [open, setOpen] = useState(true);
    const [editISS, setEditISS] = useState(false);
    const [openCode, setOpenCode] = useState(false);
    const [openLive, setOpenLive] = useState(false);
    const [openInstruct, setOpenInstruct] = useState(false);
    const [openCall, setOpenCall] = useState(false);
    const [openDeposit, setOpenDeposit] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [availableIds, setAvailableIds] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [activeName, setActiveName] = useState("");
    const [guide, setGuide] = useState(false)
    const [loading, setLoading] = useState(false);
    const [userFeed, setUserFeed] = useState([{children:"新的一天开始了"}]);
    const command = commandDataContainer.useContainer()
    const [userISS, setUserISS] = useState();
    const [client, setClient] = useState(null);
    const t = useTranslations('Login');

    const zones = [
        { id: 'zone1', top: 260, left: 110, height:220, width:320,
            tips: '每天在这里设置一个话题，可以增加和别人交谈的机会哦'},
        { id: 'zone2', top: 480, left: 110, height:220, width:320,
            tips: '如果你有一些专业的知识，在这里上传，别人会很愿意和你聊天哦'},
        { id: 'zone3', top: 270, left: 450, height:140, width:860,
            tips: '这里显示你的Pato的聊天记录，可以按时间查询' },
    ];

    const showProgressBar = (show) => {
        setLoading(show)
    }
    const changeLoginState = (status) =>{
        setIsLogin(status);
    }
    const onChange = () => {
        setOpen(!open);
    };
    useEffect(()=>{
        const mqttClient = mqtt.connect(getMQTTBroker());
        mqttClient.on("connect", () => {
            console.log("Feed Connected to MQTT broker");
        });
        mqttClient.on("error", (err) => {
            console.error("Error connecting to MQTT broker:", err);
        });
        setClient(mqttClient);

        return () => {
            mqttClient.end(); // Clean up the connection on component unmount
        };
    },[])

    useEffect(() => {
        const localInfoStr = localStorage.getItem("local_patos")
        if (localInfoStr === null) {
            setIsLogin(false);
        }else {
            const localInfo = JSON.parse(localInfoStr)
            setActiveId(localInfo.active_id);
            onChangeId(localInfo.active_id);
            setIsLogin(true);
            const ids = localInfo.ids;
            const idsMap = ids.map((id) => {
                const id_name = id.split(":")
                if (id_name.length > 1){
                    return {label: id.split(":")[1], value: id.split(":")[0]};
                }
            });
            // console.log(idsMap)
            idsMap.forEach((item) => {
                if (item.value === activeId) {
                    setActiveName(item.label);
                    onRefresh(item.label)
                }
            });
            setAvailableIds(idsMap);
            command.getPatoISS(localInfo.active_id).then((res) => {
                setUserISS(res)
            })
        }
    },[activeId]);

    useEffect(() => {
        if (client) {
            const msg_feed = activeId;
            // Handler for incoming messages
            const onMessage = async (topic, message) => {
                console.log("receive ", topic, " ", message.toString())
                if (topic === msg_feed){
                    let item = {children: message.toString()}
                    setUserFeed((prevFeed)=>{
                        const newFeed = [...prevFeed]
                        if (newFeed.length >= 10){
                            newFeed.shift()
                        }
                        newFeed.push(item)
                        return newFeed
                    })
                }
            };

            // Subscribe to the topic
            client.subscribe([msg_feed], (err) => {
                if (!err) {
                    console.log("Feed Subscribed to topic: ", [msg_feed]);
                    client.on('message', onMessage);
                }
            });

            // Return a cleanup function to unsubscribe and remove the message handler
            return () => {
                if (client) {
                    client.unsubscribe([msg_feed]);
                    client.removeListener('message', onMessage);
                }
            };
        }
    }, [client]);

    return (
        <div className={styles.container}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content={description}/>
            <meta name="og:title" content={title} />
          </Head>
            {isLogin ?
                <>
                    <Row justify="space-between">
                        <Col span={24}>
                            <HeaderPanel activeName={activeName} activeId={activeId} onChangeId={changeLoginState} userFeed={userFeed}/>
                        </Col>
                    </Row>
                    <Divider/>
                    <Row justify="space-between">
                        <Col span={6}>
                            <TaskPanel id={activeId} onShowProgress={showProgressBar} panelWidth={300}/>
                        </Col>
                        <Col span={17}>
                            {children}
                        </Col>
                    </Row>
                </>
                :
                <Image priority src="/images/ai-town.jpg" fill style={{objectFit: 'cover',}} alt={"map"}/>
            }
            <MaskedHighlight zones={zones} visible={guide} />
            <ProgressBarComponent visible={loading} steps={30} />
            <FloatButton.Group open={open} trigger="click" style={{right: 64}} onClick={onChange} icon={<MenuOutlined/>}>
                <FloatButton onClick={()=>{setOpenInstruct(true)}} icon={<UserOutlined/>}/>
                <FloatButton onClick={()=>{setOpenLive(true)}} icon={<TikTokOutlined/>}/>
                {/*<FloatButton onClick={()=>{setOpenCall(true)}} icon={<PhoneOutlined/>}/>*/}
                <FloatButton onClick={()=>{setOpenDeposit(true)}} icon={<EuroOutlined />}/>
                <FloatButton onClick={()=>{setEditISS(true)}} icon={<SettingOutlined />}/>
                <FloatButton onClick={()=>{setOpenCode(true)}} icon={<QrcodeOutlined />}/>
                {/*<FloatButton onClick={()=>onRefresh()} icon={<RedoOutlined/>}/>*/}
            </FloatButton.Group>
            <ModalLogin isOpen={!isLogin} tips={t} options={availableIds}
                        onClose={(id) => {
                            setIsLogin(true)
                            if (id !== '') {
                                setActiveId(id)
                                const localInfoStr = localStorage.getItem("local_patos")
                                if (localInfoStr !== null) {
                                    let localInfo = JSON.parse(localInfoStr)
                                    localInfo.active_id = id
                                    localStorage.setItem("local_patos", JSON.stringify(localInfo))
                                    setActiveId(localInfo.active_id);
                                }
                            }
                        }}
            />
            <ISSForm mobile={false} userISS={userISS} visible={editISS} id={activeId} onClose={()=>{setEditISS(false)}}/>
            {/*<CallPato mobile={false} id={activeId} visible={openCall} onClose={()=>{setOpenCall(false)}}/>*/}
            <Deposit mobile={false} id={activeId} visible={openDeposit} onClose={()=>{setOpenDeposit(false)}}/>
            <LiveChat id={activeId} serverUrl={Streaming_Server} onClose={()=>setOpenLive(false)}
                      visible={openLive} onShowProgress={showProgressBar}/>
            <AIInstructComponent id={activeId} serverUrl={Streaming_Server} visible={openInstruct} onShowProgress={showProgressBar}
                onClose={()=>setOpenInstruct(false)}/>
            <QRCodeComponent visible={openCode} id={activeId} onClose={()=>setOpenCode(false)} mobile={false}/>
        </div>
    );
}
