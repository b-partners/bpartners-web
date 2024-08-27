import { IconTipButton } from '@/common/components';
import { Stack } from '@mui/material';

describe('Test IconTipButton', () => {
  it('Test', () => {
    cy.mount(
      <Stack direction='row'>
        <IconTipButton data-cy='AccountTree' icon='AccountTree' title='This is account tree' />
        <IconTipButton data-cy='BabyChangingStation' icon='BabyChangingStation' title='This is baby changing station' />
      </Stack>
    );

    cy.dataCy('AccountTree').trigger('mouseover');
    cy.contains('This is account tree');

    cy.dataCy('BabyChangingStation').trigger('mouseover');
    cy.contains('This is baby changing station');
  });
});
