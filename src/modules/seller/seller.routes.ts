import Express, { Router } from 'express'
import { SellerController } from './seller.controller'

const sellerRoutes = Express.Router()

const sellerController = new SellerController()
sellerRoutes.put('/', sellerController.signup)

export {sellerRoutes}