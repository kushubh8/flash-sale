import { Deal } from "../domain/deal";
import { Item } from "../domain/item";

class DealItemRepository  {
  async  createItem(deal: Deal) {
        // insert into deal table
        const d = new Deal()
        await d.initConnection()

        // d.c
        return '1'
    }

    updateItems(dealId: string, item: Item[]) {
        return true
    }

    isProductAvailable(dealId: string, itemId: string) {
        return true
    }

    updateQty(dealId: string, itemId: string) {
        return true
    }
   
}

export {DealItemRepository}