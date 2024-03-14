import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import {List, Space} from "antd";
import {MessageOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ChatMessage} from "@/common";
import { useRouter } from "next/router";
import {useTranslations} from 'next-intl';
import {getCookie} from "@/lib/utils";

const IconText = ({ icon, text }:{icon: any, text: string}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export default function Home() {
  const [activeId, setActiveId] = useState("");
  const command = commandDataContainer.useContainer()
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const t = useTranslations('Index');

  useEffect(()=> {
    const cookie1 = getCookie('active-id');
    if (cookie1 !== "") {
      setActiveId(cookie1);
    }
  },[])

  useEffect(()=> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 3);

// Format the date as YYYY-MM-DD
    const formattedDate = yesterday.getFullYear() + '-' +
      String(yesterday.getMonth() + 1).padStart(2, '0') + '-' +
      String(yesterday.getDate()).padStart(2, '0');

    console.log(formattedDate, activeId)
    command.getPatoHistoryMessages(activeId, formattedDate).then((response) => {
      if (response !== null) {
        setChatMessages(response)
      }
    })
  },[activeId])

  return (
    <Layout title={t('title')} description={t('description')}>
      <Head>
        <title>{t('title')}</title>
      </Head>
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
            dataSource={chatMessages}
            footer={
              <div style={{color: "yellowgreen"}}>
                {t('taskTips')}
              </div>
            }
            renderItem={(item) => (
              <List.Item
                key={item.subject}
                title={item.subject}
                actions={[
                  <IconText icon={MessageOutlined} text="99+" key="list-vertical-message"/>,
                ]}
              >
                <List.Item.Meta title={item.subject}/>
                <h5>{item.sender}: {item.question}</h5>
                <h5>{item.receiver}: {item.answer}</h5>
                <h5>#{item.session}#{item.place}</h5>
              </List.Item>
            )}
          />
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
