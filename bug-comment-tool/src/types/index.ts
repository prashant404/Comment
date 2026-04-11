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
  isTrustedCL: string; // "yes" or "no"

  // Block C: History Mismatches
  historyReasonSS: string;
  historyAIUOptedSS: string;
  historySamples: SampleType[];

  // Block D: Waiting for Coverage (Standalone)
  coverageStatus: "trusted" | "not_trusted" | "";
  coverageImproved: string; // "improved" or "waiting"
  coverageSS: string; // Swapped from percentage
  coverageDashboardSS: string;
}