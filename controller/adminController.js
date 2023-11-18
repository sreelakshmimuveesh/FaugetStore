const Admin=require("../models/adminModel");
const mongoose=require('mongoose');
const {Users}=require("../models/usersModel");
const Product=require("../models/productModel");
const Address=require('../models/addressModel');
const Order=require("../models/orderModel");
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');
const randomString=require('randomstring');
const sharp = require('sharp');

//password encrption 
const securePassword=async(password)=>{
    try {
          const passwordHash=await bcrypt.hash(password, 10);
          return passwordHash;
       } catch (error) {
           console.log(error.message);
        }
    }

// //loading the admin registration form
// const loadRegister=async(req,res)=>{
//     try {
//         res.render('registerAdmin');
//     } catch (error) {
//         console.log(error.messsage);
//     }
// }   

// //Adding new admin
// const insertAdmin=async(req,res)=>{
// try {
//     const spassword=await securePassword(req.body.password)
//     const admin=new Admin({
//         name:req.body.name,
//         email:req.body.email,
//         password:spassword,
//         phone:req.body.phone
//     });
// const result=await admin.save();
//     if(result){
//         res.render('registerAdmin',{message:"Your account has been created successfully"});
//     } else{
//     res.redirect('/registerAdmin',{message:"Registration has been failed"});
//     }
//     } catch (error) {
//    console.log(error.message);
//     }
// }
// //Sending mail to user
// const addUserMail=async(name,email,password,user_id)=>{
//     try {
//         const transporter=nodemailer.createTransport({
//         host:'smtp.gmail.com',
//         port:587,
//         secure:false,
//         requireTLS:true,
//         auth:{
//             user:config.emailUser,
//             pass:config.emailPassword
//         }
//      });
//      const mailOptions={
//         from:config.emailUser,
//         to:email,
//         subject:'Admin wants to verify your mail',
//         html:'<p>hii '+name+', please click here to <a href="http://localhost:3000/verify?id='+user_id+'">verify</a>your mail</p> <br><br><b>Email:-</b>'+email+'<br><b>password:-</b>'+password
//      }
//      transporter.sendMail(mailOptions, function(error,info){
//         if(error){
//             console.log(error);
//         }
//         else{
//             console.log("Email has been sent:-",info.response);
//         }
//      })

//     } catch (error) {
//         console.log(error.message);
//     }
// }

//Loading the admin login page
const loginLoad=async(req,res)=>{
    try {
        res.render('adminLogin');
        
    } catch (error) {
        console.log(error.message);
    }
}
//Verifying the admin
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);

           if (passwordMatch) {
                // Password matches, set the session and redirect to admin_dashboard
                req.session.admin_id = adminData._id;
                res.redirect('/admin/dashBoard');
            } else {
                // Password doesn't match
               res.render('adminLogin', { message: "Email and password do not match" });
           }
        } else {
            // User with the given email doesn't exist
            res.redirect('/admin/login', { message: "Email not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

//User Management Page
const userManagement=async(req,res)=>{
    try {

        var search='';
       if(req.query.search){
        search=req.query.search;
       }
       const page = req.query.page || 1;
       const userPerPage = 6; // Define the number of products per page.

       // Count the total number of products.
       const totalUsers = await Users.countDocuments();

       // Calculate totalPages based on the totalProducts and productsPerPage.
       const totalPages = Math.ceil(totalUsers / userPerPage);

       // Query products for the current page.
       const skip = (page - 1) * userPerPage;
       const users = await Users.find({
        $or: [
            { name: { $regex: '.*' + search + '.*', $options: 'i' } },
            { email: { $regex: '.*' + search + '.*', $options: 'i' } }
            
        ]
    }).skip(skip).limit(userPerPage);

       res.render('userManagement',{users, page, totalPages });
        
    } catch (error) {
        console.log(error.message);
    }
}
//ProductManagement page

const productManagement=async(req,res)=>{
    try {
       var search='';
       if(req.query.search){
        search=req.query.search;
       }
        const page = req.query.page || 1;
        const productsPerPage = 6; // Define the number of products per page.

        // Count the total number of products.
        const totalProducts = await Product.countDocuments();

        // Calculate totalPages based on the totalProducts and productsPerPage.
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        // Query products for the current page.
        const skip = (page - 1) * productsPerPage;
        const product = await Product.find({
            $or: [
                { pname: { $regex: '.*' + search + '.*', $options: 'i' } },
                { pdesc: { $regex: '.*' + search + '.*', $options: 'i' } },
                { pcat: { $regex: '.*' + search + '.*', $options: 'i' } },
            ]
        }).skip(skip).limit(productsPerPage);

        res.render('productManagement',{product, page, totalPages });
        
    } catch (error) {
        console.log(error.message);
    }
}
 
//admin Logout 
const adminLogout=async(req,res)=>{

    try {

        req.session.destroy();
        res.redirect('/admin/login');
        
    } catch (error) {
        console.log(error.message);
    }
}
//Admin load add user register
const addUserLoad=async(req,res)=>{

    try {
        res.render('addUser')
        } catch (error) {
        console.log(error.message);
        }
}
//Admin adding a user
const addUser = async (req, res) => {
    try {
      //const spassword = await securePassword(password); // Make sure you are getting the password from the request
  
      const name = req.body.name;
      const email = req.body.email;
      const phone = req.body.phone;
     
      const user = new Users({
        name:name,
        email:email,
        phone:phone,
        is_admin:0
      });
  
      const userData = await user.save();
  
      if (userData) {
        //addUserMail(name, email, password, userData._id);
        res.render('addUser', { message: "User added successfully"});
        
      } else {
        // Handle the case where user data couldn't be saved
      res.redirect('/addUser', { message: "Failed to save user data" });
      }
    } catch (error) {
      console.log(error); // Log the error for debugging purposes
      return res.render('addUser', { message: "Something went wrong" });
    }
  };
//admin blocking and unblocking user
   const blockUser=async (req, res) => {
        try {
            const userId = req.params.id;
  
            // Find the user by ID
        const user = await Users.findById(userId);
  
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
  
            // Toggle the block status
            user.isBlocked = !user.isBlocked;
  
             // Save the updated user
            await user.save();
  
            res.status(200).json({ message: 'User block status updated' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal server error' });
        }
  };
//Loading Add Product page

const loadAddProduct=async(req,res)=>{
    try {
        
        res.render('addProduct');

        } catch (error) {
        console.log(error.messsage);
        }
}

//Adding a new product
const insertProduct = async (req, res) => {
  try {
    const imageFiles = req.files;
  const imageFileNames = imageFiles.map((file) => file.filename);
    const product = new Product({
        pname:req.body.pname,
        price:req.body.price,
        pdesc:req.body.pdesc,
        pcat:req.body.pcat,
        pimage : imageFileNames,
        pquantity:req.body.pquantity
    });
    const result = await product.save();

    if (result) {
      res.render('addProduct', { message: "Product added successfully" });
    } else {
      res.redirect('/admin/addProduct', { message: "Product can't be added" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Loading edit product
const loadEditProduct = async(req,res)=>{
    try {
        const id = req.query.id;
        console.log(req.query.id);
        const productData = await Product.findById({_id:id})
        console.log(productData);
        res.render('editProduct',{product:productData})
    } catch (error) {
        console.log(error.message);
    }
}
//Edit product page
const editProduct  = async(req,res)=>{
    try {
        console.log("edit product",req.body.pname);
        
        const updatedData = await Product.findByIdAndUpdate(
                {_id:req.body.id},
                {$set:{pname:req.body.pname,
                price:req.body.price,
                pdesc:req.body.pdesc,
                pcat:req.body.pcat,
                pimage :req.body.pimage,
                pquantity:req.body.pquantity}});
                console.log(updatedData);
                res.redirect('/admin/productDisplay')
    } catch (error) {
        console.log(error.message);
    }
}
//Delete Product
const deleteProduct = async(req,res)=>{
    try {
        const id = req.query.id;
      await Product.deleteOne({_id:id});
        res.redirect('/admin/productDisplay')
    } catch (error) {
        console.log(error.message);
    }
}


//Delete User
const deleteUser = async(req,res)=>{
    try {
        const id = req.query.id;
      await Users.deleteOne({_id:id});
        res.redirect('/admin/userDisplay')
    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboardLoad=async(req,res)=>{
    try {
        const user=await Users.countDocuments();
        const product=await Product.countDocuments();
        const order=await Order.countDocuments();
        res.render('adminDashboard',{user:user,product:product,order:order})
        
    } catch (error) {
        console.log(error.message);
    }
}

const orderManagement = async (req, res) => {
    try {
        const orders = await Order.find().populate('product.productID')
        
   

        res.render('orderManagement', { orders });

    } catch (error) {
        console.log(error.message);
    }
}


 



//Exporting all modules
module.exports={
    //loadRegister,
    //insertAdmin,
    loginLoad,
    verifyLogin,
    userManagement,
    productManagement,
    adminLogout,
    addUserLoad,
    addUser,
    blockUser,
    loadAddProduct,
    insertProduct,
    loadEditProduct,
    editProduct,
    deleteProduct,
    deleteUser,
    adminDashboardLoad,
    orderManagement
    

}