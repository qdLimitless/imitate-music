<template>
  <scroll class="listView"
    :data="data"
    ref="listView"
    :listenScroll="listenScroll"
    @scroll="scroll"
    :probeType="probeType"
  >
    <ul>
      <li v-for="(group, index) in data" class="list-group" :key="index" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <div class="list-item" @click="selectItem(item)" v-for="item in group.items" :key="item.id">
          <div class="thumb-box">
            <img v-lazy="item.thumb">
          </div>
          <p class="text" v-html="item.name"></p>
        </div>
      </li>
    </ul>
    <div class="shortCut" @touchstart.stop.prevent="onShortcutTouchStart" @touchmove.stop.prevent="onShortcutTouchMove">
      <ul>
        <li v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current':currentIndex===index}">
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref="fixed">
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div class="loading-content" v-show="!data.length">
      <loading></loading>
    </div>
  </scroll>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { getData } from 'common/js/dom'

const SHORTCUT_HEIGHT = 18
const TITLE_HEIGHT = 30

export default {
  components: {
    Scroll,
    Loading
  },
  created () {
    this.touch = {}
    this.listenScroll = true
    this.listHeight = []
    this.probeType = 3
  },
  data () {
    return {
      currentIndex: 0,
      scrollY: -1,
      diff: -1
    }
  },
  watch: {
    data () {
      setTimeout(() => {
        this.calculateHeight_()
      }, 20)
    },
    scrollY (newY) {
      const listHeight = this.listHeight
      // 当滚动到顶部，newY>0
      if (newY > 0) {
        this.currentIndex = 0
        return
      }
      // 在中间部分滚动
      for (let i = 0; i < listHeight.length - 1; i++) {
        let height1 = listHeight[i]
        let height2 = listHeight[i + 1]
        // 必须有一个是等于
        if (-newY >= height1 && -newY < height2) {
          this.currentIndex = i
          // diff为当前区域的下线 - 滚动距离
          this.diff = height2 + newY
          return
        }
      }
      // 当滚动到底部，且-newY大于最后一个元素的上限
      this.currentIndex = listHeight.length - 2
    },
    diff (newVal) {
      let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
      if (this.fixedTop === fixedTop) {
        return
      }
      this.fixedTop = fixedTop
      this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
    }
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    shortcutList () {
      return this.data.map((group) => {
        return group.title.substr(0, 1)
      })
    },
    fixedTitle () {
      if (this.scrollY > 0) {
        return ''
      }
      return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
    }
  },
  methods: {
    selectItem (item) {
      this.$emit('select', item)
    },
    onShortcutTouchStart (e) {
      let anchorIndex = getData(e.target, 'index')
      let firstTouch = e.touches[0]
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this.scrollTo_(anchorIndex)
    },
    onShortcutTouchMove (e) {
      let secondTouch = e.touches[0]
      this.touch.y2 = secondTouch.pageY
      let delta = (this.touch.y2 - this.touch.y1) / SHORTCUT_HEIGHT | 0 // | 0  :向下取整
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta // this.touch.anchorIndex  为字符串
      this.scrollTo_(anchorIndex)
    },
    scroll (pos) {
      // 滚动条滚动式派发的方法 $emit
      this.scrollY = pos.y
    },
    scrollTo_ (index) {
      if (!index && index !== 0) {
        return
      }
      if (index < 0) {
        index = 0
      } else if (index > this.listHeight.length - 2) {
        index = this.listHeight.length - 2
      }
      // this.scrollY为负数，改变当前索引（确保正确）
      this.scrollY = -this.listHeight[index]
      this.$refs.listView.scrollToElement(this.$refs.listGroup[index], 0)
    },
    refresh () {
      this.$refs.listView.refresh()
    },
    calculateHeight_ () {
      this.listHeight = []
      const list = this.$refs.listGroup
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < list.length; i++) {
        let item = list[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    }
  }
}
</script>

<style lang='scss' scope>
.listView{
  .list-group{
    padding-bottom: 30px;
    .list-group-title{
      height: 30px;
      line-height: 30px;
      padding: 0 10px;
      background: #e5e5e5;
      font-size: 15px;
    }
    .list-item{
        height: 55px;
        line-height: 40px;
        padding: 5px 10px;
        box-sizing: border-box;
        .thumb-box{
          display: inline-block;
          width: 45px;
          height: 45px;
          border-radius: 50%;
          overflow: hidden;
          box-sizing: border-box;
          vertical-align: middle;
          img{
            vertical-align: middle;
            width: 100%;
            height: 100%;
          }
        }
        .text{
          display: inline-block;
          vertical-align: top;
          height: 45px;
          line-height: 45px;
          margin-left: 10px;
        }
      }
    }
    .shortCut{
      position: absolute;
      width: 20px;
      right: 10px;
      top:50%;
      line-height: 100%;
      transform: translateY(-50%);
      ul{
        width: 20px;
        li{
          height: 18px;
          line-height: 18px;
          text-align: center;
          width:100%;
          background: #CCC;
          margin-top: 1px;
          &:nth-child(1){
            border-top-left-radius: 9px;
            border-top-right-radius: 9px;
          }
          &:last-child{
            border-bottom-left-radius: 9px;
            border-bottom-right-radius: 9px;
          }
          &.current{
            background: red;
            color:#FFF;
          }
        }
      }
    }
    .list-fixed{
      position: absolute;
      top: 0;
      right: 0;
      width: 100%;
      .fixed-title{
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        background: #e5e5e5;
        font-size: 15px;
      }
    }
  }
.loading-content{
  position: fixed;
  width: 100%;
  height: 100%;
  text-align: center;
  justify-content: center;
}
</style>
