import Express, { Router } from 'express'
import { DealController } from './deal.controller'

const dealRoutes = Express.Router()

const dealController = new DealController()
dealRoutes.put('/', dealController.createDeal)
dealRoutes.post('/:dealId', dealController.updateDeal)

export {dealRoutes}