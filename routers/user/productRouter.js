import express from 'express'
import { getAllProduct, getProductById } from '../../controller/productController.js';
const router = express.Router();


router.get('/products', getAllProduct)

router.get('/product/:id', getProductById)



export default router;