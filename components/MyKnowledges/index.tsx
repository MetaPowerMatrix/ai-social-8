import React from 'react';
import styles from "./MyKnowledgesComponentComponent.module.css";
import {
	Col, Divider, List, Modal, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	ExclamationCircleFilled,
	LeftOutlined, OrderedListOutlined,
	PlusOutlined, SearchOutlined, ShareAltOutlined
} from "@ant-design/icons";
import commandDataContainer from "@/container/command";
import {PortalKnowledge} from "@/common";

interface HotAIPros {
	activeId: string,
	onSelectName: (name: string, id: string, owner:string)=>void,
	knowledges: PortalKnowledge[]
}

const MyKnowledgesComponent: React.FC<HotAIPros>  = ({activeId, onSelectName, knowledges}) => {
	const t = useTranslations('discovery');
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	const shareKnowledge = (sig: string, title:string) => {
		confirm({
			icon: <ExclamationCircleFilled />,
			content: t('share_tips'),
			okText: t('confirm'),
			cancelText: t('cancel'),
			onOk() {
				command.share_knowledge(activeId, sig, title).then(() => {
					Modal.success({
						content: t('share_ok')
					})
				})
			}
		})
	}

	return (
		<div className={styles.sharedKnowledges_container_mobile}>
			<div className={styles.sharedKnowledges_content_mobile}>
					<div style={{overflow: "scroll"}}>
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
										<Col span={18}><h5 style={{overflow:"scroll"}}>{item.title}</h5></Col>
										<Col span={6} style={{textAlign:"end"}}>
											<SearchOutlined onClick={()=>onSelectName(item.title, item.sig, item.owner)}/>
											<Divider type={"vertical"}/>
											<ShareAltOutlined onClick={() => shareKnowledge(item.sig, item.title)} />
											<Divider type={"vertical"}/>
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
		</div>
	);
};

export default MyKnowledgesComponent;
