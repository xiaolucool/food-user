<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'

const active = ref(0)

</script>

<template>
  <RouterView />
  <footer>
    <!-- <van-tabbar v-model="active" route> -->
      <!-- <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item> -->
      <!-- <van-tabbar-item icon="shop-o" to="/shopping">点餐</van-tabbar-item> -->
      <!-- <van-tabbar-item icon="friends-o" to="/order">订单</van-tabbar-item> -->
      <!-- <van-tabbar-item icon="setting-o" to="/about">我的</van-tabbar-item> -->
    <!-- </van-tabbar> -->
  </footer>
</template>

<style scoped>

</style>
