import {createContainer} from "unstated-next"
import {api_url, ChatMessage, getApiServer, PatoInfo, Persona, sessionMessages, StatsInfo} from "@/common";

const useCommand = () => {
  const create_pato = async (name: string): Promise<string> => {
    let id = ""
    let data = {name: name, gender: 0, personality: ''}
    let url = getApiServer(80) + api_url.portal.register
    console.log("register url: ",url)
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
      // console.log(dataJson)
      if (dataJson.code === '200'){
        id = dataJson.content
      }
      // let data = JSON.parse(dataJson.content)
    }
    return id
  }
  const callPato = async (id: string, callid: string) => {
    if (id === "" || callid === "") return null
    let url = getApiServer(80) + api_url.portal.interaction.call + "/" + id + "/" + callid
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        console.log(dataJson)
      }
    }catch (e) {
      console.log(e)
    }
  }
  const getPatoInfo = async (id: string) => {
    if (id === "") return null
    let url = getApiServer(80) + api_url.portal.pato + "/" + id
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        // console.log(dataJson)
        let patoinfo: PatoInfo = JSON.parse(dataJson.content)
        return patoinfo
      }
    }catch (e) {
      console.log(e)
    }
    return null
  }
  const getPatoISS = async (id: string) => {
    if (id === "") return undefined
    let url = getApiServer(80) + api_url.portal.character.iss + "/" + id
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        // console.log(dataJson)
        let iss: Persona = JSON.parse(dataJson.content)
        return iss
      }
    }catch (e) {
      console.log(e)
    }
    return undefined
  }
  const login = (id: string) => {
    let url = getApiServer(80) + api_url.portal.login + "/" + id
    fetch(`${url}`,).then(async (response)=> {
      if (response.ok) {
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
      let dataJson = await response.json()
      console.log(dataJson)
      // let data = JSON.parse(dataJson.content)
    }
  }
  const deposit_metapower = async (id: string, amount: number) => {
    let data = {id: id, amount: amount}
    let url = getApiServer(80) + api_url.account.wallet.deposit
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
      let dataJson = await response.json()
      console.log(dataJson)
      // let data = JSON.parse(dataJson.content)
    }
  }
  const getPatoHistoryMessages = async (id: string, date: string) => {
    if (id === "" || date === "") return null
    let url = getApiServer(80) + api_url.portal.message.history + "/" + id + "/" + date
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let patoMessages: sessionMessages[] = JSON.parse(dataJson.content)
        patoMessages.forEach((item) => {
          item.messages.sort((a, b) => a.created_at - b.created_at)
        })
        return patoMessages
      }
    } catch (e) {
      console.log(e)
    }
    return null
  }
  return { login, create_pato, getPatoInfo, pray, create_today_event, getPatoHistoryMessages, getPatoISS, callPato,
    deposit_metapower
  }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
