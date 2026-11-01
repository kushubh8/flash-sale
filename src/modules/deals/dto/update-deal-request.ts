import { IItem } from "./create-deal-request"

interface UpdateDealRequestDto {
    endTime: number
    items: IItem[]
    isDealClosed: boolean
}


export {UpdateDealRequestDto}
