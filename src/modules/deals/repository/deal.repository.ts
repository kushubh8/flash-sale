import { Deal } from "../domain/deal";

class DealRepository  {
    createDetail(deal: Deal) {
        // insert into deal table
        return '1'
    }

    markDealInActive(dealId: string) {

    }

    extendDealTime(dealId: string, newTime: number) {

    }

    isDealActive(dealId: string) {
        return true
    }
}

export {DealRepository}