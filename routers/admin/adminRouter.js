
import express from 'express'
import { addCategory, deleteCategory, getAllCategory, getAllProduct, getProductById, updateCategory } from '../../controller/adminController.js';
const router = express.Router();


router.get('/admin/products', getAllProduct)

// router.get('/product/:id', getProductById)

router.get('/admin/categories', getAllCategory)
router.post('/admin/category', addCategory)
router.put('/admin/category/:id',updateCategory )
router.delete('/admin/category/:id',deleteCategory )


export default router;