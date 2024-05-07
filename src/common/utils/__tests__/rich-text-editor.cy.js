import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { EditorState } from 'draft-js';
import { FormProvider, useForm } from 'react-hook-form';
import RichTextEditor from '../../components/RichTextEditor';

const RichTextEditorComponent = () => {
  const form = useForm({ mode: 'all', defaultValues: { message: EditorState.createEmpty() } });
  return (
    <FormProvider {...form}>
      <RichTextEditor name='message' />
    </FormProvider>
  );
};

describe(specTitle('RichTextEditor'), () => {
  const field = '.public-DraftEditor-content';
  const content = '.public-DraftStyleDefault-block';
  const bold = '[data-testid="Bold"]';
  const italic = '[data-testid="Italic"]';
  const strikethrough = '[data-testid="Strikethrough"]';
  const code = '[data-testid="Code Block"]';
  const ul = '[data-testid="UL"]';
  const ol = '[data-testid="OL"]';

  beforeEach(() => {
    mount(<RichTextEditorComponent />);
  });

  it('should render the editor', () => {
    cy.get(bold).should('be.visible');
    cy.get(italic).should('be.visible');
    cy.get(strikethrough).should('be.visible');
    cy.get(code).should('be.visible');
    cy.get(ul).should('be.visible');
    cy.get(ol).should('be.visible');
  });

  it('should type', () => {
    cy.get(field).type('Hello cypress !'); // field
    cy.get(content).contains('Hello cypress !'); // output
  });

  it('should allow inline styling', () => {
    cy.get(field).type('Hello cypress !{selectall}');
    cy.get(strikethrough).click().should('have.css', 'background-color');
  });

  it('should allow block styling', () => {
    cy.get(ul).click();
    cy.get(field).type('one{enter}two');
    cy.get('.public-DraftStyleDefault-ul').should('be.visible');
  });
});
