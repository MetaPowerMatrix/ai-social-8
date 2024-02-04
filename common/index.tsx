export const host = "api.metapowermatrix.ai"
export const Web_Server = "http://"+ host +":8030"
export const getApiServer = (port: number) => {
  return Web_Server + port
}

export interface TiktokCmdResponse{
  code: number;
  content: string;
}
export interface PhoneInfo{
  name: string;
  id: string;
  port: number
}
export interface NodeInfo{
  name: string;
  id: string;
  ip: string
}

export const api_url = {
    'hooking': {
        'get':{
            'activity': '/tiktokGetCurrentActivityFragments',
        },
      'kill':{
        'job': '/jobsKill',
        'app': '/tiktokExecInstanceMethod',
      },
      'net':{
        'trace': '/tiktokTraceRetrofit',
        'inputstream': '/tiktokTraceNetInputstream',
        'setproxy': '/tiktokSetProxy',
      },
      'set':{
        'location': '/tiktokChangeLocation',
      },
      'trace':{
        'class': '/tiktokTraceClass',
        'reflection': '/tiktokTraceReflection',
      },
    },
    'heap': {
      'execute':{
        'instance': '/tiktokExecInstanceMethod',
        'class': '/tiktokExecInstanceMethod',
      },
    },
    'red':{
      'got': '/tiktokRedPacketGot',
      'find': '/tiktokRedPacketFind',
      'search': '/tiktokRedPacketSearch',
      'diamonds': '/tiktokSendLiveFeed',
    },
    'ui': {
      'alert': '/tiktokAlert',
      'input': '/tiktokSimInput',
      'live': '/tiktokSendLiveFeed',
      'logscreen': '/tiktokMonitorScreen',
      'notify': '/tiktokNotify',
      'screenshot': '/androidUiScreenshot',
      'tap': '/tiktokSimTouch',
      'move': '/tiktokSimMove'
    },
    'user': {
      'login': Web_Server + '/user/login',
      'info': Web_Server + '/user/info',
    },
    'ios': {
      'commands': Web_Server + '/ios/shell/commands',
      'hostcommand': Web_Server + '/ios/host/commands',
      'load': Web_Server + '/ioscript/load',
      'upload': Web_Server + '/ioscript/upload',
    },
    'adb':{
      'commands': Web_Server + '/adb/shell/commands',
      'loadsingle': Web_Server + '/script/load/single',
      'load': Web_Server + '/script/load',
      'unload': Web_Server + '/script/unload',
      'change': Web_Server + '/script/change',
      'upload': Web_Server + '/script/upload',
      'message': Web_Server + '/message/upload',
      'accounts': Web_Server + '/accounts/upload',
    },
    'node':{
      'restart': Web_Server + '/node/restart',
      'test': Web_Server + '/node/test',
    },
    'stats': {
      'node': {
        'list': Web_Server + '/get/nodes',
        'start': Web_Server + '/start/objection',
        'kill': Web_Server + '/kill/objection',
        'tiktok': Web_Server + '/start/tiktok',
        'hour': Web_Server + '/node/hour',
      },
      'iPhone': {
        'list': Web_Server + '/get/iphones',
        'hosts': Web_Server + '/get/iphones/hosts',
        'hour': Web_Server + '/phone/hour',
      },
      'phone': {
          'list': Web_Server + '/get/phones',
          'hour': Web_Server + '/phone/hour',
      },
      'coins': Web_Server + '/stats/ios',
    },
}
