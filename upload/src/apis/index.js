import axios from 'axios'
console.log(import.meta.env)
axios.defaults.baseURL = import.meta.env.VITE_API_SERVER
axios.interceptors.request.use((config) => {
  const accessToken = ''

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

const ajaxGet = (url, params, options) => axios.request({ url, method: 'get', params, ...options })
const ajaxOther = (url, method, data, options) => axios.request({ url, method, data, ...options })

export default {
  get: ajaxGet,
  post: (url, data, options) => ajaxOther(url, 'post', data, options),
  put: (url, data, options) => ajaxOther(url, 'put', data, options),
  patch: (url, data, options) => ajaxOther(url, 'patch', data, options),
  delete: (url, data, options) => ajaxOther(url, 'delete', data, options),
  // excelDown: (url, data, options, filename, ext) => {},
  fileUpload: (url, data, options = {}) => {
    options.headers = {
      'Content-Type': 'multipart/form-data'
    }
  }
}
