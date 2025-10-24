import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import { deleteImage } from '../utils/deleteImage.js';


const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Users = myDB.collection("users");
const Favourites = myDB.collection("favourites");



export const getUserProfile= async(req, res)=>{
  
  try{
    
    const    userId =new ObjectId(req.user._id)
   
const user = await Users.findOne({ _id: userId , email:req.user.email},{projection:{firstName:1, lastName:1, email:1, phone:1, city: 1, image:1, role:1 }});

if(!user){
  return res.status(404).send({
    message: "user not found",
    status: 0
  })
}
// console.log("user",user);

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
   
    const StoredUser = await Users.findOne({ _id: userId});
    

    if (!StoredUser) {
      return res.status(500).send({
        status: 0,
        message: "User Not Found"
        })
      }   

if (req.file) {
  console.log(updateData);
  
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
    
const userUpdate = await Users.updateOne({ _id: userId , email:req.user.email}, {$set:updateData});



    if (userUpdate.modifiedCount > 0) {

      const user = await Users.findOne({ _id: userId , email:req.user.email},{projection:{firstName:1, lastName:1, email:1, phone:1, city: 1, image:1 }});
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
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const response = await Products.insertOne(product);

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



export const myProducts=  async (req, res)=>{ 
  try{

    const oneProduct = await Products.find({ postedBy: req.user._id, isDeleted: false, deletedAt: null }, 
      {projection:{title:1, description:1, category:1, images:1, price:1, productType:1}});
    const response= await oneProduct.toArray();

    
    if (!response ||response.length<0) {
      return res.status(404).send({
      status: 0,
      message: "Product not found"
      })
      
    }
    return res.status(200).send({
      
      data:response
    })
    
  }
  catch(error){
    return res.status(500).send({
    status: 0,
    message: error.message
    })

  }
}

export const deleteProduct= async (req, res)=>{

  try{

    const productId = new ObjectId(req.params.id);
    const checkproduct = await Products.findOne({ _id: productId, postedBy: req.user._id });
    if (!checkproduct) {
      return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
      }
    
        const deleteProduct = await Products.updateOne({ _id: productId, postedBy: req.user._id }, { $set: { isDeleted: true, deletedAt: Date.now() } }, {});
    
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

    const storedProduct = await Products.findOne({ _id: productId });
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
    const result = await Products.updateOne(
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

    const updatedProduct = await Products.findOne({ _id: productId });

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
    const favourites = await Favourites.find({ userId });
    console.log(favourites);
    
const favv= await favourites.toArray();
    if (favv.length<0) {
      return res.status(404).send({
        status: 1,
        message: "No favourite products found",
        products: [],
      });
    }

    // Extract product IDs
    const productIds = favv.map(fav => fav.productId);

    // Fetch all products in parallel using Promise.all
    const products = await Promise.all(
      productIds.map(async (id) => {
        const product = await Products.findOne({ _id: id });
        return product;
      })
    );

    return res.status(200).send({
      status: 1,
      message: "Favourite products fetched successfully",
      products,
    });

  } catch (error) {
    return res.status(500).send({
      status: 0,
      message: error.message,
    });
  }
};


export const IsFavourite= async(req, res)=>{

try{

  const productId = new ObjectId(req.params.id);
  const checkproduct = await Products.findOne({ _id: productId, isDeleted: false, deletedAt: null, status: true });

  if (!checkproduct) {
      return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
    } 
      const checkFavourite = await Favourites.findOne({ userId: req.user._id, productId: productId });
if(checkFavourite){

let favouriteProduct = await Favourites.deleteOne({ userId: req.user._id, productId: productId });
      const getFavourite = await Favourites.find({ userId: req.user._id});
  const response= await getFavourite.toArray();
    
    return res.status(200).send({
        status: 1,
        message: "Removed from favourite",
        favourites: response
    })
}else{


    let favouriteProduct = await Favourites.insertOne({ userId: req.user._id, productId: productId });
            const getFavourite = await Favourites.find({ userId: req.user._id});
  const response= await getFavourite.toArray();
    
    return res.status(200).send({
        status: 1,
        message: "Added to favourite",
        favourites:response
    })
}
    

  }catch(error){


      return res.status(500).send({
        status: 0,
        message: "Something went wrong"
      })
    }
}

