import {createContainer} from "unstated-next"
import {api_url, getApiServer} from "@/common";

const useCommand = () => {
  const send_live_message = async (message: string, port: number) => {
    let url = getApiServer(port) + api_url.message.send
    let codes = message.split('').map((code)=>code.charCodeAt(0)-97+29);
    console.log(codes)
    let data = {codes: codes}
    fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const get_characters = async () => {
    let url = getApiServer(80) + api_url.portal.character.list
    let response = await fetch(url)
    if (response.ok) {
      let dataJson = await response.json()
      return JSON.parse(dataJson.content)
    }
  }
  const start_ai_social_task = async (data: string[]) => {
    let url = api_url.ai.start
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
      // let data = JSON.parse(dataJson.content)
      // console.log(data)
    }
  }
  return { send_live_message, start_ai_social_task, get_characters }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
