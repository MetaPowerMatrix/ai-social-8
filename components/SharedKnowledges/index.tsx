import React, {useEffect, useState} from 'react';
import styles from "./SharedKnowledgesComponentComponent.module.css";
import {
	Col, List, Modal, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	ExclamationCircleFilled,
	LeftOutlined, OrderedListOutlined,
	PlusOutlined
} from "@ant-design/icons";
import {PortalKnowledge} from "@/common";
import commandDataContainer from "@/container/command";

interface HotAIPros {
	activeId: string,
	inTab: boolean,
	visible: boolean,
	canSelect: boolean,
	onClose: ()=>void,
}

const SharedKnowledgesComponent: React.FC<HotAIPros>  = ({activeId, inTab, visible, canSelect, onClose}) => {
	const t = useTranslations('discovery');
	const [knowledges, setKnowledges] = useState<PortalKnowledge[]>([])
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	const handleAddSharedKnowledge = (name:string, sig:string, owner:string) => {
		confirm({
			icon: <ExclamationCircleFilled />,
			content: t('addSharedKnowledge'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.add_shared_knowledge(activeId, sig, name, owner).then(()=>{
					onClose()
					Modal.success({
						content: t('add_share_ok')
					})
				})
			}
		})
	}
	useEffect(()=> {
		if (visible)
		{
			command.getSharedKnowledges().then((response) => {
				setKnowledges(response)
			})
		}
	},[visible])

	return (
		<div hidden={!visible} className={inTab ? styles.sharedKnowledges_container_tab : styles.sharedKnowledges_container_mobile}>
			{!inTab &&
					<>
              <Row style={{padding: 10}}>
                  <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>
              </Row>
              <h3 style={{textAlign:"center"}}>{t('shared')}</h3>
					</>
			}
			<div className={styles.sharedKnowledges_content_mobile}>
				<List
					itemLayout="horizontal"
					size="small"
					dataSource={knowledges}
					renderItem={(item, index) => (
						<List.Item
							key={index}
							defaultValue={item.sig}
						>
							<Row align={"middle"} style={{width:"100%"}}>
								<Col span={canSelect ?18:22}>
									<h5 style={{overflow:"scroll"}}>{item.title}</h5></Col>
								{
									canSelect &&
	                  <Col span={2} style={{textAlign: "end",marginLeft:10}}>
	                      <PlusOutlined onClick={()=> handleAddSharedKnowledge(item.title, item.sig, item.owner)}/>
										</Col>
								}
								<Col span={2} style={{textAlign: "end"}}>
										<OrderedListOutlined onClick={()=>{
											Modal.info({
												title: t('digest'),
												content: item.summary,
											})
										}}/>
								</Col>
							</Row>
						</List.Item>
					)}
				/>
			</div>
		</div>
	);
};

export default SharedKnowledgesComponent;
