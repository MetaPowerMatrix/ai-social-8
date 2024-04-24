import {createContainer} from "unstated-next"
import {
  api_url,
  ChatMessage,
  getApiServer, HotPro, KolInfo,
  PatoInfo,
  Persona,
  PortalHotAi,
  PortalKnowledge, PortalLiveRoomInfo, PortalRoomInfo,
  SessionMessages
} from "@/common";

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
  const callPato = async (id: string, callid: string, topic: string) => {
    if (id === "" || callid === "") return null
    let data = {id: id, callid: callid, topic: topic}
    let url = getApiServer(80) + api_url.portal.interaction.call
    try {
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
      }
    }catch (e) {
      console.log(e)
    }
  }
  const getProHots = async () => {
    let url = getApiServer(80) + api_url.portal.message.hotpros
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let pros: HotPro[] = JSON.parse(dataJson.content)
        return pros
      }
    }catch (e) {
      console.log(e)
    }
    return []
  }
  const getTopicHots = async () => {
    let url = getApiServer(80) + api_url.portal.message.hot_topics
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let topics: string[] = JSON.parse(dataJson.content)
        return topics
      }
    }catch (e) {
      console.log(e)
    }
    return []
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
  const create_today_event = async (id: string, topic: string, town: string) => {
    let data = {id: id, topic: topic, town: town}
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
  const init_topic_chat = async (id: string, topic: string, town: string) => {
    let data = {id: id, topic: topic, town: town}
    let url = getApiServer(80) + api_url.portal.task.topic_chat
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
      // let data = JSON.parse(dataJson.content)
    }
  }
  const get_topic_chat_his = async (id: string, topic: string, town: string) => {
    let data = {id: id, topic: topic, town: town}
    let url = getApiServer(80) + api_url.portal.message.topic_chat_his
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
      let data: string[] = JSON.parse(dataJson.content)
      return data
    }
    return []
  }
  const get_pato_names = async (ids: string[]) => {
    let url = getApiServer(80) + api_url.portal.names
    let response = await fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(ids)
      }
    )
    if (response.ok) {
      let dataJson = await response.json()
      if (dataJson.content !== ''){
        let data: HotPro[] = JSON.parse(dataJson.content)
        return data
      }
    }
    return []
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
  const edit_session_messages = async (id: string, kol: string, messages: ChatMessage[]) => {
    let data = {id: id, kol: kol, messages: messages}
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
    let data = {id: id, town: town, topic: topic}
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
    let data = {id: id, sig: sig, query: query}
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
  const share_knowledge = async (id: string, sig: string, title: string) => {
    let data = {id: id, sig: sig, title: title, shared: true, owner: id}
    let url = getApiServer(80) + api_url.portal.task.knowledge_share
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
    }
  }
  const image_desc_by_url = async (id: string, roomId: string, image_url: string) => {
    let data = {id: id, room_id: roomId, scene: image_url}
    let url = getApiServer(80) + api_url.portal.town.image_parse
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
      return dataJson.content
    }
    return ''
  }
  const image_desc_by_url_prompt = async (id: string, roomId: string, image_url: string, prompt: string) => {
    let data = {id: id, room_id: roomId, scene: image_url}
    let url = getApiServer(80) + api_url.portal.town.image_parse
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
      return dataJson.content
    }
    return ''
  }
  const add_shared_knowledge = async (id: string, sig: string, title: string, owner:string) => {
    let data = {id: id, sig: sig, title: title, shared: false, owner:owner}
    let url = getApiServer(80) + api_url.portal.task.knowledge_add
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
    }
  }
  const log_user_activity = async (id: string, page: string, action: string) => {
    let data = {id: id, page: page, action: action}
    let url = getApiServer(80) + api_url.stats.active
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
    }
  }
  const getSharedKnowledges = async () => {
    let url = getApiServer(80) + api_url.portal.message.shared
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let books: PortalKnowledge[] = JSON.parse(dataJson.content)
        return books
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const getTownHots = async () => {
    let url = getApiServer(80) + api_url.portal.message.hot
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let hots: PortalHotAi[] = JSON.parse(dataJson.content)
        return hots
      }
    } catch (e) {
      console.log(e)
    }
    return []
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
  const query_knowledges = async (id: string) => {
    if (id === "") return []
    let url = getApiServer(80) + api_url.portal.knowledges + "/" + id
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let knowLedges: PortalKnowledge[] = JSON.parse(dataJson.content)
        return knowLedges
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const create_game_room = async (id: string, title: string, description: string, town: string) => {
    let data = {owner: id, room_id:'', title: title, description: description, town: town, cover:''}
    let url = getApiServer(80) + api_url.portal.town.create_game
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
      console.log(dataJson.content)
      return dataJson.content
    }
    return ''
  }
  const join_game = async (id: string, owner: string, room_id: string, room_name: string, level: number) => {
    let data = {owner: owner, room_id: room_id, room_name: room_name, id: id,
      message: '', image_url: '', answer:'', level:level}
    let url = getApiServer(80) + api_url.portal.town.join_game
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
      if (dataJson.content !== ''){
        let scene_info: [] = JSON.parse(dataJson.content)
        return scene_info;
      }
    }
    return []
  }
  const ask_clue = async (id: string, owner: string, room_id: string, room_name: string, message: string, image_url: string) => {
    let data = {owner: owner, room_id: room_id, room_name: room_name, id: id,
      message: message, image_url: image_url, answer:''}
    let url = getApiServer(80) + api_url.portal.town.game_clue
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
      console.log(dataJson.content)
    }
  }
  const ask_image_context = async (id: string, prompt: string, input: string, image_url: string) => {
    let data = {id: id, prompt: prompt, input: input, image_url: image_url}
    let url = getApiServer(80) + api_url.portal.town.game_scene_context
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
      console.log(dataJson.content)
      return dataJson.content
    }
    return ''
  }
  const ask_image_prompt = async (id: string, description: string, his: string, arch: string) => {
    let data = {id: id, description: description, history: his, architecture: arch}
    let url = getApiServer(80) + api_url.portal.town.game_scene_prompt
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
      console.log(dataJson.content)
      return dataJson.content
    }
    return ''
  }
  const send_answer = async (id: string, owner: string, room_id: string, room_name: string, answer: string, level: number) =>
  {
    let data = {owner: owner, room_id: room_id, room_name: room_name, id: id,
      message: '', image_url: '', answer:answer, level:level}
    let url = getApiServer(80) + api_url.portal.town.send_answer
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
      return dataJson.content
    }
    return ''
  }
  const gen_answer = async (id: string, image_url: string, room_id: string, level:number, prompt: string, input: string) => {
    let data = {room_id: room_id, id: id, prompt: prompt, image_url: image_url, input:input, level: level}
    let url = getApiServer(80) + api_url.portal.town.generate_answer
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
      let answer = dataJson.content
      return answer
    }
    return ""
  }
  const reveal_answer = async (id: string, owner: string, room_id: string, level:number) => {
    let data = {owner: owner, room_id: room_id, room_name: '', id: id,
      message: '', image_url: '', answer:'', level: level}
    let url = getApiServer(80) + api_url.portal.town.reveal_answer
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
      let answer = dataJson.content
      return answer
    }
    return ""
  }
  const query_rooms = async (town: string) => {
    if (town === "") return []
    let url = getApiServer(80) + api_url.portal.town.list_game + "/" + town
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let rooms: PortalRoomInfo[] = JSON.parse(dataJson.content)
        return rooms
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const query_live_rooms = async () => {
    let url = getApiServer(80) + api_url.portal.interaction.live.rooms
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let rooms: PortalLiveRoomInfo[] = JSON.parse(dataJson.content)
        return rooms
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const query_kol_rooms = async () => {
    let url = getApiServer(80) + api_url.portal.town.kol_list
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let rooms: KolInfo[] = JSON.parse(dataJson.content)
        return rooms
      }
    } catch (e) {
      console.log(e)
    }
    return []
  }
  const become_kol = async (id: string) => {
    let url = getApiServer(80) + api_url.portal.town.becom_kol + "/" + id
    try {
      let response = await fetch(`${url}`,)
    } catch (e) {
      console.log(e)
    }
  }
  const join_kol = async (follower:string, id: string) => {
    let url = getApiServer(80) + api_url.portal.town.join_kol + "/" + follower + "/" + id
    try {
      let response = await fetch(`${url}`,)
    } catch (e) {
      console.log(e)
    }
  }
  const retrieve_pato_by_bame = async (name: string) => {
    if (name === "") return []
    let url = getApiServer(80) + api_url.portal.retrieve + "/" + name
    try {
      let response = await fetch(`${url}`,)
      if (response.ok) {
        let dataJson = await response.json()
        let patos: HotPro[] = JSON.parse(dataJson.content)
        return patos
      }
    } catch (e) {
      console.log(e)
    }
    return []
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
        let patoMessages: ChatMessage[] = JSON.parse(dataJson.content)
          patoMessages.sort((a, b) => a.created_at - b.created_at)
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
    goTown, query_embedding, query_summary, query_knowledges, getTownHots, getSharedKnowledges, share_knowledge,
    getProHots, add_shared_knowledge, getTopicHots, init_topic_chat, get_topic_chat_his, query_rooms, create_game_room,
    send_answer, gen_answer, ask_clue, join_game, log_user_activity, image_desc_by_url, reveal_answer, retrieve_pato_by_bame,
    query_live_rooms, query_kol_rooms, become_kol, join_kol, get_pato_names, ask_image_prompt, ask_image_context
  }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
