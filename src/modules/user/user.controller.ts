import { Response, Request, NextFunction } from "express"
import { ClaimDealRequest } from "./dto/claim-deal-request"
import { UserService } from "./user.service"

class UserController {
    signup = (req: Request, res: Response) => {
        let user = req.body.email
        res.status(200)
        res.json({ email: user, id:123 })
    }

    claimDeal = (req: Request, res: Response, next: NextFunction) => {
       try {
        let user: ClaimDealRequest = req.body
        const userService  = new UserService()
        userService.claimDeal(user.dealId, user.itemId)
        res.status(200)
        res.json({ success: true })
       } catch (error) {
            next(error)
       }
    }
}

export { UserController }