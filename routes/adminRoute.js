const express=require('express');
const adminRoute=express();
const session = require('express-session');
const multer = require('multer');
const path=require('path');
const fs = require('fs');

//multer configuration
const storage = multer.diskStorage({
      destination: function (req, file, cb) {
      cb(null, 'public/productImages/');
    },
      filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + ext);
    },
  });
  
    const upload = multer({ storage: storage });


//session middleware
const auth=require('../middleware/auth');

const config=require("../config/config");

//adminRoute.use(session({secret:config.sessionSecret,resave:false,saveUninitialized:true}));//session config

//body parser
const bodyParser=require('body-parser');
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({extended:true}));

//setup view engine
adminRoute.set('view engine','ejs');
adminRoute.set('views', './views/admin');

adminRoute.use('/', express.static('public'))

//setup the routes
const adminController=require("../controller/adminController");//adding controller

adminRoute.get('/admin/addProduct',auth.isAdminLogin,adminController.loadAddProduct);//loading add product

adminRoute.post('/admin/addProduct',upload.array('pimage',5),adminController.insertProduct);//Add Product

adminRoute.get('/admin/editProduct',auth.isAdminLogin,adminController.loadEditProduct);//Loading edit product

adminRoute.post('/admin/editProduct',adminController.editProduct);//edit product

adminRoute.get('/admin/deleteProduct',adminController.deleteProduct)//delete product

adminRoute.get('/admin/deleteUser',adminController.deleteUser);//delete user

//adminRoute.get('/admin/register',auth.isAdminLogout,adminController.loadRegister);//Loading admin registration

//adminRoute.post('/admin/register',adminController.insertAdmin);//adding new admin

adminRoute.get('/admin/login',auth.isAdminLogout,adminController.loginLoad);//Loading login page

adminRoute.post('/admin/login',adminController.verifyLogin);//Verify login admin

adminRoute.get('/admin/logout',auth.isAdminLogin,adminController.adminLogout);//Admin logout

adminRoute.get('/admin/userDisplay',auth.isAdminLogin,adminController.userManagement);//User management

adminRoute.get('/admin/productDisplay',auth.isAdminLogin,adminController.productManagement);//product management

adminRoute.get('/admin/orderManagement',auth.isAdminLogin,adminController.orderManagement);

adminRoute.get('/admin/addUser',auth.isAdminLogin,adminController.addUserLoad);//Loading add user

adminRoute.post('/admin/addUser',adminController.addUser);//adding user

adminRoute.post('/users/block/:id',adminController.blockUser);//block or unblock user

adminRoute.get('/admin/dashBoard',auth.isAdminLogin,adminController.adminDashboardLoad);



module.exports=adminRoute;//exporting admin routes

