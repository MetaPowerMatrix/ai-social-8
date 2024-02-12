import {createContainer} from "unstated-next"
import {api_url, NodeInfo} from "@/common";

const useManage = () => {
  const user_login = async (username: string, password: string) => {
    let url = api_url.portal.login
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
  return { user_login }
}

let MetaDataContainer = createContainer(useManage)
export default MetaDataContainer
