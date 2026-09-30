const express = require("express");
const Router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const Product = require("../../models/Product");
const PickupOrder = require("../../models/PickupOrder");
const Contact = require("../../models/Contact");

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
    const products = await Product.find()
      .select("title price category Image createdAt")
      .sort({ createdAt: -1 })
      .lean();
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
    const { title, price, category } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const imagePath = "uploads/" + req.file.filename;

    const newProduct = new Product({
      title,
      price: Number(price),
      category: category || "Others",
      Image: imagePath,
    });

    await newProduct.save();
    return res.status(200).json({
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({ message: "Failed to add product", error: error.message });
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
      category: product.category,
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
    const { title, price, category } = req.body;
    const updateData = {
      title,
      price: Number(price),
      category: category || "Others",
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

// Contact form submission
Router.post("/contact", async (req, res) => {
  try {
    const { name, phone, email, message, address, location, pincode } = req.body;
    if (
      !name?.trim() ||
      !phone?.trim() ||
      !message?.trim() ||
      !address?.trim() ||
      !location?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        message: "Name, phone, address, location, pincode, and message are required",
      });
    }

    const pincodeDigits = String(pincode).replace(/\D/g, "").slice(0, 6);
    if (!/^\d{6}$/.test(pincodeDigits)) {
      return res.status(400).json({ message: "Invalid pincode" });
    }

    const phoneDigits = String(phone).replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
      return res.status(400).json({ message: "Invalid Indian phone number" });
    }

    const trimmedEmail = email?.trim() || "";
    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const newContact = new Contact({
      name: name.trim(),
      phone: phoneDigits,
      email: trimmedEmail,
      address: address.trim(),
      location: location.trim(),
      pincode: pincodeDigits,
      message: message?.trim() || "",
    });

    await newContact.save();
    return res.status(200).json({
      message: "Contact message saved successfully",
      contact: newContact,
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    return res.status(500).json({ message: "Failed to save contact message" });
  }
});

// Get contact messages (Admin)
Router.get("/admin/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ contactData: contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({ message: "Failed to fetch contact messages" });
  }
});

// Delete contact message (Admin)
Router.all("/admin/contact/delete", async (req, res) => {
  try {
    const id = req.query.id || req.body.id;
    if (!id) {
      return res.status(400).json({ message: "Contact ID is required" });
    }
    await Contact.findByIdAndDelete(id);
    return res.status(200).json({ message: "Contact message deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return res.status(500).json({ message: "Failed to delete contact message" });
  }
});

// Pickup Order submission
Router.post("/pickup", uploadPickup.single("pickupImage"), async (req, res) => {
  try {
    const { full_name, phone, address, location, city, country, state, zipcode } = req.body;
    const pickupImageFilename = req.file ? req.file.filename : "";

    const newOrder = new PickupOrder({
      full_name,
      phone,
      address,
      location: location || "",
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
