import React, {useEffect, useState} from 'react';
import styles from "./HotAIComponent.module.css";
import {
	Col, List, Row
} from "antd";
import {useTranslations} from "next-intl";
import {
	LeftOutlined,
	PlusOutlined
} from "@ant-design/icons";
import {PortalHotAi} from "@/common";
import commandDataContainer from "@/container/command";

interface HotAIPros {
	visible: boolean,
	canSelect: boolean,
	onSelectName: (name: string, id: string)=>void,
	onClose: ()=>void,
}

const HotAIComponent: React.FC<HotAIPros>  = ({visible, canSelect, onSelectName, onClose}) => {
	const t = useTranslations('AIInstruct');
	const [selectedIndex, setSelectedIndex] = useState<number | undefined>(undefined);
	const [HotAis, setHotAis] = useState<PortalHotAi[]>([])
	const command = commandDataContainer.useContainer()

	useEffect(()=> {
		if (visible)
		{
			command.getTownHots().then((response) => {
				setHotAis(response)
			})
		}
	},[visible])

	return (
		<div hidden={!visible} className={styles.hotai_container_mobile}>
			{
        <Row style={{padding: 10}}>
            <LeftOutlined style={{fontSize: 15}} onClick={() => onClose()}/>
        </Row>
			}
			<div className={styles.hotai_content_mobile}>
					<div style={{overflow: "scroll", padding: 15}}>
						<h3 style={{textAlign:"center"}}>{t('hot')}</h3>
						<List
							itemLayout="horizontal"
							size="small"
							dataSource={HotAis}
							renderItem={(item, index) => (
								<List.Item
									key={index}
									className={selectedIndex != undefined && selectedIndex === index ? styles.list_item : ''}
									defaultValue={item.id}
									onClick={(e) => {
										setSelectedIndex(index)
										onSelectName(item.name, item.id)
									}}
								>
									<Row align={"middle"} style={{width:"100%"}}>
										<Col span={10}><h5>{item.name}</h5></Col>
										<Col span={12}>
											<h5>最近交谈次数: {item.talks}</h5>
											<h5>专业技能: {item.pros}</h5>
										</Col>
										{
											canSelect &&
                        <Col span={2} style={{textAlign: "end"}}><PlusOutlined/></Col>
										}
									</Row>
								</List.Item>
							)}
						/>
					</div>
			</div>
		</div>
	);
};

export default HotAIComponent;
