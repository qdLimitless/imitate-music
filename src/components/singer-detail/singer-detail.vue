<template>
  <transition name="slide">
    <music-list :songs="songs" :title="title" :bgImage="bgImage"></music-list>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'
import { createSong } from 'common/js/song'
import MusicList from 'components/music-list/music-list'
import { getSongVkey } from 'common/js/http'

export default {
  computed: {
    ...mapGetters([
      'singer'
    ]),
    title () {
      return this.singer.name
    },
    bgImage () {
      return this.singer.thumb
    }
  },
  data () {
    return {
      songs: []
    }
  },
  created () {
    this.getDetail_()
  },
  methods: {
    getDetail_ () {
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          this.songs = this.normalizeSongs_(res.data.list)
        }
      })
    },
    normalizeSongs_ (list) {
      let ret = []
      list.forEach((item) => {
        let { musicData } = item // 得到music对象
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

<style lang='scss' scope>
  .slide-enter-active, .slide-leave-active{
    transition: all 0.3s;
  }
  .slide-enter, .slide-leave-to{
    transform: translate3d(100%, 0, 0);
  }
</style>
