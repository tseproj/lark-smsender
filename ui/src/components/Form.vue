<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FieldType, ToastType, bitable } from '@lark-base-open/js-sdk'
import type { IFieldMeta } from '@lark-base-open/js-sdk'
import InfoTip from '@/components/InfoTip.vue'
import Empty from '@/components/Empty.vue'
import { requestSignList, requestTemplateList } from '@/utils/useAlicloudApi'

interface SignOption {
  signName: string
}
interface TemplateOption {
  templateCode: string
  templateName: string
  templateContent: string
}

function extractTemplateVariables(templateContent: string): string[] {
  const regex = /\$\{(\w+)\}/g;
  const matches = templateContent.match(regex);
  return matches ? matches.map(match => match.slice(2, -1)) : [];
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
  if (form.value.serviceType !== 'aliyun') return

  const { id, secret } = form.value.aliyun
  if (id === '' && secret === '') return

  if (refresh && (id === '' && secret === '')) {
    await bitable.ui.showToast({
      toastType: ToastType.error,
      message: '请输入正确的阿里云 AccessKey ID 和 AccessKey Secret'
    })
    return
  }

  const [signResp, templateResp] = await Promise.all([
    requestSignList({ accessKeyId: id, accessKeySecret: secret }),
    requestTemplateList({ accessKeyId: id, accessKeySecret: secret })
  ])

  aliyunSignatureOptions.value = signResp.data.body.smsSignList
  aliyunTemplateOptions.value = templateResp.data.body.smsTemplateList

  console.log(signResp, templateResp, aliyunSignatureOptions.value, aliyunTemplateOptions.value)
}

async function handleTemplateChange() {
  form.value.aliyun.templateVariables = {};

  const selectedTemplate = aliyunTemplateOptions.value.find(t => t.templateCode === form.value.aliyun.template);
  if (selectedTemplate) {
    const variables = extractTemplateVariables(selectedTemplate.templateContent);
    form.value.aliyun.templateVariables = Object.fromEntries(variables.map(v => [v, null]));
  }

  await setSignTemplateList(true);
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
      >
        确 认
      </a-button>
    </a-form-item>
  </a-form>
</template>