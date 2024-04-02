import Head from 'next/head';
import Image from 'next/image';
import styles from './layout_mobile.module.css';
import {Card, Divider, FloatButton} from "antd";
import {
    MenuOutlined,
    SettingOutlined,
    EuroOutlined,
    UserOutlined, QrcodeOutlined
} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import ModalLogin from "@/components/login";
import {useTranslations} from 'next-intl';
import {getCookie, subscribe_topic} from "@/lib/utils";
import TaskPanel from "@/components/taskPanel";
import ProgressBarComponent from "@/components/ProgressBar";
import MaskedHighlight from "@/components/MaskedHighlight";
import ISSForm from "@/components/iss";
import commandDataContainer from "@/container/command";
import Deposit from "@/components/deposit";
import {Streaming_Server} from "@/common";
import HeaderPanelMobile from "./header_mobile";
import LiveChatMobile from "@/components/LiveChatMobile";
import AIInstructMobileComponent from "@/components/AIInstructMobile";
import QRCodeComponent from "@/components/QRCode";

export default function LayoutMobile({ children, title, description, onChangeId, onRefresh }) {
    const [open, setOpen] = useState(false);
    const [editISS, setEditISS] = useState(false);
    const [openCode, setOpenCode] = useState(false);
    const [openLive, setOpenLive] = useState(false);
    const [openInstruct, setOpenInstruct] = useState(false);
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
    const [activeTabKey, setActiveTabKey] = useState('task');
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
    useEffect(() => {
        const cookie1 = getCookie('active-id');
        if (cookie1 === "" || cookie1 === null) {
            setIsLogin(false);
        }else {
            setActiveId(cookie1);
            onChangeId(cookie1);
            setIsLogin(true);
        }
        const cookie2 = getCookie('available-ids');
        if (cookie2 !== "" || cookie2 !== null) {
            const ids = cookie2.split(',');
            const idsMap = ids.map((id) => {
                return {label: id.split(":")[1], value: id.split(":")[0]};
            });
            // console.log(idsMap)
            idsMap.forEach((item) => {
                if (item.value !== '' && item.value === activeId) {
                    // console.log(item.label)
                    setActiveName(item.label);
                }
            });
            setAvailableIds(idsMap);
        }
        const cookie3 = getCookie('guide-completed');
        if ((cookie3 === null || cookie3 === "" ) && isLogin){
            setGuide(true)
            // console.log("guide", guide)
        }
    },[activeId]);

    useEffect(() => {
        // console.log("sub: ", activeId)
        if (activeId !== ""){
            subscribe_topic(activeId, (message) => {
                // const byteArray = new Uint8Array(message);
                // const decoder = new TextDecoder("utf-8");
                // const decode_msg = decoder.decode(byteArray);
                let item = {children: message.toString()}
                setUserFeed((prevFeed)=>{
                    const newFeed = [...prevFeed]
                    if (newFeed.length >= 10){
                        newFeed.shift()
                    }
                    newFeed.push(item)
                    return newFeed
                })
            })
        }
    }, [activeId]);

    useEffect(() => {
        command.getPatoISS(activeId).then((res) => {
            setUserISS(res)
        })
    }, [activeId])

    useEffect(() => {
        if (activeId !== ''){
            const currentUrl = window.location.search;
            const searchParams = new URLSearchParams(currentUrl);
            const paramName = 'to';
            const to_page = searchParams.get(paramName);
            console.log(to_page);
            if (to_page === 'instruct'){
                setOpenInstruct(true)
            }
        }
    }, [activeId])

    return (
        <div className={styles.container}>
            <Head>
                <link rel="icon" href="/favicon.ico"/>
                <meta name="description" content={description}/>
                <meta name="og:title" content={title}/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
            </Head>
            {isLogin ?
                <>
                    <HeaderPanelMobile activeName={activeName} activeId={activeId} onChangeId={changeLoginState} userFeed={userFeed}/>
                    <Divider/>
                    <Card
                        style={{ border: "none", width: '100%', marginTop:20, maxHeight: 400, overflow: "scroll" }}
                        tabList={[{label: t('task'), key: 'task'},{label: t('messages'), key: 'messages'}]}
                        activeTabKey={activeTabKey}
                        onTabChange={(key)=> setActiveTabKey(key)}
                        tabProps={{
                            size: 'small',
                        }}
                    >
                        {activeTabKey === "task" ?
                            <TaskPanel id={activeId} onShowProgress={showProgressBar} panelWidth={340}/>
                            :
                            <div>
                                {children}
                            </div>
                        }
                    </Card>
                </>
                :
                <Image priority src="/images/ai-town.jpg" fill style={{objectFit: 'cover',}} alt={"map"}/>
            }
            <MaskedHighlight zones={zones} visible={guide} />
            <ProgressBarComponent visible={loading} steps={10} />
            <FloatButton.Group  open={open} trigger="click" style={{right: 34}} onClick={onChange} icon={<MenuOutlined/>}>
                <FloatButton onClick={()=>{setOpenInstruct(true)}} icon={<UserOutlined/>}/>
                {/*<FloatButton onClick={()=>{setOpenLive(true)}} icon={<TikTokOutlined/>}/>*/}
                {/*<FloatButton onClick={()=>{setOpenCall(true)}} icon={<PhoneOutlined/>}/>*/}
                <FloatButton onClick={()=>{setOpenDeposit(true)}} icon={<EuroOutlined />}/>
                <FloatButton onClick={()=>{setEditISS(true)}} icon={<SettingOutlined />}/>
                <FloatButton onClick={()=>{setOpenCode(true)}} icon={<QrcodeOutlined />}/>
                {/*<FloatButton onClick={()=>onRefresh()} icon={<RedoOutlined/>}/>*/}
            </FloatButton.Group>
            <ModalLogin mobile={true} isOpen={!isLogin} tips={t} options={availableIds}
                        onClose={(id) => {
                            setIsLogin(true)
                            if (id !== '') {
                                setActiveId(id)
                                document.cookie = `active-id=${id}`;
                            }
                        }}
            />
            <ISSForm mobile={true} userISS={userISS} visible={editISS} id={activeId} onClose={()=>{setEditISS(false)}}/>
            {/*<CallPato mobile={true} id={activeId} visible={openCall} onClose={()=>{setOpenCall(false)}}/>*/}
            <Deposit mobile={true} id={activeId} visible={openDeposit} onClose={()=>{setOpenDeposit(false)}}/>
            {/*<LiveChatMobile id={activeId} serverUrl={Streaming_Server} onClose={()=>setOpenLive(false)}*/}
            {/*          visible={openLive} onShowProgress={showProgressBar}/>*/}
            <AIInstructMobileComponent id={activeId} serverUrl={Streaming_Server} visible={openInstruct} onShowProgress={showProgressBar}
                onClose={()=>setOpenInstruct(false)}/>
            <QRCodeComponent visible={openCode} id={activeId} onClose={()=>setOpenCode(false)} mobile={true}/>
        </div>
    );
}
