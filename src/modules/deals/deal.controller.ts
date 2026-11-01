import { Response, Request, NextFunction } from "express"
import { CreateDealRequest } from "./dto/create-deal-request"
import { DealService } from "./deal.service"
import { UpdateDealRequestDto } from "./dto/update-deal-request"

class DealController {
    createDeal = (req: Request, res: Response, next: NextFunction) => {
       try {
        const dealRequest: CreateDealRequest = req.body
        const dealService = new DealService()
        dealService.createDeal(dealRequest)

        res.status(200)
        res.json({ success: true })
       } catch (error) {
          next(error)
       }
    }

    updateDeal  = (req: Request, res: Response, next: NextFunction) => { 
        try {
            const dealId = req.params.dealId
            const updateDealRequest: UpdateDealRequestDto = req.body
            const dealService = new DealService()
            dealService.updateDeal(dealId, updateDealRequest)
    
            res.status(200)
            res.json({ success: true })
        } catch (error) {
            next(error)
        }
    }
}

export { DealController }
