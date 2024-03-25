import {ReactNode} from "react";

export const host = "api.metapowermatrix.ai"
export const Web_Server = "https://"+ host
export const Streaming_Server = "ws://34.70.87.231:8040"
export const getApiServer = (port: number) => {
  // return Web_Server + ':' + port
  return Web_Server
}
export const getMQTTBroker = () => {
  return "ws://api.metapowermatrix.ai:8881/mqtt"
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
export interface sessionMessages{
  session: string,
  summary: string,
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
      'message':{
        'history': '/api/pato/messages',
        'archive': '/api/pato/archive'
      },
      'task': {
        'pray': '/api/pray',
        'upgrade': '/api/pro',
        "event": "/api/event"
      },
      'interaction': {
        'call': '/api/call',
        'live': '/api/live'
      },
      'character': {
        'iss': '/api/pato/iss',
        'edit': '/api/pato/iss/edit',
      },
      'market': {
        'list': '/api/job/list',
      }
    },
    'account': {
      'wallet':{
        'deposit': '/api/deposit',
        'stake': '/api/stake',
      },
    },
    'defi': {
      'trade':{
        'send': '/tiktokExecInstanceMethod',
        'recv': '/tiktokExecInstanceMethod',
      },
    },
}
