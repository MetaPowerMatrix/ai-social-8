import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import {Avatar, Card, Flex, List, Space} from "antd";
import {LikeOutlined, MessageOutlined, StarOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ListItemInfo} from "@/common";
import { useRouter } from "next/router";
import {useTranslations} from 'next-intl';
import TaskPanel from "@/components/taskPanel";
import {getCookie} from "@/lib/utils";

const data2 = Array.from({
  length: 1,
}).map((_, i) => ({
  href: 'https://www.metapowermatrix.com',
  title: `ant design part ${i}`,
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  description:
    'Ant Design, a design language for background applications, is refined by Ant UED Team.',
  content:
    'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
}));

const IconText = ({ icon, text }:{icon: any, text: string}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export default function Home() {
  const [activeId, setActiveId] = useState("");
  const command = commandDataContainer.useContainer()
  const [characterList, setCharacterList] = useState<ListItemInfo[]>([])
  const t = useTranslations('Index');

  useEffect(()=> {
    const cookie1 = getCookie('active-id');
    if (cookie1 !== "") {
      setActiveId(cookie1);
    }
    // getCharacterList()
  },[])

  return (
    <Layout title={t('title')} description={t('description')}>
      <Head>
        <title>{t('title')}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Flex vertical={false} justify="space-around" align="flex-start" gap={80}>
          <TaskPanel id={activeId}/>
          <List
            itemLayout="vertical"
            header={<p>{t('taskMessage')}</p>}
            size="small"
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 6,
            }}
            dataSource={data2}
            footer={
              <div style={{color: "yellowgreen"}}>
                {t('taskTips')}
              </div>
            }
            renderItem={(item) => (
              <List.Item
                key={item.title}
                actions={[
                  <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
                  <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
                  <IconText icon={MessageOutlined} text="2" key="list-vertical-message" />,
                ]}
                extra={
                  <img
                    width={272}
                    alt="logo"
                    src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
                  />
                }
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.avatar} />}
                  title={<a href={item.href}>{item.title}</a>}
                  description={item.description}
                />
                {item.content}
              </List.Item>
            )}
          />
        </Flex>
      </section>
    </Layout>
  );
}

export async function getStaticProps({locale}: {locale: string}) {
  return {
    props: {
      messages:{
        ...require(`../messages/${locale}.json`),
      }
    },
  };
}
