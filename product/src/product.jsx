import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstname, setFirstname] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4004/get')
      .then(res => setProducts(res.data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  const handleBuyClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    setEmail('');
    setPhone('');
    setFirstname('');
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    const res = await loadRazorpay();

    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const orderResponse = await axios.post('http://localhost:4004/order', {
        productId: selectedProduct._id,
        email,
        phone,
        firstname,
      });

      const options = {
        key: 'rzp_test_FaxseuSjMbQm5n', 
        amount: orderResponse.data.amount, 
        currency: 'INR',
        name: selectedProduct.name,
        description: 'Test Transaction',
        order_id: orderResponse.data.orderId, 
        handler: function (response) {
          console.log(response);
          alert(`Payment successful: ${response.razorpay_payment_id}`);
          closeModal();
        },
        prefill: {
          name: firstname,
          email: email,
          contact: phone,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error during payment. Please try again.');
    }
  };

  return (
    <div className='p-5'>
      {products.length > 0 ? (
        <div className="grid grid-cols-3 gap-4">
          {products.map(product => (
            <div key={product._id} className="border hover:shadow-2xl p-5 rounded-lg shadow-lg">
              <img src={product.imageUrl} alt={product.name} className='size-60' />
              <h2 className='text-sm font-semibold'>{product.name}</h2>
              <p className='text-xs'>{product.description}</p>
              <p className='mt-2 font-bold text-lg'>₹{product.price}</p>
              <button
                className='border bg-blue-700 p-2 mt-3 ml-36 text-white rounded-lg w-40 hover:bg-blue-900'
                onClick={() => handleBuyClick(product)} >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>Loading products...</p>
      )}

      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-lg">
            <h2 className='text-lg font-semibold'>Payment Page</h2>
            <p className='mt-2'>Product: {selectedProduct.name}</p>
            <p className='mt-1'>Price: ₹{selectedProduct.price}</p>
            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className='size-60 mt-2' />
            <div className='mt-4'>
              <input
                type="text"
                placeholder="Name"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="border p-2 w-full rounded mb-2"
                required />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 w-full rounded mb-2"
                required />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border p-2 w-full rounded"
                required />
            </div>

            <div className='mt-4 flex justify-end'>
              <button
                className='mr-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg'
                onClick={closeModal}>
                Cancel
              </button>
              <button
                className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg'
                onClick={handlePayment}>
                Pay ₹{selectedProduct.price}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
