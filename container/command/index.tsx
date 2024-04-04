import {createContainer} from "unstated-next"
import {api_url, ChatMessage, getApiServer, PatoInfo, Persona, SessionMessages} from "@/common";

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
  const archive_session = async (id: string, session: string, date: string) => {
    let data = {id: id, session: session, date: date}
    let url = getApiServer(80) + api_url.portal.message.archive
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
      if (dataJson.code === '200'){
        return true
      }
      // let data = JSON.parse(dataJson.content)
    }
    return false
  }
  const continue_live_chat = async (id: string, roles: string[], message: string, session: string) => {
    let data = {id: id, roles: roles, message: message, session: session}
    let url = getApiServer(80) + api_url.portal.interaction.live.continue
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
  const end_live_chat = async (roles: string[]) => {
    let data = roles
    let url = getApiServer(80) + api_url.portal.interaction.live.end
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
  const restore_live_chat = async (roles: string[], session: string) => {
    let data = roles
    let url = getApiServer(80) + api_url.portal.interaction.live.reload + "/" + session
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
  const edit_session_messages = async (id: string, session: string, date: string, messages: ChatMessage[]) => {
    let data = {id: id, session: session, date: date, messages: messages}
    let url = getApiServer(80) + api_url.portal.message.edit
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
  const continue_session_chat = async (id: string, session: string, date: string, continued: boolean) => {
    let data = {id: id, session: session, date: date, continued: continued}
    let url = getApiServer(80) + api_url.portal.message.continue
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
  const deposit_metapower = async (id: string, amount: number, is_donation: boolean) => {
    let data = {id: id, amount: amount, is_donation: is_donation}
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
  const stake_metapower = async (id: string, amount: number, is_donation: boolean) => {
    let data = {id: id, amount: amount, is_donation: is_donation}
    let url = getApiServer(80) + api_url.account.wallet.stake
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
  const goTown = async (id: string, town: string, topic: String) => {
    let data = {sender: id, town: town, topic: topic}
    let url = getApiServer(80) + api_url.portal.interaction.go_town
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
  const query_embedding = async (id: string, sig: string, query: String) => {
    let data = {sender: id, sig: sig, query: query}
    let url = getApiServer(80) + api_url.portal.task.knowledge_query
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
      let result = dataJson.content
      console.log(dataJson)
      return result
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
        let patoMessages: SessionMessages[] = JSON.parse(dataJson.content)
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
  const genPatoAuthToken = async (id: string) => {
    if (id === "") return null
    let url = getApiServer(80) + api_url.portal.auth.gen + "/" + id
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let token = dataJson.content
        return token
      }
    } catch (e) {
      console.log(e)
    }
    return null
  }
  const query_summary = async (id: string, sig: string) => {
    if (id === "") return null
    let url = getApiServer(80) + api_url.portal.task.knowledge_summary + "/" + id + "/" + sig
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let summary = dataJson.content
        return summary
      }
    } catch (e) {
      console.log(e)
    }
    return null
  }
  const queryPatoAuthToken = async (token: string | null) => {
    if (token === null) return []
    let url = getApiServer(80) + api_url.portal.auth.query + "/" + token
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        return dataJson.content.split(',')
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const getProHistoryMessages = async (id: string, pro_id: string, date: string) => {
    if (id === "" || date === "") return null
    let url = getApiServer(80) + api_url.portal.message.pro + "/" + id + "/" + pro_id + "/" + date
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let patoMessages: SessionMessages[] = JSON.parse(dataJson.content)
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
    deposit_metapower, archive_session, stake_metapower, continue_live_chat, end_live_chat, restore_live_chat,
    getProHistoryMessages, genPatoAuthToken, queryPatoAuthToken, edit_session_messages, continue_session_chat,
    goTown, query_embedding, query_summary
  }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
