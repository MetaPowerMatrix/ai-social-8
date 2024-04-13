import {Button, Col, Divider, List, Modal, Popover, Row, Tabs, Timeline} from "antd";
import React, {useEffect, useState} from "react";
import styles from './TownComponent.module.css'
import {useTranslations} from "next-intl";
import commandDataContainer from "@/container/command";
import {
	ExclamationCircleFilled, ExperimentOutlined, PlusOutlined, SwapOutlined, TeamOutlined,
} from "@ant-design/icons";
import StudyTownCompoent from "@/components/study_town";
import HotAI from "@/components/HotAI";
import TravelTownComponent from "@/components/TravelTown";
import AIInstructMobileComponent from "@/components/AIInstructMobile";

const towns =[
	{label: '专家小镇，有求必应', value: 'study'},
	{label: '旅游小镇，诗和远方', value: 'travel'},
	{label: '幸运小镇', value: 'literature'},
	{label: '音乐小镇，Music！！', value: 'music'},
	{label: '财富小镇,想赚钱就来', value: 'invest'},
	{label: '游戏小镇,嗨起来', value: 'science'},
	{label: '情感小镇,拒绝EMO', value: 'science'},
	{label: 'web3小镇', value: 'web3'},
]
const TwonMobile = ({id, mobile, onShowProgress}:{id: string, mobile: boolean, onShowProgress: (s: boolean)=>void}) => {
	const [activeTown, setActivTown] = useState('study');
	const [activeTownLabel, setActiveTownLabel] = useState<string>(towns[0].label)
	const [showHot, setShowHot] = useState<boolean>(false)
	const [openPop, setOpenPop] = useState<boolean>(false)
	const command = commandDataContainer.useContainer()
	const t = useTranslations('discovery');
	const {confirm} = Modal;

	const handleJoin = () => {
		confirm({
			icon: <ExclamationCircleFilled/>,
			content: t('join_tips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.goTown(id, activeTown, '').then((res) => {
					Modal.success({
						content: t("join_ok"),
					});
				})
			}
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
							style={{height:40}}
							key={index}
							onClick={()=>{
								Modal.info({
									content: t('select_town_tips')
								})
								setActivTown(item.value)
								setActiveTownLabel(item.label)
								setOpenPop(false)
							}}
						>
							<Row>
								<span>{item.label}</span>
							</Row>
						</List.Item>
					)
				}}
			/>
		)
	}
	return (
		<div className={styles.town_container}>
			{/*<h4 style={{textAlign:"center"}}>{t('town')}</h4>*/}
			<div className={styles.town_content}>
			{ mobile &&
				<>
          <Row align={"middle"}>
              <Col span={19} style={{textAlign:"center"}}>
		              <h4>{activeTownLabel}</h4>
              </Col>
		          <Col span={1} style={{marginRight:10}}>
                  <Popover
		                  placement={"leftBottom"}
                      content={
												<div style={{width: 200, overflow:"scroll", height:180}}>
													<TownList/>
												</div>
											}
                      trigger="click"
                      open={openPop}
                      onOpenChange={handleOpenChange}
                  >
                      <SwapOutlined />
                  </Popover>
		          </Col>
		          <Col span={1} style={{marginRight:10}}>
                  <PlusOutlined onClick={handleJoin} />
		          </Col>
		          <Col span={1}>
                  <TeamOutlined onClick={()=>{
	                  Modal.info({
		                  content: t('sheniu_tips'),
		                  onOk() { setShowHot(true) },
	                  });
                  }}/>
		          </Col>
          </Row>
          <div style={{overflow: "scroll"}}>
            {activeTown === 'study' &&
                <AIInstructMobileComponent id={id} onShowProgress={onShowProgress}/>
            }
	          {activeTown === 'travel' &&
                <TravelTownComponent activeId={id} onShowProgress={onShowProgress}/>
	          }
          </div>
          <HotAI onClose={()=>setShowHot(false)} visible={showHot} canSelect={false} onSelectName={()=>{}}/>
        </>
			}
			</div>
		</div>
	)
}

export default TwonMobile
