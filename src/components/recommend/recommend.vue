<template>
  <div class="recommend" ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <div v-if="recommends.length" class="slider-warpper">
          <slider>
            <div v-for="item in recommends" :key="item.id">
              <a :href="item.linkUrl">
                <img class="needsclick" @load="imgLoad" :src="item.picUrl" />
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h2 class="list-title">热门歌曲推荐</h2>
          <ul>
            <li v-for="item in discList" :key="item.dissid" @click="selectItem(item)">
              <div class="thumb-box">
                <img v-lazy="item.imgurl" width="60" height="60" alt="">
              </div>
              <div class="text">
                <p class="name" v-html="item.creator.name"></p>
                <span class="desc" v-html="item.dissname"></span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-cotent" v-show="discList">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import {getRecommend, getDiscList} from 'api/recommend'
import Loading from 'base/loading/loading'
import Slider from 'base/slider/slider'
import Scroll from 'base/scroll/scroll'
import { ERR_OK } from 'api/config'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      recommends: [],
      discList: []
    }
  },
  components: {
    Slider,
    Scroll,
    Loading
  },
  created () {
    this._getRecommend()
    this._getDiscList()
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.recommend.style.bottom = bottom
      this.$refs.scroll.refresh()
    },
    _getRecommend () {
      getRecommend().then((res) => {
        if (res.code === ERR_OK) {
          this.recommends = res.data.slider
        }
      })
    },
    _getDiscList () {
      getDiscList().then((res) => {
        if (res.code === ERR_OK) {
          this.discList = res.data.list
        }
      })
    },
    imgLoad () {
      // 如果轮播图有延时后渲染，只要有一张照片加载就会刷新scroll组件
      if (!this.checkLoader) {
        this.$refs.scroll.refresh()
        this.checkLoader = true
      }
    },
    selectItem (item) {
      this.$router.push({
        path: `/recommend/${item.dissid}`
      })
      this.setDics(item)
    },
    ...mapMutations({
      setDics: 'SET_DISC'
    })
  }
}
</script>

<style lang='scss' scope>
  .recommend{
    position: fixed;
    width: 100vw;
    top: 130px;
    bottom: 0;
    .recommend-content{
      height: 100%;
      overflow: hidden;
    }
    .recommend-list{
      .list-title{
        font-size: 1rem;
        line-height: 1rem;
        text-align: center;
        color: #f00;
      }
      li{
        padding: 0 10px;
        display: flex;
        display: -webkit-flex;
        display: flex;
        .thumb-box{
          padding: 2px 10px 2px 0;
        }
        .text{
          display: flex;
          flex-direction: column;
          justify-content: center;
          .name{
            font-size: 14px;
            font-weight: bold;
          }
          .desc{
            font-size: 13px;
          }
        }
      }
    }
    .loading-cotent{
      position: fixed;
      width: 100%;
      height: 100%;
      text-align: center;
      justify-content: center;
    }
  }
</style>
