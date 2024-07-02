import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/home.vue'
import Shopping from '../views/shopping.vue'
import Order from '../views/order.vue'
import About from '../views/about.vue'
import Pay from '../views/pay.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/shopping/:id',
      name: 'shopping',
      component: Shopping
    },
    {
      path: '/order',
      name: 'order',
      component: Order
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/pay',
      name: 'pay',
      component: Pay
    }
  ]
})

export default router
