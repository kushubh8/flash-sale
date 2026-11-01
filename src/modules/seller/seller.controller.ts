import { Response, Request } from "express"

class SellerController {
    signup = (req: Request, res: Response) => {
        let sellerEmail = req.body.email
        res.status(200)
        res.json({ email: sellerEmail, id:123 })
    }
}

export { SellerController }