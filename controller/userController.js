import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';


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

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    console.log("user...",updateData);
    
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
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

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
      images: imagePaths,   // ✅ store image paths
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

    const oneProduct = await Products.find({ postedBy: req.user._id, isDeleted: false, deletedAt: null });
    const response= await oneProduct.toArray();
    //   console.log(oneProduct);
    
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
    
    export const updateProduct = async (req, res)=>{
      try{

        const productId = new ObjectId(req.params.id);
        const updateProduct = {
 ...req.body 
        }
        const result = await Products.updateOne({ _id: productId, postedBy: req.user._id, isDeleted: false, deletedAt: null, status: true },
         updateProduct);
      
         if (!result) {
           return res.status(404).send({
             status: 0,
             message: "Product updating failed"
            })
          }

          return res.status(200).send({
            status: 1,
            message: "Product updated successfully"
           })
        }catch(error){
     
        
          return res.status(500).send({
            status: 0,
            message: error.message
          })

        }
}

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
    
    return res.status(200).send({
        status: 1,
        message: "removed from favourite"
    })
}else{


    let favouriteProduct = await Favourites.insertOne({ userId: req.user._id, productId: productId });
    
    return res.status(200).send({
        status: 1,
        message: "added to favourite"
    })
}
    

  }catch(error){


      return res.status(500).send({
        status: 0,
        message: "Something went wrong"
      })
    }
}

