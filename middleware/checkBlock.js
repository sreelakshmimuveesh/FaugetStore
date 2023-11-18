function checkLoginStatus(req, res, next) {
    // Check if the user is logged in
    if (req.user && req.user.isLoggedIn === false) {
        // Log the user out immediately
        // You can use your authentication library's logout method
        // For example, if you're using Passport.js:
        req.logout();
    }
    next();
}