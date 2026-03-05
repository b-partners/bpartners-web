
import { areaPictureGETResponse } from "./areaPictureGETResponse";
import { areaPicturePUTResponse } from "./areaPicturePUTResponse";
import { recallAsyncProcess } from "./awaitAsyncProcess.it.cy";
import { dijonAreaPictureGETResponse } from "./dijonAreaPictureGETResponse";
import { dijonAreaPicturePUTResponse } from "./dijonAreaPicturePUTResponse";
import { dijonProspectPUTResponse } from "./dijonProspectPUTResponse";
import { prospect } from "./prospects";

const canvas_cursor_sel = 'annotator-canvas-cursor';

describe('Generate 3D', () => {
  beforeEach(() => {
    cy.realCognitoLogin();
});

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
  cy.dataCy(canvas_cursor_sel).click(592,305, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
}

const printCanvasPixelOnDeveloperTools = () => {
  cy.dataCy(canvas_cursor_sel).then(($canvas: any) => {
    const canvas = $canvas[0]
    canvas.addEventListener('click', (e: any) => {
      console.log(e.offsetX, e.offsetY)
    })
  })
}
  
  it("Generate 3D on 6 Place de la Libération, 21000 Dijon", () => {
    let requestStartTime:any;
    let requestEndTime;
    let totalTime;
    let address = "6 Place de la Libération, 21000 Dijon"
    
    cy.e2eLogin('http://localhost:3000')
    
    cy.get('[name="prospects"]').click();
    cy.contains('Ajouter un prospect').click();

    cy.get('[data-testid="address-auto-complete"]').clear().type(address);
    cy.get('[data-testid="name-field-input"]').clear().type('Doe');

    cy.intercept('PUT', 'accountHolders/**/prospects**', dijonProspectPUTResponse)
    cy.intercept('PUT', 'accounts/**/areaPictures/**', (req) => {
      requestStartTime = Date.now();
      req.reply(dijonAreaPicturePUTResponse)
    }).as('createAreaPicture')
    cy.intercept('GET', 'accounts/**/areaPictures/**', dijonAreaPictureGETResponse)
    cy.intercept('GET', 'accounts/**/files/**/raw**', {fixture:"dijon.jpeg"})


    cy.window().then((win) => {
      win.performance.mark('start');
    });

    cy.contains('Générer l’image').should('be.visible').click();
    
    cy.wait('@createAreaPicture', { timeout: 30000 }).then((interception) => {
      requestEndTime = Date.now();
      const apiResponseTime = requestEndTime - requestStartTime;
      cy.log(`🌐 Temps de réponse API (Get areaPicture image): ${apiResponseTime} ms`);
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.window().then((win) => {
      win.performance.mark('end');
      win.performance.measure('totalTime', 'start', 'end');
      totalTime = win.performance.getEntriesByName('totalTime')[0].duration;
      cy.log(`⏱️ Temps total perçu : ${Math.round(totalTime)} ms`);
      expect(totalTime).to.be.lessThan(30000)
    });

    printCanvasPixelOnDeveloperTools()

    cy.wait(2000)

    createDijonAnnotation()
    
    cy.contains('Passer sur la version 3D').should('be.visible').click();

    cy.intercept('POST', /mercator/, () => {
      requestStartTime = Date.now();
    }).as('pixelConvertion');

    cy.wait('@pixelConvertion', { timeout: 10000 }).then((interception) => {
        requestEndTime = Date.now();
        const apiResponseTime = requestEndTime - requestStartTime;
        cy.log(`🌐 Temps de réponse API (Conversion pixel) : ${apiResponseTime} ms`);
        expect(interception.response.statusCode).to.eq(200);
    });

    cy.get('[data-testid="bp-loader-wrapper"]').should('be.visible')
    cy.intercept('PUT', 'city-jsons/**/process**').as("3DConvertion")

    recallAsyncProcess(Date.now())
  })


  it.only("Generate 3D on 2 Place Bellecour, 69002 Lyon ok", () => {
      let requestStartTime:any;
      let requestEndTime;
      let totalTime;
      
      cy.e2eLogin('http://localhost:3000')

      cy.get('[name="prospects"]').click();
      cy.contains('Ajouter un prospect').click();

      cy.get('[data-testid="address-auto-complete"]').clear().type("address");
      cy.get('[data-testid="name-field-input"]').clear().type('Doe 1');

      cy.intercept('PUT', 'accountHolders/**/prospects**', prospect)
      cy.intercept('PUT', 'accounts/**/areaPictures/**', (req) => {
        requestStartTime = Date.now();
        req.reply(areaPicturePUTResponse)
      }).as('createAreaPicture')
      cy.intercept('GET', 'accounts/**/areaPictures/**', areaPictureGETResponse)
      cy.intercept('GET', 'accounts/**/files/**/raw**', {fixture:"raw.jpeg"})

      cy.window().then((win) => {
        win.performance.mark('start');
      });

      cy.contains('Générer l’image').should('be.visible').click();
      
      cy.wait('@createAreaPicture', { timeout: 30000 }).then((interception) => {
        requestEndTime = Date.now();
        const apiResponseTime = requestEndTime - requestStartTime;
        cy.log(`🌐 Temps de réponse API (Get areaPicture image): ${apiResponseTime} ms`);
        expect(interception.response.statusCode).to.eq(200);
      });

      cy.window().then((win) => {
        win.performance.mark('end');
        win.performance.measure('totalTime', 'start', 'end');
        totalTime = win.performance.getEntriesByName('totalTime')[0].duration;
        cy.log(`⏱️ Temps total perçu : ${Math.round(totalTime)} ms`);
        expect(totalTime).to.be.lessThan(30000)
      });

      cy.wait(2000)

      createLyonAnnotation()
      
      cy.contains('Passer sur la version 3D').should('be.visible').click();

      cy.intercept('POST', /mercator/, () => {
        requestStartTime = Date.now();
      }).as('pixelConvertion');

      cy.wait('@pixelConvertion', { timeout: 10000 }).then((interception) => {
          requestEndTime = Date.now();
          const apiResponseTime = requestEndTime - requestStartTime;
          cy.log(`🌐 Temps de réponse API (Conversion pixel) : ${apiResponseTime} ms`);
          expect(interception.response.statusCode).to.eq(200);
      });

      cy.get('[data-testid="bp-loader-wrapper"]').should('be.visible')
      cy.intercept('PUT', 'city-jsons/**/process**').as("3DConvertion")

      recallAsyncProcess(Date.now())
    });

})