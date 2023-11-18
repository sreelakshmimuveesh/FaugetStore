const express=require('express');
const userRoute=express();
const session = require('express-session');


const auth=require('../middleware/auth');//middleware-session

const config=require("../config/config");

//userRoute.use();//session config

//body parser
const bodyParser=require('body-parser');
userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({extended:true}));
userRoute.use(express.json());

//setup ejs
userRoute.set('view engine','ejs');
userRoute.set('views', './views/users');

const userController=require("../controller/userController");//adding controller file
const { blockUser } = require('../controller/adminController');

//setup the routes
userRoute.get('/',userController.landingPage);//landing page

userRoute.get('/productDetail',userController.productDetail);//product detail view

userRoute.get('/new_user',auth.isLogout,userController.loadRegister);//Loading User registration form

userRoute.post('/new_user',userController.insertUsers);//Registering user

//userRoute.get('/verifyOTP',auth.isLogin,userController.otpLoad);//Loading OTP page

userRoute.post('/verifyOTP',userController.verifyOTP);//verify with OTP

userRoute.get('/userHome',auth.isLogin,userController.userHomeLoad);//Loading user home

userRoute.get('/login',auth.isLogout,userController.loginLoad);//Login user

userRoute.post('/login',userController.verifyLogin);//verify user

userRoute.get('/profile',auth.isLogin,userController.loadeditProfile);//user dashboard page

userRoute.get('/userAccount',auth.isLogin,userController.userAccountLoad);

userRoute.post('/profile',userController.editProfile);

userRoute.get('/userCart',auth.isLogin,userController.userCartLoad);

userRoute.post('/userCart',userController.userCart);

//userRoute.get('/updateQuantity',userController.updateQuantity);

userRoute.get('/addToCart',auth.isLogin,userController.addToCart)

userRoute.get('/deleteCart',auth.isLogin,userController.deleteCart);

userRoute.post('/deleteFromCart',userController.deleteFromCart);

userRoute.get('/logout',auth.isLogin,userController.userLogout);//user logout

userRoute.get('/category/girlFashion',userController.girlFashionLoad);

userRoute.get('/category/boyFashion',userController.boyFashionLoad);

userRoute.get('/category/Toys',userController.ToysLoad);

userRoute.get('/category/NewBorn',userController.NewBornLoad);

userRoute.get('/addAddress',auth.isLogin,userController.addDeliveryAddressLoad);

userRoute.post('/addAddress',userController.addDeliveryAddress);

userRoute.get('/deliveryAddress',auth.isLogin,userController.loadEditDelivery);

userRoute.get('/editAddress',auth.isLogin,userController.loadEditDeliveryAddress);

userRoute.post('/editAddress',userController.editDeliveryAddress);

userRoute.get('/deleteAddress',auth.isLogin,userController.deleteAddress);

//userRoute.get('/confirmOrder',auth.isLogin,userController.confirmOrder);

//userRoute.get('/userOrder',auth.isLogin,userController.userOrderLoad);

userRoute.get('/payment',auth.isLogin,userController.paymentLoad);

userRoute.post('/payment',userController.payment);

userRoute.post('/orderAdd',userController.orderAdd);

userRoute.post('/placeOrder',userController.placeOrder);

userRoute.get('/order',auth.isLogin,userController.orderLoad);

userRoute.get('/resetPassword',auth.isLogin,userController.resetPasswordLoad);

userRoute.post('/resetPassword',userController.resetPassword);

userRoute.get('/cancelOrder',auth.isLogin,userController.CancelOrder);


module.exports=userRoute;//exporting user route

