import React, {useEffect, useRef, useState} from "react";
import {Col, Modal, Row, List, Button, Tabs} from "antd";
import styles from "./KolTownComponent.module.css";
import {
	BankOutlined,
	ExperimentOutlined,
	LoginOutlined
} from "@ant-design/icons";
import {KolInfo, Streaming_Server} from "@/common";
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import AIInstructMobileComponent from "@/components/AIInstructMobile";
import BuyKolComponent from "@/components/BuyKol";


const KolTownComponent = ({activeId, onShowProgress}: {
	activeId: string,
	onShowProgress: (s: boolean) => void
}) => {
	const [activeTab, setActivTab] = useState('hot');
	const [roomList, setRoomList] = useState<KolInfo[]>([])
	const [myRoomList, setMyRoomList] = useState<KolInfo[]>([])
	const [reload, setReload] = useState<number>(0)
	const [roomId, setRoomId] = useState<string>('')
	const [showBuyKol, setShowBuyKol] = useState<boolean>(false)
	const [showKolRoom, setShowKolRoom] = useState<boolean>(false)
	const [buyWhat, setBuyWhat] = useState<string>('kol')
	const [isKol, setIsKol] = useState<boolean>(false)
	const [cover, setCover] = useState<string>('')
	const t = useTranslations('kol');
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	useEffect(() => {
		command.log_user_activity(activeId, "kol", "browse")
	}, [])

	useEffect(() => {
		command.query_kol_rooms().then((res) => {
			setRoomList(res)
			let mine: KolInfo[] =  []
			res.forEach((info) =>{
				if (info.id === activeId){
					setIsKol(true)
				}
				if (info.followers.includes(activeId)){
					mine.push(info)
				}
			})
			setMyRoomList(mine)
		})
	}, [reload, activeId])

	const RoomList = ({rooms, mine}:{rooms:KolInfo[], mine:boolean}) => {
		return(
			<>
				<List
					itemLayout="horizontal"
					size="small"
					style={{height: 500,overflow:"scroll"}}
					dataSource={rooms}
					renderItem={(item, index) => (
						<List.Item
							key={index}
						>
							<Row align={"middle"} style={{width: "100%"}}>
								<Col span={8}>
									<h5 style={{overflow: "scroll"}}>{item.name}</h5>
								</Col>
								<Col span={12}>
									<h5 style={{overflow: "scroll"}}>{item.name}的私聊室</h5>
								</Col>
								<Col span={2} style={{textAlign: "end"}}>
									<LoginOutlined onClick={() => {
										setRoomId(item.id)
										if (mine || activeId === item.id) {
											setShowKolRoom(true)
										}else {
											setBuyWhat('follow')
											setShowBuyKol(true)
										}
									}}/>
								</Col>
							</Row>
						</List.Item>
					)}
				/>
				<Row>
					<Col span={2}></Col>
					<Col span={20}>
						<Button style={{width: "100%", fontSize: 16}} type={"primary"} onClick={() => {
							if (isKol) {
								Modal.success({
									content: '你已经购买过密钥了，无需重复购买'
								})
							}else {
								setBuyWhat('kol')
								setShowBuyKol(true)
							}
						}}>+</Button>
					</Col>
					<Col span={2}></Col>
				</Row>
			</>
		)
	}
	const tabContent = (key: string) => {
		return (
			<>
				{key === 'hot' &&
					<RoomList rooms={roomList}  mine={false}/>
				}
				{key === 'mine' &&
					<RoomList rooms={myRoomList} mine={true}/>
				}
			</>
		)
	}
	const tabs =[
		{label: t('hot'), key:"hot", icon: <ExperimentOutlined />},
		{label: t('mine'), key:"mine", icon: <BankOutlined />},
	]

	return (
		<>
			<div className={styles.kol_town_container}>
				<div className={styles.kol_town_content}>
					<Tabs
						centered
						tabBarGutter={60}
						size={"middle"}
						type={"line"}
						animated={true}
						tabPosition="top"
						activeKey={activeTab}
						onChange={(key) => setActivTab(key)}
						items={tabs.map((tab) => {
							return {
								label: tab.label,
								key: tab.key,
								children: tabContent(tab.key),
								icon: tab.icon
							};
						})}
					/>
					<AIInstructMobileComponent id={activeId} room_id={roomId} visible={showKolRoom} onShowProgress={onShowProgress}
                     onClose={()=>setShowKolRoom(false)}/>

					<BuyKolComponent id={activeId} room_id={roomId}
             onClose={()=> {
							 setReload(reload + 1)
							 setShowBuyKol(false)
						 }}
             visible={showBuyKol} onShowProgress={onShowProgress} buyWhat={buyWhat}
					/>
				</div>
			</div>
		</>
	)
}

export default KolTownComponent;
