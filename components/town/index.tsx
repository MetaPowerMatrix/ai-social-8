import {Col, List, Modal, Popover, Row} from "antd";
import React, {useState} from "react";
import styles from './TownComponent.module.css'
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {
	SwapOutlined, TeamOutlined,
} from "@ant-design/icons";
import HotAI from "@/components/HotAI";
import Image from "next/image";
import utilStyles from "@/styles/utils.module.css";
import GameMishiTownComponent from "@/components/GameMishiTown";
import LiveBroadcastTownComponent from "@/components/LiveBroadcastTown";
import KolTownComponent from "@/components/KolTown";
import AniTown from "@/components/AniTown";
import Panorama from "@/components/Panoramic";
import InteractivePanorama from "@/components/InteractivePanoramic";

const towns =[
	{label: 'KOL小镇', value: 'kol', description: '每一天都要和有趣的人在一起'},
	{label: '密室小镇', value: 'game', description: '拨开重重迷雾，你能否战胜AI的迷思'},
	{label: '直播小镇', value: 'live', description: 'AI直播也逗逼，要不要看看'},
	{label: '幸运小镇', value: 'literature', description: '有一种从天而降的富贵'},
	// {label: '旅游小镇', value: 'travel', description: '诗和远方，没钱也行'},
	{label: '音乐小镇', value: 'music', description: '康桑～～Music！！'},
	// {label: '财富小镇,想赚钱就来', value: 'invest', description: '游戏小镇,嗨起来'},
	// {label: '情感小镇,拒绝EMO', value: 'science', description: '游戏小镇,嗨起来'},
	// {label: 'web3小镇', value: 'web3'},
]
const TwonMobile = ({id, name, mobile, onShowProgress}:{id: string,name:string, mobile: boolean, onShowProgress: (s: boolean)=>void}) => {
	const [activeTown, setActivTown] = useState(towns[0].value);
	const [activeTownLabel, setActiveTownLabel] = useState<string>(towns[0].label)
	const [showHot, setShowHot] = useState<boolean>(false)
	const [openPop, setOpenPop] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()
	const t = useTranslations('discovery');
	const {confirm} = Modal;

	const handleJoin = (activeTown: string) => {
		command.goTown(id, activeTown, '').then((res) => {
			// Modal.success({
			// 	content: t("join_ok"),
			// });
		})
	}

	const handleOpenChange = (newOpen: boolean) => {
		setOpenPop(newOpen);
	};
	const TownList = () => {
		return(
			<List
				itemLayout="vertical"
				dataSource={towns}
				renderItem={(item, index) => {
					return (
						<List.Item
							key={index}
							onClick={()=>{
								setActivTown(item.value)
								setActiveTownLabel(item.label)
								setOpenPop(false)
								handleJoin(item.value)
							}}
						>
							<Row align={"middle"}>
								<Col span={4}>
									<Image className={utilStyles.borderCircle} src="/images/logo.jpg" alt={"logo"} width={42} height={42}/>
								</Col>
								<Col span={8}>
									<div style={{marginBottom:5}}>{item.label}</div>
									<div><TeamOutlined style={{marginRight: 10}}/>{(Math.random()*100).toFixed(0)}</div>
								</Col>
								<Col span={10}>
									<span>{item.description}</span>
								</Col>
							</Row>
						</List.Item>
					)
				}}
			/>
		)
	}
	return (
		<div className={styles.town_container}>
			<div className={styles.town_content}>
			{ mobile &&
				<>
          <Row align={"middle"}>
              <Col span={24} style={{textAlign:"center"}}>
		              <h4 style={{display:"inline-block"}}>{activeTownLabel}</h4>
                  <Popover
                      placement={"bottom"}
                      content={
					              <div style={{width: 370, overflowY:"scroll", height:500}}>
						              <TownList/>
					              </div>
				              }
                      trigger="click"
                      open={openPop}
                      onOpenChange={handleOpenChange}
                  >
                      <SwapOutlined style={{marginLeft: 10, color: "darkorchid", fontSize: 14}}/>
                  </Popover>
                  {/*<TeamOutlined style={{marginLeft:5}} onClick={()=>{*/}
			            {/*  setShowHot(true)*/}
		              {/*}}/>*/}
              </Col>
          </Row>
          {activeTown === 'game' &&
              <GameMishiTownComponent activeId={id} onShowProgress={onShowProgress}/>
          }
          {activeTown === 'live' &&
              <LiveBroadcastTownComponent activeId={id} onShowProgress={onShowProgress}/>
          }
          {activeTown === 'kol' &&
              <KolTownComponent name={name} activeId={id} onShowProgress={onShowProgress}/>
          }
					{activeTown === 'music' &&
              <AniTown/>
					}
					{activeTown === 'literature' &&
              <Panorama/>
          }
          {/*<HotAI onClose={()=>setShowHot(false)} visible={showHot} canSelect={false} onSelectName={()=>{}}/>*/}
        </>
			}
			</div>
		</div>
	)
}

export default TwonMobile
