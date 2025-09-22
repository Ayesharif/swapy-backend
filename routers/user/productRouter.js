import express from 'express'
import { getActiveProduct, getProductById } from '../../controller/productController.js';
const router = express.Router();


router.get('/products', getActiveProduct)

router.get('/product/:id', getProductById)



export default router;