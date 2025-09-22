
import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
const myDB = client.db("olxClone");
const Products = myDB.collection("products");


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

export const getProductById= async (req, res)=>{

  try{

    const productId = new ObjectId(req.params.id);
    const oneProduct = await Products.findOne({ _id: productId, status: true, isDeleted: false, deletedAt: null });
     
      if (!oneProduct) {
        return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
        
      }

      return res.status(200).send({
        
        data:oneProduct
      })

    }catch(error){
      
      return res.status(500).send({
        status: 0,
        message: error.message
      })
    }
}