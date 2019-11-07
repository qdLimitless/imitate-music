<template>
  <transition name="list-fade">
    <div class="playlist" v-show="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title" @click="changeMode">
            <i class="icon" :class="iconMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click.stop="showConfirm"><i class="icon-clear"></i></span>
          </h1>
        </div>
        <scroll ref="listContent" class="list-content" :data="sequenceList">
          <transition-group ref="list" name="list" tag="ul">
            <li ref="listItem" class="item" v-for="(item, index) in sequenceList" :key="item.id" @click.stop="selectItem(item, index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span @click.stop="toggleFavorite(item)" class="like">
                <i :class="getFavoriteIcon(item)"></i>
              </span>
              <span class="delete" @click.stop="deleteOne(item)">
                <i class="icon-delete"></i>
              </span>
            </li>
          </transition-group>
        </scroll>
        <div class="list-operate">
          <div class="add" @click="addSong">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" confirmBtnText="清空" @confirm="clearConfirm"></confirm>
      <add-song ref="addSong"></add-song>
    </div>
  </transition>
</template>

<script>
import Confirm from 'base/confirm/confirm'
import Scroll from 'base/scroll/scroll'
import AddSong from 'components/add-song/add-song'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { playMode } from 'common/js/config'
import { playerMixin } from 'common/js/mixin'

export default {
  mixins: [playerMixin],
  data () {
    return {
      showFlag: false
    }
  },
  methods: {
    addSong () {
      this.$refs.addSong.show()
    },
    show () {
      this.showFlag = true
      // 当scroll显示是才计算scroll高度
      setTimeout(() => {
        this.$refs.listContent.refresh()
        this.scrollToCurrent(this.currentSong)
      }, 20)
    },
    hide () {
      this.showFlag = false
    },
    selectItem (item, index) {
      if (this.mode === playMode.random) {
        index = this.playlist.findIndex((song) => {
          return song.id === item.id
        })
      }
      this.setCurrentIndex(index)
      this.setPlayingState(true)
    },
    scrollToCurrent (current) {
      const index = this.sequenceList.findIndex((song) => {
        return current.id === song.id
      })
      this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
    },
    getCurrentIcon (item) {
      if (this.currentSong.id === item.id) {
        return 'icon-play'
      } else {
        return ''
      }
    },
    deleteOne (item) {
      this.deleteSong(item)
      if (!this.playlist.length) {
        this.hide()
      }
    },
    showConfirm () {
      this.$refs.confirm.show()
    },
    clearConfirm () {
      this.deleteSongList()
      this.hide()
    },
    ...mapMutations({
      'setCurrentIndex': 'SET_CURRENT_INDEX',
      'setPlayingState': 'SET_PLAYING_STATE'
    }),
    ...mapActions([
      'deleteSong',
      'deleteSongList',
      'saveFavoriteList',
      'deleteFavoriteList'
    ])
  },
  computed: {
    modeText () {
      return this.mode === playMode.sequence ? '顺序播放' : this.mode === playMode.loop ? '单曲循环' : '随机播放'
    },
    ...mapGetters([
      'sequenceList',
      'currentSong',
      'playlist',
      'mode'
    ])
  },
  watch: {
    currentSong (newSong, oldSong) {
      if (!this.showFlag || newSong.id === oldSong.id) {
        return
      }
      this.scrollToCurrent(newSong)
    }
  },
  components: {
    Scroll,
    Confirm,
    AddSong
  }
}
</script>

<style lang='scss' scope>
  .playlist{
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: rgba(0,0,0,.3);
    &.list-fade-enter-active, &.list-fade-leave-active{
      transition: opacity 0.3s;
      .list-wrapper{
        transition: all 0.3s;
      }
    }
    &.list-fade-enter, &.list-fade-leave-to{
      opacity: 0;
      .list-wrapper{
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper{
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: #333;
      .list-header{
        position: relative;
        padding: 20px 30px 10px 20px;
        .title{
          display: flex;
          align-items: center;
          .icon{
            margin-right: 10px;
            font-size: 30px;
            color: #FFF;
            &.icon-sequence {
              display: inline-block;
              height: 25px;
              width: 25px;
              background: url('../../assets/image/play-sequence.png') center
                no-repeat;
              background-size: 100%;
            }
            &.icon-loop {
              display: inline-block;
              height: 25px;
              width: 25px;
              background: url('../../assets/image/play-loop.png') center
                no-repeat;
              background-size: 100%;
            }
            &.icon-random {
              display: inline-block;
              height: 25px;
              width: 25px;
              background: url('../../assets/image/play-random.png') center
                no-repeat;
              background-size: 100%;
            }
          }
          .text{
            flex: 1;
            font-size: 14px;
            color: #FFF;
          }
          .clear{
            // extend-click();
            display: inline-block;
            width: 25px;
            height: 25px;
            color: #FFF;
            background: url('./trash.png') center center no-repeat;
            background-size: 20px 20px;
            .icon-clear{
              font-size: 14px;
            }
          }
        }
      }
      .list-content{
        max-height: 240px;
        overflow: hidden;
        .item{
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          &.list-enter-active, &.list-leave-active{
            transition: all 0.1s;
          }
          &.list-enter, &.list-leave-to{
            height: 0;
          }
          .current{
            flex: 0 0 20px;
            &.icon-play{
              width: 20px;
              height: 20px;
              color: #FFF;
              background: url('./play-current.png') center center no-repeat;
              background-size: 15px 15px;
            }
          }
          .text{
            flex: 1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 14px;
            color: #CCC;
          }
          .like{
            display: inline-block;
            width: 40px;
            height: 40px;
            .icon-favorite{
              display: inline-block;
              width: 40px;
              height: 40px;
              background: url('./after-favorite.png') center center no-repeat;
              background-size: 20px;
            }
            .icon-not-favorite{
              display: inline-block;
              width: 40px;
              height: 40px;
              background: url('./before-favorite.png') center center no-repeat;
              background-size: 20px;
            }
          }
          .delete{
            font-size: 13px;
            color: red;
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url('./delete.png') center center no-repeat;
            background-size: 20px;
          }
        }
      }
      .list-operate{
        width: 140px;
        margin: 20px auto 30px auto;
        .add{
          display: flex;
          align-items: center;
          padding: 8px 16px;
          border: 1px solid #FFF;
          border-radius: 100px;
          color: #FFF;
          .icon-add{
            margin-right: 5px;
            font-size: 13px-s;
          }
          .text{
            font-size: 13px;
          }
        }
      }
      .list-close{
        text-align: center;
        line-height: 50px;
        background: #000;
        font-size: 14px-x;
        color: #FFF;
      }
    }
  }
</style>
