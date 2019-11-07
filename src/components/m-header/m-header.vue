<template>
  <div class="header">
    <img src="./logo.png" alt />
    <router-link to="/user" class="mine" tag="div">
      <i class="icon-mine"></i>
    </router-link>
  </div>
</template>

<script>
export default {
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.header {
  position: relative;
  height: 80px;
  width: 100%;
  padding: 0 10px;
  line-height: 80px;
  box-sizing: border-box;
  img {
    height: 35px;
    vertical-align: middle;
  }
  .mine{
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    padding: 0 15px;
    background: url('./mine.png') center center no-repeat;
    background-size: 35px;
    .icon-mine{
      display: block;
      padding: 12px;
    }
  }
}
</style>
