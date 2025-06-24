import { request } from '@/utils'

export default {
  read(params) {
    return request.get('/links', { params })
  },
  create(data) {
    return request.post('/links', data)
  },
  update(data) {
    return request.put(`/links/${data.id}`, data)
  },
  delete(id) {
    return request.delete(`/links/${id}`)
  }
}
