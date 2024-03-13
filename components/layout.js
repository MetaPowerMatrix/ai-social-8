import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import {Descriptions, Divider, Flex, FloatButton} from "antd";
import {PhoneOutlined, MenuOutlined, EditOutlined} from "@ant-design/icons";
import React, {useEffect, useState} from 'react';
import ModalLogin from "@/components/login";
import {useTranslations} from 'next-intl';
import {getCookie} from "@/lib/utils";
import commandDataContainer from "@/container/command"
import TaskPanel from "@/components/taskPanel";
import ProgressBarComponent from "@/components/ProgressBar";

Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
}

export default function Layout({ children, title, description }) {
    const [isLogin, setIsLogin] = useState(true);
    const [userInfo, setUserInfo] = useState([]);
    const [open, setOpen] = useState(true);
    const [availableIds, setAvailableIds] = useState([]);
    const [activeId, setActiveId] = useState("");
    const [activeName, setActiveName] = useState("");
    const command = commandDataContainer.useContainer()
    const [loading, setLoading] = useState(false);

    const showProgressBar = (show) => {
        setLoading(show)
    }

    const onChange = () => {
        setOpen(!open);
    };
    const t = useTranslations('Login');

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
            console.log(idsMap)
            idsMap.forEach((item) => {
                if (item.value !== '' && item.value === activeId) {
                    console.log(item.label)
                    setActiveName(item.label);
                }
            });
            setAvailableIds(idsMap);
        }
    },[activeId]);
    useEffect(() => {
        command.getPatoInfo(activeId).then((res) => {
            if ( res !== null){
                let userStats = []
                userStats.push({
                    key: '1',
                    label: "ID",
                    children: res.id.substring(0, 8) + '...' + res.id.substring(34, 35)
                })
                userStats.push({
                    key: '2',
                    label: t("Name"),
                    children: res.name,
                })
                userStats.push({
                    key: '3',
                    label: t("MatrixTime"),
                    children: res.matrix_datetime,
                })
                userStats.push({
                    key: '4',
                    label: t("RegisteredTime"),
                    children: res.registered_datetime,
                })
                userStats.push({
                    key: '5',
                    label: t("SN"),
                    children: res.sn.pad(5).toString(),
                })
                userStats.push({
                    key: '6',
                    label: t("Balance"),
                    children: 10,
                })
                setUserInfo(userStats);
            }
        })
    },[activeId]);

    return (
        <div className={styles.container}>
          <Head>
            <link rel="icon" href="/favicon.ico" />
            <meta
              name="description"
              content={description}
            />
            <meta name="og:title" content={title} />
          </Head>
            {isLogin ?
                <>
                    <header>
                        <Flex vertical={false} justify="space-around" align="center">
                            <Flex gap="middle" vertical align="center">
                                <Image
                                    priority
                                    src="/images/notlogin.png"
                                    className={utilStyles.borderCircle}
                                    height={72}
                                    width={72}
                                    alt={activeName}
                                />
                                <Flex gap="middle" vertical={false} align="center">
                                    <h5 className={utilStyles.headingLg}>
                                        {activeName.length > 14 ? activeName.substring(0,8) + '...' : activeName}
                                    </h5>
                                    <EditOutlined onClick={() => setIsLogin(false)} />
                                </Flex>
                            </Flex>
                            <Descriptions bordered={true} column={6} layout="vertical" items={userInfo}/>
                        </Flex>
                    </header>
                    <Divider/>
                    <main>
                        <section className={utilStyles.headingMd}>
                            <Flex vertical={false} justify="space-around" align="flex-start" gap={80}>
                                <TaskPanel id={activeId} onShowProgress={showProgressBar}/>
                                {children}
                            </Flex>
                        </section>
                    </main>
                </>
                :
                <Image
                priority
                src="/images/ai-town.jpg"
                fill
                style={{
                objectFit: 'cover',
                    }}
                    alt={"map"}
                />
            }
            <ProgressBarComponent visible={loading} />
            {/*{isLogin ??*/}
                <FloatButton.Group
                    open={open}
                    trigger="click"
                    style={{right: 24}}
                    onClick={onChange}
                    icon={<MenuOutlined/>}
                >
                    <FloatButton href="/controller" icon={<PhoneOutlined/>}/>
                    {/*<FloatButton href="/controller" icon={<CommentOutlined />} />*/}
                </FloatButton.Group>
            {/*}*/}
            <ModalLogin isOpen={!isLogin}
                        onClose={(id) => {
                            setIsLogin(true)
                            if (id !== '') {
                                setActiveId(id)
                                document.cookie = `active-id=${id}`;
                            }
                        }}
                        tips={t} options={availableIds}
            />
        </div>
    );
}
