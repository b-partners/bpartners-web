
import { recallAsyncProcess } from "./awaitAsyncProcess.it.cy";

const canvas_cursor_sel = 'annotator-canvas-cursor';

const createLyonAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(467, 294, { force: true });
  cy.dataCy(canvas_cursor_sel).click(515, 311, { force: true });
  cy.dataCy(canvas_cursor_sel).click(543, 248, { force: true });
  cy.dataCy(canvas_cursor_sel).click(495, 228, { force: true });
  cy.dataCy(canvas_cursor_sel).click(467, 294, { force: true });
}

const createDijonAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
  cy.dataCy(canvas_cursor_sel).click(519, 352, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 288, { force: true });
  cy.dataCy(canvas_cursor_sel).click(592, 305, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
}

const testCases = [
  {
    name: "Generate 3D on 6 Place de la Libération, 21000 Dijon",
    address: "6 Place de la Libération, 21000 Dijon",
    annotation: createDijonAnnotation,
    imageFixture: "dijon.jpeg",
  },
  {
    name: "Generate 3D on 2 Place Bellecour, 69002 Lyon",
    address: "2 Place Bellecour, 69002 Lyon",
    annotation: createLyonAnnotation,
    imageFixture: "raw.jpeg",
  }
];

const printCanvasPixelOnDeveloperTools = () => {
  cy.dataCy(canvas_cursor_sel).then(($canvas: any) => {
    const canvas = $canvas[0]
    canvas.addEventListener('click', (e: any) => {
      console.log(e.offsetX, e.offsetY)
    })
  })
}

describe('Generate 3D', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
    cy.e2eLogin('http://localhost:3000')
  });

  testCases.forEach((testCase) => {

    it(`on ${testCase.name}`, () => {
      let requestStartTime: any;
      let requestEndTime;

      cy.get('[name="prospects"]').click();
      cy.contains('Ajouter un prospect').click();

      cy.get('[data-testid="address-auto-complete"]').clear().type(testCase.address);
      cy.get('[data-testid="name-field-input"]').clear().type('Doe');


      cy.intercept('PUT', 'accounts/**/areaPictures/**', () => {
        requestStartTime = Date.now();
      }).as('createAreaPicture');
      
      cy.contains('Générer l’image').should('be.visible').click();

      cy.wait('@createAreaPicture', { timeout: 30000 }).then((interception) => {
        requestEndTime = Date.now();
        const apiResponseTime = requestEndTime - requestStartTime;
        cy.log(`Temps de récupération de l'image: ${apiResponseTime} ms`);
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.wait(3000)

      testCase.annotation();
    
      cy.intercept('POST', 'mercator**', () => {
        requestStartTime = Date.now();
      }).as('pixelConvertion');

      cy.intercept('PUT', 'city-jsons/**/process**').as("3DConvertion");

      cy.contains('Passer sur la version 3D')
        .should('be.visible')
        .click();

      cy.wait('@pixelConvertion', { timeout: 10000 }).then((interception) => {
        requestEndTime = Date.now();
        const apiResponseTime = requestEndTime - requestStartTime;

        cy.log(`Conversion pixel : ${apiResponseTime} ms`);
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.get('[data-testid="bp-loader-wrapper"]').should('be.visible');

      recallAsyncProcess(Date.now()).then((responseTime) => {
        cy.log(`Temps total conversion 3D : ${responseTime} ms`);

        expect(responseTime).to.be.lessThan(130000);
      });
    });
  });

})