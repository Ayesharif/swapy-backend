import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';


const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Favourites = myDB.collection("favourites");
const Category = myDB.collection("category");


export const getAllProduct = async (req, res)=>{

  const allProduct = Products.find();
  const response = await allProduct.toArray();
  if (response.length > 0) {
    return res.status(200).send(response)

  } else {

    return res.status(404).send({
      status: 0,
      message: "Product not found"
    })
  }
} 

export const getProductById= async (req, res)=>{
      const productId = new ObjectId(req.params.id);
      const oneProduct = await Products.findOne({ _id: productId, status: true, isDeleted: false, deletedAt: null });
     
      if (oneProduct) {
        return res.send(oneProduct)
      }
      else {
        return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
      }
}

export const addCategory= async (req, res)=>{

      const response = await Category.insertOne({category:req.body.category});
      if (response) {
        return res.send({
            status:0,
            message:"Category added successfully"
        })
      }
      else {
        return res.send({
                status:1,
            message:"something went wrong"})
      }
}


export const getAllCategory = async (req, res)=>{

  const allCatgory = Category.find();
  const response = await allCatgory.toArray();
  if (response.length > 0) {
    return res.status(200).send(response)

  } else {

    return res.status(404).send({
      status: 0,
      message: "Category not available"
    })
  }
} 

export const updateCategory = async (req, res)=>{
      const Id = new ObjectId(req.params.id);
      
      const result = await Category.updateOne({ _id: Id},
         $set ={category: req.body.category,});
      
         if (result) {
        return res.status(200).send({
          status: 1,
          message: "Category updated successfully"
        })
    
      } else {
        return res.status(500).send({
          status: 0,
          message: "Something went wrong"
        })
    
      }
}
export const deleteCategory = async (req, res)=>{

  try{

    const Id = new ObjectId(req.params.id);
    
      const result = await Category.findOne({ _id: Id});
      
         if (!result) {
        return res.status(500).send({
          status: 0,
          message: "Category Not Found"
        })
      } 
      await Category.deleteOne({_id:Id});
      
      return res.status(200).send({
        status: 1,
        message: "Category deleted successfully"
      })
    }
    catch(error){
      return res.status(500).send({
        status: 0,
        message: error.message
      })
    }
    
}