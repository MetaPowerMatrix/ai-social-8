import {createContainer} from "unstated-next"
import {api_url, getApiServer} from "@/common";

const useCommand = () => {

  const tap = async (x: number,y: number, port: number) => {
    let data = {x: x, y: y}
    let url = getApiServer(port) + api_url.ui.tap
    fetch(
      url,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=>{
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const get_activity = async (port: number) => {
    let url = getApiServer(port) + api_url.hooking.get.activity
    let response = await fetch(url)
    if (response.ok) {
      console.log(response)
      let dataJson = await response.json()
      console.log(dataJson)
      // let data = JSON.parse(dataJson.content)
    }
  }
  const prepare_live_message = async (port: number) => {
    let url = getApiServer(port) + api_url.ui.live
    let data = {message: 'hello'}
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
  const swipe = async (x:number, y:number, offset:number, port: number) => {
    let url = getApiServer(port) + api_url.ui.move
    let data = {x: x, y: y, offset: offset}
    fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const send_live_message = async (message: string, port: number) => {
    let url = getApiServer(port) + api_url.ui.input
    let codes = message.split('').map((code)=>code.charCodeAt(0)-97+29);
    console.log(codes)
    let data = {codes: codes}
    fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const search_zhubo = async (keyword: string, port: number) => {
    let url = getApiServer(port) + api_url.heap.execute.instance
    let data = {classname: 'X.SKK', methodname: 'setText', hashcode: -99, params: [keyword,1], param_types: ['string','android.widget.TextView$BufferType']}
    fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const finish_app = async (port: number) => {
    let url = getApiServer(port) + api_url.heap.execute.instance
    let data = {classname: 'com.ss.android.ugc.aweme.main.MainActivity', methodname: 'finish', hashcode: -99, params: [], param_types: []}
    fetch(
      `${url}`,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(data)
      }
    ).then(async (response)=> {
      if (response.ok) {
        console.log(response)
        let dataJson = await response.json()
        console.log(dataJson)
        // let data = JSON.parse(dataJson.content)
      }
    }).catch((e) => console.log(e))
  }
  const kill_job = async (jobId: string, port: number) => {
    let url = getApiServer(port) + api_url.hooking.kill
    let data = {ident: jobId}
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
  const alert = async (message: string, port: number)=> {
    let url = getApiServer(port) + api_url.ui.notify
    let data = {message: message}
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
  const set_location = async (x: number, y: number, port: number) => {
    let url = getApiServer(port) + api_url.hooking.set.location
    let data = {x: x, y: y}
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
  const get_phones = async () => {
    let url = api_url.stats.phone.list + "/0"
    let response = await fetch(url)
    if (response.ok) {
      let dataJson = await response.json()
      let data = JSON.parse(dataJson.content)
      return data
      // let data = JSON.parse(dataJson.content)
    }
  }
  const get_iPhones = async () => {
    let url = api_url.stats.iPhone.list + "/0"
    let response = await fetch(url)
    if (response.ok) {
      let dataJson = await response.json()
      let data = JSON.parse(dataJson.content)
      return data
      // let data = JSON.parse(dataJson.content)
    }
  }
  const update_phones = async () => {
    let url = api_url.stats.phone.list + "/1"
    let response = await fetch(url)
    if (response.ok) {
      let dataJson = await response.json()
      let data = JSON.parse(dataJson.content)
      return data
      // let data = JSON.parse(dataJson.content)
    }
  }
  const update_iphones = async () => {
    let url = api_url.stats.iPhone.list + "/1"
    let response = await fetch(url)
    if (response.ok) {
      let dataJson = await response.json()
      let data = JSON.parse(dataJson.content)
      return data
      // let data = JSON.parse(dataJson.content)
    }
  }
  const start_objection_server = async (data: string[]) => {
    let url = api_url.stats.node.start
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
      // console.log(data)
    }
  }
  const start_tiktok = async (data: string[]) => {
    let url = api_url.stats.node.tiktok
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
      // console.log(data)
    }
  }
  const restart_node = async () => {
    let url = api_url.node.restart
    let data = {}
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
  const test_node = async () => {
    let url = api_url.node.restart
    let data = {}
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
  return { prepare_live_message, tap, get_activity, send_live_message, swipe, search_zhubo, kill_job,
    finish_app, set_location, get_phones, start_objection_server, alert, start_tiktok, restart_node, test_node,
    update_phones, get_iPhones, update_iphones
  }
}

let CommandDataContainer = createContainer(useCommand)
export default CommandDataContainer
