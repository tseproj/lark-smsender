<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { FieldType, ToastType, bitable } from '@lark-base-open/js-sdk'
import type { IFieldMeta } from '@lark-base-open/js-sdk'
import InfoTip from '@/components/InfoTip.vue'
import Empty from '@/components/Empty.vue'
import { requestSignList, requestTemplateList, sendSms } from '@/utils/useAlicloudApi'

interface SignOption {
  signName: string
}
interface TemplateOption {
  templateCode: string
  templateName: string
  templateContent: string
}

function extractTemplateVariables(templateContent: string): string[] {
  const regex = /\$\{(\w+)\}/g
  const matches = templateContent.match(regex)
  return matches ? matches.map(match => match.slice(2, -1)) : []
}

const form = ref({
  serviceType: 'aliyun',
  phoneNumberField: null,
  isOutputDatetime: true,
  isOutputResult: true,
  aliyun: {
    id: '',
    secret: '',
    signature: null,
    template: null,
    templateVariables: {} as Record<string, string | null>,
  },
})
const isLoading = ref(false)
const isDisabled = computed(() => {
  const isTestTemplate = form.value.aliyun.template === 'SMS_154950909'
  return form.value.aliyun.id === '' || form.value.aliyun.secret === ''
    || form.value.aliyun.signature === null || form.value.aliyun.template === null
    || (isTestTemplate && form.value.aliyun.templateVariables.code === null)
    || (!isTestTemplate
    && aliyunTemplateOptions.value.find(t => t.templateCode === form.value.aliyun.template)
    && Object.keys(form.value.aliyun.templateVariables).length > 0
    && Object.values(form.value.aliyun.templateVariables).includes(null))
    || form.value.phoneNumberField === null
})
const fieldOptions = ref<IFieldMeta[]>([])
const phoneOptions = ref<IFieldMeta[]>([])
const aliyunSignatureOptions = ref<SignOption[]>([])
const aliyunTemplateOptions = ref<TemplateOption[]>([])

async function setFieldList(): Promise<void> {
  const table = await bitable.base.getActiveTable()
  const view = await table.getActiveView()
  const fieldMetaList: IFieldMeta[] = await view.getFieldMetaList()
  fieldOptions.value = fieldMetaList
  phoneOptions.value = fieldMetaList.filter(item => item.type === FieldType.Text || item.type === FieldType.Phone)
}

async function setSignTemplateList(refresh?: boolean) {
  if (form.value.serviceType !== 'aliyun')
    return

  const { id, secret } = form.value.aliyun
  if (id === '' && secret === '')
    return

  if (refresh && (id === '' && secret === '')) {
    await bitable.ui.showToast({
      toastType: ToastType.error,
      message: '请输入正确的阿里云 AccessKey ID 和 AccessKey Secret',
    })
    return
  }

  const [signResp, templateResp] = await Promise.all([
    requestSignList({ accessKeyId: id, accessKeySecret: secret }),
    requestTemplateList({ accessKeyId: id, accessKeySecret: secret }),
  ])

  aliyunSignatureOptions.value = signResp.data.body.smsSignList
  aliyunTemplateOptions.value = templateResp.data.body.smsTemplateList

  console.log(signResp, templateResp, aliyunSignatureOptions.value, aliyunTemplateOptions.value)
}

async function handleTemplateChange() {
  form.value.aliyun.templateVariables = {}

  const selectedTemplate = aliyunTemplateOptions.value.find(t => t.templateCode === form.value.aliyun.template)
  if (selectedTemplate) {
    const variables = extractTemplateVariables(selectedTemplate.templateContent)
    form.value.aliyun.templateVariables = Object.fromEntries(variables.map(v => [v, null]))
  }
  else if (form.value.aliyun.template === 'SMS_154950909') {
    // 为测试模板添加 code 变量
    form.value.aliyun.templateVariables = { code: null }
  }

  await setSignTemplateList(true)
}

async function handleSubmit() {
  isLoading.value = true
  const table = await bitable.base.getActiveTable()
  const recordList = await table.getRecordIdList()
  if (form.value.phoneNumberField) {
    for (const recordId of recordList) {
      const phoneNumberField = await table.getFieldById(form.value.phoneNumberField)
      let phoneNumber
      try {
        phoneNumber = await phoneNumberField.getValue(recordId)
        console.log(phoneNumber)
      }
      catch (error) {
        continue
      }
      const templateVariables: Record<string, string> = {}
      for (const [key, fieldId] of Object.entries(form.value.aliyun.templateVariables)) {
        if (fieldId) {
          console.log(fieldId)
          const field = await table.getFieldById(fieldId)
          let value
          try {
            value = await field.getValue(recordId)
            console.log(value)
            if (typeof value === 'object' && value !== null) {
              if (Array.isArray(value)) {
                templateVariables[key] = value[0]?.text || ''
              }
              else if ('text' in value) {
                templateVariables[key] = value.text
              }
              else {
                templateVariables[key] = JSON.stringify(value)
              }
            }
            else {
              templateVariables[key] = String(value)
            }
          }
          catch (error) {
            console.error(`获取字段 ${key} 的值时出错:`, error)
            templateVariables[key] = ''
          }
        }
      }
      if (form.value.aliyun.signature && form.value.aliyun.template) {
        const templateParam = JSON.stringify(templateVariables)
        const query = {
          accessKeyId: form.value.aliyun.id,
          accessKeySecret: form.value.aliyun.secret,
          phoneNumbers: phoneNumber,
          signName: form.value.aliyun.signature,
          templateCode: form.value.aliyun.template,
          templateParam,
        }
        console.log(query)
        const resp = await sendSms(query)
        console.log(resp)
        const code = resp.data.body.code
        if (code !== 'OK') {
          await bitable.ui.showToast({
            toastType: ToastType.error,
            message: resp.data.body.message,
          })
        }
      }
    }
  }
  isLoading.value = false
  await bitable.ui.showToast({
    toastType: ToastType.success,
    message: '发送任务已完成',
  })
}

onMounted(async () => {
  await setFieldList()
})
</script>

<template>
  <a-form
    :model="form"
    layout="vertical"
    :disabled="isLoading"
    @submit="handleSubmit"
  >
    <a-form-item hide-label>
      <a-alert :show-icon="false">
        <a-link
          href="https://feishu.cn/docx/Ec6idLtHGo8fsKxKob7c8o79nab"
          target="_blank"
          icon
        >
          插件使用文档 👈
        </a-link>
      </a-alert>
    </a-form-item>
    <div v-show="form.serviceType === 'aliyun'">
      <a-form-item
        field="aliyunId"
        label="阿里云 AccessKey ID"
      >
        <a-input
          v-model="form.aliyun.id"
          placeholder="请粘贴阿里云账户 AccessKey ID"
          allow-clear
          @change="setSignTemplateList"
        />
      </a-form-item>
      <a-form-item
        field="aliyunSecret"
        label="阿里云 AccessKey Secret"
      >
        <a-input-password
          v-model="form.aliyun.secret"
          placeholder="请粘贴阿里云账户 AccessKey Secret"
          allow-clear
          @change="setSignTemplateList"
        />
      </a-form-item>
      <a-form-item
        field="aliyunSignature"
        label="短信签名"
      >
        <a-select
          v-model="form.aliyun.signature"
          placeholder="请选择要使用的短信签名"
        >
          <a-option
            v-for="(sign, index) of aliyunSignatureOptions"
            :key="index"
            :value="sign.signName"
            :label="sign.signName"
          />
          <a-option
            v-if="form.aliyun.id !== '' && form.aliyun.secret !== ''"
            value="阿里云短信测试"
            label="阿里云短信测试"
          />
          <template #empty>
            <Empty
              title="请输入阿里云 AccessKey ID 和 AccessKey Secret 以继续"
              subtitle="请确保您已在阿里云控制台创建了短信签名，可使用「阿里云短信测试」进行短信发送测试"
            />
          </template>
          <template #footer>
            <div>
              <a-button
                type="text"
                size="small"
                long
                @click="setSignTemplateList(true)"
              >
                刷新
              </a-button>
            </div>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        field="aliyunTemplate"
        label="短信模板"
      >
        <a-select
          v-model="form.aliyun.template"
          placeholder="请选择要配置的短信模板"
          @change="handleTemplateChange"
        >
          <a-option
            v-for="(template, index) of aliyunTemplateOptions"
            :key="index"
            :value="template.templateCode"
            :label="template.templateName"
          />
          <a-option
            v-if="form.aliyun.id !== '' && form.aliyun.secret !== ''"
            value="SMS_154950909"
            label="测试专用模板"
          />
          <template #empty>
            <Empty
              title="请输入阿里云 AccessKey ID 和 AccessKey Secret 以继续"
              subtitle="请确保您已在阿里云控制台创建了短信模板，可使用「阿里云短信测试」进行短信发送测试"
            />
          </template>
          <template #footer>
            <div>
              <a-button
                type="text"
                size="small"
                long
                @click="setSignTemplateList(true)"
              >
                刷新
              </a-button>
            </div>
          </template>
        </a-select>
      </a-form-item>
    </div>
    <a-form-item
      field="phoneNumberField"
      label="手机号字段"
    >
      <a-select
        v-model="form.phoneNumberField"
        placeholder="请选择要接收短信的手机号字段"
      >
        <a-option
          v-for="(item, index) of phoneOptions"
          :key="index"
          :value="item.id"
          :label="item.name"
        />
      </a-select>
    </a-form-item>
    <div v-if="form.aliyun.template">
      <template
        v-for="(_, key) in form.aliyun.templateVariables"
        :key="key"
      >
        <a-form-item
          :field="`${key}Field`"
          :label="`${key} 字段`"
        >
          <a-select
            v-model="form.aliyun.templateVariables[key]"
            :placeholder="`请选择要发送短信使用的 ${key} 对应内容字段`"
          >
            <a-option
              v-for="(item, index) of fieldOptions"
              :key="index"
              :value="item.id"
              :label="item.name"
            />
          </a-select>
        </a-form-item>
      </template>
    </div>
    <a-form-item
      field="outputOption"
      hide-label
    >
      <a-space direction="vertical">
        <a-checkbox v-model="form.isOutputDatetime">
          输出发送时间至数据表
          <InfoTip content="将会输出至「短信发送时间」字段，若不存在将自动创建同名字段并映射" />
        </a-checkbox>
        <a-checkbox v-model="form.isOutputResult">
          输出发送结果至数据表
          <InfoTip content="将会输出至「短信发送结果」字段，若不存在将自动创建同名字段并映射" />
        </a-checkbox>
      </a-space>
    </a-form-item>
    <a-form-item hide-label>
      <a-button
        html-type="submit"
        type="primary"
        :loading="isLoading"
        :disabled="isDisabled"
      >
        确 认
      </a-button>
    </a-form-item>
  </a-form>
</template>
