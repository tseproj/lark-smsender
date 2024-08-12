import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import OpenApi, * as $OpenApi from '@alicloud/openapi-client'
import Util, * as $Util from '@alicloud/tea-util'


const app = new Hono()


class Client {
  static createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
    let config = new $OpenApi.Config({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
    })
    config.endpoint = `dysmsapi.aliyuncs.com`
    return new Dysmsapi20170525(config)
  }

  static async querySmsSignList(accessKeyId: string, accessKeySecret: string): Promise<any> {
    let client = Client.createClient(accessKeyId, accessKeySecret)
    let querySmsSignListRequest = new $Dysmsapi20170525.QuerySmsSignListRequest({})
    let runtime = new $Util.RuntimeOptions({})
    try {
      return await client.querySmsSignListWithOptions(querySmsSignListRequest, runtime)
    } catch (error) {
      console.log(error.message)
      console.log(error.data["Recommend"])
      throw error
    }
  }

  static async querySmsTemplateList(accessKeyId: string, accessKeySecret: string): Promise<any> {
    let client = Client.createClient(accessKeyId, accessKeySecret)
    let querySmsTemplateListRequest = new $Dysmsapi20170525.QuerySmsTemplateListRequest({})
    let runtime = new $Util.RuntimeOptions({})
    try {
      return await client.querySmsTemplateListWithOptions(querySmsTemplateListRequest, runtime)
    } catch (error) {
      console.log(error.message)
      console.log(error.data["Recommend"])
      throw error
    }
  }

  static async sendSms(accessKeyId: string, accessKeySecret: string, phoneNumbers: string, signName: string, templateCode: string, templateParam: string): Promise<any> {
    let client = Client.createClient(accessKeyId, accessKeySecret)
    let sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers,
      signName,
      templateCode,
      templateParam,
    })
    let runtime = new $Util.RuntimeOptions({})
    try {
      return await client.sendSmsWithOptions(sendSmsRequest, runtime)
    } catch (error) {
      console.log(error.message)
      console.log(error.data["Recommend"])
      throw error
    }
  }
}

app.post('/getSignList', async (c) => {
  const { accessKeyId, accessKeySecret } = await c.req.json()
  if (!accessKeyId || !accessKeySecret) {
    return c.json({ error: '缺少必要的参数' }, 400)
  }
  try {
    const result = await Client.querySmsSignList(accessKeyId, accessKeySecret)
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/getTemplateList', async (c) => {
  const { accessKeyId, accessKeySecret } = await c.req.json()
  if (!accessKeyId || !accessKeySecret) {
    return c.json({ error: '缺少必要的参数' }, 400)
  }
  try {
    const result = await Client.querySmsTemplateList(accessKeyId, accessKeySecret)
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.post('/sendSms', async (c) => {
  const { accessKeyId, accessKeySecret, phoneNumbers, signName, templateCode, templateParam } = await c.req.json()
  if (!accessKeyId || !accessKeySecret) {
    return c.json({ error: '缺少必要的参数' }, 400)
  }
  try {
    const result = await Client.sendSms(accessKeyId, accessKeySecret, phoneNumbers, signName, templateCode, templateParam)
    return c.json(result)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/', serveStatic({ root: './static/' }))
app.get(
  '/assets/*',
  serveStatic({
    root: './static/assets',
    rewriteRequestPath: (path) =>
      path.replace(/^\/assets/, ''),
  })
)
const port = 3000
console.log(`server running at ${port}`)

serve({
  fetch: app.fetch,
  port: port
})