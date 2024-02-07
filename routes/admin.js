const express = require('express')
const router = express.Router()

const { authCheck, adminCheck } = require('../middlewares/auth')

const { orders, orderStatus} = require("../controllers/admin")

router.get('/admin/orders', authCheck, adminCheck, orders);
router.put('/admin/orders-status', authCheck, adminCheck, orderStatus);


module.exports = router