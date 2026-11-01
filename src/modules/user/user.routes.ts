import Express, { Router } from 'express'
import { UserController } from './user.controller'

const userRoutes = Express.Router()

const userController = new UserController()
userRoutes.put('/', userController.signup)
userRoutes.post('/claim-deal', userController.claimDeal)


export {userRoutes}