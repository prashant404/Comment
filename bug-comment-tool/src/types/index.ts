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
  attribute: string[]; 
  gearloose: string;
  userAgents: string[]; 
  activeScenarios: string[];
  outputFormat: "text" | "markdown";

  // Block A: Overrule
  overruleType: "dt" | "or" | "";
  mismatchSS: string;
  bugLink: string;
  extractor: string;
  dashboardSS: string;
  orIssues: ORIssueType[];
  overruleOverride: boolean; // ✨ NEW
  overruleAttr: string[];    // ✨ NEW
  overruleUAs: string[];     // ✨ NEW

  // Block B: History Mismatches
  historyCondition: string;
  historyReasonSS: string; 
  isAIUOpted: boolean;
  historyAIUOptedSS: string;
  historySamples: SampleType[];
  historyOverride: boolean;  // ✨ NEW
  historyAttr: string[];     // ✨ NEW
  historyUAs: string[];      // ✨ NEW

  // Block C: CL Creation
  clSamples: SampleType[];

  // Block D: Coverage
  coverageImproved: string; 
  coverageSS: string; 
}