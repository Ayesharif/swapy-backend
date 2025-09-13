import express from 'express'
import { client } from '../../dbConfig.js';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../middleware/verifyToken.js';
import { addProduct, deleteProduct, IsFavourite, myProducts, updateProduct } from '../../controller/userProductController.js';
const router = express.Router();
const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Favourites = myDB.collection("favourites");





router.get('/user/myproducts', verifyToken, myProducts)

router.post('/user/product', verifyToken, addProduct)


router.post('/user/product/:id', verifyToken, deleteProduct)



router.put('/user/product/:id',verifyToken, updateProduct)


router.post('/user/favourite/:id', verifyToken, IsFavourite)

export default router;