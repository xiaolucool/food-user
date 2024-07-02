import request from '@/request'

export const getGoods = (params: object) => {
  return request({
    url: '/dish',
    method: 'get',
    params
  })
}