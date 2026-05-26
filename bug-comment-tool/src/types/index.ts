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
  
  // ✨ SPLIT USER AGENTS
  userAgentsPrice: string[]; 
  userAgentsAvail: string[];
  
  gearloose: string;
  activeScenarios: string[];
  
  overruleType: "dt" | "or" | "";
  mismatchPriceSS: string;
  mismatchAvailSS: string;
  dashboardPriceSS: string;
  dashboardAvailSS: string;
  bugLink: string;
  extractor: string;
  
  orIssues: ORIssueType[];
  clSamples: SampleType[];
  
  historyCondition: string;
  historyReasonSS: string; 
  isAIUOpted: boolean;
  historyAIUOptedSS: string;
  historySamples: SampleType[];
  
  // ✨ SPLIT HISTORY OVERRIDE USER AGENTS
  historyOverride: boolean;  
  historyAttr: string[];     
  historyUAsPrice: string[];      
  historyUAsAvail: string[];

  coverageImproved: string; 
  coverageSS: string; 
  outputFormat: "text" | "markdown";
}
