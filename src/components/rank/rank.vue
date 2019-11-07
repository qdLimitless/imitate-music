<template>
  <div class="rank" ref="rank">
    <scroll class="toplist" ref="toplist" :data="topList">
      <ul>
        <li class="item" v-for="(item,index) in topList" :key="index" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl" />
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song, ind) in item.songList" :key="ind">
              <span>{{ind + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>

<script>
import { getTopList } from 'api/rank'
import { ERR_OK } from 'api/config'
import Scroll from 'base/scroll/scroll'
import Loading from 'base/loading/loading'
import { playlistMixin } from 'common/js/mixin'
import { mapMutations } from 'vuex'

export default {
  mixins: [playlistMixin],
  data () {
    return {
      topList: []
    }
  },
  created () {
    this.getTopList_()
  },
  methods: {
    getTopList_ () {
      getTopList().then((res) => {
        if (res.code === ERR_OK) {
          this.topList = res.data.topList
        }
      })
    },
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.rank.style.bottom = bottom
      this.$refs.toplist.refresh()
    },
    selectItem (item) {
      this.$router.push({
        path: `/rank/${item.id}`
      })
      this.setTopList(item)
    },
    ...mapMutations({
      setTopList: 'SET_TOP_LIST'
    })
  },
  components: {
    Scroll,
    Loading
  }
}
</script>

<style lang='scss' scope>
  .rank{
    position: fixed;
    width: 100%;
    top: 130px;
    bottom: 0;
    .toplist{
      height: 100%;
      overflow: hidden;
      .item{
        display: flex;
        margin: 0 20px;
        padding-top: 20px;
        height: 100px;
        &:last-child{
          padding-bottom: 20px;
        }
        .icon{
          flex: 0 0 100px;
          width: 100px;
          height: 100px;
        }
        .songlist{
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 20px;
          height: 100px;
          overflow: hidden;
          background: #222;
          color: #FFF;
          font-size: 15px;
          .song{
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            line-height: 26px;
          }
        }
      }
      .loading-container{
        position: absolute;
        width: 100%;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
</style>
