<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()


const goShpping = (tableId: number) => {
  router.push(`/shopping/${tableId}`)
}
</script>

<template>
  <div class="home">
    <van-nav-bar title="点餐系统" />
    <!-- 轮播 -->
    <!-- <div class="swipe m-1 round-2">
      <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
        <van-swipe-item>1</van-swipe-item>
        <van-swipe-item>2</van-swipe-item>
        <van-swipe-item>3</van-swipe-item>
        <van-swipe-item>4</van-swipe-item>
      </van-swipe>
    </div> -->
    <!-- /轮播 -->
    <!-- 宫格 -->
    <!-- <div class="grid">
      <van-cell title="当前卓号" value="1" />
      <van-grid :column-num="2">
        <van-grid-item @click="goShpping" icon="shop-o" text="点单" />
        <van-grid-item icon="goods-collect-o" text="订单" />
      </van-grid>
    </div> -->
    <!-- /宫格 -->
    <van-grid :column-num="4">
      <van-grid-item icon-color="#FDA483" v-for="item in 12" icon="records-o" :text="`${item}号卓`" @click="goShpping(item)" />
    </van-grid>
  </div>
</template>

<style soped>
.my-swipe .van-swipe-item {
  color: #fff;
  font-size: 20px;
  line-height: 150px;
  text-align: center;
  background-color: #39a9ed;
}

.swipe {
  overflow: hidden;
}

.m-1 {
  margin: 10px;
}

.round-2 {
  border-radius: 10px;
}
</style>
