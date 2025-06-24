<template>
  <CommonPage>
    <template #action>
      <n-button type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        添加环境
      </n-button>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
      :loading="loading"
      :error="error"
    >
      <MeQueryItem label="环境名称" :label-width="80">
        <n-input
          v-model:value="queryItems.name"
          type="text"
          placeholder="请输入环境名称"
          clearable
          @keydown.enter="() => $table?.handleSearch"
        />
      </MeQueryItem>

      <MeQueryItem label="环境代码" :label-width="80">
        <n-input
          v-model:value="queryItems.code"
          type="text"
          placeholder="请输入环境代码"
          clearable
          @keydown.enter="() => $table?.handleSearch"
        />
      </MeQueryItem>

      <MeQueryItem label="状态" :label-width="80">
        <n-select
          v-model:value="queryItems.status"
          placeholder="请选择状态"
          :options="statusOptions"
          clearable
        />
      </MeQueryItem>
    </MeCrud>

    <MeModal ref="modalRef" width="520px">
      <n-form
        ref="modalFormRef"
        label-placement="left"
        label-align="left"
        :label-width="80"
        :model="modalForm"
      >
        <n-form-item
          label="环境名称"
          path="name"
          :rule="{
            required: true,
            message: '请输入环境名称',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.name" placeholder="例如：开发环境" />
        </n-form-item>
        
        <n-form-item
          label="环境代码"
          path="code"
          :rule="{
            required: true,
            message: '请输入环境代码',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input 
            v-model:value="modalForm.code" 
            placeholder="例如：DEV"
            :disabled="modalAction === 'edit'"
          />
        </n-form-item>
        
        <n-form-item label="状态" path="status">
          <n-radio-group v-model:value="modalForm.status">
            <n-radio :value="1">启用</n-radio>
            <n-radio :value="0">禁用</n-radio>
          </n-radio-group>
        </n-form-item>
        
        <n-form-item label="描述" path="description">
          <n-input
            v-model:value="modalForm.description"
            type="textarea"
            placeholder="请输入环境描述信息"
            :autosize="{ minRows: 3, maxRows: 5 }"
          />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag, NRadio, NRadioGroup, NSelect } from 'naive-ui'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'

defineOptions({ name: 'EnvironmentMgt' })

const $table = ref(null)
const queryItems = ref({
  name: '',
  code: '',
  status: null
})

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 }
]

onMounted(() => {
  $table.value?.handleSearch()
})
const loading = ref(false)
const error = ref(null)

async function getData(params) {
  try {
        loading.value = true
    error.value = null
    console.log('Request params:', params)
    const res = await api.read(params)
    console.log('API response data structure:', res.data)


    let items = []
    if (res?.data.pageData && Array.isArray(res.data.pageData)) {
      items = res.data.pageData.map(item => ({
        id: item?.id,
        name: item?.name || '未命名',
        code: item?.code || '',
        description: item?.description || '',
        status: item?.status ?? 1,
        createdAt: item?.created_at,
        updatedAt: item?.updated_at
      }))
    }
    console.log('Processed data:', { items, total: res?.data?.total || 0 }) // 3. 检查处理后的数据

    return { 
      items,
      total: items.length 
    }
  } catch (error) {
    error.value = err.message
    console.error('Failed to load data:', error)
    return { items: [], total: 0 }
  }finally {
    loading.value = false
  }
}

const columns = [
  { 
    title: '环境名称', 
    key: 'name', 
    width: 150,
    ellipsis: { tooltip: true }
  },
  { 
    title: '环境代码', 
    key: 'code', 
    width: 120,
    render: (row) => h(NTag, { type: 'success' }, { default: () => row.code })
  },
  { 
    title: '状态', 
    key: 'status', 
    width: 100,
    render: (row) => h(
      NTag,
      { 
        type: row.status === 1 ? 'success' : 'error',
        bordered: false
      },
      { default: () => row.status === 1 ? '启用' : '禁用' }
    )
  },
  { 
    title: '描述', 
    key: 'description', 
    width: 200,
    ellipsis: { tooltip: true }
  },

  { 
    title: '更新时间', 
    key: 'updatedAt', 
    width: 180,
    render: (row) => formatDate(row.updated_at)
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleOpen({ 
              action: 'edit', 
              title: '编辑环境', 
              row 
            }),
          },
          { default: () => '编辑' }
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            style: 'margin-left: 12px;',
            onClick: () => handleDelete(row.id),
          },
          { default: () => '删除' }
        ),
      ]
    },
  },
]

const {
  modalRef,
  modalFormRef,
  modalForm,
  modalAction,
  handleAdd,
  handleDelete,
  handleOpen,
  handleSave,
} = useCrud({
  name: '环境',
  initForm: {
    id: null,
    name: '',
    code: '',
    description: '',
    status: 1
  },
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  beforeSubmit: (form) => {
    // 提交前处理数据
    return {
      ...form,
      code: form.code.toUpperCase() // 环境代码统一转为大写
    }
  },
  refresh: () => $table.value?.handleSearch(),
})

// 日期格式化函数
function formatDate(dateString) {
  if (!dateString) return '无'
  try {
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? dateString : date.toLocaleString()
  } catch {
    return dateString
  }
}
</script>

<style scoped>
.n-tag {
  margin-right: 6px;
}
</style>