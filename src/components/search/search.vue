<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll ref="shortcut" class="shortcut" :data="shortcut" :refreshDelay="refreshDelay">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li class="item" v-for="(item, index) in hotKey" :key="index" @click="addQuery(item.k)">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @select="addQuery" @delete="deleteSearchHistory"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest ref="suggest" :query="query" @listScroll="blurInput" @select="saveSearch"></suggest>
    </div>
    <confirm ref="confirm" text="是否清空所有搜索历史" confirmBtnText="清空" @confirm="clearSearchHistory"></confirm>
    <router-view></router-view>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import Scroll from 'base/scroll/scroll'
import { getHotKey } from 'api/search'
import { ERR_OK } from 'api/config'
import Suggest from 'components/suggest/suggest'
import { mapActions } from 'vuex'
import SearchList from 'base/search-list/search-list'
import Confirm from 'base/confirm/confirm'
import { playlistMixin, searchMixin } from 'common/js/mixin'

export default {
  mixins: [playlistMixin, searchMixin],
  data () {
    return {
      hotKey: []
    }
  },
  created () {
    this.getHotKey_()
  },
  computed: {
    shortcut () {
      return this.hotKey.concat(this.searchHistory)
    }
  },
  methods: {
    handlePlaylist (playlist) {
      const bottom = playlist.length > 0 ? '60px' : ''
      this.$refs.shortcutWrapper.style.bottom = bottom
      this.$refs.shortcut.refresh()
      this.$refs.searchResult.style.bottom = bottom
      this.$refs.suggest.refresh()
    },
    getHotKey_ () {
      getHotKey().then((res) => {
        if (res.code === ERR_OK) {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }
      })
    },
    showConfirm () {
      this.$refs.confirm.show()
    },
    ...mapActions([
      'clearSearchHistory'
    ])
  },
  watch: {
    query (newQuery) {
      if (!newQuery) {
        setTimeout(() => {
          this.$refs.shortcut.refresh()
        }, 20)
      }
    }
  },
  components: {
    SearchBox,
    Scroll,
    Suggest,
    SearchList,
    Confirm
  }
}
</script>

<style lang='scss' scope>
  .search{
    .search-box-wrapper{
      margin: 20px;
    }
    .shortcut-wrapper{
      position: fixed;
      top: 210px;
      bottom: 0;
      width: 100%;
      .shortcut{
        height: 100%;
        overflow: hidden;
        .hot-key{
          margin: 0 20px 20px 20px;
          .title{
            margin-bottom: 20px;
            font-size: 14px;
            color: red;
          }
          .item{
            display: inline-block;
            padding: 5px 10px;
            margin: 0 20px 10px 0;
            border-radius: 6px;
            background: #CCC;
            font-size: 14px;
            color: #FFF;
          }
        }
        .search-history{
          position: relative;
          margin: 0 20px;
          .title{
            display: flex;
            align-items: center;
            height: 40px;
            font-size: 14px;
            color: red;
            .text{
              flex: 1;
            }
            .clear{
              display: inline-block;
              width: 25px;
              height: 25px;
              background: url('./trash.png') center center no-repeat;
              background-size: 100%;
              .icon-clear{
                font-size: 14px;
                color: #FFF;
              }
            }
          }
        }
      }
    }
    .search-result{
      position: fixed;
      width: 100%;
      top: 200px;
      bottom: 0;
    }
  }
</style>
