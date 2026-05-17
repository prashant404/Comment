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
  name: string;
  attribute: string[]; // ✨ NOW AN ARRAY FOR MULTI-SELECT!
  gearloose: string;
  activeScenarios: string[];
  overruleType: "dt" | "or" | "";
  mismatchSS: string;
  bugLink: string;
  extractor: string;
  dashboardSS: string;
  
  userAgents: string[]; 
  
  orIssues: ORIssueType[];
  clSamples: SampleType[];
  historyCondition: string;
  historyReasonSS: string; 
  isAIUOpted: boolean;
  historyAIUOptedSS: string;
  historySamples: SampleType[];
  coverageImproved: string; 
  coverageSS: string; 
  outputFormat: "text" | "markdown";
}