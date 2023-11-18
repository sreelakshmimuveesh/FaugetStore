const Admin=require("../models/adminModel");
const {Users}=require("../models/usersModel");
const Product=require("../models/productModel");
const Address=require("../models/addressModel");
const Cart=require("../models/cartModel");
const Order=require("../models/orderModel");
const nodemailer=require('nodemailer');
const randomString=require('randomstring');
const bcrypt=require('bcrypt');
const mongoose=require('mongoose');
const axios = require('axios');
let objectId=mongoose.Types.ObjectId



//Loading landing page
const landingPage=async(req,res)=>{
    try {
        var search='';
       if(req.query.search){
        search=req.query.search;
       }
        const productData=await Product.find({
            $or: [
                { pname: { $regex: '.*' + search + '.*', $options: 'i' } },
                { pdesc: { $regex: '.*' + search + '.*', $options: 'i' } },
                { pcat: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        });
        res.render('userlanding',{product:productData});
        
    } catch (error) {
        console.log(error.message);
    }
}

//Encrypting Password
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}
//Loading User Registraion
const loadRegister=async(req,res)=>{
    try {
        
        res.render('newUser');

    } catch (error) {
        console.log(error.messsage);
    }
}

const sendVerifyMail = async (userId, email) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'sreelakshmishaji13@gmail.com', // Replace with your email
                pass: 'iipm gugu estz cpwb' // Replace with your App Password
            }
        });

        const otpValue = generateOTP();

        const userData = await Users.findOne({ _id: userId });

        if (userData) {
            userData.otp = {
                value: otpValue,
                createdAt: Date.now(),
                expiresAt: Date.now() + 300000,
            };

            await userData.save();

            const mailOptions = {
                from: 'sreelakshmishaji13@gmail.com', // Replace with your email
                to: email,
                subject: 'Your OTP code for verification',
                text: `Your OTP code is: ${otpValue}`
            };

            const info = await transporter.sendMail(mailOptions);

            console.log('Email sent:', info.response);
            console.log('OTP:', otpValue);

            return otpValue;
        } else {
            console.log('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error sending email:', error);
        return null;
    }
}

// Generate a 6-digit numeric OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Verifying OTP with the user
const verifyOTP = async (req, res) => {
    try {
        const OTP = req.body.otp;
        const userId = req.session.user_id; // Assuming you have a user ID in your session

        if (!userId) {
            return res.status(400).json({ error: 'User not authenticated' });
        }

        const userData = await Users.findOne({ _id: userId });

        if (!userData) {
            console.log('User not found');
            return res.status(400).json({ error: 'User not found' });
        }

        const storedOTP = userData.otp.value;
        const expiresAt = userData.otp.expiresAt;
        const currentTimestamp = userData.otp.createdAt;

        console.log('Stored OTP:', storedOTP);
        console.log('User entered OTP:', OTP);
        console.log('Current time:', currentTimestamp);
        console.log('Expiration time:', expiresAt);

        if (storedOTP === OTP && currentTimestamp <= expiresAt) {
            userData.is_verified = true; // Ensure that this is correctly setting is_verified to true
            const result=await userData.save();
            console.log('User verified');
            return res.render('userHomePage', { user: result });
        } else {
            console.log('OTP verification failed');
            return res.status(400).json({ error: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Internal server error');
    }
}


// Your route for inserting a new user
const insertUsers = async (req, res) => {
    try {
        const spassword = await securePassword(req.body.password);
        const users = new Users({
            name: req.body.name,
            email: req.body.email,
            password: spassword,
            phone: req.body.phone,
        });

        const result = await users.save();

        if (result) {
            req.session.user_id = result._id;
            // Send the verification email
            const email = req.body.email;
            const otp = await sendVerifyMail(req.session.user_id, email);
            return res.render('OTP', { userId: req.session.user_id, otp });
        } else {
            return res.render('newUser', { message: 'Registration has failed' });
        }
    } catch (error) {
        console.error(error.message);
        return res.status(500).send('Internal server error');
    }
}

//Loading OTP Form
// const otpLoad=async(req,res)=>{
//     try {
//         if(req.session.user_id){
//         res.render('OTP',{userId:req.session.user_id})
//         }else{
//         res.redirect('/new_user')
//         } 
//         } catch (error) {
//         console.log(error.message);
//         }
//     }

//Loading Login Form
const loginLoad=async(req,res)=>{
    try {
        res.render('login');
        
    } catch (error) {
        console.log(error.message);
    }
}
//Verifying credentials
const verifyLogin=async(req,res)=>{
        try {
            

        const email=req.body.email;
        const password=req.body.password;
        const userData = await Users.findOne({email:email});
        const blocked=userData.isBlocked;


        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);

        if(passwordMatch&&blocked===false){
            req.session.user_id = userData._id;
                res.redirect('/userHome');
            } else{
                
                res.redirect('/login');
            }
        } else{
            res.render('login',{message:"Email and password are incorrect"});
        }
        
    } catch (error) {
        console.log(error.message);
    }
}
//Loading user home page
const userHomeLoad=async(req,res)=>{
    try {
        
        console.log("user",req.session.user_id);
        const userId=req.session.user_id

         const productData=await Product.find();
         const userData=await Users.findById(userId);

         res.render('userHomePage', { product: productData, user: userData });
    } catch (error) {
        console.log(error.message);
    }
}

//User Logout page
const userLogout=async(req,res)=>{
        try {
        req.session.destroy();
        res.redirect('/login');
        
        } catch (error) {
        console.log(error.message);
         }
}
//Product Detail view
const productDetail=async(req,res)=>{
    try {
       const productId=req.query.id;

       const product=await Product.findById(productId);

        res.render('productDetail',{product:product});
        
    } catch (error) {
        console.log(error.message);
    }
}
//Loading User Account


const girlFashionLoad=async(req,res)=>{
    try {
        const productData = await Product.find({ pcat: 'GirlFashion' }); 
        res.render('GirlFashion', { product: productData });
    } catch (error) {
       console.log(error.message); 
    }
}
const boyFashionLoad=async(req,res)=>{
    try {
        const productData = await Product.find({ pcat: 'BoyFashion' }); 
        res.render('BoyFashion', { product: productData });
    } catch (error) {
       console.log(error.message); 
    }
}
const ToysLoad=async(req,res)=>{
    try {
        const productData = await Product.find({ pcat: 'Toys' }); 
        res.render('Toys', { product: productData });
    } catch (error) {
       console.log(error.message); 
    }
}
const NewBornLoad=async(req,res)=>{
    try {
        const productData = await Product.find({ pcat: 'NewBorn' }); 
        res.render('NewBorn', { product: productData });
    } catch (error) {
       console.log(error.message); 
    }
}

const userAccountLoad=async(req,res)=>{
    try {
        console.log("hi");
        console.log(req.query);
        const userId=req.query.id;
        
    
           const user=await Users.findById(userId);
    
            res.render('userAccount',{user:user});
    } catch (error) {
        console.log()
    }
    }
    //Loading User Cart
    const userCartLoad=async(req,res)=>{
        try {
            const userId=req.session.user_id;
        
    console.log('hello',userId);
           const user=await Users.findById(userId);
           console.log(user);
           const cartCount = await Cart.aggregate([
            {
              $project: {
                productCount: { $size: '$product' } // Count the elements in the 'product' array field
              }
            }
          ]);
            const cartFetch = await Cart.findOne(
                { userID: req.session.user_id }).populate('product.productID')
       console.log(cartFetch);
                res.render('userCart',{user:user,cart:cartFetch,cartCount:cartCount[0].productCount});
        } catch (error) {
            console.log()
        }
        }
        const userCart = async (req, res) => {
            try {
              const userId = req.session.user_id;
              const productId = req.body.productId; 
              const updatedCart = await Cart.findOneAndUpdate(
                { userID: userId },
                { $push: { product: { productID: productId, quantity: 1 } } },
                { new: true }
              ).populate('product.productID');
          
              const cartCount = updatedCart.product.length;
          
              res.status(200).json({ message: 'Product added to cart', cartCount });
            } catch (error) {
              console.error(error.message);
              res.status(500).json({ error: 'Failed to add item to cart' });
            }
          };
          
        // const updateQuantity = async (req, res) => {
        //     try {
        //         const productId = req.query.id
        //         console.log(productId);
        //         const newQuantity = req.body.quantity;
        
        //         if (!productId || isNaN(newQuantity)) {
        //             return res.status(400).json({ message: 'Invalid request data.' });
        //         }
        
        //         const userId = req.session.userId;
        
        //         const cart = await Cart.findOne({ userID: userId }).populate('product.productID');
        
        //         if (!cart) {
        //             return res.status(404).json({ message: 'Cart not found.' });
        //         }
        
        //         // Print the populated cart for debugging
        //         console.log('Cart:', cart);
        
        //         let productIndex = -1;
        // for (let i = 0; i < cart.product.length; i++) {
        //     if (cart.product[i].productID._id.toString() === productId) {
        //         productIndex == i;
        //         console.log(productIndex);
        //         break;
        //     }
        // }
        //         console.log('Product Index:', productIndex);
        
        //         if (productIndex === -1) {
        //             return res.status(404).json({ message: 'Product not found in the cart.' });
        //         }
        
        //         // Update the quantity for the product
        //         cart.product[productIndex].quantity = newQuantity;
        
        //         const totalPrice = cart.product.reduce((total, item) => {
        //             return total + (item.productID.price * item.quantity);
        //         }, 0);
        
        //         cart.totalPrice = totalPrice;
        
        //         await cart.save();
        
        //         res.redirect('/userCart');
        //     } catch (error) {
        //         console.error(error);
        //         res.status(500).json({ message: 'Internal server error' });
        //     }
        // };
        

       
        const addToCart = async (req, res) => {
            try {
              const productId = req.query.id;
              if (!productId) {
                return res.status(400).json({ error: 'Invalid productId in the query' });
              }
          
              const userId = req.session.user_id;
          
              const products = await Product.findById(productId);
              const userCart = await Cart.findOne({ userID: userId });
          
              if (!userCart) {
                const cart = new Cart({
                  userID: userId,
                  product: [
                    {
                      productID: productId,
                      price: products.price,
                      quantity: 1,
                    }
                  ],
                });
                await cart.save();
              } else {
                const productIndex = userCart.product.findIndex(
                  (product) => product.productID.toString() === productId.toString()
                );
          
                if (productIndex !== -1) {
                  userCart.product[productIndex].quantity += 1;
                } else {
                  userCart.product.push({ productID: productId, quantity: 1, price: products.price });
                }
                await userCart.save();
              }
          
              res.redirect('/userCart?success=Product added successfully');
            } catch (error) {
              console.error('Error adding item to cart:', error);
              res.status(500).json({ error: 'Failed to add item to cart', details: error.message });
            }
          };
          
          

  const addDeliveryAddressLoad=async(req,res)=>{
    try {
        console.log(req.query);
            const userId=req.session.user_id;
            console.log(userId);
               const user=await Users.findById(userId);
        
        console.log(user);
                res.render('addAddress',{user:user});
        
    } catch (error) {
        console.log(error.message);
    }
  }
  
  const addDeliveryAddress = async (req, res) => {
    try {
        const userID = req.session.user_id;

        // Create a new address object with the data from the request
        const newAddress = {
            address1: req.body.address1,
            country: req.body.country,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        };

        // Find the user's address document based on userID
        const userAddress = await Address.findOne({ userID });

        if (userAddress) {
            // If the user already has an address document, add the new address to the array
            userAddress.address.push(newAddress);
            await userAddress.save();
        } else {
            // If the user doesn't have an address document, create a new one
            const address = new Address({
                userID,
                address: [newAddress]
            });
            await address.save();
        }

        res.redirect('/deliveryAddress');
    } catch (error) {
        console.log(error.message);
        // You may want to handle the error by displaying an error message or redirecting to an error page
        res.redirect('/addAddress', { message: "Address couldn't be added" });
    }
};




    const loadEditDelivery = async(req,res)=>{
        try {
            const userId=req.session.user_id;
            console.log(userId);
            const user=await Users.findById(userId);
            console.log(user);

            const addressData = await Address.findOne({ userID: req.session.user_id })
            console.log(addressData);
            res.render('deliveryAddress',{address:addressData,user:user});
            
        } catch (error) {
            console.log(error.message);
        }
    }

    const loadEditDeliveryAddress = async(req,res)=>{
        try {
            const userId=req.session.user_id;
            console.log(userId);
            const user=await Users.findById(userId);
            console.log(user);

            const addressData = await Address.findOne({ userID: req.session.user_id })
            console.log(addressData);
            res.render('editAddress',{address:addressData,user:user});
            
        } catch (error) {
            console.log(error.message);
        }
    }
    //Edit product page
    const editDeliveryAddress  = async(req,res)=>{
        try {
            console.log(req.body);
            console.log(req.query);
            console.log(req.params);
        const addressId=req.query.id;
          const userId=req.session.user_id
          console.log(addressId);
          console.log(userId);

          //const userData=await Users.findOne(new objectId(userId));
            const updatedData = await Address.updateOne(
                    {userID:new objectId(userId),"address._id":new objectId(addressId)},
                    {$set:{address:[{
                        address1:req.body.address1,
                        country:req.body.country,
                        city:req.body.city,
                        state:req.body.state,
                        zip:req.body.zip}]}});
                    console.log(updatedData);
                    res.redirect('/deliveryAddress')
        } catch (error) {
            console.log(error.message);
        }
    }


    const deleteAddress = async (req, res) => {
        try {
            const addressId = req.query.id;
           console.log(addressId);
            const userId=req.session.user_id
            
    
            // Use the $pull operator to remove the item with a specific _id from the product array
            const del=await Address.updateOne({ userID: new objectId(userId) },{ $pull: { address: { _id: new objectId(addressId) } } });
            console.log(del);
            
            res.redirect('/deliveryAddress');
        } catch (error) {
            console.log(error.message);
        }
    }

    const deleteCart = async (req, res) => {
       
        try {
            const productId = req.query.id;
            console.log('pdt',productId);
            const userId=req.session.user_id
            console.log('user',userId);
    
            // Use the $pull operator to remove the item with a specific _id from the product array
            const del=await Cart.updateOne({ userID: userId },{ $pull: { product: { productID: new mongoose.Types.ObjectId(productId) } } });
            console.log(del);
            
            res.redirect('/userCart');
        } catch (error) {
            console.log(error.message);
        }
    }



   
    
    // const confirmOrder = async (req, res) => {
    //     try {
    //         const productId = req.query.id;
    //         const userId = req.session.userId;
    //         const product = await Product.findById(productId); // Fetch the associated product
    
    //         if (product) {
    //             // Check if there is an existing order for the user
    //             const existingOrder = await Order.findOne({ userID: userId });
    
    //             if (existingOrder) {
    //                 // Update the existing order by pushing the new product
    //                 existingOrder.product.push({
    //                     productID: new mongoose.Types.ObjectId(productId),
    //                     quantity: 1,
    //                     price: product.price
    //                 });
    
    //                 existingOrder.totalPrice += product.price;
    
    //                 await existingOrder.save();
    //                 res.redirect('/userHome');
    //             } else {
    //                 // Create a new order
    //                 const order = new Order({
    //                     userID: userId,
    //                     product: [{
    //                         productID: new mongoose.Types.ObjectId(productId),
    //                         quantity: 1,
    //                         price: product.price
    //                     }],
    //                     totalPrice: product.price
    //                 });
    
    //                 await order.save();
    //                 res.redirect('/userHome');
    //             }
    //         } else {
    //             res.json({ status: false, message: "Product not found" });
    //         }
    //     } catch (error) {
    //         console.log(error.message);
    //     }
    // }
    // const userOrderLoad=async(req,res)=>{
    //     try {
    //         const userId=req.session.user_id;
        
    
    //        const user=await Users.findById(userId);
    
    //         const orderFetch = await Order.findOne(
    //             { userID: req.session.user_Id }).populate('product.productID')
      
    //             res.render('orders',{user:user,order:orderFetch});
    //     } catch (error) {
    //         console.log()
    //     }
    //     } 
    const paymentLoad=async(req,res)=>{

        try {
            const userId=req.session.user_id;
            console.log(userId);
            const user=await Users.findById(userId);
            console.log(user);

            const addressData = await Address.findOne({ userID: req.session.user_id })
            console.log(addressData);

           
            
            res.render('payment',{address:addressData,user:user});
            
        } catch (error) {
            console.log(error.message);
        }
    }
    const payment = async (req, res) => {
        try {
          // Assuming you have a function to get the selected product IDs from the request
          const selectedProductIds = getSelectedProductIdsFromRequest(req);
      
          const data = {
            selectedProductIds,
          };
      
          // Use Axios to send the data to the server
          const response = await axios.post('/payment', data);
      
          // Handle the response from the server if needed
          //console.log(response.data);
      
          // Redirect to the checkout page
          res.redirect('/payment'); // Replace with the actual URL of the checkout page
        } catch (error) {
          // Handle errors here
          console.error(error);
        }
      };
      
    

    const loadeditProfile = async(req,res)=>{
        try {
            const id = req.session.user_id;
            const userData = await Users.findById({_id:id})
           
            res.render('profile',{user:userData})
        } catch (error) {
            console.log(error.message);
        }
    }
    //Edit Profile
    const editProfile  = async(req,res)=>{
        try {
           
            const updatedData = await Users.findByIdAndUpdate(
                    {_id:req.session.user_id},
                    {$set:{name:req.body.name,
                    email:req.body.email,
                    phone:req.body.phone,
                    }});
                    console.log(updatedData);
                    res.redirect('/profile')
        } catch (error) {
            console.log(error.message);
        }
    }


    const orderAdd = async (req, res) => {
        try {
          const orderData = req.body;
          const userId = req.session.user_id;
      
          // Find an existing order for the user
          const existingOrder = await Order.findOne({ userID: userId });
      
          if (existingOrder) {
            // If an order exists, add the new products to it
            orderData.productDetails.forEach((productDetail) => {
              const existingProduct = existingOrder.product.find(
                (p) => p.productID.toString() === productDetail.productId
              );
      
              if (existingProduct) {
                // If the product already exists, update the quantity
                existingProduct.quantity += productDetail.quantity;
              } else {
                // If the product doesn't exist, add it to the order
                existingOrder.product.push({
                  productID: productDetail.productId,
                  price: productDetail.price,
                  quantity: productDetail.quantity,
                });
              }
            });
      
            // Update the total price of the order
            existingOrder.totalPrice += orderData.totalPrice;
      
            // Save the updated order
            await existingOrder.save();
          } else {
            // If no order exists, create a new order
            const products = orderData.productDetails.map((productDetail) => ({
              productID: productDetail.productId,
              price: productDetail.price,
              quantity: productDetail.quantity,
            }));
      
            const newOrder = new Order({
              userID: userId,
              product: products,
              totalPrice: orderData.totalPrice,
            });
      
            await newOrder.save();
          }
      
          res.json({ message: 'Order saved successfully' });
        } catch (error) {
          console.log(error.message);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };
      
      const placeOrder = async (req, res) => {
        try {
          const orderData = req.body;
      
          const existingOrder = await Order.findOne({ userID: req.session.user_id });
      
          if (existingOrder) {
            const existingAddressIndex = existingOrder.address.findIndex(
              addr => addr.addressID.toString() === orderData.addressID
            );
      
            if (existingAddressIndex === -1) {
              existingOrder.address.push({
                addressID: new objectId(orderData.addressID),
                // Add other address details as needed
              });
            } else {
              // Address already exists in the order, handle accordingly
              // For instance, throw an error or skip adding the address
              // For now, let's log a message indicating the existing address
              console.log('Address already exists in the order');
            }
      
            existingOrder.paymentMethod = orderData.paymentMethod;
            // Add other order details as needed
      
            await existingOrder.save();
          } else {
            const addressId = new objectId(orderData.addressId);
            const newOrder = new Order({
              userID: req.session.user_id,
              address: [
                {
                  addressID: addressId,
                  // Add other address details as needed
                },
              ],
              paymentMethod: orderData.paymentMethod,
              status: 'Order Placed'
              // Add other order details as needed
            });
      
            await newOrder.save();
          }
      
          res.redirect('/order?success=Order placed successfully');
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: 'Failed to place the order' });
        }
      };
      
      const deleteFromCart = async (req, res) => {
        try {
          const userId = req.session.user_id; // Assuming you have user session handling
          console.log('deleteuser',userId);
          const { productIds } = req.params;
      
          // Assuming your Cart schema has a field like `products` containing product IDs
          await Cart.updateOne(
            { userId }, // Assuming your Cart model contains a userId field
            { $pull: { products: { $in: new objectId(productIds) } } } // Removing products by their IDs
          );
      
          res.json({ message: 'Products removed from cart successfully' });
        } catch (error) {
          console.error('Error deleting products from cart:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      };
      const orderLoad = async (req, res) => {
        try {
          const userId = req.session.user_id;
          const user = await Users.findById(userId);
          console.log(user);
      
          const orderFetch = await Order.findOne({ userID: req.session.user_id })
            .populate('product.productID')
            .populate('address.addressID'); // Populate address.addressID field from another database
      
          res.render('orders', { user: user, order: orderFetch });
        } catch (error) {
          console.log(error.message);
        }
      };

      const resetPasswordLoad=async(req,res)=>{
        try {
          const userId=req.session.user_id;
          const userData=await Users.findById(userId);
          res.render('resetPassword',{user:userData})
        } catch (error) {
          console.log(error.message);
        }
      }
    

const resetPassword = async (req, res) => {
  try {
    const password = req.body.password;
    const userId = req.session.user_id;
    const newPassword = req.body.newpassword;

    const userData = await Users.findById(userId);
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password with the hashed password
        const updatedUser = await Users.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true });

        if (updatedUser) {
          // Password updated successfully
          res.status(200).json({ message: 'Password updated successfully' });
        } else {
          res.status(500).json({ error: 'Failed to update password' });
        }
      } else {
        res.status(400).json({ error: 'Current password does not match' });
      }
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

const CancelOrder = async (req, res) => {
       
  try {
      const productId = req.query.id;
      console.log('pdt',productId);
      const userId=req.session.user_id
      console.log('user',userId);

      // Use the $pull operator to remove the item with a specific _id from the product array
      const del=await Order.updateOne({ userID: userId },{ $pull: { product: { productID: new mongoose.Types.ObjectId(productId) } } });
      console.log(del);
      
      res.redirect('/order');
  } catch (error) {
      console.log(error.message);
  }
}

      
      
//exporting all modules

module.exports={
    landingPage,
    loadRegister,
    sendVerifyMail,
    insertUsers,
    verifyOTP,
    loginLoad,
    verifyLogin,
    userLogout,
    //otpLoad,
    productDetail,
    userHomeLoad,
    userAccountLoad,
    userCartLoad,
    girlFashionLoad,
    boyFashionLoad,
    ToysLoad,
    NewBornLoad,
    addDeliveryAddressLoad,
    addDeliveryAddress,
    loadEditDelivery,
    editDeliveryAddress,
    userCart,
    addToCart,
    //updateQuantity,
   
    deleteCart,
    //confirmOrder,
    //userOrderLoad,
    paymentLoad,
    payment,
    loadeditProfile,
    editProfile,
    deleteAddress,
    loadEditDeliveryAddress,
    orderAdd,
    placeOrder,
    deleteFromCart,
    orderLoad,
    resetPassword,
    resetPasswordLoad,
    CancelOrder
   
  
}