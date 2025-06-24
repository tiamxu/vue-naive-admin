/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/05 21:28:47
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

import axios from 'axios'
import { request } from '@/utils'

export default {
  getMenuTree: () => request.get('/permission/menu/tree'),
  getButtonAndApi: (parentId) => request.get(`/permission/button-and-api/${parentId}`),
  getComponents: () => axios.get(`${import.meta.env.VITE_PUBLIC_PATH}components.json`),
  addPermission: (data) => request.post('/permission', data),
  savePermission: (id, data) => request.patch(`/permission/${id}`, data),
  deletePermission: (id) => request.delete(`permission/${id}`),
}


// 在api.js中添加
axios.interceptors.request.use(config => {
  if (config.data) {
    config.data = convertBoolProperties(config.data)
  }
  return config
})

function convertBoolProperties(obj) {
  if (typeof obj !== 'object' || obj === null) return obj
  
  if (Array.isArray(obj)) {
    return obj.map(convertBoolProperties)
  }
  
  const result = {}
  for (const key in obj) {
    if (obj[key] === true) {
      result[key] = 1
    } else if (obj[key] === false) {
      result[key] = 0
    } else if (typeof obj[key] === 'object') {
      result[key] = convertBoolProperties(obj[key])
    } else {
      result[key] = obj[key]
    }
  }
  return result
}