import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { DBConnection } from "../../../lib/db"



@Entity({name: 'order'})
class OrderModel  extends DBConnection{
    @PrimaryGeneratedColumn()
    id?: number

    @Column()
    dealId?: string

    @Column()
    itemId?: string


}
export {OrderModel}
