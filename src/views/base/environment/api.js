import { request } from '@/utils'

export default {
  read(params) {
    return request.get('/environments', { params })
  },
  create(data) {
    return request.post('/environments', data)
  },
  update(data) {
    return request.put(`/environments/${data.id}`, data)
  },
  delete(id) {
    return request.delete(`/environments/${id}`)
  }
}
