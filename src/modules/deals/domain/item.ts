import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { DBConnection } from "../../../lib/db";
import { IItem } from "../dto/create-deal-request";

@Entity({ name: "item" })
class Item extends DBConnection {
  @PrimaryGeneratedColumn()
  id?: string;

  @Column()
  dealId?: string;

  @Column()
  name?: string;

  @Column()
  price?: number;

  @Column()
  qty?: number;

  @Column()
  avlQty?: number;

  constructor() {
    super();
  }

  static toModel(itemList: IItem[]) {
    return itemList.map((item) => {
      const itemObj = new Item();
      itemObj.name = item.name;
      itemObj.qty = item.qty;
      itemObj.avlQty = item.qty;
      itemObj.price = item.price;
      return itemObj;
    });
  }
}

export { Item };
