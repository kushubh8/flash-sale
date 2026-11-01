import { DealService } from '../../src/modules/deals/deal.service';
import { DealRepository } from '../../src/modules/deals/repository/deal.repository';
import { DealItemRepository } from '../../src/modules/deals/repository/deal-item.repository';
import { Deal } from '../../src/modules/deals/domain/deal';
import { Item } from '../../src/modules/deals/domain/item';

// Auto-mock the repository modules. The services instantiate the repositories
// with `new` inside their methods, so we point each mock constructor at a
// single shared instance we control, letting us configure return values and
// assert calls without touching a real Postgres.
jest.mock('../../src/modules/deals/repository/deal.repository');
jest.mock('../../src/modules/deals/repository/deal-item.repository');

interface DealRepoMock {
  createDetail: jest.Mock;
  markDealInActive: jest.Mock;
  extendDealTime: jest.Mock;
  isDealActive: jest.Mock;
}

interface ItemRepoMock {
  createItem: jest.Mock;
  updateItems: jest.Mock;
  isProductAvailable: jest.Mock;
  updateQty: jest.Mock;
}

describe('DealService', () => {
  let service: DealService;
  let dealRepo: DealRepoMock;
  let itemRepo: ItemRepoMock;

  beforeEach(() => {
    jest.clearAllMocks();

    dealRepo = {
      createDetail: jest.fn().mockReturnValue('deal-42'),
      markDealInActive: jest.fn(),
      extendDealTime: jest.fn(),
      isDealActive: jest.fn(),
    };
    itemRepo = {
      createItem: jest.fn(),
      updateItems: jest.fn(),
      isProductAvailable: jest.fn(),
      updateQty: jest.fn(),
    };

    (DealRepository as unknown as jest.Mock).mockImplementation(() => dealRepo);
    (DealItemRepository as unknown as jest.Mock).mockImplementation(() => itemRepo);

    service = new DealService();
  });

  describe('createDeal', () => {
    it('builds a deal from the request, persists it, and stores mapped items', () => {
      service.createDeal({
        sellerId: 'seller-1',
        endTime: 100,
        items: [{ name: 'A', price: 10, qty: 3 }],
      });

      // The deal passed to the repository carries the request's sellerId/endTime.
      expect(dealRepo.createDetail).toHaveBeenCalledTimes(1);
      const createdDeal = dealRepo.createDetail.mock.calls[0][0];
      expect(createdDeal).toBeInstanceOf(Deal);
      expect(createdDeal.sellerId).toBe('seller-1');
      expect(createdDeal.endTime).toBe(100);

      // The repository returns an id, which is set back onto the deal before
      // the items are persisted.
      expect(itemRepo.createItem).toHaveBeenCalledTimes(1);
      const persistedDeal = itemRepo.createItem.mock.calls[0][0];
      expect(persistedDeal).toBeInstanceOf(Deal);
      expect(persistedDeal.id).toBe('deal-42');
      expect(persistedDeal.items).toHaveLength(1);
      expect(persistedDeal.items[0]).toBeInstanceOf(Item);
      expect(persistedDeal.items[0].name).toBe('A');
      expect(persistedDeal.items[0].qty).toBe(3);
      expect(persistedDeal.items[0].avlQty).toBe(3); // Item.toModel seeds avlQty from qty
    });

    it('maps every item in the request, in order', () => {
      service.createDeal({
        sellerId: 'seller-1',
        endTime: 50,
        items: [
          { name: 'A', price: 10, qty: 3 },
          { name: 'B', price: 5, qty: 1 },
        ],
      });

      const persistedDeal = itemRepo.createItem.mock.calls[0][0];
      expect(persistedDeal.items.map((i: Item) => i.name)).toEqual(['A', 'B']);
    });
  });

  describe('updateDeal', () => {
    it('closes the deal (marks inactive) when isDealClosed is true', () => {
      service.updateDeal('deal-1', { isDealClosed: true });

      expect(dealRepo.markDealInActive).toHaveBeenCalledTimes(1);
      expect(dealRepo.markDealInActive).toHaveBeenCalledWith('deal-1');
      // Closing short-circuits: no time extension, no item update.
      expect(dealRepo.extendDealTime).not.toHaveBeenCalled();
      expect(itemRepo.updateItems).not.toHaveBeenCalled();
    });

    it('extends the end time but does not replace items when items is empty', () => {
      service.updateDeal('deal-1', { endTime: 200, items: [] });

      expect(dealRepo.extendDealTime).toHaveBeenCalledTimes(1);
      expect(dealRepo.extendDealTime).toHaveBeenCalledWith('deal-1', 200);
      expect(itemRepo.updateItems).not.toHaveBeenCalled();
    });

    it('replaces items without extending the end time when only items are provided', () => {
      service.updateDeal('deal-1', { items: [{ name: 'A', price: 10, qty: 2 }] });

      expect(dealRepo.extendDealTime).not.toHaveBeenCalled();
      expect(itemRepo.updateItems).toHaveBeenCalledTimes(1);
      expect(itemRepo.updateItems.mock.calls[0][0]).toBe('deal-1');
      expect(itemRepo.updateItems.mock.calls[0][1]).toEqual([
        { name: 'A', price: 10, qty: 2 },
      ]);
    });

    it('extends the end time and replaces items when both are provided', () => {
      service.updateDeal('deal-1', {
        endTime: 200,
        items: [{ name: 'A', price: 10, qty: 2 }],
      });

      expect(dealRepo.extendDealTime).toHaveBeenCalledWith('deal-1', 200);
      expect(itemRepo.updateItems).toHaveBeenCalledWith('deal-1', [
        { name: 'A', price: 10, qty: 2 },
      ]);
    });

    it('throws when items is undefined, because the service reads items.length directly', () => {
      // This is real, documented behaviour: the non-null assertion is erased at
      // runtime, so an undefined items array raises a TypeError.
      expect(() =>
        service.updateDeal('deal-1', { endTime: 200 } as never),
      ).toThrow(TypeError);

      // The endTime branch runs before the items access, so the extension fires.
      expect(dealRepo.extendDealTime).toHaveBeenCalledWith('deal-1', 200);
    });

    it('forwards the dealId to the repository with no existence check', () => {
      // The repository layer is a stub and performs no existence validation,
      // so updating a (non-existent) deal id still forwards that id.
      service.updateDeal('does-not-exist', { isDealClosed: true });

      expect(dealRepo.markDealInActive).toHaveBeenCalledWith('does-not-exist');
    });
  });
});
