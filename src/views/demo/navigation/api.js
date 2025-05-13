import { request } from '@/utils'

export default {
  read(params) {
    return request.get('/links', { params })
  },
  create(data) {
    return request.post('/links', data)
  },
  update(id, data) {
    return request.put(`/links/${id}`, data)
  },
  delete(id) {
    return request.delete(`/links/${id}`)
  }
}
