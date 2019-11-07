<template>
  <transition name="slide">
    <div class="add-song" v-show="showFlag" @click.stop>
      <div class="header">
        <h1 class="title">添加歌曲到列表</h1>
        <div class="close" @click="hide">
          <i class="icon-close"></i>
        </div>
      </div>
      <div class="search-box-wrapper">
        <search-box ref="searchBox" @query="onQueryChange" placeholder="搜索歌曲"></search-box>
      </div>
      <div class="shortcut" v-show="!query">
        <switches :currentIndex="currentIndex" :switches="switches" @switch="switchItem"></switches>
        <div class="list-wrapper">
          <scroll ref="songList" class="list-scroll" v-if="currentIndex === 0" :data="playHistory">
            <div class="list-inner">
              <song-list :songs="playHistory" @select="selectSong">
              </song-list>
            </div>
          </scroll>
          <scroll ref="searchList" class="list-scroll" v-if="currentIndex === 1" :refreshDelay="refreshDelay">
            <div class="list-inner">
              <search-list @delete="deleteSearchHistory" @select="addQuery" :searches="searchHistory"></search-list>
            </div>
          </scroll>
        </div>
      </div>
      <div class="search-result" v-show="query">
        <suggest :query="query" :showSinger="showSinger" @select="selectSuggest" @listScroll="blurInput"></suggest>
      </div>
      <top-tip ref="topTip">
        <div class="tip-title">
          <i class="icon-ok"></i>
          <span class="text">1首歌曲已经添加到播放列表</span>
        </div>
      </top-tip>
    </div>
  </transition>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import Suggest from 'components/suggest/suggest'
import Switches from 'base/switches/switches'
import Scroll from 'base/scroll/scroll'
import SongList from 'base/song-list/song-list'
import SearchList from 'base/search-list/search-list'
import TopTip from 'base/top-tip/top-tip'
import { searchMixin } from 'common/js/mixin'
import { mapGetters, mapActions } from 'vuex'
import Song from 'common/js/song'

export default {
  mixins: [searchMixin],
  data () {
    return {
      showFlag: false,
      showSinger: false,
      currentIndex: 0,
      switches: [
        {name: '最近播放'},
        {name: '搜索历史'}
      ]
    }
  },
  methods: {
    selectSong (song, index) {
      if (index !== 0) {
        this.insertSong(new Song(song))
        this.showTip()
      }
    },
    selectSuggest () {
      this.saveSearch()
      this.showTip()
    },
    switchItem (index) {
      this.currentIndex = index
    },
    show () {
      this.showFlag = true
      // 组件早就存在，scroll已经计算高度，要当显示时再计算scroll高度
      setTimeout(() => {
        if (this.currentIndex === 0) {
          this.$refs.songList.refresh()
        } else {
          this.$refs.searchList.refresh()
        }
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    showTip () {
      this.$refs.topTip.show()
    },
    ...mapActions([
      'insertSong'
    ])
  },
  computed: {
    ...mapGetters([
      'playHistory'
    ])
  },
  components: {
    SearchBox,
    Suggest,
    Switches,
    Scroll,
    SongList,
    SearchList,
    TopTip
  }
}
</script>

<style lang='scss' scope>
.add-song{
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  z-index: 200;
  background: #FFF;
  &.slide-enter-active, &.slide-leave-active{
    transition: all 0.3s;
  }
  &.slide-enter, &.slide-leave-to{
    transform: translate3d(100%, 0, 0);
  }
  .header{
    position: relative;
    height: 44px;
    text-align: center;
    .title{
      line-height: 44px;
      font-size: 15px;
      color: #000;
    }
    .close{
      position: absolute;
      top: 0;
      right: 8px;
      height: 100%;
      background: url('./delete.png') center center no-repeat;
      background-size: 20px;
      .icon-close{
        display: block;
        padding: 12px;
      }
    }
  }
  .search-box-wrapper{
    margin: 20px;
  }
  .shortcut{
    .list-wrapper{
      position: absolute;
      top: 170px;
      bottom: 0;
      width: 100%;
      background: #FFF;
      .list-scroll{
        height: 100%;
        overflow: hidden;
        .list-inner{
          padding: 20px 30px;
        }
      }
    }
  }
  .search-result{
    position: fixed;
    top: 124px;
    bottom: 0;
    width: 100%;
  }
  .tip-title{
    text-align: center;
    padding: 18px 0;
    font-size: 0;
    .icon-ok{
      font-size: 14px;
      margin-right: 4px;
    }
    .text{
      font-size: 14px;
      color: #000;
    }
  }
}
</style>
