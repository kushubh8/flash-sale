import { UserService } from '../../src/modules/user/user.service';
import { OrderRepository } from '../../src/modules/user/repository/order.repository';
import { DealRepository } from '../../src/modules/deals/repository/deal.repository';
import { DealItemRepository } from '../../src/modules/deals/repository/deal-item.repository';

// Auto-mock every repository the service constructs. Each mock constructor is
// pointed at a shared instance so we can drive return values and assert calls
// without a running Postgres.
jest.mock('../../src/modules/user/repository/order.repository');
jest.mock('../../src/modules/deals/repository/deal.repository');
jest.mock('../../src/modules/deals/repository/deal-item.repository');

interface OrderRepoMock {
  isUserClaimDeal: jest.Mock;
  bookOrder: jest.Mock;
}

interface DealRepoMock {
  isDealActive: jest.Mock;
}

interface ItemRepoMock {
  isProductAvailable: jest.Mock;
  updateQty: jest.Mock;
}

describe('UserService.claimDeal', () => {
  let service: UserService;
  let orderRepo: OrderRepoMock;
  let dealRepo: DealRepoMock;
  let dealItemRepo: ItemRepoMock;

  beforeEach(() => {
    jest.clearAllMocks();

    orderRepo = {
      isUserClaimDeal: jest.fn(),
      bookOrder: jest.fn(),
    };
    dealRepo = {
      isDealActive: jest.fn(),
    };
    dealItemRepo = {
      isProductAvailable: jest.fn(),
      updateQty: jest.fn(),
    };

    (OrderRepository as unknown as jest.Mock).mockImplementation(() => orderRepo);
    (DealRepository as unknown as jest.Mock).mockImplementation(() => dealRepo);
    (DealItemRepository as unknown as jest.Mock).mockImplementation(() => dealItemRepo);

    service = new UserService();
  });

  it('rejects a claim when the user has already claimed the deal item', () => {
    orderRepo.isUserClaimDeal.mockReturnValue(true);

    expect(() => service.claimDeal('deal-1', 'item-1')).toThrow(
      'User already claim deal',
    );

    // The user-already-claimed check is first, so the rest never runs.
    expect(dealRepo.isDealActive).not.toHaveBeenCalled();
    expect(dealItemRepo.isProductAvailable).not.toHaveBeenCalled();
    expect(orderRepo.bookOrder).not.toHaveBeenCalled();
    expect(dealItemRepo.updateQty).not.toHaveBeenCalled();
  });

  it('rejects a claim when the deal is no longer active (expired)', () => {
    orderRepo.isUserClaimDeal.mockReturnValue(false);
    dealRepo.isDealActive.mockReturnValue(false);

    expect(() => service.claimDeal('deal-1', 'item-1')).toThrow('Deal is expired');

    expect(dealItemRepo.isProductAvailable).not.toHaveBeenCalled();
    expect(orderRepo.bookOrder).not.toHaveBeenCalled();
    expect(dealItemRepo.updateQty).not.toHaveBeenCalled();
  });

  it('rejects a claim when the item is sold out (not available)', () => {
    orderRepo.isUserClaimDeal.mockReturnValue(false);
    dealRepo.isDealActive.mockReturnValue(true);
    dealItemRepo.isProductAvailable.mockReturnValue(false);

    expect(() => service.claimDeal('deal-1', 'item-1')).toThrow(
      'Product is not available',
    );

    // Availability fails before any booking, so neither side effect runs.
    expect(orderRepo.bookOrder).not.toHaveBeenCalled();
    expect(dealItemRepo.updateQty).not.toHaveBeenCalled();
  });

  it('books an order and decrements quantity when all checks pass', () => {
    orderRepo.isUserClaimDeal.mockReturnValue(false);
    dealRepo.isDealActive.mockReturnValue(true);
    dealItemRepo.isProductAvailable.mockReturnValue(true);

    expect(() => service.claimDeal('deal-1', 'item-1')).not.toThrow();

    expect(orderRepo.bookOrder).toHaveBeenCalledTimes(1);
    expect(orderRepo.bookOrder).toHaveBeenCalledWith('deal-1', 'item-1');
    expect(dealItemRepo.updateQty).toHaveBeenCalledTimes(1);
    expect(dealItemRepo.updateQty).toHaveBeenCalledWith('deal-1', 'item-1');
  });
});
