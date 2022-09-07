import { Cache } from '../cache';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

const DUMMY_VALUE = 'dummy value for test';

describe(specTitle('Cache'), () => {
  beforeEach(() => {
    Cache.clear();
  });

  it('can save {key, value} pair', () => {
    const saved = Cache.set('test', DUMMY_VALUE);
    expect(saved).to.be.eq(DUMMY_VALUE);
  });

  it('can get/clear value', () => {
    Cache.set('key1', DUMMY_VALUE);
    Cache.set('key2', DUMMY_VALUE);

    assert.equal(Cache.get('key1'), Cache.get('key2'));

    Cache.clear();

    assert.isNull(Cache.get('key1'));
    assert.isNull(Cache.get('key2'));
  });
});
