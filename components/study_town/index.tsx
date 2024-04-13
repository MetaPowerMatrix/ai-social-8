import {Tabs} from "antd";
import React, {useState} from "react";
import styles from './StudyTownCompoent.module.css'
import {useTranslations} from "next-intl";
import {
	BankOutlined,
	CommentOutlined, ExperimentOutlined,
} from "@ant-design/icons";
import SummaryComponent from "@/components/summary";
import SharedKnowledges from "@/components/SharedKnowledges";

const StudyTownCompoent = ({id, mobile, onShowProgress}:{id: string, mobile: boolean, onShowProgress: (s: boolean)=>void}) => {
	const [activeTab, setActivTab] = useState('summary');
	const [updateCounter, setUpdateCounter] = useState<number>(0)
	const t = useTranslations('discovery');

	const tabContent = (key: string) => {
		return (
			<>
				{key === 'summary' &&
          <SummaryComponent updateCounter={updateCounter} activeId={id} onShowProgress={onShowProgress}/>
				}
				{key === 'library' &&
          <SharedKnowledges inTab={true} activeId={id} visible={true} canSelect={true} onClose={()=>{setUpdateCounter(updateCounter+1)}}/>
				}
			</>
		)
	}
	const tabs =[
		{label: t('summary'), key:"summary", icon: <ExperimentOutlined />},
		{label: t('library'), key:"library", icon: <BankOutlined />},
	]
	return (
		<div className={styles.study_town_container}>
			<div className={styles.study_town_content}>
				{ mobile &&
              <Tabs
                  centered
                  tabBarGutter={60}
                  size={"middle"}
                  type={"line"}
                  animated={true}
                  tabPosition="top"
                  activeKey={activeTab}
                  onChange={(key) => setActivTab(key)}
                  items={tabs.map((tab, i) => {
										return {
											label: tab.label,
											key: tab.key,
											children: tabContent(tab.key),
											icon: tab.icon
										};
									})}
              />
				}
			</div>
		</div>
	)
}

export default StudyTownCompoent
