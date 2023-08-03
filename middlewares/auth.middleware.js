 import AppError from "../utils/error.util.js";
 import  jwt  from "jsonwebtoken";

 const isLoggedIn = async (req, res, next) => {
     const {token} = req.cookies;

     if(!token) {
        return next (new AppError("Unauthenticated, please login again", 401))
    }
    const userDetails = await jwt.verify(token , process.env.JWT_SECRET)

    req.user = userDetails;

    next()

}

const authorizedRoles = (...roles) => async(req, res, next) => {
   const currentUserRole = req.user.role

   if(!roles.includes(currentUserRole)) {
     return next(
        new AppError('You do not have permission to access this route', 400)
     )
   }
   next();
}

const authorizeSubscriber = async (req, res, next) => {
     const subscription = req.user.subscription
     const currentUserRole = req.user.role

     if (currentUserRole !== 'ADMIN' && subscription.status !== 'active') {
           return next(
              new AppError('Please subscribe to access this route!', 403)
           )      
     }

}

export {
    isLoggedIn,
    authorizedRoles,
    authorizeSubscriber
}