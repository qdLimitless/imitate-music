function getRandomInt (min, max) {
  // 在min 和 max中随机取一个数，包含min和max
  // + min ：：当前面为0时，确保min
  // + 1 ：：因为Math.random不包含1，确保max
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function shuffle (arr) {
  let arr_ = arr.slice()
  for (let i = 0; i < arr_.length; i++) {
    let j = getRandomInt(0, i)
    let t = arr_[i]
    arr_[i] = arr_[j]
    arr_[j] = t
  }
  return arr_
}

export function debounce (func, delay) {
  let timer
  return function (...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}
