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
	visible: boolean,
	canSelect: boolean,
	onSelectName: (name: string, id: string)=>void,
	onClose: ()=>void,
}

const SharedKnowledgesComponent: React.FC<HotAIPros>  = ({visible, canSelect, onSelectName, onClose}) => {
	const t = useTranslations('AIInstruct');
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
	const [knowledges, setKnowledges] = useState<PortalKnowledge[]>([])
	const command = commandDataContainer.useContainer()
	const {confirm} = Modal;

	useEffect(()=> {
		if (visible)
		{
			command.getSharedKnowledges().then((response) => {
				setKnowledges(response)
			})
		}
	},[visible])
	const [open, setOpen] = useState(false);

	const hide = () => {
		setOpen(false);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
	};
	return (
		<div hidden={!visible} className={styles.sharedKnowledges_container_mobile}>
			{
        <Row style={{padding: 10}}>
            <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>
        </Row>
			}
			<div className={styles.sharedKnowledges_content_mobile}>
					<div style={{overflow: "scroll", padding: 15}}>
						<h3 style={{textAlign:"center"}}>{t('shared')}</h3>
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
										{
											canSelect &&
                        <Col span={2} style={{textAlign: "end",marginLeft:10}}>
		                        <PlusOutlined onClick={()=>{
			                        confirm({
				                        icon: <ExclamationCircleFilled />,
				                        content: t('addSharedKnowledge'),
				                        okText: t('confirm'),
				                        cancelText: t('cancel'),
				                        onOk() {
					                        onSelectName(item.title, item.sig)
				                        }
			                        })
		                        }}/>
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
		</div>
	);
};

export default SharedKnowledgesComponent;
