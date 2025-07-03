<template>
  <CommonPage>
    <template #action>
      <n-button type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        添加链接
      </n-button>
    </template>

    <MeCrud
      ref="$table"
      v-model:query-items="queryItems"
      :scroll-x="1200"
      :columns="columns"
      :get-data="api.read"
    >
      <MeQueryItem label="标题" :label-width="50">
        <n-input
          v-model:value="queryItems.title"
          type="text"
          placeholder="请输入标题"
          clearable
          @keydown.enter="() => $table?.handleSearch"
        />
      </MeQueryItem>

      <MeQueryItem label="分类" :label-width="50">
        <n-input
          v-model:value="queryItems.category"
          type="text"
          placeholder="请输入分类"
          clearable
          @keydown.enter="() => $table?.handleSearch"
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
          label="标题"
          path="title"
          :rule="{
            required: true,
            message: '请输入标题',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.title" />
        </n-form-item>
        <n-form-item
          label="URL"
          path="url"
          :rule="{
            required: true,
            message: '请输入URL',
            trigger: ['input', 'blur'],
          }"
        >
          <n-input v-model:value="modalForm.url" />
        </n-form-item>
        <n-form-item label="分类" path="category">
          <n-input v-model:value="modalForm.category" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import { MeCrud, MeQueryItem, MeModal } from '@/components'
import { useCrud } from '@/composables'
import api from './api'
import { formatDate } from '@/utils/date'
 

defineOptions({ name: 'NavigationMgt' })

const $table = ref(null)
const queryItems = ref({})

onMounted(() => {
  $table.value?.handleSearch()
})

async function getData(params) {
  try {
    console.log('Request params:', params)
    const res = await api.read(params)
    console.log('API response:', res)
    const rawItems = res?.data || []

    // 转换分组数据为平铺格式
    let items = []
    if (res?.data.pageData  && Array.isArray(res.data.pageData )) {
      items = res.data.pageData.map(item => ({
        id: item?.id,
        title: item?.title || '无标题',
        url: item?.url || '#',
        category: item?.category || '未分类',
        description: item?.description || '',
        createdAt: item?.created_at,
        updatedAt: item?.updated_at
      }))
    }
    console.log('Processed data:', { rawItems, total: res?.data?.total || 0 }) // 3. 检查处理后的数据

    return { 
      items,
      total: items.length 
    }
  } catch (error) {
    console.error('Failed to load data:', error)
    return { items: [], total: 0 }
  }
}

const columns = [
  { title: '标题', key: 'title', width: 200, ellipsis: { tooltip: true } },
  { title: 'URL', key: 'url', width: 300, ellipsis: { tooltip: true } },
  { 
    title: '分类', 
    key: 'category', 
    width: 150,
    render: (row) => h(NTag, { type: 'info' }, { default: () => row.category || '未分类' })
  },
  { 
    title: '上架时间', 
    key: 'createdAt', 
    width: 180,
    render: (row) => formatDate(row.created_at)
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
    width: 200,
    align: 'right',
    fixed: 'right',
    render(row) {
      return [
        h(
          NButton,
          {
            size: 'small',
            type: 'primary',
            onClick: () => handleOpen({ action: 'edit', title: '编辑链接', row }),
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
  name: '链接',
  initForm: {},
  doCreate: api.create,
  doDelete: api.delete,
  doUpdate: api.update,
  refresh: () => $table.value?.handleSearch(),
})

// function formatDate(dateString) {
//   if (!dateString) return '无'
//   try {
//     const date = new Date(dateString)
//     return isNaN(date.getTime()) ? dateString : date.toLocaleString()
//   } catch {
//     return dateString
//   }
// }
</script>
