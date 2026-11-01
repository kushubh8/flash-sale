import { Item } from '../../src/modules/deals/domain/item';
import { Deal } from '../../src/modules/deals/domain/deal';
import { IItem } from '../../src/modules/deals/dto/create-deal-request';

describe('Item.toModel (pure domain logic)', () => {
  it('maps each IItem to an Item, copying qty into avlQty', () => {
    const items: IItem[] = [
      { name: 'A', price: 10, qty: 3 },
      { name: 'B', price: 5, qty: 1 },
    ];

    const result = Item.toModel(items);

    expect(result).toHaveLength(2);
    expect(result[0]).toBeInstanceOf(Item);
    expect(result[0].name).toBe('A');
    expect(result[0].price).toBe(10);
    expect(result[0].qty).toBe(3);
    expect(result[0].avlQty).toBe(3); // avlQty is seeded from qty
    // toModel does not assign id or dealId
    expect(result[0].id).toBeUndefined();
    expect(result[0].dealId).toBeUndefined();

    expect(result[1]).toBeInstanceOf(Item);
    expect(result[1].name).toBe('B');
    expect(result[1].price).toBe(5);
    expect(result[1].qty).toBe(1);
    expect(result[1].avlQty).toBe(1);
  });

  it('preserves the input order of items', () => {
    const items: IItem[] = [
      { name: 'first', price: 1, qty: 1 },
      { name: 'second', price: 2, qty: 2 },
      { name: 'third', price: 3, qty: 3 },
    ];
    const result = Item.toModel(items);
    expect(result.map((i) => i.name)).toEqual(['first', 'second', 'third']);
  });

  it('returns an empty array for an empty input', () => {
    expect(Item.toModel([])).toEqual([]);
  });
});

describe('Deal (pure domain logic)', () => {
  it('initializes items to an empty array', () => {
    const deal = new Deal();
    expect(deal.items).toEqual([]);
  });

  it('setItems replaces the items collection in place', () => {
    const deal = new Deal();
    const items = Item.toModel([{ name: 'A', price: 10, qty: 2 }]);

    deal.setItems(items);

    expect(deal.items).toBe(items);
    expect(deal.items).toHaveLength(1);
    expect(deal.items[0].name).toBe('A');
  });

  it('setId sets the deal id', () => {
    const deal = new Deal();
    expect(deal.id).toBeUndefined();

    deal.setId('9');

    expect(deal.id).toBe('9');
  });
});
