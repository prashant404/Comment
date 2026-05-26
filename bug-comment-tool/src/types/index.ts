export interface SampleType {
  cds: string;
  lp: string;
  debug: string;
  rating?: string;
  inspector?: string;
}

export interface ORIssueType {
  attribute: string; 
  description: string;
  mismatchSS: string; 
  rating: string;
  inspector: string;
  referenceLP?: string;
}

export interface FormDataType {
  name: string;
  attribute: string[]; 
  userAgents: string[]; 
  gearloose: string;
  activeScenarios: string[];
  
  // Overrule specific fields
  overruleType: "dt" | "or" | "";
  mismatchPriceSS: string;
  mismatchAvailSS: string;
  dashboardPriceSS: string;
  dashboardAvailSS: string;
  bugLink: string;
  extractor: string;
  
  orIssues: ORIssueType[];
  clSamples: SampleType[];
  
  // History Mismatches
  historyCondition: string;
  historyReasonSS: string; 
  isAIUOpted: boolean;
  historyAIUOptedSS: string;
  historySamples: SampleType[];
  
  // History Override 
  historyOverride: boolean;  
  historyAttr: string[];     
  historyUAs: string[];      

  coverageImproved: string; 
  coverageSS: string; 
  outputFormat: "text" | "markdown";
}
