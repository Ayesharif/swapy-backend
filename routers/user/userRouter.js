import express from 'express'
// import { client } from '../../dbConfig.js';
import { ObjectId } from 'mongodb';
import { verifyToken } from '../../middleware/verifyToken.js';
import { addProduct, deleteProduct, getContacts, getMessages, getUserProfile, IsFavourite, MyFavourite, myProducts, sendMessage, updateProduct, updateUserProfile } from '../../controller/userController.js';
import { upload } from '../../middleware/uploads.js';
import uploadrouter from '../../middleware/uploadRoute.js';
const router = express.Router();
// const myDB = client.db("olxClone");
// const Products = myDB.collection("products");
// const Favourites = myDB.collection("favourites");




router.get('/user/profile', verifyToken, getUserProfile)

router.post("/user/profile", verifyToken, upload.single("images"), updateUserProfile);

router.get('/user/myproducts', verifyToken, myProducts)

router.post('/user/product', verifyToken, upload.array("images", 5), addProduct)


router.post('/user/product/:id', verifyToken, deleteProduct)



router.put('/user/product/:id',verifyToken,upload.array("newImages", 5), updateProduct)


router.get('/user/favourite', verifyToken, MyFavourite)
router.post('/user/favourite/:id', verifyToken, IsFavourite)
// router.get('/user/chats', verifyToken, myChats)


router.post("/send", verifyToken, async  (req, res) => {
  try {
    // console.log("data",req.body);
    const data={
      body: req.body,
      sender:req.user._id
    }
    const newMessage = await sendMessage(data);
    res.status(201).json({ success: true, message: "Message sent!", data: newMessage });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});
router.get("/messages/:otherId/:productId", verifyToken, getMessages);
router.get("/contacts",verifyToken, getContacts);

export default router;