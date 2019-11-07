<template>
  <div class="tab">
    <router-link tag="div" class="tab-item" to="/recommend">
      <span class="tab-link">推荐</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/singer">
      <span class="tab-link">歌手</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/rank">
      <span class="tab-link">排行榜</span>
    </router-link>
    <router-link tag="div" class="tab-item" to="/search">
      <span class="tab-link">搜索</span>
    </router-link>
  </div>
</template>

<script>
export default {
}
</script>

<style lang='scss' scope>
.tab {
  font-size: 0;
  width: 100%;
  height: 50px;
  line-height: 50px;
  div {
    box-sizing: border-box;
    height: 50px;
    display: inline-block;
    width: 25%;
    text-align: center;
    font-size: 1rem;
    color: #222222;
    border-top: 1px solid #CCCCCC;
    &.router-link-active {
      color: #31c27c;
      background: rgba(222, 222, 222, 0.3);
      border-bottom: 3px solid #31c27c;
    }
  }
}
</style>
