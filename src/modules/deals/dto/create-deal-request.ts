interface CreateDealRequest {
    endTime: number
    items: IItem[]
    sellerId: string
}

interface IItem {
    name: string
    price: number
    qty: number
}

export {CreateDealRequest, IItem}