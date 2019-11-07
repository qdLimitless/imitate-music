<template>
  <div class="search-list" v-show="searches.length">
    <transition-group name="list" tag="ul">
      <li :key="item" class="search-item" @click="selectItem(item)" v-for="item in searches">
        <span class="text">{{item}}</span>
        <span class="icon" @click.stop="deleteOne(item)">
          <i class="icon-delete"></i>
        </span>
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  props: {
    searches: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    selectItem (item) {
      this.$emit('select', item)
    },
    deleteOne (item) {
      this.$emit('delete', item)
    }
  }
}
</script>

<style lang='scss' scope>
.search-list{
  .search-item{
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;
    &.list-enter-active, &.list-leave-active{
      transition: all 0.1s;
    }
    &.list-enter, &.list-leave-to{
      height: 0;
    }
    .text{
      flex: 1;
      color: #222;
    }
    .icon{
      // extend-click();
      .icon-delete{
        display: inline-block;
        width: 20px;
        height: 20px;
        background: url('./delete.png') center center no-repeat;
        background-size: 100%;
      }
    }
  }
}
</style>
