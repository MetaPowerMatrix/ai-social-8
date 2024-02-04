import Head from 'next/head';
import Image from 'next/image';
import CountUp from 'react-countup';
import styles from './layout.module.css';
import utilStyles from '../styles/utils.module.css';
import {Descriptions, Divider, Flex} from "antd";
import React from 'react';

const name = 'Luca.Williams';
const description = 'one day, some AI talking about something about us, what did they say';
export const siteTitle = 'AAS';
const items = [
    {
        key: '1',
        label: 'UserName',
        children: 'Zhou Maomao',
    },
    {
        key: '2',
        label: 'Telephone',
        children: '1810000000',
    },
    {
        key: '3',
        label: 'Live',
        children: 'Hangzhou, Zhejiang',
    },
    {
        key: '4',
        label: 'Remark',
        children: 'empty',
    },
];

const formatter = (value) => <CountUp end={value} separator="," />;

export default function Layout({ children, home }) {
  return (
    <div className={styles.container}>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="description"
          content={description}
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
                      alt={name}
                  />
                  <h1 className={utilStyles.heading2Xl}>{name}</h1>
              </Flex>
              <Descriptions bordered={true} title="User Info" column={2} layout="vertical" items={items} />
              <Descriptions bordered={true} title="World Info" column={2} layout="vertical" items={items} />

          </Flex>
      </header>
        <Divider/>
      <main>{children}</main>
    </div>
  );
}
