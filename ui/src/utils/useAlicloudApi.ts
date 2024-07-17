import type { AxiosResponse } from 'axios'
import axios from 'axios'

interface GetData {
  accessKeyId: string
  accessKeySecret: string
  templateCode?: string
}

interface SendData extends GetData {
  phoneNumbers: string
  signName: string
  templateParam: string
}

interface SendBatchData extends GetData {
  phoneNumberJson: string
  signNameJson: string
  templateParamJson: string
}

async function requestSignList({ accessKeyId, accessKeySecret }: GetData): Promise<AxiosResponse> {
  const data = {
    accessKeyId,
    accessKeySecret,
  }

  try {
    const response = await axios.post('/ali/getSignList', data)
    return response.data.body
  }
  catch (error) {
    throw new Error(`Request failed: ${error}`)
  }
}

async function requestTemplateList({ accessKeyId, accessKeySecret }: GetData): Promise<AxiosResponse> {
  const data = {
    accessKeyId,
    accessKeySecret,
  }

  try {
    const response = await axios.post('/ali/getTemplateList', data)
    return response.data.body
  }
  catch (error) {
    throw new Error(`Request failed: ${error}`)
  }
}

async function sendSms({ accessKeyId, accessKeySecret, phoneNumbers, signName, templateCode, templateParam }: SendData): Promise<AxiosResponse> {
  const data = {
    accessKeyId,
    accessKeySecret,
    phoneNumbers,
    signName,
    templateCode,
    templateParam,
  }

  try {
    const response = await axios.post('/ali/sendSms', data)
    return response.data.body
  }
  catch (error) {
    throw new Error(`Request failed: ${error}`)
  }
}

async function sendBatchSms({ accessKeyId, accessKeySecret, phoneNumberJson, signNameJson, templateCode, templateParamJson }: SendBatchData): Promise<AxiosResponse> {
  const data = {
    accessKeyId,
    accessKeySecret,
    phoneNumberJson,
    signNameJson,
    templateCode,
    templateParamJson,
  }

  try {
    const response = await axios.post('/ali/sendBatchSms', data)
    return response.data.body
  }
  catch (error) {
    throw new Error(`Request failed: ${error}`)
  }
}

export {
  requestSignList,
  requestTemplateList,
  sendSms,
  sendBatchSms,
}
