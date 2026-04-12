export interface SampleType {
  cds: string;
  lp: string;
  debug: string;
  rating?: string;
  inspector?: string;
}

export interface ORIssueType {
  description: string;
  rating: string;
  inspector: string;
  referenceLP?: string;
}

export interface FormDataType {
  // Global Fields
  name: string;
  attribute: string;
  gearloose: string;
  
  // Activated Scenarios Array
  activeScenarios: string[];

  // Block A: Overrule (DT/OR)
  overruleType: "dt" | "or" | "";
  mismatchSS: string;
  bugLink: string;
  extractor: string;
  dashboardSS: string;
  userAgents: string;
  orIssues: ORIssueType[];

  // Block B: CL Creation
  clSamples: SampleType[];

  // Block C: History Mismatches
  historyReasonSS: string;
  historyAIUOptedSS: string;
  historySamples: SampleType[];

  // Block D: Waiting for Coverage (Standalone)
  coverageImproved: string; 
  coverageSS: string; 
  
  // ✨ Markdown Support
  outputFormat: "text" | "markdown";
}