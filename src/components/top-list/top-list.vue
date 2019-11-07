<template>
  <transition name="slide">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getMusicList } from 'api/rank'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import { getSongVkey } from 'common/js/http'

export default {
  data () {
    return {
      songs: []
    }
  },
  created () {
    this.getMusicList_()
    this.rank = true
  },
  computed: {
    title () {
      return this.topList.topTitle
    },
    bgImage () {
      return this.topList.picUrl
    },
    ...mapGetters([
      'topList'
    ])
  },
  methods: {
    getMusicList_ () {
      if (!this.topList.id) {
        this.$router.push({
          path: '/rank'
        })
        return
      }
      getMusicList(this.topList.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this.normalizeSongs_(res.songlist)
        }
      })
    },
    normalizeSongs_ (list) {
      let ret = []
      list.forEach((item) => {
        const musicData = item.data // 得到music对象
        getSongVkey(musicData.songmid).then((res) => {
          const songVkey = res.data.items[0].vkey
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData, songVkey))
          }
        })
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang="scss">
  .slide-enter-active, .slide-leave-active{
    transition: all 0.3s ease
  }

  .slide-enter, .slide-leave-to{
    transform: translate3d(100%, 0, 0)
  }
</style>
