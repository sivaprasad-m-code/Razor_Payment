const Product = require('./model')

//add product

const addProduct = async (req, res) => {
  try {
    const { name, description, price, imageUrl } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl
    });
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add product to the database.' });
  }
};

//get products

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};





require('dotenv').config();





//payment_using RazorPay


const Razorpay = require('razorpay');

const createOrder = async (req, res) => {
  try {
    const { productId, email, phone, firstname } = req.body;

    if (!productId || !email || !phone || !firstname) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const price = Number(product.price.toString().replace(/,/g, ''));

    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: 'Invalid product price' });
    }

    const options = {
      amount: price * 100, 
      currency: 'INR',
      receipt: `receipt_${productId}`,
      payment_capture: 1,
    };

    const razorpayInstance = new Razorpay({
      key_id: "rzp_test_FaxseuSjMbQm5n", 
      key_secret: process.env.RAZORPAY_KEY_SECRET, 
    });

    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      product: product.name,
    });
  } catch (error) {

    res.status(500).json({ error: 'Internal server error' });
  }
};








module.exports = { addProduct, getAllProducts,createOrder};