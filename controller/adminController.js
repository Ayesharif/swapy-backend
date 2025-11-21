// import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { deleteImage } from '../utils/deleteImage.js';
import { Category } from '../model/Category.js';

// const myDB = client.db("olxClone");
// const Products = myDB.collection("products");
// const Users = myDB.collection("users");
// const Favourites = myDB.collection("favourites");
// const Category = myDB.collection("category");


export const getAllProduct = async (req, res)=>{
try{

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
}catch(error){
      return res.status(500).send({
      status: 0,
      message: error.message,
    })
}
}

export const productStatus= async(req, res)=>{

try{

  const productId = new ObjectId(req.params.id);


  const checkproduct = await Products.findOne({ _id: productId});

  if (!checkproduct) {
      return res.status(404).send({
          status: 0,
          message: "Product not found"
        })
    } 
    if(checkproduct.status == true){
      await Products.updateOne({_id: productId}, {$set:{status:false}})
        const checkproduct = await Products.findOne({ _id: productId});
      return res.status(200).send({
          status: 1,
          message: "Product blocked successfuly",
          data:checkproduct

        })
    }    else if(checkproduct.status == false){
      await Products.updateOne({_id: productId}, {$set:{status:true}})
              const checkproduct = await Products.findOne({ _id: productId});
      return res.status(200).send({
          status: 1,
          message: "Product unblocked successfuly",
          data:checkproduct
        })
    }

  

  }catch(error){


      return res.status(500).send({
        status: 0,
        message: error.message,
      })
    }


}


export const getProductById= async (req, res)=>{
  try{

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
      }catch(error){


      return res.status(500).send({
        status: 0,
        message: error.message,
      })
    }
}

export const addCategory= async (req, res)=>{
  try{

  const updateCat={
    ...req.body,
  };
    if (req.file) {
  updateCat.image = {
    image: req.file.path, // Cloudinary hosted URL
    publicId: req.file.filename, // Cloudinary public_id (used for deleting later)
  };
    }
//console.log(updateCat);

      const response = await Category.insertOne(updateCat);
      if (response) {
        return res.send({
            status:1,
            message:"Category added successfully",
            data: updateCat
        })
      }
      else {
        return res.send({
                status:0,
            message:"Action failed"})
      }
        }catch(error){


      return res.status(500).send({
        status: 0,
        message: error.message,
      })
    }
}


export const getAllCategory = async (req, res) => {
  try {
    const response = await Category.find();

    if (response.length > 0) {
      return res.status(200).send({
        status: 1,
        data: response
      });
    } else {
      return res.status(404).send({
        status: 0,
        message: "Category not available"
      });
    }

  } catch (error) {
    return res.status(500).send({
      status: 0,
      message: error.message
    });
  }
};

export const updateCategory = async (req, res)=>{
  try{

  
      const Id = new ObjectId(req.params.id);
    //   //console.log("🔹 BODY:", req.body);
    //console.log("🔹 FILE:", req.file);
    //console.log("🔹 PARAM ID:", req.params.id);

    const updateCat={
      ...req.body,
    };
    const StoredCatgory = await Category.findOne({ _id: Id});
    

    if (!StoredCatgory) {
      return res.status(500).send({
        status: 0,
        message: "Category Not Found"
        })
      }   
if (req.file) {
  //console.log(updateCat);
  
  // 🗑️ Delete the old image from Cloudinary (if it exists)
  if (updateCat.imageId) {
    await deleteImage(updateCat.imageId);
  }
  
  // 🌩️ Save the new image info
  updateCat.image = {
    image: req.file.path, // Cloudinary hosted URL
    publicId: req.file.filename, // Cloudinary public_id (used for deleting later)
  };
}
delete updateCat.imageId;
//console.log("cat",updateCat);
     
      const result = await Category.updateOne({ _id: Id},
         {$set :updateCat});
      
         if (result) {
                const getCat = await Category.findOne({ _id: Id});
        return res.status(200).send({
          status: 1,
          message: "Category updated successfully",
          data:getCat
        })
    
      } else {
        return res.status(500).send({
          status: 0,
          message: "Action failed"
        })
    
      }
        }catch(error){


      return res.status(500).send({
        status: 0,
        message: `this is error ${error.message}`,
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
if(result.image){
      await deleteImage(result?.image?.publicId);
}

      await Category.deleteOne({_id:Id});
      
      return res.status(200).send({
        status: 1,
        message: "Category deleted successfully",
        id: req.params.id
      })
    }
    catch(error){
      return res.status(500).send({
        status: 0,
        message: error.message
      })
    }
    
}

export const allUsers= async(req, res)=>{
  try{

    const allUsers= await Users.find({role:"user"},{projection:{firstName:1, lastName:1, email:1, status:1, phone:1}});
    const users = await allUsers.toArray()
    if(users.length<0){
      return res.status(404).send({
        message:"users not Available",
        status:0
      })
    }
    
    return res.status(200).send({
      Data:users,
      message:"users are Available",
      status:1
    })
  }catch(error){
        return res.status(500).send({
      
      message:error.message,
      status:0
    })
  }
}


export const userStatus= async(req, res)=>{

try{

  const userId = new ObjectId(req.params.id);
  const checkUser = await Users.findOne({ _id: userId});

  if (!checkUser) {
      return res.status(404).send({
          status: 0,
          message: "User not found"
        })
    } 
    if(checkUser.status == "active"){
      await Users.updateOne({_id: userId}, {$set:{status:"block"}})
        const getUser = await Users.findOne({ _id: userId});
      return res.status(200).send({
          status: 1,
          message: "User is block now",
          data: getUser
        })
    }    else if(checkUser.status == "block"){
      await Users.updateOne({_id: userId}, {$set:{status:"active"}})
          const getUser = await Users.findOne({ _id: userId});
      return res.status(200).send({
          status: 1,
          message: "User is active now",
          data:getUser
        })
    }
  }catch(error){
      return res.status(500).send({
        status: 0,
        message: error.message,
      })
    }
}