<script setup lang="ts">
import { ref, watch } from 'vue'
import { getOrder } from '@/api/order'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'
import { useWindowSize } from '@vant/use';


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

// 订单信息接口
interface OrderInfo {
    id: number
    tableNumber: number,
    dishs: string
    createTime: string
    endTime: string | never
    status: string,
    totalAmount: number
    deleted: number
    phone: string
    remark: string
}

const route = useRoute()
const router = useRouter()

// 订单列表
const goods = ref<Goods[]>([])
// 订单信息
const orderInfo = ref<OrderInfo>()
// 订单步骤
const active = ref(0)
// 号码
const phone = ref('')
// 宫格列
const colNum = ref(2)
// 刷新
const loading = ref(false)

const getOrderStatus = async () => {
    // 获取手机号
    phone.value = route.query.phone as string
    if (!phone.value) {
        // 路由没有phone 错误返回购物页面
        showFailToast('订单详情页面错误')
        router.push('/pay')
        return
    }
    try {
        // 获取订单状态
        const { data } = await getOrder({
            phone: phone.value
        })
        console.log(data.data)
        orderInfo.value = data.data[data.data.length - 1] as OrderInfo
        orderInfo.value.status === "等待确认" ? active.value = 2 : orderInfo.value.status === "等待出餐" ? active.value = 1 : active.value = 0
        // 获取订单信息
        goods.value = JSON.parse(localStorage.getItem('cart') as string)
        console.log('已买商品', goods.value)

    } catch (error) {

    }
}
getOrderStatus()

// 屏幕尺寸管理
const { width, height } = useWindowSize()
const windowSize = () => {
    width.value > 1024 ? colNum.value = 3 : width.value > 750 ? colNum.value = 2 : colNum.value = 1
    // console.log(width.value); // -> 窗口宽度
    // console.log(height.value); // -> 窗口高度
}
windowSize()

watch([width, height], () => {
    windowSize()
    console.log('window resized');
})

// 下拉刷新
const onRefresh = () => {
    try {
        getOrderStatus()
        showSuccessToast('刷新成功')
    } catch (error) {
        showFailToast('刷新失败')
    }
    loading.value = false
}


// 浮动气泡点击事件
const onFloatClick = () => {
    let tableId = localStorage.getItem('tableId') as string
    router.push(`/shopping/${tableId}`)
}

// 格式化日期
const formattedDate = (dateString: string) => {
    // 使用 Date 对象解析日期字符串
    let date = new Date(dateString);

    // 获取年、月、日、小时和分钟
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份是从0开始的，所以需要+1
    let day = date.getDate().toString().padStart(2, '0');
    let hours = date.getHours().toString().padStart(2, '0');
    let minutes = date.getMinutes().toString().padStart(2, '0');

    // 组合成新的日期格式
    return `${year}-${month}-${day} ${hours}:${minutes}`
}


</script>

<template>
    <van-nav-bar title="订单详情" fixed />
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
        <div v-if="orderInfo" class="order">
            <van-cell icon="location-o" title="订单进度" />
            <van-steps direction="vertical" :active="active" active-color="#FDA483" inactive-color="#ECF0F8">
                <van-step>
                    <h3>订单完成</h3>
                    <p>{{ orderInfo.endTime ? formattedDate(orderInfo.endTime) : '' }}</p>
                </van-step>
                <van-step>
                    <h3>等待出餐</h3>
                    <!-- <p>2016-07-11 10:00</p> -->
                </van-step>
                <van-step>
                    <h3>等待确认</h3>
                    <p>{{ formattedDate(orderInfo.createTime) }}</p>
                </van-step>
            </van-steps>
            <van-cell icon="label-o" title="订单列表" :label="`备注：${orderInfo.remark}`" />
            <van-grid :border="true" :column-num="colNum" class="grid">
                <van-grid-item v-for="item in goods" :key="item.id">
                    <div class="card">
                        <van-card :num="item.num" :price="item.price" :desc="item.des" :title="item.name"
                            thumb="https://fastly.jsdelivr.net/npm/@vant/assets/ipad.jpeg" />
                    </div>
                </van-grid-item>
            </van-grid>
        </div>
    </van-pull-refresh>
    <van-floating-bubble icon="shopping-cart-o" @click="onFloatClick" />
</template>

<style scoped>
.order {
    height: 100vh;
    background: white;
}

.card {
    width: 100%;
}
</style>