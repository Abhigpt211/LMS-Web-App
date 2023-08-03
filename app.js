import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { config } from 'dotenv'
import morgan from 'morgan'
import userRoutes from './routes/user.routes.js'
import errorMiddleware from './middlewares/error.middleware.js'
import paymentRoutes from './routes/payment.routes.js'
import courseRoutes from './routes/course.routes.js'
config()

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(cors({
    origin:[process.env.FRONTEND_URL],
    credentials:true
}))

app.use(cookieParser())

app.use(morgan('dev'))

app.use('/ping', (req,res)=>{
    res.send('/Pong')
})

app.use('/api/v1/user', userRoutes)
app.use('/api/v1/courses', courseRoutes)
app.use('/api/v1/payments', paymentRoutes)


app.all('*', (req, res)=>{
    res.status(404).send('OOPS!! 404 page not found')
})

app.use(errorMiddleware);

export default  app