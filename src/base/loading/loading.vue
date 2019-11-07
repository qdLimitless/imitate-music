<template>
  <div class="loading">
    <img src="./loading.gif" width="50" height="50" alt="">
    <p v-text="title"></p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '加载更多!'
    }
  }
}
</script>

<style lang='scss' scope>
  .loading{
    height: 100%;
    padding-top: 20%;
    text-align: center;
    img{
      display: inline-block;
      width: 50px;
      height: 50px;
    }
    p{
      font-size: 14px;
      color: #aaa;
      text-align: center;
    }
  }
</style>
