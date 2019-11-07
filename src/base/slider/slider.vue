<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot></slot>
    </div>
    <div class="dots">
      <span v-for="(item, index) in dots" :key="index" :class="{active : currentPageIndex === index}"></span>
    </div>
  </div>
</template>

<script>
// 参考网址better-croll
// http://ustbhuangyi.github.io/better-scroll/doc/api.html
import BScroll from 'better-scroll'
import { addClass } from 'common/js/dom'
// 开发轮播图组件
export default {
  name: 'slider',
  data () {
    return {
      dots: [],
      currentPageIndex: 0
    }
  },
  props: {
    loop: {
      type: Boolean,
      default: true
    },
    autoPlay: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 4000
    }
  },
  mounted () {
    setTimeout(() => {
      this._setSliderWidth()
      // 在初始化slider前初始化
      this._initDots()
      this._initSlider()
      if (this.autoPlay) {
        this._play()
      }

      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        this.slider.refresh()
      })
    }, 20)
  },
  methods: {
    _setSliderWidth (isResize) {
      this.children = this.$refs.sliderGroup.children
      // 总宽度
      let width = 0
      // 单个宽度
      let sliderWidth = this.$refs.slider.clientWidth
      for (let i = 0; i < this.children.length; i++) {
        let child = this.children[i]
        addClass(child, 'slider-item')
        width += sliderWidth
        child.style.width = sliderWidth + 'px'
      }
      // isResize搞不清
      if (this.loop && !isResize) {
        width += 2 * sliderWidth
      }
      this.$refs.sliderGroup.style.width = width + 'px'
    },
    _initDots () {
      this.dots = this.$refs.sliderGroup.children.length
    },
    _initSlider () {
      // 不需要加click事件，1、a链接自带；2、click会禁止自带的点击，fastclick会禁止click；
      this.slider = new BScroll(this.$refs.slider, {
        scrollX: true,
        scrollY: false,
        momentum: false,
        snap: {
          loop: this.loop,
          threshold: 0.3,
          speed: 400
        }
      })

      this.slider.on('scrollEnd', () => {
        let pageIndex = this.slider.getCurrentPage().pageX
        this.currentPageIndex = pageIndex
        clearTimeout(this.timer)
        this._play()
      })
    },
    _play () {
      let pageIndex = this.currentPageIndex + 1
      this.timer = setTimeout(() => {
        this.slider.goToPage(pageIndex, 0, 400)
      }, this.interval)
    }
  },
  destroyed () {
    clearTimeout(this.timer)
  }
}
</script>

<style lang='scss' scope>
.slider {
  min-height: 1px;
  font-size: 0;
  position: relative;
  .slider-item{
    display: inline-block;
    box-sizing: border-box;
    overflow: hidden;
    text-align: center;
    a{
      display: block;
      width: 100%;
      overflow: hidden;
      text-decoration: none;
    }
    img{
      display: block;
      width: 100%;
    }
  }
  .dots{
    position: absolute;
    width: 100vw;
    bottom: 10px;
    text-align: center;
    span{
      display: inline-block;
      height: 8px;
      width: 8px;
      border-radius: 4px;
      background: #FFF;
      margin: 0 3px;
      &.active{
        display: inline-block;
        width: 20px;
      }
    }
  }
}
</style>
