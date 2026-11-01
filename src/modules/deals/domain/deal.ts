import { DBConnection } from "../../../lib/db"
import { Item } from "./item"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ name: 'deal' })
class Deal extends DBConnection {
  @PrimaryGeneratedColumn()
  id?: string

  @Column()
  sellerId?: string

  @Column()
  endTime?: number


  @Column()
  startTime?: number


  items: Item[] = []
  constructor() {
    super()
  }

  setItems(items: Item[]) {
    this.items = items
  }

  setId(id: string) {
    this.id = id
  }
}



export {
  Deal
}
