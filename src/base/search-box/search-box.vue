<template>
  <div class="search-box">
    <i class="icon-search"></i>
    <input ref="query" v-model="query" class="box" :placeholder="placeholder"/>
    <i v-show="query" class="icon-dismiss" @click="clear"></i>
  </div>
</template>

<script>
import { debounce } from 'common/js/util'
export default {
  props: {
    placeholder: {
      type: String,
      default: '搜索歌曲、歌手'
    }
  },
  data () {
    return {
      query: ''
    }
  },
  methods: {
    clear () {
      this.query = ''
    },
    setQuery (query) {
      this.query = query
    },
    blur () {
      this.$refs.query.blur()
    }
  },
  created () {
    this.$watch('query', debounce((newQuery) => {
      this.$emit('query', newQuery)
    }, 200))
  }
}
</script>

<style lang='scss' scope>
  .search-box{
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 40px;
    background: #f4f4f4;
    border-radius: 6px;
    .icon-search{
      width: 20px;
      height: 20px;
      color: rgba(0,0,0,.3);
      background: url('./search.png') center center no-repeat;
      background-size: 100%;
    }
    .box{
      flex: 1;
      margin: 0 5px;
      line-height: 18px;
      background: #FFF;
      color: rgba(0,0,0,.3);
      font-size: 14px;
      &::placeholder{
        color: rgba(0,0,0,.3);
      }
    }
    .icon-dismiss{
      width: 20px;
      height: 16px;
      color: rgba(0,0,0,.3);
      background: url('./delete.png') center center no-repeat;
      background-size: 100%;
    }
  }
</style>
