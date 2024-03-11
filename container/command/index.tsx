import {createContainer} from "unstated-next"
import {api_url, ChatMessage, getApiServer, PatoInfo, StatsInfo} from "@/common";

const useCommand = () => {
  const create_pato = async (name: string): Promise<string> => {
    let id = ""
    let data = {name: name, gender: 0, personality: ''}
    let url = getApiServer(80) + api_url.portal.register
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
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
      if (dataJson.code === '200'){
        id = dataJson.content
      }
      // let data = JSON.parse(dataJson.content)
    }
    return id
  }
  const getPatoInfo = async (id: string) => {
    if (id === "") return null
    let url = getApiServer(80) + api_url.portal.pato + "/" + id
    let response = await fetch(`${url}`,)
    if (response.ok) {
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
      let patoinfo: PatoInfo = JSON.parse(dataJson.content)
      return patoinfo
    }
    return null
  }
  const login = (id: string) => {
    let url = getApiServer(80) + api_url.portal.login + "/" + id
    fetch(`${url}`,).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
      }
    }).catch((e) => console.log(e))
  }
  const create_today_event = async (id: string, topic: string) => {
    let data = {id: id, topic: topic}
    let url = getApiServer(80) + api_url.portal.task.event
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
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
      // let data = JSON.parse(dataJson.content)
    }
  }
  const pray = async (id: string, wish: string) => {
    let data = {sender: id, receiver: '', message: wish}
    let url = getApiServer(80) + api_url.portal.task.pray
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
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
      // let data = JSON.parse(dataJson.content)
    }
  }
  const getPatoHistoryMessages = async (id: string, date: string) => {
    if (id === "" || date === "") return null
    let url = getApiServer(80) + api_url.portal.message.history + "/" + id + "/" + date
    let response = await fetch(`${url}`,)
    if (response.ok) {
      let dataJson = await response.json()
      console.log(dataJson)
      let patoMessages: ChatMessage[] = JSON.parse(dataJson.content)
      return patoMessages
    }
    return null
  }
  const get_characters = async () => {
    let url = getApiServer(80) + api_url.portal.character.list
    let response = await fetch(url)
    if (response.ok) {
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
    }
  }
  return { get_characters, login, create_pato, getPatoInfo, pray, create_today_event, getPatoHistoryMessages }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
