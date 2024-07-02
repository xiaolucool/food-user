import request from '@/request'

export const addOrder = (data: object) => {
  return request({
    url: '/order',
    method: 'post',
    data
  })
}

export const getOrder = (params: object) => {
  return request({
    url: '/order/phone',
    method: 'get',
    params
  })
}