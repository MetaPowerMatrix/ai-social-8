import React from 'react';
import styles from "./MyKnowledgesComponentComponent.module.css";
import {
	Col, List, Modal, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	ExclamationCircleFilled,
	LeftOutlined, OrderedListOutlined,
	PlusOutlined, ShareAltOutlined
} from "@ant-design/icons";
import commandDataContainer from "@/container/command";

interface HotAIPros {
	activeId: string,
	visible: boolean,
	canSelect: boolean,
	onSelectName: (name: string, id: string)=>void,
	onClose: ()=>void,
	knowledges: { label: string, value: string }[]
}

const MyKnowledgesComponent: React.FC<HotAIPros>  = ({activeId, visible, canSelect, onSelectName, onClose, knowledges}) => {
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
		<div hidden={!visible} className={styles.sharedKnowledges_container_mobile}>
			{
        <Row style={{padding: 10}}>
            <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>
        </Row>
			}
			<div className={styles.sharedKnowledges_content_mobile}>
					<div style={{overflow: "scroll", padding: 15}}>
						<h3 style={{textAlign:"center"}}>{t('my_knowledges')}</h3>
						<List
							itemLayout="horizontal"
							size="small"
							dataSource={knowledges}
							renderItem={(item, index) => (
								<List.Item
									key={index}
									defaultValue={item.value}
								>
									<Row align={"middle"} style={{width:"100%"}}>
										<Col span={18}><h5 style={{overflow:"scroll"}}>{item.label}</h5></Col>
										{
											canSelect &&
                        <Col span={2} style={{textAlign: "end",marginLeft:10}}>
		                        <PlusOutlined onClick={()=>{
			                        confirm({
				                        icon: <ExclamationCircleFilled />,
				                        content: t('addMyKnowledge'),
				                        okText: t('confirm'),
				                        cancelText: t('cancel'),
				                        onOk() {
					                        onSelectName(item.label, item.value)
					                        onClose()
				                        }
			                        })
		                        }}/>
												</Col>
										}
										<Col onClick={() => shareKnowledge(item.value, item.label)} span={2}
										     style={{textAlign: "end"}}><ShareAltOutlined/></Col>
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
