
const isLogin=async(req,res,next)=>{
    try {
          if(req.session.user_id){
            next();

          }else{
            res.redirect('/login');
          }
         

    } catch (error) {
        console.log(error.message);
    }
}


const isLogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/userhome');
        }
        next();  
    } catch (error) {
        console.log(error.message);
    }
}


const isAdminLogin=async(req,res,next)=>{
    try {
          if(req.session.admin_id){
            next();
          }else{
            res.redirect('/admin/login');
          }
         

    } catch (error) {
        console.log(error.message);
    }
}


const isAdminLogout=async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/productDisplay');
        }
        next();  
    } catch (error) {
        console.log(error.message);
    }
}





module.exports={
    isLogin,
    isLogout,
    isAdminLogin,
    isAdminLogout
}