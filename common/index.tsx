export const host = "api.metapowermatrix.ai"
export const Web_Server = "http://"+ host
export const getApiServer = (port: number) => {
  return Web_Server + ':' + port
}

export interface PatoInfo {
  sn: number,
  id: string,
  name: string,
  matrix_datetime: string,
  registered_datetime: string
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
  children: string,
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
        'get': '/api/connection/list',
        'rate': '/api/connection/rate',
      },
      'character': {
        'list': '/api/character/list',
        'choose': '/tiktokExecInstanceMethod',
      },
      'market': {
        'list': '/api/job/list',
        'detail': '/api/job/detail',
      },
      'target': {
        'list': '/api/character/objects',
        'choose': '/api/object/choose',
      },
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
    'ai':{
      'start': '/tiktokRedPacketGot',
      'stop': '/tiktokRedPacketFind',
      'adjust': '/tiktokRedPacketSearch',
      'data': '/tiktokSendLiveFeed',
    },
    'stats': {
      'coins': '/stats/ios',
    },
}
