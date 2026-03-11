export type TestResult = {
  testName: string;
  status: 'FINISHED' | 'FAILED' | 'UNAVAILABLE';
  responseTime: number;
};

export type CypressTestResult = { testName: string; status: string; error?: string }

export const cypressTestResult: CypressTestResult[] = [];

export const testResults: TestResult[] = [];

export const recordTestResult = (result: TestResult) => {
  testResults.push(result);
};

export const recordCypressTestResult = (result: CypressTestResult) => {
  cypressTestResult.push(result);
};