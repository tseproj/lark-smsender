import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import OpenApi, * as $OpenApi from '@alicloud/openapi-client'
import Util, * as $Util from '@alicloud/tea-util'

const app = new Hono()

class Client {
  static createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
    const config = new $OpenApi.Config({
      accessKeyId,
      accessKeySecret,
    })
    config.endpoint = `dysmsapi.aliyuncs.com`
    return new Dysmsapi20170525(config)
  }

  static async querySmsSignList(accessKeyId: string, accessKeySecret: string): Promise<any> {
    const client = Client.createClient(accessKeyId, accessKeySecret)
    const querySmsSignListRequest = new $Dysmsapi20170525.QuerySmsSignListRequest({})
    const runtime = new $Util.RuntimeOptions({})
    return await client.querySmsSignListWithOptions(querySmsSignListRequest, runtime)
  }

  static async querySmsTemplateList(accessKeyId: string, accessKeySecret: string): Promise<any> {
    const client = Client.createClient(accessKeyId, accessKeySecret)
    const querySmsTemplateListRequest = new $Dysmsapi20170525.QuerySmsTemplateListRequest({})
    const runtime = new $Util.RuntimeOptions({})
    return await client.querySmsTemplateListWithOptions(querySmsTemplateListRequest, runtime)
  }

  static async sendSms(accessKeyId: string, accessKeySecret: string, phoneNumbers: string, signName: string, templateCode: string, templateParam: string): Promise<any> {
    const client = Client.createClient(accessKeyId, accessKeySecret)
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      phoneNumbers,
      signName,
      templateCode,
      templateParam,
    })
    const runtime = new $Util.RuntimeOptions({})
    return await client.sendSmsWithOptions(sendSmsRequest, runtime)
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
  }
  catch (error) {
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
  }
  catch (error) {
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
  }
  catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

app.get('/', serveStatic({ root: './static/' }))
app.get(
  '/assets/*',
  serveStatic({
    root: './static/assets',
    rewriteRequestPath: path =>
      path.replace(/^\/assets/, ''),
  }),
)
const port = 3000

serve({
  fetch: app.fetch,
  port,
})
