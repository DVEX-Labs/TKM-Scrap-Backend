const express = require("express");
const Router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../../models/Product");
const PickupOrder = require("../../models/PickupOrder");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../../public/uploads");
const pickupImageDir = path.join(__dirname, "../../public/assets/pickupImage");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(pickupImageDir)) {
  fs.mkdirSync(pickupImageDir, { recursive: true });
}

// Multer storage for Products
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const uploadProduct = multer({ storage: productStorage });

// Multer storage for Pickup orders
const pickupStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pickupImageDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});
const uploadPickup = multer({ storage: pickupStorage });

// Admin Login
Router.post("/AdminLogin", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  // Return successful response with dummy token
  return res.status(200).json({
    token: "sample-admin-jwt-token-123456",
    username: username,
    message: "Login successful",
  });
});

// Get Products (User side) - accepts both GET and POST
const getProductsHandler = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ carddetails: products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ message: "Failed to fetch products" });
  }
};
Router.get("/Products", getProductsHandler);
Router.post("/Products", getProductsHandler);

// Get Products (Admin side)
const getAdminProductsHandler = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ adminCard: products });
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return res.status(500).json({ message: "Failed to fetch admin products" });
  }
};
Router.get("/adminProduct", getAdminProductsHandler);
Router.post("/adminProduct", getAdminProductsHandler);

// Add Product
Router.post("/card", uploadProduct.single("file"), async (req, res) => {
  try {
    const { title, price } = req.body;
    const imagePath = req.file ? "uploads/" + req.file.filename : "";

    const newProduct = new Product({
      title,
      price: Number(price),
      Image: imagePath,
    });

    await newProduct.save();
    return res.status(200).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Failed to add product" });
  }
});

// Delete Product
Router.all("/productdelete", async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ message: "Failed to delete product" });
  }
});

// Get Single Product by ID
Router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({
      title: product.title,
      price: product.price,
      Image: product.Image,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Update Product by ID
Router.put("/products/:id", uploadProduct.single("image"), async (req, res) => {
  try {
    const { title, price } = req.body;
    const updateData = {
      title,
      price: Number(price),
    };
    if (req.file) {
      updateData.Image = "uploads/" + req.file.filename;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ success: false, message: "Failed to update product" });
  }
});

// Pickup Order submission
Router.post("/pickup", uploadPickup.single("pickupImage"), async (req, res) => {
  try {
    const { full_name, phone, address, city, country, state, zipcode } = req.body;
    const pickupImageFilename = req.file ? req.file.filename : "";

    const newOrder = new PickupOrder({
      full_name,
      phone,
      address,
      city,
      country,
      state,
      zipcode,
      pickupImage: pickupImageFilename,
    });

    await newOrder.save();
    return res.status(200).json({
      message: "Pickup request created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error creating pickup request:", error);
    return res.status(500).json({ message: "Failed to create pickup request" });
  }
});

// Get User Orders
Router.get("/Users", async (req, res) => {
  try {
    const orders = await PickupOrder.find().sort({ createdAt: -1 });
    return res.status(200).json({ userData: orders });
  } catch (error) {
    console.error("Error fetching users/orders:", error);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Delete User Order
Router.all("/admin/User/delete", async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }
    await PickupOrder.findByIdAndDelete(id);
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = Router;
