import originJsonp from 'jsonp'
/**
 * originJsonp只有url和option参数
 * 拼接好url后在传给originJsonp
 * @param {*} url 接口地址
 * @param {*} data 接口参数
 * @param {*} option
 */
export default function jsonp (url, data, option) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJsonp(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

/**
 * 拼接参数
 * @param {*} data 参数
 */
function param (data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += '&' + k + '=' + encodeURIComponent(value)
  }
  return url ? url.substring(1) : ''
}
