const express = require('express')
const router = express.Router()


const { authCheck } = require('../middlewares/auth')
const { userCart, getUserCart, emptyCart, saveAddress, applyCouponToUserCart,
    createOrder, orders } = require('../controllers/user')
// router.get('/user', (req, res) => {
//     res.json({
//         data: 'hey you hit user API Endpoint'
//     })
// })

router.post('/user/cart', authCheck, userCart)
router.get('/user/cart', authCheck, getUserCart)
router.delete('/user/cart', authCheck, emptyCart)
router.post('/user/address', authCheck, saveAddress)

router.post('/user/order', authCheck, createOrder)
router.get('/user/orders', authCheck, orders)

router.post('/user/cart/coupon', authCheck, applyCouponToUserCart)

module.exports = router