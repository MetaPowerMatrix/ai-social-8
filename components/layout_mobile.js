import Head from 'next/head';
import Image from 'next/image';
import styles from './layout_mobile.module.css';
import {Tabs} from "antd";
import {
    UserOutlined,
    BarsOutlined,
    ShopOutlined,
    SolutionOutlined,
    CommentOutlined,
} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import ModalLogin from "@/components/login";
import {useTranslations} from 'next-intl';
import {getCookie} from "@/lib/utils";
import ProgressBarComponent from "@/components/ProgressBar";
import MaskedHighlight from "@/components/MaskedHighlight";
import Deposit from "@/components/deposit";
import {getMQTTBroker, Streaming_Server} from "@/common";
import HeaderPanelMobile from "./header_mobile";
import AIInstructMobileComponent from "@/components/AIInstructMobile";
import QRCodeComponent from "@/components/QRCode";
import mqtt from "mqtt";
import UserFeedMobile from "@/components/user_feed";
import LiveChatMobile from "@/components/LiveChatMobile";
import DiscoveryComponent from "@/components/discovery";

export default function LayoutMobile({ children, title, description, onChangeId, onRefresh }) {
    const [open, setOpen] = useState(false);
    const [openCode, setOpenCode] = useState(false);
    const [openDeposit, setOpenDeposit] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [availableIds, setAvailableIds] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [activeName, setActiveName] = useState("");
    const [guide, setGuide] = useState(false)
    const [loading, setLoading] = useState(false);
    const [userFeed, setUserFeed] = useState([{children:"新的一天开始了"}]);
    const [openLive, setOpenLive] = useState(false);
    const [client, setClient] = useState(null);
    const [activeTab, setActivTab] = useState('chat');
    const t = useTranslations('Login');

    const zones = [
        { id: 'zone1', top: 560, left: 80, height:220, width:320,
            tips: '每天在这里设置一个话题，可以增加和别人交谈的机会哦'},
        { id: 'zone2', top: 760, left: 80, height:220, width:320,
            tips: '如果你有一些专业的知识，在这里上传，别人会很愿意和你聊天哦'},
        { id: 'zone3', top: 960, left: 80, height:140, width:320,
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
    }, [client, activeId]);

    useEffect(() => {
        if (activeId !== ''){
            const currentUrl = window.location.search;
            const searchParams = new URLSearchParams(currentUrl);
            const paramName = 'to';
            const to_page = searchParams.get(paramName);
            console.log(to_page);
            if (to_page === 'instruct'){
                setActivTab("pro")
            }
        }
    }, [activeId])

    const tabs =[
        {label: t('messages'), key:"chat", icon: <CommentOutlined/>},
        {label: t('task'), key:"pro", icon: <SolutionOutlined />},
        {label: t("town"), key:"feed", icon: <ShopOutlined />},
        {label: t("discovery"), key:"discovery", icon: <BarsOutlined />},
        {label: t("mine"), key:"mine", icon: <UserOutlined />}
    ]

    const content = (key) => {
        return(
            <>
                {key === 'chat' &&
                    <div>
                        {children}
                    </div>
                }
                {key === 'pro' &&
                    <AIInstructMobileComponent id={activeId} onShowProgress={showProgressBar}/>
                }
                {key === 'feed' &&
                    <UserFeedMobile id={activeId} mobile={true} userFeed={userFeed}/>
                }
                {key === 'discovery' &&
                    <DiscoveryComponent id={activeId} onShowProgress={showProgressBar} showLiveChat={()=>setOpenLive(true)}/>
                }
                {key === 'mine' &&
                    <HeaderPanelMobile
                        showDeposit={()=>{setOpenDeposit(true)}}
                        showQRCode={()=>{setOpenCode(true)}}
                        onShowProgress={showProgressBar}
                        activeId={activeId} onChangeId={changeLoginState} userFeed={userFeed}
                    />
                }
            </>
        )
    }

    return (
        <div className={styles.container}>
            <Head>
                <link rel="icon" href="/favicon.ico"/>
                <meta name="description" content={description}/>
                <meta name="og:title" content={title}/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            {isLogin ?
                <Tabs
                    centered
                    size={"middle"}
                    type={"line"}
                    animated={true}
                    tabPosition="bottom"
                    activeKey={activeTab}
                    onChange={(key)=>setActivTab(key)}
                    items={tabs.map((tab, i) => {
                        return {
                            label: tab.label,
                            key: tab.key,
                            children: content(tab.key),
                            icon:tab.icon
                        };
                    })}
                />
                :
                <Image priority src="/images/ai-town.jpg" fill style={{objectFit: 'cover',}} alt={"map"}/>
            }
            <MaskedHighlight zones={zones} visible={guide} />
            <ProgressBarComponent visible={loading} steps={15} />
            <ModalLogin mobile={true} isOpen={!isLogin} tips={t} options={availableIds}
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
            <Deposit mobile={true} id={activeId} visible={openDeposit} onClose={()=>{setOpenDeposit(false)}}/>
            <LiveChatMobile id={activeId} serverUrl={Streaming_Server} onClose={()=>setOpenLive(false)}
                      visible={openLive} onShowProgress={showProgressBar}/>
            <QRCodeComponent visible={openCode} id={activeId} onClose={()=>setOpenCode(false)} mobile={true}/>
        </div>
    );
}
