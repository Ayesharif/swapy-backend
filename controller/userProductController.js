import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';


const myDB = client.db("olxClone");
const Products = myDB.collection("products");
const Favourites = myDB.collection("favourites");


export const addProduct= async (req, res)=>{
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
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const response = await Products.insertOne(product);
      if (response) {
        return res.send({
            status:0,
            message:"product added successfully"
        })
      }
      else {
        return res.send({
                status:1,
            message:"something went wrong"})
      }
}


export const myProducts=  async (req, res)=>{
  const oneProduct = await Products.find({ postedBy: req.user._id, isDeleted: false, deletedAt: null });
  const response= await oneProduct.toArray();
//   console.log(oneProduct);

  if (response.length>0) {
    return res.status(200).send(response)
  }
  else {
    return res.status(404).send({
      status: 0,
      message: "Product not found"
    })
  }
}

export const deleteProduct= async (req, res)=>{
      const productId = new ObjectId(req.params.id);
      const checkproduct = await Products.findOne({ _id: productId, postedBy: req.user._id });
      if (!checkproduct) {
        return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
      } else {
    
        const deleteProduct = await Products.updateOne({ _id: productId, postedBy: req.user._id }, { $set: { isDeleted: true, deletedAt: Date.now() } }, {});
    
        if (deleteProduct) {
          return res.status(200).send({
            status: 1,
            message: "Product deleted successfully"
          })
        } else {
          return res.status(500).send({
            status: 0,
            message: "Something went wrong"
          })
        }
      }
}

export const updateProduct = async (req, res)=>{
      const productId = new ObjectId(req.params.id);
      const updateProduct = {
        $set: {
          title: req.body.title,
          description: req.body.description,
          updatedAt:Date.now()
        }
      }
      const result = await Products.updateOne({ _id: productId, postedBy: req.user._id, isDeleted: false, deletedAt: null, status: true },
         updateProduct);
      
         if (result) {
        return res.status(200).send({
          status: 1,
          message: "Product updated successfully"
        })
    
      } else {
        return res.status(500).send({
          status: 0,
          message: "Something went wrong"
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