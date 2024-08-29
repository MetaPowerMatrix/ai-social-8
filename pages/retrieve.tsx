import {Button, Col, Input, List, Modal, Row} from "antd";
import React, {useState} from "react";
import commandDataContainer from "@/container/command";
import {HotPro} from "@/common";

export default function DesktopHome() {
	const [name, setName] = useState<string>('')
	const [retrieveNames, setRetrieveNames] = useState<HotPro[]>([])
	const command = commandDataContainer.useContainer()

	const onInputRetrieveName = (event: React.ChangeEvent<HTMLInputElement>) =>{
		setName(event.target.value)
	}
	const handleRetrieve = (name:string)=>{
		command.retrieve_pato_by_bame(name).then((res)=>{
			setRetrieveNames(res)
		})
	}
	return(
		<div style={{width:"100%", height: 600}}>
			<div style={{marginTop:40, width:"100%", height: "100%",padding:10}}>
				<Row>
					<Col span={18}>
						<Input placeholder={"要找回的pato名字"} name="pato_name" id="pato_name" onChange={onInputRetrieveName}/>
					</Col>
					<Col span={6} style={{textAlign:"end"}}>
						<Button type={"primary"} onClick={()=>{
							handleRetrieve(name)
						}}>查询</Button>
					</Col>
				</Row>
				<div style={{width:"100%", height: "100%", marginTop: 40}}>
					<Row align={"middle"} style={{width: "100%"}}>
						<Col span={8} style={{textAlign:"center"}}><h4>名字</h4></Col>
						<Col span={8} style={{textAlign:"center"}}><h4>ID</h4></Col>
						<Col span={6} style={{textAlign:"center"}}><h4>小镇编号</h4></Col>
						<Col span={2} style={{textAlign:"center"}}><h4>操作</h4></Col>
					</Row>
					<List
						itemLayout="horizontal"
						size="small"
						split={true}
						dataSource={retrieveNames}
						renderItem={(item, index) => (
							<List.Item
								key={index}
								defaultValue={item.id}
							>
								<Row align={"middle"} style={{width: "100%"}}>
									<Col span={10} style={{textAlign:"start"}}><h4>{item.name}</h4></Col>
									<Col span={8} style={{textAlign:"start"}}><h4>{item.id.substring(0,6)}...{item.id.substring(32,36)}</h4></Col>
									<Col span={4} style={{textAlign:"center"}}><h4>{item.subjects[0]}</h4></Col>
									<Col span={2} style={{textAlign:"end", }}><Button onClick={()=>{
										let username = item.name
										let userid = item.id
										let localInfoStr = localStorage.getItem("local_patos")
										if (localInfoStr === null){
											const localInfo ={ids: [`${userid}:${username}`], active_id: `${userid}`}
											localStorage.setItem("local_patos", JSON.stringify(localInfo))
										}else{
											const localInfo = JSON.parse(localInfoStr)
											localInfo.ids.push(`${userid}:${username}`)
											const newlocalInfo = {ids: localInfo.ids, active_id: `${userid}`}
											localStorage.setItem("local_patos", JSON.stringify(newlocalInfo))
										}
										Modal.success({
											content: '找回成功，是否跳转首页',
											onOk(){
												window.location.href = "/"
											}
										})
									}}>找回</Button></Col>
								</Row>
							</List.Item>
						)}
					/>
				</div>
			</div>
		</div>
	)
}
