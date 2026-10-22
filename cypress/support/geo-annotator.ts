/*
  Drawing helpers for the lon/lat annotator the @bpartners/roof-analyser library owns.

  Both drawing surfaces — the pan delimitation and the line alignment — are one SVG laid out in a
  1000-unit canvas, panned and zoomed through its own viewBox. A point is therefore kept as the
  library keeps it: a uv pair in [0, 1] over the whole aerial photo, v counted from the bottom, which
  survives a different viewport, a different zoom and a different run. Replaying it means reading the
  viewBox back off the element and turning that uv into a click offset.
*/

export type GeoUv = [number, number];

export interface GeoPanFixture {
  address: string;
  pans: GeoUv[][];
}

const CANVAS_SIZE = 1000;

export const GEO_PAN_DELIMIT = '[data-testid="geo-pan-delimit"]';
export const GEO_INTERSECTION_ALIGN = '[data-testid="geo-intersection-align"]';

const fixturePathOf = (key: string) => `cypress/fixtures/annotator/${key}.json`;

const viewOf = (svg: SVGSVGElement) => {
  const [x, y, width, height] = (svg.getAttribute('viewBox') ?? '')
    .trim()
    .split(/[\s,]+/)
    .map(Number);
  return { x, y, width, height };
};

const offsetOf = (svg: SVGSVGElement, [u, v]: GeoUv) => {
  const view = viewOf(svg);
  const rect = svg.getBoundingClientRect();
  return {
    x: ((u * CANVAS_SIZE - view.x) / view.width) * rect.width,
    y: (((1 - v) * CANVAS_SIZE - view.y) / view.height) * rect.height,
  };
};

const ringOfPath = (d: string): GeoUv[] => {
  const numbers = (d.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
  const ring: GeoUv[] = [];
  for (let index = 0; index + 1 < numbers.length; index += 2) ring.push([numbers[index] / CANVAS_SIZE, 1 - numbers[index + 1] / CANVAS_SIZE]);
  return ring;
};

const clickUv = (uv: GeoUv) =>
  cy.get(GEO_PAN_DELIMIT).then($svg => {
    const { x, y } = offsetOf($svg[0] as unknown as SVGSVGElement, uv);
    cy.wrap($svg, { log: false }).click(x, y);
  });

/** One pan: every corner, then its first corner again, which is what closes the ring. */
const drawGeoPan = (ring: GeoUv[]) => {
  [...ring, ring[0]].forEach(uv => clickUv(uv));
  cy.get(GEO_PAN_DELIMIT).should('exist');
};

const drawGeoPans = (rings: GeoUv[][]) => {
  rings.forEach(ring => drawGeoPan(ring));
  cy.get(`${GEO_PAN_DELIMIT} .geo-pans-pan`).should('have.length', rings.length);
};

/** The pans standing on the photo right now, read back off their own paths. */
const readGeoPans = () =>
  cy
    .document({ log: false })
    .then(document => [...document.querySelectorAll(`${GEO_PAN_DELIMIT} .geo-pans-pan`)].map(path => ringOfPath(path.getAttribute('d') ?? '')));

/**
 * Hands the browser over, in `cypress open` only, for the one thing no fixture can stand in for. A
 * headless run walks straight past it, and fails right after on the button the missing drawing leaves
 * disabled — which is the honest outcome: that spec has nothing recorded yet.
 */
const geoManualStep = (message: string) => {
  cy.log(`✋ ${message}`);
  if (Cypress.config('isInteractive')) cy.pause();
};

/**
 * The pans of `key`: replayed from `cypress/fixtures/annotator/<key>.json` when it has any, otherwise
 * drawn by hand in `cypress open` and written back into that same file, so the next run replays them.
 */
const geoDrawPans = (key: string) => {
  const path = fixturePathOf(key);
  return cy.readFile<GeoPanFixture>(path).then(fixture => {
    if (fixture.pans.length > 0) {
      drawGeoPans(fixture.pans);
      return cy.wrap(fixture.pans, { log: false });
    }
    geoManualStep(`Tracez les pans de « ${fixture.address} » sur la photo, puis reprenez le test. Ils seront enregistrés dans ${path}.`);
    return readGeoPans().then(pans => {
      if (pans.length === 0) {
        throw new Error(
          `Aucun pan tracé pour « ${fixture.address} ». Lancez ce test avec "npm run cy:open", tracez les pans à la main : ils seront écrits dans ${path}.`
        );
      }
      cy.writeFile(path, { ...fixture, pans });
      return cy.wrap(pans, { log: false });
    });
  });
};

/**
 * The alignment step, which only stands between the tracing and the model when more than one pan was
 * traced — a single pan has nothing to be lined up against and goes straight to the generation.
 */
const geoAlignLines = () => {
  cy.get(GEO_INTERSECTION_ALIGN, { timeout: 300_000 }).should('be.visible');
  cy.contains('Lecture des lignes du toit…').should('not.exist');
  geoManualStep('Alignez les lignes du toit sur la photo, puis reprenez le test.');
  cy.contains('button', 'Valider et modéliser').should('be.enabled').click();
};

Cypress.Commands.add('geoReadPans', readGeoPans);
Cypress.Commands.add('geoDrawPans', geoDrawPans);
Cypress.Commands.add('geoAlignLines', geoAlignLines);
Cypress.Commands.add('geoManualStep', geoManualStep);
