<template>
  <div class="song-list">
    <ul>
      <li @click="selectItem(song, index)" v-for="(song, index) in songs" :key="index" class="item">
        <div class="list-rank" v-show="rank">
          <span :class="getRankCls(index)">{{getRankText(index)}}</span>
        </div>
        <div class="content">
          <h2 class="name">{{song.name}}</h2>
          <p class="desc">{{getDesc(song)}}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  props: {
    songs: {
      type: Array,
      default: () => []
    },
    rank: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getDesc (song) {
      return `${song.singer} 。 ${song.album}`
    },
    selectItem (item, index) {
      this.$emit('select', item, index)
    },
    getRankCls (index) {
      if (index <= 2) {
        return `icon icon-${index}`
      } else {
        return 'text'
      }
    },
    getRankText (index) {
      if (index > 2) {
        return index + 1
      }
    }
  }
}
</script>

<style lang='scss' scope>
  .song-list{
    .item{
      display: flex;
      align-items: center;
      box-sizing: border-box;
      height: 64px;
      font-size: 15px;
      .list-rank{
        flex: 0 0 25px;
        width: 25px;
        margin-right: 30px;
        text-align: center;
        .icon{
          display: inline-block;
          width: 25px;
          height: 24px;
          &.icon-0{
            background: url("./first@2x.png") center center no-repeat;
            background-size: 25px 24px;
          }
          &.icon-1{
            background: url("./second@2x.png") center center no-repeat;
            background-size: 25px 24px;
          }
          &.icon-2{
            background: url("./third@2x.png") center center no-repeat;
            background-size: 25px 24px;
          }
        }
        .text{
          color: red;
          font-size: 16px;
        }
      }
      .content{
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name{
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          color: #CCC;
        }
        .desc{
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
          margin-top: 4px;
          color: gray;
        }
      }
    }
  }
</style>
