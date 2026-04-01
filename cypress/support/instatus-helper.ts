export type TestResult = {
  testName: string;
  status: 'FINISHED' | 'FAILED' | 'UNAVAILABLE';
  responseTime: number;
};

export type CypressTestResult = { testName: string; status: string; error?: string };

export const cypressTestResult: CypressTestResult[] = [];

export const testResults: TestResult[] = [];

export const recordTestResult = (result: TestResult) => {
  testResults.push(result);
};

export const recordCypressTestResult = (result: CypressTestResult) => {
  cypressTestResult.push(result);
};

const canvas_cursor_sel = 'annotator-canvas-cursor';

export const createLyonAnnotation = () => {
  const converter = (x: number, y: number) => [400 - 38 + x, 200 - 192 + y] as [number, number];
  cy.dataCy(canvas_cursor_sel).click(...converter(293, 192), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(312, 146), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(329, 144), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(354, 151), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(364, 159), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(346, 212), { force: true });
  cy.dataCy(canvas_cursor_sel).click(...converter(293, 192), { force: true });
};

export const createDijonAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
  cy.dataCy(canvas_cursor_sel).click(519, 352, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 288, { force: true });
  cy.dataCy(canvas_cursor_sel).click(592, 305, { force: true });
  cy.dataCy(canvas_cursor_sel).click(557, 368, { force: true });
};

export const createParthenayAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(661, 234, { force: true });
  cy.dataCy(canvas_cursor_sel).click(645, 277, { force: true });
  cy.dataCy(canvas_cursor_sel).click(668, 284, { force: true });
  cy.dataCy(canvas_cursor_sel).click(691, 284, { force: true });
  cy.dataCy(canvas_cursor_sel).click(705, 247, { force: true });
  cy.dataCy(canvas_cursor_sel).click(661, 234, { force: true });
};

export const createCannesAnnotation = () => {
  cy.dataCy(canvas_cursor_sel).click(571, 227, { force: true });
  cy.dataCy(canvas_cursor_sel).click(506, 208, { force: true });
  cy.dataCy(canvas_cursor_sel).click(504, 254, { force: true });
  cy.dataCy(canvas_cursor_sel).click(555, 268, { force: true });
  cy.dataCy(canvas_cursor_sel).click(571, 227, { force: true });
};
