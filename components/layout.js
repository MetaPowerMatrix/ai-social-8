import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import {Divider, Flex, FloatButton} from "antd";
import {PhoneOutlined, MenuOutlined, EditOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import ModalLogin from "@/components/login";
import {useTranslations} from 'next-intl';
import {getCookie} from "@/lib/utils";
import TaskPanel from "@/components/taskPanel";
import ProgressBarComponent from "@/components/ProgressBar";
import HeaderPanel from "@/components/header";
import MaskedHighlight from "@/components/MaskedHighlight";

export default function Layout({ children, title, description }) {
    const [isLogin, setIsLogin] = useState(false);
    const [open, setOpen] = useState(true);
    const [availableIds, setAvailableIds] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [activeName, setActiveName] = useState("");
    const [loading, setLoading] = useState(false);
    const [guide, setGuide] = useState(false)
    const t = useTranslations('Login');

    const zones = [
        { id: 'zone1', top: 260, left: 110, height:220, width:320,
            tips: '每天在这里设置一个话题，可以增加和别人交谈的机会哦'},
        { id: 'zone2', top: 480, left: 110, height:220, width:320,
            tips: '如果你有一些专业的知识，在这里上传，别人会很愿意和你聊天哦'},
        { id: 'zone3', top: 270, left: 450, height:140, width:860,
            tips: '这里显示你的pato的聊天记录，可以按时间查询' },
    ];

    const showProgressBar = (show) => {
        setLoading(show)
    }
    const onChange = () => {
        setOpen(!open);
    };
    const changeLoginState = (status) =>{
        setIsLogin(status);
    }

    useEffect(() => {
        const cookie1 = getCookie('active-id');
        if (cookie1 === "" || cookie1 === null) {
            setIsLogin(false);
        }else {
            setActiveId(cookie1);
            setIsLogin(true)
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
                    console.log(item.label)
                    setActiveName(item.label);
                }
            });
            setAvailableIds(idsMap);
        }
        const cookie3 = getCookie('guide-completed');
        if ((cookie3 === null || cookie3 === "" ) && isLogin){
            setGuide(true)
            console.log("guide", guide)
        }
    },[activeId]);

    return (
        <div className={styles.container}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content={description}/>
            <meta name="og:title" content={title} />
          </Head>
            {isLogin ?
                <>
                    <HeaderPanel activeName={activeName} activeId={activeId} onChangeId={changeLoginState}/>
                    <Divider/>
                    <main>
                        <section className={utilStyles.headingMd}>
                            <Flex vertical={false} justify="space-around" align="flex-start" gap={40}>
                                <TaskPanel id={activeId} onShowProgress={showProgressBar}/>
                                {children}
                            </Flex>
                        </section>
                    </main>
                </>
                :
                <Image priority src="/images/ai-town.jpg" fill style={{objectFit: 'cover',}} alt={"map"}/>
            }
            <MaskedHighlight zones={zones} visible={guide} />
            <ProgressBarComponent visible={loading} />
            <FloatButton.Group open={open} trigger="click" style={{right: 24}} onClick={onChange} icon={<MenuOutlined/>}>
                <FloatButton href="/controller" icon={<PhoneOutlined/>}/>
            </FloatButton.Group>
            <ModalLogin isOpen={!isLogin} tips={t} options={availableIds}
                        onClose={(id) => {
                            setIsLogin(true)
                            if (id !== '') {
                                setActiveId(id)
                                document.cookie = `active-id=${id}`;
                            }
                        }}
            />
        </div>
    );
}
