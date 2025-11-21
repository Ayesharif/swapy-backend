// import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import { deleteImage } from '../utils/deleteImage.js';
import { User } from '../model/User.js';
import { Product } from '../model/product.js';
import { Favourite } from '../model/Favourite.js';
import { Chat } from '../model/Chat.js';


// const myDB = client.db("olxClone");
// const Products = myDB.collection("products");
// const Users = myDB.collection("users");
// const Chats = myDB.collection("chats");
// const Messages = myDB.collection("messages");

// const Favourites = myDB.collection("favourites");



export const getUserProfile= async(req, res)=>{
  
  try{
    
    const    userId =new ObjectId(req.user._id)
   
const user = await User.findOne({ _id: userId , email:req.user.email},{firstName:1, lastName:1, email:1, phone:1, city: 1, image:1, role:1 });

if(!user){
  return res.status(404).send({
    message: "user not found",
    status: 0
  })
}
//console.log("user",user);

return res.status(200).send({
data: user,
  message: "user found successfully",
  status: 1
})

  }catch(error){

   return res.status(500).send({
    message: error.message,
    status: 0
  }) 
  }

}
export const updateUserProfile= async(req, res)=>{
  
  try{
    
    const    userId =new ObjectId(req.user._id)

    const updateData = { ...req.body };
   
    const StoredUser = await User.findOne({ _id: userId});
    

    if (!StoredUser) {
      return res.status(500).send({
        status: 0,
        message: "User Not Found"
        })
      }   

if (req.file) {
  //console.log(updateData);
  
  // 🗑️ Delete the old image from Cloudinary (if it exists)
  if (updateData.imageId) {
    await deleteImage(updateData.imageId);
 delete updateData.imageId;
  }


  // 🌩️ Save the new image info
  updateData.image = {
    image: req.file.path, // Cloudinary hosted URL
    publicId: req.file.filename, // Cloudinary public_id (used for deleting later)
  };
}
    
const userUpdate = await User.updateOne({ _id: userId , email:req.user.email}, {$set:updateData});



    if (userUpdate.modifiedCount > 0) {

      const user = await User.findOne({ _id: userId , email:req.user.email},{projection:{firstName:1, lastName:1, email:1, phone:1, city: 1, image:1 }});
      return res.status(200).send({
        status: 1,
        message: "Profile updated successfully",
        data:user
      });
    } else {
      return res.status(200).send({
        status: 1,
        message: "No changes made to profile",
      });
    }
  }catch(error){

   return res.status(500).send({
    message: error.message,
    status: 0
  }) 
  }

}

export const addProduct = async (req, res) => {
  try {
    // map uploaded files to paths
const imageData = req.files.map(file => ({
  imageUrl: file.path,       // Cloudinary URL
  publicId: file.filename,   // Cloudinary public_id
}));

    const product = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      postedBy: req.user._id,
      status: true,
      deletedAt: null,
      isDeleted: false,
      productType: req.body.productType,
      images: imageData,   // ✅ store image paths
      // createdAt: Date.now(),
      // updatedAt: Date.now(),
    };

    const response = await Product.create(product);

    if (!response) {
      return res.status(404).send({
        status: 0,
        message: "product not found",
      });
    }

    return res.status(200).send({
      status: 1,
      message: "product added successfully",
      data:product,
    });
  } catch (error) {
    return res.status(500).send({
      status: 0,
      message: error.message,
    });
  }
};



export const myProducts = async (req, res) => { 
  try {
    // Get all products by the logged-in user
    const products = await Product.find(
      { postedBy: req.user._id, isDeleted: false, deletedAt: null },
      { title: 1, description: 1, category: 1, images: 1, price: 1, productType: 1 }
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: 0,
        message: "Products not found"
      });
    }

    return res.status(200).json({
      data: products
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message
    });
  }
};


export const deleteProduct= async (req, res)=>{

  try{

    const productId = new ObjectId(req.params.id);
    const checkproduct = await Product.findOne({ _id: productId, postedBy: req.user._id });
    if (!checkproduct) {
      return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
      }
    
        const deleteProduct = await Product.updateOne({ _id: productId, postedBy: req.user._id }, { $set: { isDeleted: true, deletedAt: Date.now() } }, {});
    
        if (!deleteProduct) {
          return res.status(500).send({
            status: 1,
            message: "Product deletion faild"
          })
        }

          return res.status(200).send({
            status: 1,
            message: "Product deleted successfull"
          })

      } catch(error){
        return res.status(500).send({
          status: 0,
          message: error.message
        })

      }

    }

export const updateProduct = async (req, res) => {
  try {
    const productId = new ObjectId(req.params.id);

    const storedProduct = await Product.findOne({ _id: productId });
    if (!storedProduct) {
      return res.status(404).json({ status: 0, message: "Product not found" });
    }

    // 🟢 Step 1: Parse kept images from frontend (these are already existing Cloudinary URLs)
    let keptImages = [];
    try {
      keptImages = Array.isArray(req.body.images)
        ? req.body.images.map((img) => JSON.parse(img))
        : typeof req.body.images === "string"
        ? JSON.parse(req.body.images)
        : [];
    } catch (err) {
      keptImages = [];
    }

    // 🟢 Step 2: Identify images removed by the user
    const removedImages = storedProduct.images.filter(
      (oldImg) =>
        !keptImages.some((newImg) => newImg.publicId === oldImg.publicId)
    );

    // 🗑️ Step 3: Delete removed images from Cloudinary
    if (removedImages.length > 0) {
      await Promise.all(
        removedImages.map((img) => deleteImage(img.publicId))
      );
    }

    // 🟢 Step 4: Handle new uploads (via multer-storage-cloudinary)
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map((file) => ({
        imageUrl: file.path, // Cloudinary hosted URL
        publicId: file.filename, // Cloudinary public_id
      }));
    }

    // 🟢 Step 5: Merge kept + newly uploaded images
    const finalImages = [...keptImages, ...newImages];

    // 🟢 Step 6: Update product
    const result = await Product.updateOne(
      { _id: productId },
      {
        $set: {
          ...req.body,
          images: finalImages,
        },
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        status: 0,
        message: "No changes were made to the product",
      });
    }

    const updatedProduct = await Product.findOne({ _id: productId });

    res.status(200).json({
      status: 1,
      message: "✅ Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("❌ Error in updateProduct:", error);
    res.status(500).json({ status: 0, message: error.message });
  }
};

export const MyFavourite = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all favourites for this user
    const favourites = await Favourite.find({ userId });

    if (favourites.length === 0) {
      return res.status(404).json({
        status: 1,
        message: "No favourite products found",
        products: [],
      });
    }

    // Extract product IDs
    const productIds = favourites.map(fav => fav.productId);

    // Fetch all products in parallel
    const products = await Product.find({ _id: { $in: productIds } });

    return res.status(200).json({
      status: 1,
      message: "Favourite products fetched successfully",
      products,
    });

  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

export const IsFavourite = async (req, res) => {
  try {
    const productId = req.params.id;

    // Check if product exists and is active
    const checkProduct = await Product.findOne({
      _id: productId,
      isDeleted: false,
      deletedAt: null,
      status: true
    });

    if (!checkProduct) {
      return res.status(404).json({
        status: 0,
        message: "Product not found"
      });
    }

    // Check if favourite already exists
    const checkFavourite = await Favourite.findOne({
      userId: req.user._id,
      productId: productId
    });

    if (checkFavourite) {
      // Remove from favourites
      await Favourite.deleteOne({ userId: req.user._id, productId: productId });

      // Get updated favourites
      const favourites = await Favourite.find({ userId: req.user._id });

      return res.status(200).json({
        status: 1,
        message: "Removed from favourite",
        favourites
      });
    } else {
      // Add to favourites
      await Favourite.create({ userId: req.user._id, productId: productId });

      // Get updated favourites
      const favourites = await Favourite.find({ userId: req.user._id });

      return res.status(200).json({
        status: 1,
        message: "Added to favourite",
        favourites
      });
    }

  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: "Something went wrong"
    });
  }
};

export const newChat= async(req, res)=>{

}
export const sendMessage = async (data) => {
// console.log(req.body);

  const {receiverId, productId, message} = data.body;
  const senderId=data.sender;
  
  if (!senderId || !receiverId || !message) {
    return res.status(400).send("Missing fields");
  }
//   const chat={
//     senderId,
//     receiverId, 
//     productId
//   }
// console.log(message);
// const query = {
//   $or: [
//     { senderId, receiverId },
//     { senderId: receiverId, receiverId: senderId },
//   ],
// };
// if (productId) query.productId = productId;

// const checkChat= await Chat.findOne(query)

const checkUser1 = await User.findOne({ _id: new ObjectId(receiverId) });
const checkUser2 = await User.findOne({ _id: new ObjectId(senderId) });
const checkProduct = await Product.findOne({ _id: new ObjectId(productId) });
  if (!checkUser1 || !checkUser2) {
    throw new Error("User not found");
  }
  if (!checkUser1 || !checkUser2    ) {
    throw new Error("User not found");
  }

  const newMessage = {
    senderId,
    receiverId,
    productId: productId,
    message
  };

  await Chat.insertOne(newMessage);
  return newMessage;
};


// 💬 Get Messages between two users
export const getMessages = async (req, res) => {
 try {
    const { otherId, productId } = req.params;
    const myId = req.user._id;

    const messages = await Chat.find({
      productId,
      $or: [
        { senderId: myId, receiverId: otherId },
        { senderId: otherId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ success: true, data: messages });

  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getContacts = async (req, res) => {
  try {
    const myId =new ObjectId(req.user._id);

 const contacts = await Chat.aggregate([
      // 1. Match user messages
      {
        $match: {
          $or: [
            { senderId: myId },
            { receiverId: myId }
          ]
        }
      },

      // 2. Determine the other user
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ["$senderId", myId] },
              "$receiverId",
              "$senderId"
            ]
          },
          productId: 1,
          message: 1,
          createdAt: 1
        }
      },

      // 3. Group by (otherUser + product)
      {
        $group: {
          _id: {
            otherUser: "$otherUser",
            productId: "$productId"
          },
          lastMessage: { $last: "$message" },
          lastMessageTime: { $last: "$createdAt" }
        }
      },

      // 4. Lookup user data
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },

      // 5. Lookup product data
      {
        $lookup: {
          from: "products",
          localField: "_id.productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },

      // 6. Only send selected fields
      {
        $project: {
          _id: 0,
          otherUser: "$_id.otherUser",
          productId: "$_id.productId",
          lastMessage: 1,
          lastMessageTime: 1,
          user: {
            _id: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            image: "$user.image"
          },
          product: {
            _id: "$product._id",
            title: "$product.title",
            price: "$product.price",
            images: "$product.images"
          }
        }
      },

      // 7. Sort latest first
      {
        $sort: { lastMessageTime: -1 }
      }
    ]);

    res.status(200).json({ success: true, data: contacts });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
