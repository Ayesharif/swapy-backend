
import express from 'express'
import { addCategory, allUsers, deleteCategory, getAllCategory, getAllProduct, getProductById, productStatus, updateCategory, userStatus } from '../../controller/adminController.js';
import { upload } from '../../middleware/uploads.js';
const router = express.Router();


router.get('/admin/products', getAllProduct)
router.post('/admin/product/:id', productStatus)
router.get('/admin/users', allUsers);
router.post('/admin/user/:id', userStatus);
router.get('/admin/categories', getAllCategory)
router.post('/admin/category', upload.single('image'), addCategory)
router.put('/admin/category/:id',upload.single('image') ,updateCategory )
router.delete('/admin/category/:id',deleteCategory )


export default router;