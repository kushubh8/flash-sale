import { DealItemRepository } from "../deals/repository/deal-item.repository";
import { DealRepository } from "../deals/repository/deal.repository";
import { OrderRepository } from "./repository/order.repository";

class UserService {
    claimDeal(dealId: string, itemId: string) {
        const orderRepo = new OrderRepository()
        if (orderRepo.isUserClaimDeal(dealId, itemId)) {
            throw new Error('User already claim deal')
        }

        const dealRepo = new DealRepository()
        if (!dealRepo.isDealActive(dealId)) {
            throw new Error('Deal is expired')
        }

        const dealItemRepo = new DealItemRepository()

        if(!dealItemRepo.isProductAvailable(dealId, itemId)) {
            throw new Error('Product is not available')
        }
        // run in serial transaction 
        orderRepo.bookOrder(dealId, itemId)
        dealItemRepo.updateQty(dealId, itemId)
    }
}

export {UserService}
