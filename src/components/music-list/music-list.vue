<template>
  <div class="music-list">
    <div class="back" @click="goBack">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" class="play" v-show="songs.length>0" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll class="list" @scroll="scroll" :probeType="probeType" :listenScroll="listenScroll" ref="list" :data="songs">
      <div class="song-list-wrapper">
        <song-list @select="selectItem" :songs="songs" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import SongList from 'base/song-list/song-list'
import { prefixStyle } from 'common/js/dom'
import { mapActions } from 'vuex'
import { playlistMixin } from 'common/js/mixin'

const RESERVED_HEIGHT = 40
const transform = prefixStyle('transform')
const filter = prefixStyle('filter')

export default {
  mixins: [playlistMixin],
  data () {
    return {
      scrollY: 0
    }
  },
  props: {
    bgImage: {
      type: String,
      default: ''
    },
    songs: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    this.imageHeight = this.$refs.bgImage.clientHeight
    this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT
    this.$refs.list.$el.style.top = `${this.imageHeight}px`
  },
  created () {
    this.probeType = 3
    this.listenScroll = true
  },
  watch: {
    scrollY (newY) {
      // this.minTranslateY，newY都为负数
      let translateY = Math.max(this.minTranslateY, newY)
      let zIndex = 0
      let scale = 1
      let blur = 0
      this.$refs.layer.style[transform] = `translate3d(0,${translateY}px,0)`
      const percent = Math.abs(newY / this.imageHeight)
      if (newY > 0) {
        scale = 1 + percent
        zIndex = 10
      } else {
        blur = Math.min(20 * percent, 20)
      }
      this.$refs.filter.style[filter] = `blur(${blur}px)`
      if (newY < this.minTranslateY) {
        zIndex = 10
        this.$refs.bgImage.style.paddingTop = '0'
        this.$refs.bgImage.style.height = RESERVED_HEIGHT + 'px'
        this.$refs.playBtn.style.display = 'none'
      } else {
        this.$refs.bgImage.style.paddingTop = '70%'
        this.$refs.bgImage.style.height = '0'
        this.$refs.playBtn.style.display = ''
      }
      this.$refs.bgImage.style.zIndex = zIndex
      this.$refs.bgImage.style[transform] = `scale(${scale})`
    }
  },
  computed: {
    bgStyle () {
      return `background:url('${this.bgImage}') no-repeat;background-size:100%`
    }
  },
  methods: {
    goBack () {
      this.$router.back()
    },
    scroll (pos) {
      this.scrollY = pos.y
    },
    selectItem (item, index) {
      this.selectPlay({
        list: this.songs,
        index
      })
    },
    random () {
      this.randomPlay({
        list: this.songs
      })
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.list.$el.style.bottom = bottom
      this.$refs.list.refresh()
    },
    ...mapActions([
      'selectPlay',
      'randomPlay'
    ])
  },
  components: {
    Scroll,
    Loading,
    SongList
  }
}
</script>

<style lang='scss' scope>
.music-list{
    position: fixed;
    z-index: 1;
    top:0;
    bottom:0;
    left: 0;
    right: 0;
    background: rgb(219, 210, 210);
    .back{
      position: absolute;
      top: 0;
      z-index: 50;
      .icon-back{
        display: block;
        padding: 20px;
        background: url('../../assets/image/icon-left.png') no-repeat;
      }
    }
    .title{
      position: absolute;
      top: 0;
      left: 10%;
      z-index: 50;
      width: 80%;
      overflow: hidden;
      text-overflow:ellipsis;
      overflow: hidden;
      text-overflow:ellipsis;
      white-space: nowrap;
      text-align: center;
      line-height: 40px;
      font-size: 16px;
      color: red;
    }
    .bg-image{
      position: relative;
      width: 100%;
      height: 0;
      padding-top: 70%;
      transform-origin: top;
      background-size: cover;
      .play-wrapper{
        position: absolute;
        bottom: 20px;
        z-index: 50;
        width: 100%;
        .play{
          box-sizing: border-box;
          width: 135px;
          padding: 7px 0;
          margin: 0 auto;
          text-align: center;
          border: 1px solid #000;
          color: #000;
          border-radius: 100px;
          font-size: 0;
          .icon-play{
            display: inline-block;
            vertical-align: middle;
            margin-right: 6px;
            font-size: 15px;
          }
          .text{
            display: inline-block;
            vertical-align: middle;
            font-size: 14px;
            color: #FFF
          }
        }
      }
      .filter{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .bg-layer{
      position: relative;
      height: 100%;
      background: #CCC;
    }
    .list{
      position: fixed;
      top: 0;
      bottom: 0;
      width: 100%;
      background: #222;
      .song-list-wrapper{
        padding: 20px 30px;
        background: #222;
      }
      .loading-container{
        position: absolute;
        text-align: center;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
