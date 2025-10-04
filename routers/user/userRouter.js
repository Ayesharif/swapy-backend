import express from 'express'
import { client } from '../../dbConfig.js';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../middleware/verifyToken.js';
import { addProduct, deleteProduct, getUserProfile, IsFavourite, myProducts, updateProduct, updateUserProfile } from '../../controller/userController.js';
import { upload } from '../../middleware/uploads.js';
const router = express.Router();
const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Favourites = myDB.collection("favourites");





router.get('/user/profile', verifyToken, getUserProfile)
router.post('/user/profile', verifyToken, upload.single('image'), updateUserProfile)
router.get('/user/myproducts', verifyToken, myProducts)

router.post('/user/product', verifyToken, upload.array("images", 5), addProduct)


router.post('/user/product/:id', verifyToken, deleteProduct)



router.put('/user/product/:id',verifyToken, updateProduct)


router.post('/user/favourite/:id', verifyToken, IsFavourite)

export default router;