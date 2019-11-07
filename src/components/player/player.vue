<template>
  <div class='player' v-show='playlist.length>0'>
    <transition
      name='normal'
      @enter='enter'
      @afterEnter='afterEnter'
    >
      <div class='normal-player' v-show='fullScreen'>
        <div class='background'>
          <img height='100%' width='100%' :src='currentSong.image' />
        </div>
        <div class='top'>
          <div class='back' @click='goBack'>
            <i class='icon-back'></i>
          </div>
          <h1 class='title'>{{currentSong.name}}</h1>
          <h2 class='subtitle'>{{currentSong.singer}}</h2>
        </div>
        <div class='middle'
          @touchstart.stop="middleTouchStart"
          @touchmove.stop="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div class='middle-l' ref='middleL'>
            <div class='cd-wrapper' ref='cdWrapper'>
              <div class='cd' :class="adCls">
                <img class='image' :src='currentSong.image' />
              </div>
            </div>
            <div class='playing-lyric-wrapper'>
              <div class='playing-lyric'>{{playingLyric}}</div>
            </div>
          </div>
          <scroll class='middle-r' ref='lyricList' :data="currentLyric && currentLyric.lines">
            <div class='lyric-wrapper'>
              <div v-if="currentLyric">
                <p ref='lyricLine' class='text' :class="{'current': currentLineNum === index}" v-for="(line,index) in currentLyric.lines" :key="index">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class='bottom'>
          <div class='dot-wrapper'>
            <span class='dot' :class="{'active': currentShow === 'cd'}"></span>
            <span class='dot' :class="{'active': currentShow === 'lyric'}"></span>
          </div>
          <div class='progress-wrapper'>
            <span class='time time-l'>{{format(currentTime)}}</span>
            <div class='progress-bar-wrapper'>
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class='time time-r'>{{format(currentSong.duration)}}</span>
          </div>
          <div class='operators'>
            <div class='icon i-left'>
              <i :class='iconMode' @click="changeMode"></i>
            </div>
            <div class='icon i-left'>
              <i @click="prev" class='icon-prev' :class="disableCls"></i>
            </div>
            <div class='icon i-center'>
              <i @click="togglePlaying" :class="[playing?'playing':'pause']"></i>
            </div>
            <div class='icon i-right'>
              <i @click="next" class='icon-next' :class="disableCls"></i>
            </div>
            <div class='icon i-right'>
              <i class='icon' :class="getFavoriteIcon(currentSong)" @click="toggleFavorite(currentSong)"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name='mini'>
      <div class='mini-player' v-show='!fullScreen' @click='open'>
        <div class='icon'>
          <img :class="adCls" width='40' height='40' :src='currentSong.image' />
        </div>
        <div class='text'>
          <h2 class='name' v-html='currentSong.name'></h2>
          <p class='desc' v-html='currentSong.singer'></p>
        </div>
        <div class='control'>
          <progress-circle :radius='radius' :percent="percent">
            <i @click.stop="togglePlaying" class='icon-mini' :class="[playing?'playing':'pause']"></i>
          </progress-circle>
        </div>
        <div class='control' @click.stop="showPlaylist">
          <i class='icon-playlist'></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist" ></play-list>
    <audio ref='audio' :src='currentSong.url' @play="ready" @error="error" @timeupdate="updateTime" @ended="end"></audio>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from 'vuex'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import Scroll from 'base/scroll/scroll'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import Lyric from 'lyric-parser'
import PlayList from 'components/playlist/playlist'
import { playerMixin } from 'common/js/mixin'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

export default {
  mixins: [playerMixin],
  data () {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      currentLineNum: 0,
      currentShow: 'cd',
      playingLyric: ''
    }
  },
  created () {
    this.touch = {}
  },
  computed: {
    adCls () {
      return this.playing ? 'play' : 'play pause'
    },
    disableCls () {
      return this.songReady ? '' : 'disable'
    },
    percent () {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'fullScreen',
      'playing',
      'currentIndex'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (!newSong.id) {
        return
      }
      if (newSong.id === oldSong.id) {
        return
      }
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$refs.audio.play()
        this.getLyric()
      }, 1000)
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
    },
    playing (newPlaying) {
      if (!this.songReady) {
        return
      }
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
    },
    fullScreen (newVal) {
      if (newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh()
        }, 20)
      }
    }
  },
  methods: {
    goBack () {
      this.setFullScreen(false)
    },
    open () {
      this.setFullScreen(true)
    },
    prev () {
      if (!this.songReady) {
        return
      }
      let index = this.currentIndex - 1
      if (index === 0) {
        index = this.playlist.length - 1
      }
      this.setCurrentIndex(index)
      if (!this.playing) {
        this.togglePlaying()
      }
      this.songReady = false
    },
    next () {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
        return
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
      this.songReady = false
    },
    end () {
      if (this.mode === playMode.loop) {
        // 循环播放
        this.loop()
      } else {
        this.next()
      }
    },
    ready () {
      this.songReady = true
      this.savePlayHistory(this.currentSong)
    },
    error () {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.songReady = true
        this.end()
      }, 1000)
    },
    loop () {
      // 循环播放
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    updateTime (e) {
      this.currentTime = e.target.currentTime
    },
    pad_ (num, n = 2) {
      // 给秒补0
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    getLyric () {
      this.currentSong.getLyric().then((lyric) => {
        if (this.currentSong.lyric !== lyric) {
        }
      })
      // 获取歌词
      this.currentSong.getLyric().then((lyric) => {
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        if (this.playing && this.songReady) {
          this.currentLyric.play()
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLyric.lineNum = 0
      })
    },
    handleLyric ({lineNum, txt}) {
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    middleTouchStart (e) {
      this.touch.initiated = true
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove (e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 纵轴的偏移大于横轴
        return
      }
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd (e) {
      let opacity
      let offsetWidth
      if (this.currentShow === 'cd') {
        if (this.touch.percent > 0.1) {
          offsetWidth = -window.innerWidth
          this.currentShow = 'lyric'
          opacity = 0
        } else {
          offsetWidth = 0
          opacity = 1
        }
      } else {
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
    },
    enter (el, done) {
      const { x, y, scale } = this.getPosAndScale_()
      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter () {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave (el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this.getPosAndScale_()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      this.$refs.cdWrapper.addEventListener('transitionend', done)
    },
    afterLeave () {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    onProgressBarChange (percent) {
      const currentTime = this.currentSong.duration * percent
      this.$refs.audio.currentTime = percent * this.$refs.audio.duration
      if (!this.playing) {
        this.togglePlaying()
      }
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
    },
    getPosAndScale_ () {
      const targetWidth = 40
      const paddingLeft = 40
      const paddingBottom = 30
      const paddingTop = 80
      const width = window.innerWidth * 0.8
      const scale = targetWidth / width
      const x = -(window.innerWidth / 2 - paddingLeft)
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
      return {
        x,
        y,
        scale
      }
    },
    showPlaylist () {
      this.$refs.playlist.show()
    },
    togglePlaying () {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric) {
        this.currentLyric.togglePlay()
      }
    },
    format (interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this.pad_(interval % 60)
      return `${minute}:${second}`
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'savePlayHistory',
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  },
  components: {
    Scroll,
    ProgressBar,
    ProgressCircle,
    PlayList
  }
}
</script>

<style lang='scss' scope>
.player {
  .normal-player {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 150;
    background: #222;
    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);
    }
    .top {
      position: relative;
      margin-bottom: 25px;
      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
        .icon-back {
          display: block;
          padding: 20px;
          background: url('../../assets/image/icon-down.png') center no-repeat;
          background-size: 100%;
        }
      }
      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        white-space: nowrap;
        font-size: 16px;
        color: #EEE;
      }
      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: 14px;
        color: #EEE;
      }
    }
    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;
      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;
        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          height: 100%;
          .cd {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            border: 10px solid rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            &.play {
              animation: rotate 20s linear infinite;
            }
            &.pause {
              animation-play-state: paused;
            }
            .image {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
        }
        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;
          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: 14px;
            color: #FFF;
          }
        }
      }
      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;
        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;
          .text {
            line-height: 32px;
            color: #CCC;
            font-size: 14px;
            text-align: center;
            &.current {
              color: #FFF;
            }
          }
        }
      }
    }
    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;
      .dot-wrapper {
        text-align: center;
        font-size: 0;
        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
          &.active {
            width: 20px;
            border-radius: 5px;
            background: #fff;
          }
        }
      }
      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;
        .time {
          color: #000;
          font-size: 12px;
          flex: 0 0 30px;
          line-height: 30px;
          width: 30px;
          &.time-l {
            text-align: left;
          }
          &.time-r {
            text-align: right;
          }
        }
        .progress-bar-wrapper {
          flex: 1;
        }
      }
      .operators {
        line-height: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        .icon {
          flex: 1;
          color: #000;
          &.disable {
            color: #ccc;
          }
          i {
            font-size: 30px;
          }
        }
        .i-left {
          text-align: right;
          .icon-prev {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-left.png') center no-repeat;
            background-size: 100%;
          }
          .icon-sequence {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-sequence.png') center
              no-repeat;
            background-size: 100%;
          }
          .icon-loop {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-loop.png') center
              no-repeat;
            background-size: 100%;
          }
          .icon-random {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-random.png') center
              no-repeat;
            background-size: 100%;
          }
        }
        .i-center {
          padding: 0 20px;
          text-align: center;
          i.playing {
            display: inline-block;
            height: 60px;
            width: 60px;
            background: url('../../assets/image/play-pause.png') center
              no-repeat;
            background-size: 100%;
          }
          i.pause {
            display: inline-block;
            height: 60px;
            width: 60px;
            background: url('../../assets/image/play-start.png') center
              no-repeat;
            background-size: 100%;
          }
        }
        .i-right {
          text-align: left;
          .icon-next {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-right.png') center
              no-repeat;
            background-size: 100%;
          }
          .icon-not-favorite {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-not-favorite.png') center
              no-repeat;
            background-size: 100%;
          }
          .icon-favorite {
            display: inline-block;
            height: 40px;
            width: 40px;
            background: url('../../assets/image/play-favorite.png') center
              no-repeat;
            background-size: 100%;
          }
        }
        .icon-favorite {
          color: #000;
        }
      }
    }
    &.normal-enter-active,
    &.normal-leave-active {
      transition: all 0.4s;
      .top,
      .bottom {
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32);
      }
    }
    &.normal-enter,
    &.normal-leave-to {
      opacity: 0;
      .top {
        transform: translate3d(0, -100px, 0);
      }
      .bottom {
        transform: translate3d(0, 100px, 0);
      }
    }
  }
  .mini-player {
    display: flex;
    align-items: center;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    width: 100%;
    height: 60px;
    background: #333;
    &.mini-enter-active,
    &.mini-leave-active {
      transition: all 0.4s;
    }
    &.mini-enter,
    &.mini-leave-to {
      opacity: 0;
    }
    .icon {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;
      img {
        border-radius: 50%;
        &.play {
          animation: rotate 10s linear infinite;
        }
        &.pause {
          animation-play-state: paused;
        }
      }
    }
    .text {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .name {
        margin-bottom: 2px;
        white-space: nowrap;
        font-size: 14px;
        color: #fff;
      }
      .desc {
        white-space: nowrap;
        font-size: 13px;
        color: #fff;
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      height: 30px;
      padding: 0 10px;
      position: relative;
      .icon-play-mini,
      .icon-pause-mini,
      .icon-playlist {
        font-size: 30px;
        color: #fff;
      }
      .icon-playlist {
        color: #fff;
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        height: 30px;
        width: 30px;
        background: url('../../assets/image/play-list.png') center no-repeat;
        background-size: 100%;
      }
      .icon-mini.playing {
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        height: 32px;
        width: 32px;
        background: url('../../assets/image/pause.png') center center no-repeat;
        background-size: 16px;
      }
      .icon-mini.pause {
        position: absolute;
        left: 0;
        top: 0;
        display: inline-block;
        height: 32px;
        width: 36px;
        background: url('../../assets/image/start.png') center center no-repeat;
        background-size: 16px;
      }
    }
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
