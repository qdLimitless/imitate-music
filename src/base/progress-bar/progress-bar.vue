<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper" ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend="progressTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
import {prefixStyle} from 'common/js/dom'

const progressBtnWidth = 16
const transform = prefixStyle('transform')

export default {
  props: {
    percent: {
      type: Number,
      default: 0
    }
  },
  created () {
    this.touch = {}
  },
  methods: {
    progressTouchStart (e) {
      this.touch.initiated = true
      this.touch.startX = e.touches[0].pageX
      this.touch.left = this.$refs.progress.clientWidth
    },
    progressTouchMove (e) {
      // 根据改变已经播放的进度条长度
      if (!this.touch.initiated) {
        return
      }
      const deltaX = e.touches[0].pageX - this.touch.startX
      const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX))
      this.offset_(offsetWidth)
    },
    progressTouchEnd (e) {
      this.touch.initiated = false
      this.triggerPercent_()
    },
    progressClick (e) {
      // 改变已经播放的进度条长度然后执行 triggerPercent_()
      // 点击按钮时，e.offsetX会有BUG
      // this.offset_(e.offsetX)
      // 所以获取pageX
      const rect = this.$refs.progressBar.getBoundingClientRect()
      const offsetWidth = e.pageX - rect.left
      this.offset_(offsetWidth)
      this.triggerPercent_()
    },
    triggerPercent_ () {
      // 根据改变已经播放的进度条长度，计算百分比
      const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
      const percent = this.$refs.progress.clientWidth / barWidth
      this.$emit('percentChange', percent)
    },
    offset_ (offsetWidth) {
      this.$refs.progress.style.width = `${offsetWidth}px`
      this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0)`
    }
  },
  watch: {
    percent (newPercent) {
      if (newPercent >= 0 && !this.touch.initiated) {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth
        const offsetWidth = newPercent * barWidth
        this.offset_(offsetWidth)
      }
    }
  }
}
</script>

<style lang='scss' scope>
.progress-bar{
  height: 30px;
  .bar-inner{
    position: relative;
    top: 13px;
    height: 4px;
    background: rgba(0, 0, 0, 0.3);
    .progress{
      position: absolute;
      height: 100%;
      background: #222;
    }
    .progress-btn-wrapper{
      position: absolute;
      left: -8px;
      top: -13px;
      width: 30px;
      height: 30px;
      .progress-btn{
        position: relative;
        top: 7px;
        left: 7px;
        box-sizing: border-box;
        width: 16px;
        height: 16px;
        border: 3px solid #000;
        border-radius: 50%;
        background: #222;
      }
    }
  }
}
</style>
