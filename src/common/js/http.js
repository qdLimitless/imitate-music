import jsonp from './jsonp'

export function getSongVkey (songmid) {
  const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
  const data = Object.assign({}, {
    g_tk: 1928093487,
    inCharset: 'utf-8',
    outCharset: 'utf-8',
    notice: 0,
    format: 'json',
    cid: 205361747,
    platform: 'yqq',
    hostUin: 0,
    needNewCode: 0,
    uin: 0,
    songmid: `${songmid}`,
    filename: `C400${songmid}.m4a`,
    guid: 7120953682
  })
  return jsonp(url, data)
}
