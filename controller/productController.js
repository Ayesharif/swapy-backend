
// import { client } from '../dbConfig.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { Product } from '../model/Product.js';
import { User } from '../model/User.js';
// const myDB = client.db("olxClone");
// const Products = myDB.collection("products");
// const Users = myDB.collection("users");


export const getActiveProduct = async (req, res) => {
  try {
    const response = await Product.find(
      { status: true, isDeleted: false, deletedAt: null }
    )
      .select("_id title images price description category"); // projection

    if (!response || response.length === 0) {
      return res.status(404).send({
        status: 0,
        message: "Product not found"
      });
    }

    return res.status(200).send({
      status: 1,
      data: response
    });

  } catch (error) {
    return res.status(500).send({
      status: 0,
      message: error.message
    });
  }
};


export const getCategoryProduct = async (req, res) => {
  try {
    const category = req.params.id;

    const response = await Product.find(
      {
        category: category,
        status: true,
        isDeleted: false,
        deletedAt: null
      }
    ).select("_id title images price description category postedBy");

    if (!response || response.length === 0) {
      return res.status(404).send({
        status: 0,
        message: "Product not found"
      });
    }

    return res.status(200).send({
      status: 1,
      data: response
    });

  } catch (error) {
    return res.status(500).send({
      status: 0,
      message: error.message
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the main product
    const oneProduct = await Product.findOne(
      { _id: productId, status: true, isDeleted: false, deletedAt: null },
      { _id: 1, title: 1, images: 1, price: 1, description: 1, category: 1, postedBy: 1 }
    );

    if (!oneProduct) {
      return res.status(404).json({
        status: 0,
        message: "Product not found",
      });
    }

    const postedBy = oneProduct.postedBy;

    // Find all other products by the same user
    const userProducts = await Product.find(
      { postedBy: postedBy, status: true, isDeleted: false, deletedAt: null },
      { _id: 1, title: 1, images: 1, price: 1 }
    );

    // Get user information
    const user = await User.findOne(
      { _id: postedBy },
      { firstName: 1, lastName: 1, city: 1, createdAt: 1, phone: 1, image: 1 }
    );

    return res.status(200).json({
      data: {
        product: oneProduct,
        userData: {
          user: user,
          products: userProducts.length,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};

export const searchProduct = async (req, res) => {
  // try {
  //  const { city, priceMin, priceMax, title } = req.query;
  //   //console.log(city, priceMin, priceMax, title);

  //   const result = await myDB.collection("users").aggregate([
  //     {
  //       $lookup: {
  //         from: 'products',             // collection name in MongoDB
  //         localField: '_id',    // field in Products
  //         foreignField: 'postedBy',       // field in Users
  //         as: 'userData'
  //       }

  //     },

  //     // { $unwind: '$userData' },
  //     // {
  //     //   $match: {
  //     //     ...(city ? { 'userData.city': city } : {}), // filter only if provided
  //     //     ...(title ? { title: { $regex: title, $options: 'i' } } : {}),
  //     //     price: {
  //     //       $gte: parseInt(priceMin) || 0,
  //     //       $lte: parseInt(priceMax) || 1000000000 // upper limit fallback
  //     //     }
  //   ]).toArray();


  //console.log(result);
  //   return res.status(200).json({
  //     status: 1,
  //     message: 'Products available',
  //     data: result,
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     status: 0,
  //     message: error.message,
  //   });
  // }
};


export const getPublicProfile = async (req, res) => {
  try {
    let userId;

    // Get userId from query or token
    if (req?.query?.id) {
      userId = req.query.id;
    } else {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.SECRET);
      userId = decoded._id;
    }

    // Fetch user with selected fields
    const user = await User.findOne(
      { _id: userId },
      { firstName: 1, lastName: 1, email: 1, phone: 1, city: 1, image: 1, role: 1 }
    );

    if (!user) {
      return res.status(404).json({
        status: 0,
        message: "User not found",
      });
    }

    // Fetch all non-deleted products by this user
    const allProducts = await Product.find(
      { postedBy: userId, isDeleted: false, deletedAt: null, status: true },
      { title: 1, description: 1, category: 1, images: 1, price: 1, productType: 1 }
    );

    if (!allProducts || allProducts.length === 0) {
      return res.status(200).json({
        status: 1,
        message: "User found successfully, but no products posted yet",
        data: user,
        products: [],
      });
    }

    // Success response
    return res.status(200).json({
      status: 1,
      message: "User found successfully",
      data: user,
      products: allProducts,
    });

  } catch (error) {
    console.error("❌ Error in getPublicProfile:", error.message);
    return res.status(500).json({
      status: 0,
      message: error.message,
    });
  }
};