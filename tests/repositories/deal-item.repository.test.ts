import { DBConnection } from '../../src/lib/db';
import { DealItemRepository } from '../../src/modules/deals/repository/deal-item.repository';
import { Deal } from '../../src/modules/deals/domain/deal';

describe('DealItemRepository.createItem', () => {
  beforeEach(() => {
    // initConnection() only calls DataSource.initialize() when
    // DBConnection.appDataSource is falsy. Caching a truthy stub short-circuits
    // the connection attempt, so createItem can run with no real Postgres.
    DBConnection.appDataSource = {} as never;
  });

  afterEach(() => {
    // Reset the cached datasource so it cannot leak into other tests.
    DBConnection.appDataSource = undefined;
  });

  it('resolves to "1" without a database when appDataSource is already cached', async () => {
    const repo = new DealItemRepository();

    await expect(repo.createItem({} as Deal)).resolves.toBe('1');
  });
});
