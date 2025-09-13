
import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
const myDB = client.db("olxClone");
const Products = myDB.collection("products");


export const getAllProduct = async (req, res)=>{

  const allProduct = Products.find({ status: true, isDeleted: false, deletedAt: null });
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