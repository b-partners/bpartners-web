import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { emptyToNull } from '../empty-to-null';

const expected = {
  test1: null,
  test2: 'should not null',
  testObj: {
    test1: null,
    test2: 'should not null',
  },
};

describe(specTitle('Empty string to null'), () => {
  it('', () => {
    const toTest = {
      test1: '',
      test2: 'should not null',
      testObj: {
        test1: '',
        test2: 'should not null',
      },
    };

    assert.deepEqual(emptyToNull(toTest), expected);
  });
});
