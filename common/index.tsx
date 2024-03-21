import {ReactNode} from "react";

export const host = "api.metapowermatrix.ai"
export const Web_Server = "https://"+ host
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
  professionals: string[]
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
      },
      'task': {
        'pray': '/api/pray',
        'upgrade': '/api/pro',
        "event": "/api/event"
      },
      'interaction': {
        'call': '/api/call',
      },
      'character': {
        'iss': '/api/pato/iss',
        'edit': '/api/pato/iss/edit',
      },
      'market': {
        'list': '/api/job/list',
        'detail': '/api/job/detail',
      }
    },
    'account': {
      'wallet':{
        'bind': '/tiktokChangeLocation',
        'info': '/tiktokChangeLocation',
      },
      'assets':{
        'list': '/tiktokTraceClass',
        'nft': '/tiktokTraceReflection',
      },
    },
    'defi': {
      'fund':{
        'total': '/tiktokExecInstanceMethod',
        'liquity': '/tiktokExecInstanceMethod',
        'plan': '/tiktokExecInstanceMethod',
      },
      'trade':{
        'send': '/tiktokExecInstanceMethod',
        'recv': '/tiktokExecInstanceMethod',
        'transactions': '/tiktokExecInstanceMethod',
      },
    },
}
