import { CreateDealRequest } from "./dto/create-deal-request"
import { DealRepository } from "./repository/deal.repository"
import { Deal } from "./domain/deal"
import { UpdateDealRequestDto } from "./dto/update-deal-request";
import { DealItemRepository } from "./repository/deal-item.repository";
import { Item } from "./domain/item";


class DealService {
    createDeal(dealRequest: CreateDealRequest) {
        const dealRepo = new DealRepository();
        const newDeal = new Deal()
        newDeal.sellerId = dealRequest.sellerId
        newDeal.endTime =dealRequest.endTime
        newDeal.startTime
        
        const dealId =  dealRepo.createDetail(newDeal)



        newDeal.setItems(Item.toModel(dealRequest.items))
        newDeal.setId(dealId)
        const itemRepo = new DealItemRepository()
        itemRepo.createItem(newDeal)
    }

    updateDeal(dealId: string, updatedDealDto: Partial<UpdateDealRequestDto>) {
        const dealRepo = new DealRepository();
        if(updatedDealDto.isDealClosed) {
            return dealRepo.markDealInActive(dealId)
        }

        if(updatedDealDto.endTime) {
            dealRepo.extendDealTime(dealId, updatedDealDto.endTime)
        }

        const itemRepo = new DealItemRepository()
        if(updatedDealDto.items!.length>0) {
            itemRepo.updateItems(dealId, updatedDealDto.items! as Item[])
        }

    }
}

export { DealService}
