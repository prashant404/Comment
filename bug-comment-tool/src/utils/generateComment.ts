import type { FormDataType, SampleType } from "../types/index";

// 🧠 Smart Helper: Automatically adds https:// to links if the user forgot it
const formatURL = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  
  if (trimmed === "" || trimmed.length < 4 || !trimmed.includes(".")) return trimmed;
  
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

export const generateComment = (rawData: FormDataType): string => {
  
  // 1. Intercept and format all URLs cleanly
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
    orIssues: rawData.orIssues.map(i => ({...i, referenceLP: formatURL(i.referenceLP)})),
    historySamples: rawData.historySamples.map(s => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)})),
    clSamples: rawData.clSamples.map(s => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)}))
  };

  const { activeScenarios, outputFormat } = data;
  const isMd = outputFormat === "markdown";

  // ✨ Smart Link Builders
  const link = (label: string, url: string) => {
    if (!url) return "";
    return isMd ? `[${label}](${url})` : `${label}: ${url}`;
  };

  // ✨ Groups CDS, LP, and Debug onto a SINGLE line!
  const getSampleLinksOnOneLine = (s: SampleType) => {
    const parts = [];
    if (s.cds) parts.push(link('CDS', s.cds));
    if (s.lp) parts.push(link('LP', s.lp));
    if (s.debug) parts.push(link('Debug', s.debug));
    // Uses spaces for Markdown, or a neat | pipe for plain text
    return parts.join(isMd ? "   " : " | ");
  };

  let commentBody = "";

  // -------------------------------------------------------------
  // SCENARIO D: WAITING FOR COVERAGE (Standalone)
  // -------------------------------------------------------------
  if (activeScenarios.includes("coverage")) {
    let coverageStatement = data.coverageImproved === "improved" 
      ? "Moreover, the coverage has improved to some extent but not reached the threshold.\n" 
      : "Waiting for the coverage to be reflected on the dashboard.\n";

    commentBody = `The overruling has been carried out and script is now trusted for ${data.attribute}.\n${link('Gearloose', data.gearloose)}\n\n${coverageStatement}Current coverage: ${isMd ? `[SS](${data.coverageSS})` : data.coverageSS}\n\nI will update once the coverage reaches the threshold.\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 4: COMBINED OVERRULE + HISTORY MISMATCH
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        historySampleText += `${getSampleLinksOnOneLine(s)}\n`;
      }
    });

    commentBody += `After analyzing the merchant, it has been observed that script for ${data.attribute} is distrusted for all user agents due to mismatches in ${data.attribute} which needs to be overruled also here are high percentage of history mismatches for ${data.attribute} leading to ‘BASE_${data.attribute.toUpperCase()}_DISTRUST_THRESHOLD_REACHED’, where ${data.attribute} given in feed differs from ${data.attribute} present on landing page and script is extracting ${data.attribute} as per landing page Moreover, AIU is opted for ${data.attribute}.\n\n${link('Gearloose', data.gearloose)}\n${link(`Mismatches(${data.attribute})`, data.mismatchSS)}\n\n${isMd ? `[Overruling Bug](${data.bugLink})` : `Overruling Bug(${data.bugLink || ""})`} has been raised for mismatches in ${data.attribute}.\n\n${link('Reason', data.historyReasonSS)}\nSample:\n${historySampleText}${link('AIU Opted(SS)', data.historyAIUOptedSS)}\n\nI will update once the overruling has been done and the script gets trusted for ${data.attribute}.\n\n`;
  } 
  
  // -------------------------------------------------------------
  // CASE 1: OVERRULE ONLY (DT or OR)
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule")) {
    if (data.overruleType === "dt") {
      commentBody += `After analyzing the merchant, the following mismatches have been encountered:\n${link('Gearloose', data.gearloose)}\n\n${link(`Mismatches(${data.attribute})`, data.mismatchSS)}\n\nHowever, ${isMd ? `[overruling bug](${data.bugLink})` : `overruling bug (${data.bugLink})`} has been raised for the mismatches in ${data.attribute}. I will update once overruling has been done.\n\n`;
    } else if (data.overruleType === "or") {
      
      let issuesText = "";
      data.orIssues.forEach((issue) => {
        issuesText += `Issue: ${issue.description}\n`;
        if (issue.rating && issue.rating.trim() !== "") issuesText += `Rating: ${issue.rating}\n`;
        if (issue.inspector && issue.inspector.trim() !== "") issuesText += `Inspector: ${issue.inspector}\n`;
        if (issue.referenceLP && issue.referenceLP.trim() !== "") issuesText += `${link('Reference LP', issue.referenceLP)}\n`;
        issuesText += "\n";
      });

      commentBody += `${link('Gearloose', data.gearloose)}\n${link('Extractor', data.extractor)}\n\n${issuesText}${link(`Mismatches(${data.attribute})`, data.mismatchSS)}\n${link('Dashboard(Agoraphile extractions)', data.dashboardSS)}\n\nPlease overrule similar mismatches for ${data.userAgents || "_______"} user agents.\n\n`;
    }
  }

  // -------------------------------------------------------------
  // CASE 3: HISTORY MISMATCH ONLY
  // -------------------------------------------------------------
  else if (activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        historySampleText += `${getSampleLinksOnOneLine(s)}\n`;
      }
    });

    commentBody += `After analyzing the merchant, it has been observed that script for ${data.attribute} is distrusted for all/specefic as here are high percentage of history mismatches leading to ___, where ${data.attribute} given in feed differs from ${data.attribute} present on landing page and script is extracting ${data.attribute} as per landing page Moreover, AIU is opted for ${data.attribute}.\n\n${link('Gearloose', data.gearloose)}\n${link('Reason', data.historyReasonSS)}\nSample:\n${historySampleText}${link('AIU opted(SS)', data.historyAIUOptedSS)}\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 2: CL CREATION
  // -------------------------------------------------------------
  if (activeScenarios.includes("cl")) {
    let clSampleText = "";
    data.clSamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        clSampleText += `${getSampleLinksOnOneLine(s)}\n`;
        if (s.rating && s.rating.trim() !== "") clSampleText += `Rating: ${s.rating}\n`;
        if (s.inspector && s.inspector.trim() !== "") clSampleText += `Inspector: ${s.inspector}\n`;
        clSampleText += `\n`;
      }
    });

    if (commentBody !== "") {
      commentBody += `Furthermore, regarding CL Creation:\n\n`;
    } else {
      commentBody += `After analyzing the merchant, few issues have been encountered:\n\n${link('Gearloose', data.gearloose)}\n\n`;
    }

    commentBody += `Sample for reference:\n${clSampleText}Due to above mentioned issues the crawzall is currently not trusted for ${data.attribute}.\nMoreover, the script is under modification for aforementioned issues.\nI will update here once the new version of crawzall gets reflected on gearloose.\n\n`;
  }

  // Final comment assembly
  let finalComment = `Hi,\n\n${commentBody}Thanks,\n${data.name}`;

  // ✨ MARKDOWN LINE-BREAK ENFORCER:
  if (isMd) {
    finalComment = finalComment.split('\n').map(line => {
      // Append '\' tightly to the end of any line that actually has text
      if (line.trim().length > 0 && !line.trim().endsWith('\\')) {
        return `${line.trimEnd()} \\`;
      }
      return line;
    }).join('\n');
  }

  return finalComment;
};