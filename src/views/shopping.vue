<template>
    <div>
        <van-nav-bar left-arrow @click-left="onClickLeft" :title="`${route.params.id}号餐桌`" />

        <van-row>
            <van-col span="4">
                <div class="left-nav">
                    <van-sidebar v-model="active" @change="onChange">
                        <van-sidebar-item v-for="item in menuList" :key="item.id" :title="item.name" />
                    </van-sidebar>
                </div>
            </van-col>
            <van-col span="20">
                <div class="grid">
                    <div class="card" v-for="item in shoppingList" :key="item.id">
                        <img class="card-img" :src="`/img/${item.image}`" alt="">
                        <div class="card-content">
                            <div class="card-top">
                                <div class="card-title">{{ item.name }}</div>
                                <div class="card-desc">
                                    <van-text-ellipsis :content="item.des" />
                                </div>
                                <div class="card-price">¥{{ item.price }}</div>
                            </div>
                            <div class="card-bottom">
                                <van-button v-if="item.num == 0" type="warning" plain round  size="mini"
                                    @click="addToCart(item)"><van-icon size="18" name="shopping-cart-o" /></van-button>
                                <van-stepper button-size="16" theme="round" v-else min="0" v-model="item.num" @minus="onMinus(item)"
                                    @plus="addToCart(item)" />
                            </div>
                        </div>
                    </div>
                </div>
            </van-col>
        </van-row>

        <!-- 弹出层 -->
        <van-action-sheet v-model:show="show" title="购物车">
            <div class="tc">
                <div class="grid">
                    <div class="card" v-for="item in cart" :key="item.id">
                        <img class="card-img" height="150" width="200" :src="`/img/${item.image}`" alt="">
                        <div class="card-content">
                            <div class="card-top">
                                <div class="card-title">{{ item.name }}</div>
                                <div class="card-desc">
                                    <van-text-ellipsis :content="item.des" />
                                </div>
                                <div class="card-price">¥{{ item.price }}</div>
                            </div>
                            <div class="card-bottom">
                                <van-stepper min="0" theme="round" button-size="16" v-model="item.num" @minus="onMinus(item)"
                                    @plus="addToCart(item)" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <van-submit-bar :price="totalPrice + 0.00" button-text="提交订单" tip-icon="info-o" tip="点击下方按钮清空购物车"  @submit="onSubmit" >
                <van-badge :content="cartNum">
                    <van-icon size="24" name="close" @click="clearCart"/>
                </van-badge>
            </van-submit-bar>
        </van-action-sheet>
        <!-- /弹出层 -->
        <van-submit-bar :price="totalPrice" button-text="提交订单" @submit="onSubmit">
            <van-badge :content="cartNum">
                <van-icon size="24" name="shopping-cart-o" @click="onShow" />
            </van-badge>
        </van-submit-bar>

    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getGoods } from '@/api/goods'

import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// orderType
type OrderType = {
    id: number
    name: string
    priority: number
    des: string | never
    deleted: number
}

// 商品列表接口
interface Goods {
    id: number
    name: string
    price: number
    image: string
    des: string | never
    status: number,
    num: number
    dishType: Array<OrderType>
}

// 菜单列表接口
// interface MenuList {
//     title: string
//     id: number 
// }

// 默认选中菜单
const active = ref(0)
// 商品列表
const shoppingList = ref<Goods[]>([])
const goods = ref<Goods[]>([])
// 购物车列表
const cart = ref<Goods[]>([])
// 是否显示弹出层
const show = ref(false)
// 菜单列表数组
const menuList = ref<OrderType[]>([])

// 打开弹出层
const onShow = () => {
    if (cartNum.value != 0) show.value = true
}

// 清空购物车
const clearCart = () => {
    cart.value = []
    goods.value.forEach(item => {
        item.num = 0
    })
    show.value = false
}

// 切换菜单
const onChange = () => {
    console.log(active.value)
    if (active.value == 0) {
        shoppingList.value = goods.value
    } else {
        shoppingList.value = goods.value.filter(item => {
            return item.dishType.find(item => item.id == active.value)
        })
    }
}

// 获取商品列表
const onGoods = async () => {
    // 缓存桌号
    localStorage.setItem('tableId', route.params.id as string)
    // 初始化高度
    // 获取50px对应的视口高度百分比
    var vh = window.innerHeight * 0.6 / 100;
    // 设置CSS变量
    document.documentElement.style.setProperty('--offset-vh', vh + 'vh');
    // 获取商品列表
    const { data } = await getGoods({
        page: 1,
        pageSize: 10
    })
    goods.value = data.data.records
    goods.value.forEach(item => {
        item.num = 0
    })
    // 对数组进行赋值
    goods.value.forEach(item => {
        menuList.value = [...menuList.value, ...item.dishType]

    })
    // 对菜单列表数组去重
    menuList.value = menuList.value.filter((item, index, arr) => {
        return arr.indexOf(item) === index
    })
    const seen = new Map()

    menuList.value.forEach((item) => {
        seen.set(item.id, item)
    })
    menuList.value = [...seen.values()]
    shoppingList.value = goods.value
}
onGoods()


// 返回上一页
const onClickLeft = () => {
    router.push('/')
}

// 结算
const onSubmit = () => {
    if (cartNum.value != 0) {
        router.push({
            path: '/pay',
        })
    }
}

/*
 * 加入购物车
 * @param {object} item 商品对象
 */
const addToCart = (item: Goods) => {
    goods.value.forEach(element => {
        if (element.id === item.id) {
            element.num++
        }
    })
    // 按照id去重后加入数组
    cart.value = cart.value.filter(element => element.id !== item.id)
    cart.value.push(item)
    // 存储到本地
    window.localStorage.setItem('cart', JSON.stringify(cart.value))
}

/*
 * 减少购物车
 * @param {object} item 商品对象
 */
const onMinus = (item: Goods) => {
    goods.value.forEach(element => {
        if (element.id === item.id) {
            element.num--
            if (element.num === 0) {
                cart.value = cart.value.filter(element => element.id !== item.id)
            }
        }
    })
    // 存储到本地
    window.localStorage.setItem('cart', JSON.stringify(cart.value))
}
// 通过计算属性，动态计算购物车数量
const cartNum = computed(() => {
    let num = 0
    cart.value.forEach(element => {
        num += element.num
    })
    if (num === 0) {
        show.value = false
    }
    return num
})
// 通过计算属性动态计算总价，金额（单位分）
const totalPrice = computed(() => {
    let price = 0
    cart.value.forEach(element => {
        price += element.price * element.num
    })
    return price * 100
})
</script>

<style scoped>
:root {
    --van-nav-bar-height: 50px;
}

.left-nav {
    background: #F7F8FA;
    /* height: 100vh; */
    height: calc(100vh - var(--offset-vh));
}

:deep(.van-sidebar) {
    width: 100%;
}

.grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* grid-gap: 10px; */
}

.tc {
    margin-bottom: 40px;
    padding: 20px;
    height: 60vh;
}

.card {
    display: flex;
    background: white;
    overflow: hidden;
}

/* .card:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
} */

.card-img {
    width: 140px;
    height: 140px;
    margin-right: 10px;
}

.card-content {
    min-width: 120px;
    width: 100%;
    padding: 5px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.card-title {
    font-weight: bolder;
}

.card-price {
    color: red;
}

.card-desc {
    color: gray;
}

.card-bottom {
    display: flex;
    justify-content: right;
}

:deep(.van-grid) {
    width: 100% !important;
}


/* 基础样式 */
.container {
    padding: 20px;
}

/* 小屏幕设备（如手机）的样式 */
@media (max-width: 767px) {
    .grid {
        grid-template-columns: repeat(1, 1fr);
    }
    .card {
        height: 100px;
    }
    .card-img {
        width: 150px;
        height: 100px;
    }

    .tc {
        padding: 10px;
    }
}

/* 中等屏幕设备（如平板）的样式 */
@media (min-width: 768px) and (max-width: 991px) {
    .grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .card-img {
        width: 150px;
        height: 100px;
    }
}

/* 大屏幕设备（如桌面显示器）的样式 */
@media (min-width: 992px) {
    .grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .card-img {
        width: 150px;
        height: 150px;
    }
}
</style>