import AppError from "../utils/error.util.js";
import { razorpay } from '../server.js'
import User from "../models/user.model.js";

export const getRazorpayApiKey = async (req, res, next) => {
       try {
          res.status().json({
            success: true,
            message: 'Razorpay API key',
            key: process.env.RAZORPAY_KEY_ID
        })
       } catch (e) {
          return next(
            new AppError(e.message, 500)
        )
       }
}

export const buySubscription = async (req, res, next) => {
      try {
         const { id } = req.body;
       const user = await User.findById(id)

       if(!user) {
        return next(
            new AppError('Unauthorized, please login', 500)
        )
       }

       if(user === 'ADMIN') {
          return next(
            new AppError(
                'Admin cannot purchase a subscription', 400
            ) 
          )
       }

       const subscription = await razorpay.subscription.create({
           plan_id: process.env.RAZORPAY_PLAN_ID,
           custome_notify: 1
       })

       user.subscription.id = subscription.id
       user.subscription.status = subscription.status

       await user.save()

       res.status().json({
        success: true,
        message: 'Subscribed successfully',
        subscription_id: subscription.id
    })
      } catch (e) {
         return next(
            new AppError(e.message, 500)
        )
      }
}

export const verifySubscription = async (req, res, next) => {
       try {
        const { id } = req.user;
        const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = req.body;

        const user = await User.findById(id)

       if(!user) {
        return next(
            new AppError('Unauthorized, please login', 500)
        )
       }

       const subscriptionId = user.subscription.id

       const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_ID)
            .update(`${razorpay_payment_id} | ${subscriptionId}`)
            .digest('hex')

        if(generatedSignature !== razorpay_signature) {
             return next(
                new AppError('Payment not verified, please try again', 500)
             )
        }   

        await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        })

        user.subscription.status = 'active';
        await user.save();

        res.status().json({
            success: true,
            message: 'Payment verified successfully',
        })
       } catch (e) {
           return next(
            new AppError(e.message, 500)
        )
       }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const { id } = req.user;

     const user = await User.findById(id)

      if(!user) {
        return next(
            new AppError('Unauthorized, please login', 500)
        )
       }

       if(user === 'ADMIN') {
          return next(
            new AppError(
                'Admin cannot purchase a subscription', 400
            ) 
          )
       }

       const subscriptionId = user.subscription.id

       const subscription = await razorpay.subscriptions.cancel(
         subscriptionId
       )

       user.subscription.status = subscription.status

       await user.save()
    } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
    }
     
}

export const allPayments = async (req, res, next) => {
     try {
        const { count } = req.query;

        const subscriptions = await razorpay.subscriptions.all({
             count: count || 10
        });
  
        res.status().json({
          success: true,
          message: 'All Payments',
          subscriptions
      })
     } catch (e) {
        return next(
            new AppError(e.message, 500)
        )
     }
}