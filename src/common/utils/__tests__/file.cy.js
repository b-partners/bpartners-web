import specTitle from 'cypress-sonarqube-reporter/specTitle';
import * as FileUtils from '../file';

describe(specTitle('FileUtils API'), () => {
  describe('getFilenameMeta', () => {
    it('basic case', () => {
      const _input = 'my file name.pdf';

      const expectedName = 'my file name';
      const expectedExt = 'pdf';

      const { name, ext } = FileUtils.getFilenameMeta(_input);

      expect(name).to.deep.eq(expectedName);
      expect(ext).to.deep.eq(expectedExt);
    });

    it('hard case', () => {
      const _input = 'test.cy.js';

      const expectedName = 'test.cy';
      const expectedExt = 'js';

      const { name, ext } = FileUtils.getFilenameMeta(_input);

      expect(name).to.deep.eq(expectedName);
      expect(ext).to.deep.eq(expectedExt);
    });
  });
});
