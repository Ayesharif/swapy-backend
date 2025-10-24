
import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Users = myDB.collection("users");


export const getActiveProduct = async (req, res)=>{
try{

  const allProduct = Products.find({ status: true, isDeleted: false, deletedAt: null });
  const response = await allProduct.toArray();
  
  if (!response || response.length < 0) {
    return res.status(404).send({
      status: 0,
      message: "Product not found"
    })
    
  }

  return res.status(200).send({
    data:response
  })

}catch(error){
  return res.status(500).send({
    status: 0,
    message: error.message
  })

}
}
 
export const getCategoryProduct = async (req, res)=>{
try{
    const category = req.params.id;
    console.log(category);
    

  const allProduct = Products.find({category:category, status: true, isDeleted: false, deletedAt: null });
  const response = await allProduct.toArray();
  console.log(response);
  
  if (!response || response.length < 0) {
    return res.status(404).send({
      status: 0,
      message: "Product not found"
    })
    
  }

  return res.status(200).send({
    data:response
  })

}catch(error){
  return res.status(500).send({
    status: 0,
    message: error.message
  })

}
} 

export const getProductById= async (req, res)=>{

  try{

    const productId = new ObjectId(req.params.id);

    const oneProduct = await Products.findOne({ _id: productId, status: true, isDeleted: false, deletedAt: null });
    const postedBy= oneProduct.postedBy

    const userProduct = await Products.find({ postedBy:postedBy, status: true, isDeleted: false, deletedAt: null });

    const user = await Users.findOne({ _id:new ObjectId(postedBy)}, {projection:{firstName:1, lastName:1, city:1, createdAt:1, phone:1,}});

     const response = await userProduct.toArray();
     console.log(response.length);
     
      if (!oneProduct) {
        return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
        
      }

      return res.status(200).send({
        
        data:{
          product:oneProduct,
          userData:{
            user:user,
            products:response.length
          }
}
      })

    }catch(error){
      
      return res.status(500).send({
        status: 0,
        message: error.message
      })
    }
}
export const searchProduct = async (req, res) => {
  try {
   const { city, priceMin, priceMax, title } = req.query;
    console.log(city, priceMin, priceMax, title);

    const result = await Products.aggregate([
      {
        $lookup: {
          from: 'users',             // collection name in MongoDB
          localField: 'postedBy',    // field in Products
          foreignField: '_id',       // field in Users
          as: 'userData'
        }
      
      },
      { $unwind: '$userData' },
      {
        $match: {
          ...(city ? { 'userData.city': city } : {}), // filter only if provided
          ...(title ? { title: { $regex: title, $options: 'i' } } : {}),
          price: {
            $gte: parseInt(priceMin) || 0,
            $lte: parseInt(priceMax) || 1000000000 // upper limit fallback
          }
        }
      }
    ]).toArray();


  console.log(result);
    return res.status(200).json({
      status: 1,
      message: 'Products available',
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};



export const getPublicProfile = async (req, res) => {
  try {
    let userId;
    console.log(req?.query?.id);
    
    if(req?.query?.id){
      userId = req.query.id;
      console.log("params ",userId);
    }
    else{
          const token = req.cookies.token; 
      
          const decoded = jwt.verify(token, process.env.SECRET);
 userId= decoded._id;
          
      
 console.log("logged",userId);
    }


    // ✅ Fetch user with selected fields
    const user = await Users.findOne(
      { _id: new ObjectId(userId) },
      { projection: { firstName: 1, lastName: 1, email: 1, phone: 1, city: 1, image: 1, role: 1 } }
    );

    if (!user) {
      return res.status(404).send({
        status: 0,
        message: "User not found",
      });
    }


    // ✅ Fetch all non-deleted products by this user
    const allProducts = await Products.find(
      { postedBy: userId, isDeleted: false, deletedAt: null, status:true },
      { projection: { title: 1, description: 1, category: 1, images: 1, price: 1, productType: 1 } }
    ).toArray();

    // ✅ Check properly if array is empty
    if (!allProducts || allProducts.length === 0) {
      return res.status(200).send({
        status: 1,
        message: "User found successfully, but no products posted yet",
        data: user,
        products: [],
      });
    }

    // ✅ Success response
    return res.status(200).send({
      status: 1,
      message: "User found successfully",
      data: user,
      products: allProducts,
    });

  } catch (error) {
    console.error("❌ Error in getPublicProfile:", error.message);
    return res.status(500).send({
      status: 0,
      message: error.message,
    });
  }
};
