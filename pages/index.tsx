import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Layout from '../components/layout';
import {
  Button,
  Card,
  Col,
  DatePicker,
  DatePickerProps,
  Divider,
  List,
  Row,
  Space,
  Tag,
  notification
} from "antd";
import {CloseOutlined, DeleteOutlined, FormOutlined, RedoOutlined, UploadOutlined} from "@ant-design/icons";
import commandDataContainer from "@/container/command"
import {ChatMessage, getMQTTBroker, sessionMessages} from "@/common";
import {useTranslations} from 'next-intl';
import {formatDateTimeString, getCookie, getTodayDateString} from "@/lib/utils";
import dayjs from "dayjs";
import mqtt from "mqtt";

const IconText = ({ icon, text }:{icon: any, text: string}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const MessageHeader = ({onChangeDate, onClickReload, onClickArchive, queryDate, summary, onEditSaveClick}:{
  onChangeDate: (datestring: string)=>void,
  onClickReload: ()=>void,
  onClickArchive: ()=>void,
  onEditSaveClick: ()=>void,
  queryDate: string, summary: string
}) => {
  const t = useTranslations('Index');

  const onChange: DatePickerProps['onChange'] = (_, dateString) => {
    onChangeDate(dateString as string)
    // console.log(date, dateString);
  };

  return (
    <>
      <Row justify="space-between">
        <Col span={8}><span>{t('taskMessage')}</span>
          <Divider type={"vertical"}/>
          <RedoOutlined onClick={onClickReload}/>
          <Divider type={"vertical"}/>
          <UploadOutlined onClick={onEditSaveClick}/>
          <Divider type={"vertical"}/>
          <DeleteOutlined onClick={onClickArchive}/>
        </Col>
        <Col span={16} style={{ textAlign: 'right' }}>
          <DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{textAlign: "end"}} onChange={onChange} />
        </Col>
      </Row>
      <Divider type={"horizontal"}/>
      <Row>
        <h5>{summary}</h5>
      </Row>
    </>
  )
}

interface EditableListItemProps {
  initialValue: ChatMessage;
  onSave: (value: ChatMessage) => void;
}

const EditableListItem: React.FC<EditableListItemProps> = ({ initialValue, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleSave = () => {
    onSave(value);
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setEditing(false);
  };

  const handleChangeQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((prevState) => {
      return {
        ...prevState,
        question: event.target.value,
      };
    });
  };
  const handleChangeAnswer = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((prevState) => {
      return {
        ...prevState,
        answer: event.target.value,
      };
    });
  };

  if (editing) {
    return (
      <List.Item>
        <div>{initialValue.sender}: <input style={{width:"100%"}} autoFocus={true} value={value.question} onChange={handleChangeQuestion} /></div>
        <div>{initialValue.receiver}: <input style={{width:"100%"}} autoFocus={true} value={value.answer} onChange={handleChangeAnswer} /></div>
        <button style={{marginTop:10, marginRight: 10}} onClick={handleSave}>Save</button>
        <button onClick={handleCancel}>Cancel</button>
      </List.Item>
    );
  }

  return (
    <List.Item
      key={initialValue.subject}
      onClick={handleEdit}
    >
        {/*<div hidden={!editing}>*/}
        {/*  <input autoFocus={true} value={value.question} onChange={handleChange}/>*/}
        {/*  <button onClick={handleSave}>Save</button>*/}
        {/*  <button onClick={handleCancel}>Cancel</button>*/}
        {/*</div>*/}
      <h5>{initialValue.sender}: {initialValue.question}</h5>
      <h5>{initialValue.receiver === initialValue.sender ? initialValue.receiver + "#2" : initialValue.receiver}: {initialValue.answer}</h5>
      <h5>{formatDateTimeString(initialValue.created_at*1000)} <Tag color="green">{initialValue.place}</Tag><Tag color="yellow">{initialValue.subject}</Tag></h5>
    </List.Item>
  );
};
export default function Home() {
  const [activeId, setActiveId] = useState("");
  const command = commandDataContainer.useContainer()
  const [sessionMessages, setSessionMessages] = useState<sessionMessages[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [queryDate, setQueryDate] = useState(getTodayDateString());
  const [reloadTimes, setReloadTimes] = useState(0);
  const [sessionTabKey, setSessionTabKey] = useState<string>('');
  const [sessionList, setSessionList] = useState<{key: string, label: string}[]>([])
  const [summary, setSummary] = useState<string>('')
  const [continueTalk, setContinueTalk] = useState<boolean>(false)
  const [api, contextHolder] = notification.useNotification();
  const [client, setClient] = useState<mqtt.MqttClient | null>(null);
  const [isMySeesion, setIsMySession] = useState<boolean>(false)
  const [activeName, setActiveName] = useState<string>("")

  const t = useTranslations('Index');

  const openNotification = (title: string, message: string) => {
    api.open({
      message: title,
      description:
        message,
      duration: 0,
    });
  };

  const onTabChange = (key: string) => {
    let session_message = sessionMessages.filter((item) => item.session === key)
    if (session_message.length > 0){
      setChatMessages(session_message[0].messages)
      if (session_message[0].messages.length > 0){
        // console.log(session_message[0].messages[0].sender, activeName)
        let realname = session_message[0].messages[0].sender.split('(')[0]
        if ( realname === activeName){
          setIsMySession(true)
        }else{
          setIsMySession(false)
        }
      }
      setSummary(session_message[0].summary)
      setSessionTabKey(session_message[0].session)
    }
  };

  const onChange: DatePickerProps['onChange'] = (_, dateString) => {
    changeQueryDate(dateString as string)
    // console.log(date, dateString);
  };

  const changeQueryDate = (datestring: string) => {
    setQueryDate(datestring);
  }

  const increaseReloadTimes = () => {
    setReloadTimes(reloadTimes + 1);
  }
  const archiveSession = () =>{
    command.archive_session(activeId, sessionTabKey, queryDate).then((res) => {
      if (res){
        alert(t('deleted'))
      }
    })
  }

  useEffect(()=> {
    const cookie1 = getCookie('active-id');
    if (cookie1 !== "" && cookie1 !== null) {
      setActiveId(cookie1);
    }
    const mqttClient = mqtt.connect(getMQTTBroker());
    mqttClient.on("connect", () => {
      console.log("Messages Connected to MQTT broker");
    });
    mqttClient.on("error", (err) => {
      console.error("Error connecting to MQTT broker:", err);
    });
    setClient(mqttClient);

    return () => {
      console.log("Messages Disconnecting from MQTT broker")
      mqttClient.end(); // Clean up the connection on component unmount
    };
  },[])

  useEffect(()=> {
    command.getPatoHistoryMessages(activeId, queryDate).then((response) => {
      setSessionList([])
      setSessionMessages([])
      setChatMessages([])
      if (response !== null) {
        let session_messages = response
        let sessions = session_messages.map((item) => {
          // return {key: item.session, label: item.session.substring(0, 4) + '...' + item.session.substring(30, 34)}
          return {key: item.session, label: item.messages[0]?.subject}
        })
        setSessionList(sessions)
        setSessionMessages(session_messages)
        if (session_messages.length > 0){
          setChatMessages(session_messages[0].messages)
          if (session_messages[0].messages.length > 0){
            let realname = session_messages[0].messages[0].sender.split('(')[0]
            if ( realname === activeName){
              setIsMySession(true)
            }else{
              setIsMySession(false)
            }
          }
          setSummary(session_messages[0].summary)
          setSessionTabKey(session_messages[0].session)
        }
      }
    })
  },[activeId, queryDate, reloadTimes])

  useEffect(() =>{
    setClient(null)
  }, [activeId])

  useEffect(() => {
    if (client) {
      const msg_refresh = activeId+"/refresh";
      const chat_continue = activeId+"/continue";

      // Handler for incoming messages
      const onMessage = async (topic: string, message: Buffer) => {
        console.log("receive ", topic, " ", message.toString())
        if (topic === msg_refresh){
          console.log("begin refresh")
          increaseReloadTimes()
          setSessionTabKey(message.toString())
        }else{
          if ( sessionTabKey === message.toString()){
            setContinueTalk(true)
          }else{
            setContinueTalk(false)
          }
        }
      };

      // Subscribe to the topic
      client.subscribe([msg_refresh, chat_continue], (err) => {
        if (!err) {
          console.log("Messages Subscribed to topic: ", [msg_refresh, chat_continue]);
          client.on('message', onMessage);
        }
      });

      // Return a cleanup function to unsubscribe and remove the message handler
      return () => {
        if (client) {
          console.log("Messages unsubscribe from ", [msg_refresh, chat_continue])
          client.unsubscribe([msg_refresh, chat_continue]);
          client.removeListener('message', onMessage);
        }
      };
    }
  }, [client]);

  const handleSave = (index: number, value: ChatMessage) => {
    setChatMessages(chatMessages.map((item, i) => i === index ? value : item));
  };

  const handleEditMessages = () => {
    command.edit_session_messages(activeId, sessionTabKey, queryDate, chatMessages).then((res) =>
    {
      openNotification("修改成功", "修改结果将影响之后的聊天")
    })
  }
  const handleContinueChat = (continued: boolean) => {
   command.continue_session_chat(activeId, sessionTabKey, queryDate, continued).then((res) => {
     openNotification("是否继续聊天", "继续了，将会收费哦")
   })
  }

  return (
    <Layout onRefresh={(name: string)=> setActiveName(name)} onChangeId={(newId:string)=>setActiveId(newId)} title={t('title')} description={t('description')}>
      {contextHolder}
      <Head>
        <title>{t('title')}</title>
      </Head>
      <Card
        style={{ width: '100%' }}
        tabList={sessionList}
        activeTabKey={sessionTabKey}
        onTabChange={onTabChange}
        tabProps={{
          size: 'small',
        }}
      >
      {
        chatMessages.length === 0 ?
          <div style={{textAlign: "center", width: 1000}}>
            <h3>{t('noMessage')}</h3>
            <label>{t('his')} <DatePicker defaultValue={dayjs(queryDate)} size={"small"} style={{textAlign: "end"}} onChange={onChange} /></label>
          </div>
          :
          <>
          <List
            itemLayout="vertical"
            header={<MessageHeader onEditSaveClick={handleEditMessages} onClickArchive={archiveSession} summary={summary} queryDate={queryDate} onChangeDate={changeQueryDate} onClickReload={increaseReloadTimes}/>}
            size="small"
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 6,
              position: "bottom"
            }}
            dataSource={chatMessages}
            renderItem={(item, index) => {
              if (isMySeesion) {
                return <EditableListItem initialValue={item} onSave={(value) => handleSave(index, value)}/>
              }else{
                return (
                  <List.Item
                    key={item.subject}
                  >
                    <h5>{item.sender}: {item.question}</h5>
                    <h5>{item.receiver === item.sender ? item.receiver + "#2" : item.receiver}: {item.answer}</h5>
                    <h5>{formatDateTimeString(item.created_at*1000)} <Tag color="green">{item.place}</Tag><Tag color="yellow">{item.subject}</Tag></h5>
                  </List.Item>
                )
              }
            }}
          />
          {isMySeesion &&
            <>
              <Divider/>
              <Row>
                <Col span={4} style={{marginTop:10}}>
                  <label>是否继续聊天?</label>
                </Col>
                <Col span={12} style={{marginTop:10}}>
                  <Button onClick={() => handleContinueChat(true)} disabled={!continueTalk} type={"primary"} style={{marginRight:30}}>是</Button>
                  <Button onClick={() => handleContinueChat(false)} disabled={!continueTalk}>否</Button>
                </Col>
              </Row>
            </>
          }
          </>
      }
      </Card>
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
