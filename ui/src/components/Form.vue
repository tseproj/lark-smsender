<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { FieldType, bitable } from '@lark-base-open/js-sdk'
import type { IFieldMeta } from '@lark-base-open/js-sdk'
import InfoTip from '@/components/InfoTip.vue'
import { requestSignList, requestTemplateList } from '@/utils/useAlicloudApi'

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
  },
})
const isLoading = ref(false)
const fieldOptions = ref<IFieldMeta[]>([])
const phoneOptions = ref<IFieldMeta[]>([])
const aliyunSignatureOptions = ref([])
const aliyunTemplateOptions = ref([])

async function setFieldList(): Promise<void> {
  const table = await bitable.base.getActiveTable()
  const view = await table.getActiveView()
  const fieldMetaList: IFieldMeta[] = await view.getFieldMetaList()
  fieldOptions.value = fieldMetaList
  phoneOptions.value = fieldMetaList.filter(item => item.type === FieldType.Text || item.type === FieldType.Phone)
}

async function setSignTemplateList() {
  if (form.value.serviceType === 'aliyun') {
    if (form.value.aliyun.id !== '' || form.value.aliyun.secret !== '') {
      const signResp = await requestSignList({ accessKeyId: form.value.aliyun.id, accessKeySecret: form.value.aliyun.secret })
      if (signResp.data.Message === 'OK')
        aliyunSignatureOptions.value = signResp.data
      const templateResp = await requestTemplateList({ accessKeyId: form.value.aliyun.id, accessKeySecret: form.value.aliyun.secret })
      if (templateResp.data.Message === 'OK')
        aliyunTemplateOptions.value = templateResp.data
      console.log(signResp, templateResp)
    }
  }
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
          <a-option />
          <a-option value="阿里云短信测试" label="阿里云短信测试" />
        </a-select>
      </a-form-item>
      <a-form-item
        field="aliyunTemplate"
        label="短信模板"
      >
        <a-select
          v-model="form.aliyun.template"
          placeholder="请选择要配置的短信模板"
        >
          <a-option />
          <a-option value="SMS_154950909" label="测试专用模板" />
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
