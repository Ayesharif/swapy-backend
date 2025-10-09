import express from 'express'
import { getActiveProduct, getCategoryProduct, getProductById, searchProduct } from '../../controller/productController.js';
import { getAllCategory } from '../../controller/adminController.js';
const router = express.Router();


router.get('/products', getActiveProduct)
router.get('/product', searchProduct)
router.get('/categories', getAllCategory)
router.get('/category/products/:id', getCategoryProduct)

router.get('/product/:id', getProductById)



export default router;