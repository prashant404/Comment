import type { FormDataType } from "../types/index";

// 🧠 Smart Helper: Automatically adds https:// to links if the user forgot it
const formatURL = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  
  // Don't format empty strings, short text, or things without a dot (like "NA")
  if (trimmed === "" || trimmed.length < 4 || !trimmed.includes(".")) return trimmed;
  
  // If it doesn't start with http:// or https://, add it!
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const generateComment = (rawData: FormDataType): string => {
  
  // 1. Intercept and format all URLs cleanly before generating the comment
  const data: FormDataType = {
    ...rawData,
    gearloose: formatURL(rawData.gearloose),
    mismatchSS: formatURL(rawData.mismatchSS),
    bugLink: formatURL(rawData.bugLink),
    extractor: formatURL(rawData.extractor),
    dashboardSS: formatURL(rawData.dashboardSS),
    historyReasonSS: formatURL(rawData.historyReasonSS),
    historyAIUOptedSS: formatURL(rawData.historyAIUOptedSS),
    coverageSS: formatURL(rawData.coverageSS),
    // Notice: We correctly removed coverageDashboardSS here to fix the build error!
    orIssues: rawData.orIssues.map(i => ({...i, referenceLP: formatURL(i.referenceLP)})),
    historySamples: rawData.historySamples.map(s => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)})),
    clSamples: rawData.clSamples.map(s => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)}))
  };

  const { activeScenarios } = data;
  let commentBody = "";

  // -------------------------------------------------------------
  // SCENARIO D: WAITING FOR COVERAGE (Standalone)
  // -------------------------------------------------------------
  if (activeScenarios.includes("coverage")) {
    let coverageStatement = data.coverageImproved === "improved" 
      ? "Moreover, the coverage has improved to some extent but not reached the threshold.\n" 
      : "Waiting for the coverage to be reflected on the dashboard.\n";

    return `Hi,

The overruling has been carried out and script is now trusted for ${data.attribute}. 
Gearloose: ${data.gearloose}

${coverageStatement}Current coverage: ${data.coverageSS}

I will update once the coverage reaches the threshold.

Thanks,
${data.name}`;
  }

  // -------------------------------------------------------------
  // CASE 4: COMBINED OVERRULE + HISTORY MISMATCH
  // -------------------------------------------------------------
  if (activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        historySampleText += `CDS: ${s.cds}\nLP: ${s.lp}\nSS(AIU Opted): ${data.historyAIUOptedSS}\nDebug: ${s.debug}\n\n`;
      }
    });

    commentBody += `After analyzing the merchant, it has been observed that script for ${data.attribute} is distrusted for all user agents due to mismatches in ${data.attribute} which needs to be overruled also here are high percentage of history mismatches for ${data.attribute} leading to ‘BASE_${data.attribute.toUpperCase()}_DISTRUST_THRESHOLD_REACHED’, where ${data.attribute} given in feed differs from ${data.attribute} present on landing page and script is extracting ${data.attribute} as per landing page Moreover, AIU is opted for ${data.attribute}.

Gearloose: ${data.gearloose}
Mismatches(${data.attribute}): ${data.mismatchSS}

Overruling Bug(${data.bugLink || ""}) has been raised for mismatches in ${data.attribute}.

Reason: ${data.historyReasonSS}
Sample:
${historySampleText}I will update once the overruling has been done and the script gets trusted for ${data.attribute}.\n\n`;
  } 
  
  // -------------------------------------------------------------
  // CASE 1: OVERRULE ONLY (DT or OR)
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule")) {
    if (data.overruleType === "dt") {
      commentBody += `After analyzing the merchant, the following mismatches have been encountered:
Gearloose: ${data.gearloose}

Mismatches(${data.attribute}): ${data.mismatchSS}

However, overruling bug (${data.bugLink}) has been raised for the mismatches in ${data.attribute}. I will update once overruling has been done.\n\n`;
    } else if (data.overruleType === "or") {
      
      let issuesText = "";
      data.orIssues.forEach((issue) => {
        issuesText += `Issue: ${issue.description}\n`;
        if (issue.rating) issuesText += `Rating: ${issue.rating}\n`;
        if (issue.inspector) issuesText += `Inspector: ${issue.inspector}\n`;
        if (issue.referenceLP) issuesText += `Reference LP: ${issue.referenceLP}\n`;
        issuesText += "\n";
      });

      commentBody += `Gearloose: ${data.gearloose}
Extractor: ${data.extractor}

${issuesText}Mismatches(${data.attribute}): ${data.mismatchSS}
Dashboard(Agoraphile extractions): ${data.dashboardSS}

Please overrule similar mismatches for ${data.userAgents || "_______"} user agents.\n\n`;
    }
  }

  // -------------------------------------------------------------
  // CASE 3: HISTORY MISMATCH ONLY
  // -------------------------------------------------------------
  else if (activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        historySampleText += `CDS: ${s.cds}\nLP: ${s.lp}\nDebug: ${s.debug}\n\n`;
      }
    });

    commentBody += `After analyzing the merchant, it has been observed that script for ${data.attribute} is distrusted for all/specefic as here are high percentage of history mismatches leading to ___, where ${data.attribute} given in feed differs from ${data.attribute} present on landing page and script is extracting ${data.attribute} as per landing page Moreover, AIU is opted for ${data.attribute}.
Gearloose: ${data.gearloose}
Reason: ${data.historyReasonSS}
Sample:
${historySampleText}AIU opted(SS): ${data.historyAIUOptedSS}\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 2: CL CREATION
  // -------------------------------------------------------------
  if (activeScenarios.includes("cl")) {
    let clSampleText = "";
    data.clSamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        clSampleText += `CDS: ${s.cds}\nLP: ${s.lp}\nDebug: ${s.debug}\nRating: ${s.rating || ""}\nInspector: ${s.inspector || ""}\n\n`;
      }
    });

    if (commentBody !== "") {
      commentBody += `Furthermore, regarding CL Creation:\n`;
    } else {
      commentBody += `After analyzing the merchant, few issues have been encountered:\n\nGearloose: ${data.gearloose}\n\n`;
    }

    commentBody += `Sample for reference:\n${clSampleText}`;
    commentBody += `Due to above mentioned issues the crawzall is currently not trusted for ${data.attribute}.\n`;
    commentBody += `Moreover, the script is under modification for aforementioned issues.\nI will update here once the new version of crawzall gets reflected on gearloose.\n\n`;
  }

  return `Hi,\n\n${commentBody}Thanks,\n${data.name}`;
};