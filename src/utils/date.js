import dayjs from 'dayjs'


export function formatDate(dateString, format = 'YYYY-MM-DD HH:mm:ss', emptyText = '无') {
  if (!dateString) return emptyText
  const date = dayjs(dateString)
  return date.isValid() ? date.format(format) : String(dateString)
}
