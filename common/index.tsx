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

export const api_url = {
    'portal': {
      'login': '/api/login',
      'register': '/api/register',
      'pato': '/api/pato/info',
      'task': {
        'pray': '/api/pray',
        'upgrade': '/api/pro',
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
    'message':{
      'send': '/tiktokRedPacketGot',
      'recv': '/tiktokRedPacketFind',
      'history': '/tiktokRedPacketSearch',
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
