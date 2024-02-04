import {createContainer} from "unstated-next"
import {api_url, NodeInfo} from "@/common";

const useManage = () => {
  const get_node_map = async () => {
    let url = api_url.stats.node.list
    let response = await fetch(`${url}`)
    if (response.ok) {
      let nodeMap = new Map<string, string>();
      let dataJson = await response.json()
      if (dataJson.code === 200){
        let data = JSON.parse(dataJson.content)
        data.forEach((node: NodeInfo)=>{
          nodeMap.set(node.id, node.name)
        })
      }
      return nodeMap
    }
  }
  const user_login = async (username: string, password: string) => {
    let url = api_url.user.login
    let data = {username: username, password:password, userid:""}
    let response = await fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    )
    if (response.ok) {
      let dataJson = await response.json()
      console.log(dataJson)
      if (dataJson.code === "200"){
        return true
      }
    }
    return false
  }
  return { get_node_map, user_login }
}

let MetaDataContainer = createContainer(useManage)
export default MetaDataContainer
