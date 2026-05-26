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
  
  // ✨ THESE ARRAYS ARE WHAT VERCEL WAS MISSING!
  attribute: string[]; 
  userAgents: string[]; 
  
  gearloose: string;
  activeScenarios: string[];
  overruleType: "dt" | "or" | "";
  mismatchSS: string;
  bugLink: string;
  extractor: string;
  dashboardSS: string;
  
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
