import express from 'express'
import { getActiveProduct, getCategoryProduct, getProductById, getPublicProfile, searchProduct } from '../../controller/productController.js';
import { getAllCategory } from '../../controller/adminController.js';
const router = express.Router();


router.get('/products', getActiveProduct)
router.get('/product', searchProduct)
router.get('/categories', getAllCategory)
router.get('/category/products/:id', getCategoryProduct)
router.get('/public-profile', getPublicProfile)

router.get('/product/:id', getProductById)



export default router;