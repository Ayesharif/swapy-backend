
import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
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
    const { title, city, price } = req.query;

    // Step 1: build product filters
    const filters = {
      ...(title && { title }),
      ...(price && { price: parseFloat(price) }),
    };

    let cityFilter = {};
    if (city) {
      // Step 2: find all users in that city
      const cityUsers = await Users.find({ city }).project({ _id: 1 }).toArray();
      const userIds = cityUsers.map(user => user._id);
      if (userIds.length > 0) {
        cityFilter = { postedBy: { $in: userIds } };
      } else {
        return res.status(404).json({
          status: 0,
          message: 'No users found in this city',
        });
      }
    }

    // Step 3: merge both filters
    const finalFilter = { ...filters, ...cityFilter };

    // Step 4: find products
    const products = await Products.find(finalFilter).toArray();

    if (!products || products.length === 0) {
      return res.status(404).json({
        status: 0,
        message: 'No products found',
      });
    }

    return res.status(200).json({
      status: 1,
      message: 'Products available',
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};
