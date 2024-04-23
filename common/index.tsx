import {ReactNode} from "react";

export const tokenAbi = [{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"symbol","type":"string"},{"internalType":"uint8","name":"decimals","type":"uint8"},{"internalType":"uint256","name":"totalSupply","type":"uint256"}],"payable":true,"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":true,"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"uint256","name":"value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"subtractedValue","type":"uint256"}],"name":"decreaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"addedValue","type":"uint256"}],"name":"increaseAllowance","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
export const tokenContractAddress = "0xD6311f9A6bd3a802263F4cd92e2729bC2C31Ed23"
export const recipientAddress = '0xd951AA2182A55aEeE6D32b1be11ebAEe61Cb2623'
export const host = "api.metapowermatrix.ai"
export const Web_Server = "https://"+ host
export const Streaming_Server = "wss://ws.metapowermatrix.ai"
export const getApiServer = (port: number) => {
  // return Web_Server + ':' + port
  return Web_Server
}
export const getMQTTBroker = () => {
  return "wss://ws.metapowermatrix.ai/mqtt"
}
export interface HotPro{
  id: string,
  name: string,
  subjects: string[]
}
export interface PortalHotAi{
    id: string,
    name: string,
    talks: number,
    pros: string,
}
export interface PortalKnowledge{
  sig: string,
  title: string,
  owner: string,
  summary: string,
}
export interface KolInfo{
  id: string,
  name: string,
  followers: string[],
}
export interface PortalRoomInfo{
  owner: string,
  room_id: string,
  room_name: string,
  title: string,
  description: string,
  cover: string,
  town: string
}
export interface PortalLiveRoomInfo{
  owner: string,
  room_id: string,
  room_name: string,
  roles: string[],
  title: string,
  description: string,
  cover: string,
  town: string
}

export interface LiveOpenResponse {
  room_id: string,
  cover: string,
}
export interface TimeLineItem {
  children: string
}
export interface PatoInfo {
  sn: number,
  id: string,
  name: string,
  matrix_datetime: string,
  registered_datetime: string,
  professionals: string[],
  balance: number
}
export interface ListItemInfo{
  name: string;
  id: string;
  value: string
}
export interface NodeInfo{
  name: string;
  id: string;
  ip: string
}
export interface StatsInfo{
  key: string,
  label: string,
  children: string | ReactNode,
}
export interface ChatMessage{
  created_at: number,
  session: string,
  place: string,
  sender: string,
  receiver: string,
  question: string,
  answer: string,
  subject: string,
  sender_role: string
}
export interface SessionMessages{
  session: string,
  summary: string,
  messages: ChatMessage[]
}
export interface SessionList{
  session: string,
  receiver: string,
  place: string,
  subject: string,
  summary: string,
  created_at: number,
  messages: ChatMessage[]
}
export interface Persona {
  name: string,
  age: number,
  innate: string,
  learned: string,
  currently: string,
  lifestyle: string,
  daily_plan_req: string,
}

export const api_url = {
    'portal': {
      'login': '/api/login',
      'register': '/api/register',
      'pato': '/api/pato/info',
      'names': '/api/pato/names',
      'retrieve': '/api/pato/retrieve',
      'knowledges': '/api/pato/knowledge/all',
      'message':{
        'history': '/api/pato/messages',
        'archive': '/api/pato/archive',
        'pro': '/api/pato/pro/messages',
        'edit': '/api/pato/edit/messages',
        'continue': '/api/pato/continue/chat',
        "shared": '/api/knowledge/shared',
        "hot": '/api/town/hots',
        "hotpros": '/api/pro/hots',
        "hot_topics": '/api/town/hot/topics',
        "topic_chat_his": '/api/topic/chat/history'
      },
      'auth':{
        'gen': '/api/pato/pro/auth/gen',
        'query': '/api/pato/pro/auth/query'
      },
      'town':{
        "gen_scene": '/api/town/generate/scene',
        "image_parse": '/api/town/image/description',
        "image_chat": '/api/town/chat/image',
        "list_game": '/api/town/game/rooms',
        "create_game": '/api/town/create/game',
        "join_game": '/api/town/join/game',
        "game_clue": '/api/town/game/clue',
        "send_answer": '/api/town/game/send/answer',
        "accept_answer": '/api/town/game/accept/answer',
        "reveal_answer": '/api/town/game/reveal/answer',
        "generate_answer": '/api/town/game/answer/image',
        "kol_list":"/api/town/kol/list",
        "becom_kol": "/api/town/become/kol",
        "join_kol": "/api/town/follow/kol",
        "game_scene_context": '/api/town/game/scene/context',
        "game_scene_prompt": '/api/town/game/scene/prompt',
      },
      'task': {
        'pray': '/api/pray',
        'upgrade': '/api/pro',
        "event": "/api/event",
        "topic_chat": '/api/pato/topic/chat',
        "knowledge_query": "/api/knowledge/query",
        "knowledge_summary": "/api/knowledge/summary",
        "knowledge_embedding": "/api/study/knowledge",
        "knowledge_share": "/api/pato/share/knowledge",
        "knowledge_add": "/api/pato/add/shared/knowledge",
      },
      'interaction': {
        'call': '/api/call',
        'instruct': '/api/pato/instruct',
        'live': {
          'open': '/api/live/open',
          'continue': '/api/live/continue',
          'end': '/api/live/end',
          'reload': '/api/live/reload',
          'rooms': '/api/live/rooms'
        },
        "go_town": '/api/pato/go/town'
      },
      'character': {
        'iss': '/api/pato/iss',
        'edit': '/api/pato/iss/edit',
      }
    },
    'account': {
      'wallet':{
        'deposit': '/api/deposit',
        'stake': '/api/stake',
        'subscription': '/api/sub'
      },
    },
    'stats': {
      'active': '/api/stats/user/active',
    },
}
