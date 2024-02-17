import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import {Descriptions, Divider, Flex, FloatButton} from "antd";
import {PhoneOutlined, MenuOutlined} from "@ant-design/icons";
import React, {useState} from 'react';
import {siteTitle, UserStats, siteDescription, sampleName} from "@/common";

export default function Layout({ children, home }) {
    const [open, setOpen] = useState(true);
    const onChange = () => {
        setOpen(!open);
    };

  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content={siteDescription}
        />
        <meta name="og:title" content={siteTitle} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <header>
          <Flex vertical={false} justify="space-around" align="center">
              <Flex gap="middle" vertical align="center">
                  <Image
                      priority
                      src="/images/profile.jpg"
                      className={utilStyles.borderCircle}
                      height={144}
                      width={144}
                      alt={sampleName}
                  />
                  <h1 className={utilStyles.heading2Xl}>{sampleName}</h1>
              </Flex>
              <Descriptions bordered={true} column={6} layout="vertical" items={UserStats} />
          </Flex>
      </header>
        <FloatButton.Group
            open={open}
            trigger="click"
            style={{ right: 24 }}
            onClick={onChange}
            icon={<MenuOutlined />}
        >
            <FloatButton href="/controller" icon={<PhoneOutlined />} />
            {/*<FloatButton href="/controller" icon={<CommentOutlined />} />*/}
        </FloatButton.Group>
        <Divider/>
      <main>{children}</main>
    </div>
  );
}
