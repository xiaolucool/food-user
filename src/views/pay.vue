<script setup lang="ts">
import { ref, computed } from 'vue'
import { addOrder } from '@/api/order'
import { showSuccessToast, showFailToast } from 'vant'
import { useRouter } from 'vue-router'


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

// 路由
const router = useRouter()

// 购物车列表
const cart = ref<Goods[]>([])
// 桌号
const tableId = ref('')
// 确认弹窗
const show = ref(false)
// 备注文本
const remark = ref('')
// 下单手机号
const phone = ref('')
// 手机号正则
const pattern = /^1[3-9]\d{9}$/

const getCart = () => {
    // 获取桌号
    tableId.value = localStorage.getItem('tableId') as string
    cart.value = JSON.parse(window.localStorage.getItem('cart') as string)
    console.log(cart.value);

}
getCart()

// 动态判断是否可以点击弹窗确认按钮
const btnStatus = computed(() => phone.value == '' || phone.value.length != 11 ? true : false)

// 返回上一页
const onClickLeft = () => {
    window.history.go(-1)
}
// 显示弹窗
const onSubmit = () => {
    show.value = !show.value
}
// 购买
const confirmBuy = async () => {
    let dishs: Array<string> = []
    cart.value.forEach(element => {
        dishs.push(element.id + '.' + element.num)
    })
    try {
        await addOrder({
            tableNumber: tableId.value,
            phone: phone.value,
            dishs: dishs.join(','),
            remark: remark.value
        })
        showSuccessToast('购买成功')
        // 购买成功跳转到order页面
        router.push({
            path: '/order',
            query: {
                phone: phone.value
            }
        })
        // 清空购物车
        cart.value = []
        // 清空手机号
        phone.value = ''
    } catch (error) {
        showFailToast('购买失败')
    }
}


/*
 * 加入购物车
 * @param {object} item 商品对象
 */
const addToCart = (item: Goods) => {
    cart.value.forEach(element => {
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
    cart.value.forEach(element => {
        if (element.id === item.id) {
            element.num--
            if (element.num === 0) {
                cart.value = cart.value.filter(element => element.id !== item.id)
            }
        }
    })
    if (cart.value.length == 0) window.history.go(-1)
    // 存储到本地
    window.localStorage.setItem('cart', JSON.stringify(cart.value))
}

// 通过计算属性动态计算总价，金额（单位分）
const totalPrice = computed(() => {
    let price = 0
    cart.value.forEach(element => {
        price += element.price * element.num
    })
    return price * 100
})
</script>

<template>
    <div>
        <van-nav-bar left-arrow @click-left="onClickLeft" :title="`${tableId}号餐桌结算`" />
        <!-- 商品 -->
        <div class="box">
            <div class="grid">
                <div class="card" v-for="item in cart" :key="item.id">
                    <!-- <img class="card-img" height="150" width="200" :src="`/img/${item.image}`" alt=""> -->
                    <van-image lazy-load height="150" width="300" class="card-img" :src="`/img/${item.image}`"
                        :alt="item.name">
                        <template v-slot:loading>
                            <van-loading type="spinner" size="20" />
                        </template>
                        <template v-slot:error>加载失败</template>
                    </van-image>
                    <div class="card-content">
                        <div class="card-top">
                            <div class="card-title">{{ item.name }}</div>
                            <div class="card-desc">
                                <van-text-ellipsis :content="item.des" />
                            </div>
                            <div class="card-price">¥{{ item.price }}</div>
                        </div>
                        <div class="card-bottom">
                            <van-stepper min="0" button-size="16" theme="round" v-model="item.num"
                                @minus="onMinus(item)" @plus="addToCart(item)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- /商品 -->
        <van-submit-bar :price="totalPrice" button-text="购买" @submit="onSubmit" />

        <!-- 弹窗 -->
        <van-dialog v-model:show="show" title="订单确认信息" confirm-button-color="#ff9a00" show-cancel-button
            @confirm="confirmBuy" :confirm-button-disabled="btnStatus">
            <van-form>
                <van-cell-group inset>
                    <van-field v-model="phone" label="手机号" placeholder="请输入手机号" type="tel"
                        :rules="[{ pattern, required: true, message: '手机号格式错误' }]" required />
                    <van-field v-model="remark" rows="2" autosize label="订单备注" type="textarea" maxlength="20"
                        placeholder="请输入备注" show-word-limit />
                </van-cell-group>
            </van-form>
        </van-dialog>
        <!-- /弹窗 -->
    </div>
</template>

<style scoped>
.grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
}

.card {
    display: flex;
    background: white;
    overflow: hidden;
}

.card-img {
    width: 150px;
    height: 100px;
    margin-right: 10px;
}

.card-content {
    min-width: 140px;
    width: 100%;
    padding: 5px 10px;
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
        width: 200px;
        height: 150px;
    }
}
</style>