import { useDraftAnnotationFilterStore } from '@/common/store';
import { DraftAnnotationFilterBar } from '@/operations/prospects/components';

describe('useDraftAnnotationFilterStore', () => {
  beforeEach(() => {
    useDraftAnnotationFilterStore.getState().resetFilters();
  });

  it('starts with no filters', () => {
    expect(useDraftAnnotationFilterStore.getState().filters).to.deep.eq({});
  });

  it('sets a filter value', () => {
    useDraftAnnotationFilterStore.getState().setFilter('prospectName', 'Doe');
    expect(useDraftAnnotationFilterStore.getState().filters).to.deep.eq({ prospectName: 'Doe' });
  });

  it('keeps other filters when setting one', () => {
    const { setFilter } = useDraftAnnotationFilterStore.getState();
    setFilter('prospectName', 'Doe');
    setFilter('address', 'Paris');
    expect(useDraftAnnotationFilterStore.getState().filters).to.deep.eq({ prospectName: 'Doe', address: 'Paris' });
  });

  it('unsets a filter when given an empty value', () => {
    const { setFilter } = useDraftAnnotationFilterStore.getState();
    setFilter('prospectName', 'Doe');
    setFilter('prospectName', '');
    expect(useDraftAnnotationFilterStore.getState().filters.prospectName).to.be.undefined;
  });

  it('resets all filters', () => {
    const { setFilter, resetFilters } = useDraftAnnotationFilterStore.getState();
    setFilter('prospectName', 'Doe');
    setFilter('address', 'Paris');
    resetFilters();
    expect(useDraftAnnotationFilterStore.getState().filters).to.deep.eq({});
  });
});

describe('DraftAnnotationFilterBar', () => {
  beforeEach(() => {
    useDraftAnnotationFilterStore.getState().resetFilters();
  });

  it('defaults to an editable prospect-name input with no chips', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy^="draft-filter-chip-"]').should('not.exist');
    cy.get('[data-cy="draft-filter-input"]')
      .should('not.be.disabled')
      .and('have.attr', 'type', 'text')
      .and('have.attr', 'placeholder', 'Rechercher un prospect');
  });

  it('lists every configured filter in the type menu', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-prospectName"]').should('contain.text', 'Prospect');
    cy.get('[data-cy="draft-filter-menu-item-address"]').should('contain.text', 'Adresse');
    cy.get('[data-cy="draft-filter-menu-item-creationFrom"]').should('contain.text', 'Créé après le');
    cy.get('[data-cy="draft-filter-menu-item-creationTo"]').should('contain.text', 'Créé avant le');
  });

  it('picking a text filter focuses an editable text input with the right placeholder', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-prospectName"]').click();

    cy.get('[data-cy="draft-filter-input"]')
      .should('not.be.disabled')
      .and('have.attr', 'type', 'text')
      .and('have.attr', 'placeholder', 'Rechercher un prospect')
      .and('be.focused');
  });

  it('commits a text filter into a chip on Enter and clears the input', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-prospectName"]').click();
    cy.get('[data-cy="draft-filter-input"]').type('Jane Doe{enter}');

    cy.get('[data-cy="draft-filter-chip-prospectName"]').should('contain.text', 'Prospect').and('contain.text', 'Jane Doe');
    cy.get('[data-cy="draft-filter-input"]').should('have.value', '').and('be.disabled');
    cy.wrap(null).should(() => {
      expect(useDraftAnnotationFilterStore.getState().filters.prospectName).to.eq('Jane Doe');
    });
  });

  it('does not commit an empty value', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-address"]').click();
    cy.get('[data-cy="draft-filter-input"]').type('{enter}');

    cy.get('[data-cy^="draft-filter-chip-"]').should('not.exist');
    expect(useDraftAnnotationFilterStore.getState().filters.address).to.be.undefined;
  });

  it('picking a date filter prefills a sensible default and reveals the date-picker helper button', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-creationFrom"]').click();

    cy.get('[data-cy="draft-filter-input"]')
      .should('have.attr', 'type', 'datetime-local')
      .and(input => {
        expect((input[0] as HTMLInputElement).value).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
      });
    cy.get('[data-cy="draft-filter-date-picker-button"]').should('be.visible');
  });

  it('commits the default date filter on Enter without retyping it', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-creationFrom"]').click();
    cy.get('[data-cy="draft-filter-input"]').trigger('keydown', { key: 'Enter' });

    cy.get('[data-cy="draft-filter-chip-creationFrom"]').should('be.visible');
    cy.wrap(null).should(() => {
      expect(useDraftAnnotationFilterStore.getState().filters.creationFrom).to.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });
  });

  it('commits the current draft when the search button is clicked', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-prospectName"]').click();
    cy.get('[data-cy="draft-filter-input"]').type('Jane Doe');
    cy.get('[data-cy="draft-filter-search-button"]').click();

    cy.get('[data-cy="draft-filter-chip-prospectName"]').should('contain.text', 'Prospect').and('contain.text', 'Jane Doe');
    cy.wrap(null).should(() => {
      expect(useDraftAnnotationFilterStore.getState().filters.prospectName).to.eq('Jane Doe');
    });
  });

  it('re-opening an already-set filter hides its chip and loads its value for editing', () => {
    useDraftAnnotationFilterStore.getState().setFilter('address', 'Paris');
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-chip-address"]').should('contain.text', 'Adresse').and('contain.text', 'Paris');
    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-address"]').click();

    cy.get('[data-cy="draft-filter-chip-address"]').should('not.exist');
    cy.get('[data-cy="draft-filter-input"]').should('have.value', 'Paris');
  });

  it('removes a chip when its close icon is clicked', () => {
    useDraftAnnotationFilterStore.getState().setFilter('address', 'Paris');
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-chip-remove-address"]').click({ force: true });

    cy.get('[data-cy="draft-filter-chip-address"]').should('not.exist');
    cy.wrap(null).should(() => {
      expect(useDraftAnnotationFilterStore.getState().filters.address).to.be.undefined;
    });
  });

  it('shows French tooltips on the action buttons', () => {
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-search-button"]').trigger('mouseover');
    cy.contains('Rechercher').should('be.visible');
    cy.get('[data-cy="draft-filter-search-button"]').trigger('mouseout');

    cy.get('[data-cy="draft-filter-menu-button"]').trigger('mouseover');
    cy.contains('Choisir un filtre').should('be.visible');
  });

  it('removes the last visible chip on Backspace once the input is empty', () => {
    const { setFilter } = useDraftAnnotationFilterStore.getState();
    setFilter('prospectName', 'Jane');
    setFilter('address', 'Paris');
    cy.mount(<DraftAnnotationFilterBar />);

    cy.get('[data-cy="draft-filter-menu-button"]').click();
    cy.get('[data-cy="draft-filter-menu-item-address"]').click();
    cy.get('[data-cy="draft-filter-input"]').should('have.value', 'Paris').type('{selectall}{backspace}{backspace}');

    cy.get('[data-cy="draft-filter-chip-prospectName"]').should('not.exist');
    cy.wrap(null).should(() => {
      expect(useDraftAnnotationFilterStore.getState().filters.prospectName).to.be.undefined;
      expect(useDraftAnnotationFilterStore.getState().filters.address).to.eq('Paris');
    });
  });
});
