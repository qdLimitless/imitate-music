<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>

<script>
import MusicList from 'components/music-list/music-list'
import { mapGetters } from 'vuex'
import { getSongList } from 'api/recommend'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import { getSongVkey } from 'common/js/http'

export default {
  data () {
    return {
      songs: []
    }
  },
  computed: {
    title () {
      return this.disc.dissname
    },
    bgImage () {
      return this.disc.imgurl
    },
    ...mapGetters([
      'disc'
    ])
  },
  created () {
    this.getSongList_()
  },
  methods: {
    getSongList_ () {
      if (!this.disc.dissid) {
        this.$router.push({
          path: '/recommend'
        })
        return
      }
      getSongList(this.disc.dissid).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this.normalizeSongs_(res.cdlist[0].songlist)
        }
      })
    },
    normalizeSongs_ (list) {
      let ret = []
      list.forEach((item) => {
        const musicData = item // 得到music对象
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
    transition: all 0.3s;
  }

  .slide-enter, .slide-leave-to{
    transform: translate3d(100%, 0, 0);
  }
</style>
