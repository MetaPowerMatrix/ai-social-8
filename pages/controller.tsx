import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import { getSortedPostsData } from '@/lib/posts';
import {Avatar, Card, Flex, List, Space} from "antd";
import {LikeOutlined, MessageOutlined, StarOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ListItemInfo, siteTitle} from "@/common";
import ListModalComponent from "@/components/list_modal";

const data2 = Array.from({
  length: 23,
}).map((_, i) => ({
  href: 'https://ant.design',
  title: `ant design part ${i}`,
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  description:
    'Ant Design, a design language for background applications, is refined by Ant UED Team.',
  content:
    'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
}));

const data = [
  {
    title: '任务 1',
  },
  {
    title: '任务 2',
  },
  {
    title: '任务 3',
  },
  {
    title: '任务 4',
  },
  {
    title: '任务 5',
  },
  {
    title: '任务 6',
  },
];

const IconText = ({ icon, text }:{icon: any, text: string}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);


export default function Controller() {
  const command = commandDataContainer.useContainer()
  const [characterList, setCharacterList] = useState<ListItemInfo[]>([])
  const [isModalVisible, setIsModalVisible] = useState(true); // Add a state variable for modal visibility

  const getCharacterList = () => {
    command.get_characters().then((infos) => {
      if (infos !== undefined){
        const characters: ListItemInfo[] = infos.map((info: String) => {
          return {
            name: info,
            id: info,
            value: info
          }
        })
        setCharacterList(characters)
      }
    })
  }

  const handleSelect = (item: ListItemInfo) => {
    console.log(item);
    setIsModalVisible(false); // Close the modal when an item is selected
  }

  useEffect(()=> {
    getCharacterList()
  },[])

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <Flex vertical={false} justify="space-around" align="flex-start" gap={80}>
          <List
            dataSource={data}
            split={false}
            renderItem={(item) => (
              <List.Item>
                <Card hoverable style={{width: 260}} title={item.title}>
                  <button onClick={() => setIsModalVisible(true)}>Open Modal</button>
                  {/* Add a button to open the modal */}
                  {isModalVisible && <ListModalComponent items={characterList}
                                                         onSelect={handleSelect}/>} {/* Render the modal if isModalVisible is true */}
                </Card>
              </List.Item>
            )}
          />
          <List
            itemLayout="vertical"
            header={<p>世界消息</p>}
            size="small"
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 6,
            }}
            dataSource={data2}
            footer={
              <div>
                <b>task list</b>
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

export async function getStaticProps() {
  const allPostsData = getSortedPostsData();
  return {
    props: {
      allPostsData,
    },
  };
}
