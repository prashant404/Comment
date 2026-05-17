import type { FormDataType, SampleType } from "../types/index";

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

  const { activeScenarios, outputFormat, isAIUOpted, userAgents, attribute } = data;
  const isMd = outputFormat === "markdown";

  // Format Attributes
  const attrString = attribute.join(" and ");

  // ✨ Format User Agents AND Pluralization
  let uaString = "";
  let uaPlural = "user agents"; // Default to plural
  
  if (userAgents.length === 1) {
    uaString = userAgents;
    uaPlural = "user agent"; // Switch to singular!
  } else if (userAgents.length > 1) {
    const last = userAgents[userAgents.length - 1];
    const rest = userAgents.slice(0, -1).join(", ");
    uaString = `${rest} and ${last}`;
  }

  const link = (label: string, url: string) => {
    if (!url) return "";
    return isMd ? `[${label}](${url})` : `${label}: ${url}`;
  };

  const formatSampleLinks = (s: SampleType) => {
    const parts = [];
    if (s.cds) parts.push(link('CDS', s.cds));
    if (s.lp) parts.push(link('LP', s.lp));
    if (s.debug) parts.push(link('Debug', s.debug));
    return parts.join("\n"); 
  };

  let commentBody = "";

  // -------------------------------------------------------------
  // SCENARIO D: WAITING FOR COVERAGE (Standalone)
  // -------------------------------------------------------------
  if (activeScenarios.includes("coverage")) {
    let coverageStatement = data.coverageImproved === "improved" 
      ? "Moreover, the coverage has improved to some extent but not reached the threshold.\n" 
      : "Waiting for the coverage to be reflected on the dashboard.\n";

    commentBody = `The overruling has been carried out and script is now trusted for ${attrString}.\n${link('Gearloose', data.gearloose)}\n\n${coverageStatement}Current coverage: ${isMd ? `[SS](${data.coverageSS})` : data.coverageSS}\n\nI will update once the coverage reaches the threshold.\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 4: COMBINED OVERRULE + HISTORY MISMATCH
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) historySampleText += `${formatSampleLinks(s)}\n`;
    });

    const aiuText = isAIUOpted ? ` However AIU is opted for ${attrString} and feed will get updated.` : "";
    const aiuSS = isAIUOpted ? `${link('SS(Opted)', data.historyAIUOptedSS)}\n` : "";

    // ✨ Injected ${uaPlural}
    commentBody += `After analyzing the merchant it has been observed that script for ${attrString} is distrusted for ${uaString} ${uaPlural} due to mismatches in ${attrString} which needs to be overruled. Also, there are high percentage of history mismatches for ${attrString} where ${attrString} present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.${aiuText}\n\n${link('Gearloose', data.gearloose)}\n${link(`Mismatches(${attrString})`, data.mismatchSS)}\n\n${isMd ? `[Overruling Bug](${data.bugLink})` : `Overruling Bug(${data.bugLink || ""})`} has been raised for mismatches in ${attrString}.\n\n${link('Reason', data.historyReasonSS)}\n\nSample:\n${historySampleText}${aiuSS}\nI will update once the overruling has been done and the script gets trusted for ${attrString}.\n\n`;
  } 
  
  // -------------------------------------------------------------
  // CASE 1: OVERRULE ONLY (DT or OR)
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule")) {
    if (data.overruleType === "dt") {
      commentBody += `After analyzing the merchant, the following mismatches have been encountered:\n${link('Gearloose', data.gearloose)}\n\n${link(`Mismatches(${attrString})`, data.mismatchSS)}\n\nHowever, ${isMd ? `[overruling bug](${data.bugLink})` : `overruling bug (${data.bugLink})`} has been raised for the mismatches in ${attrString}. I will update once overruling has been done.\n\n`;
    } else if (data.overruleType === "or") {
      let issuesText = "";
      data.orIssues.forEach((issue) => {
        issuesText += `Issue: ${issue.description}\n`;
        if (issue.rating && issue.rating.trim() !== "") issuesText += `Rating: ${issue.rating}\n`;
        if (issue.inspector && issue.inspector.trim() !== "") issuesText += `Inspector: ${issue.inspector}\n`;
        if (issue.referenceLP && issue.referenceLP.trim() !== "") issuesText += `${link('Reference LP', issue.referenceLP)}\n`;
        issuesText += "\n";
      });
      // ✨ Injected ${uaPlural}
      commentBody += `${link('Gearloose', data.gearloose)}\n${link('Extractor', data.extractor)}\n\n${issuesText}${link(`Mismatches(${attrString})`, data.mismatchSS)}\n${link('Dashboard(Agoraphile extractions)', data.dashboardSS)}\n\nPlease overrule similar mismatches for ${uaString} ${uaPlural}.\n\n`;
    }
  }

  // -------------------------------------------------------------
  // CASE 3: HISTORY MISMATCH ONLY
  // -------------------------------------------------------------
  else if (activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) historySampleText += `${formatSampleLinks(s)}\n`;
    });

    const aiuText = isAIUOpted ? ` However AIU is opted for ${attrString} and feed will get updated.` : "";
    const aiuSS = isAIUOpted ? `${link('SS(Opted)', data.historyAIUOptedSS)}\n` : "";

    // ✨ Injected ${uaPlural}
    commentBody += `After analyzing the merchant it has been observed that there are high percentage of history mismatches for ${attrString} for ${uaString} ${uaPlural} where ${attrString} present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.${aiuText}\n\n${link('Gearloose', data.gearloose)}\n${link('Reason', data.historyReasonSS)}\n\nSample:\n${historySampleText}${aiuSS}\nI will update the status accordingly.\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 2: CL CREATION
  // -------------------------------------------------------------
  if (activeScenarios.includes("cl")) {
    let clSampleText = "";
    data.clSamples.forEach((s) => {
      if (s.cds || s.lp || s.debug) {
        clSampleText += `${formatSampleLinks(s)}\n`;
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

    commentBody += `Sample for reference:\n${clSampleText}Due to above mentioned issues the crawzall is currently not trusted for ${attrString}.\nMoreover, the script is under modification for aforementioned issues.\nI will update here once the new version of crawzall gets reflected on gearloose.\n\n`;
  }

  let finalComment = `Hi,\n\n${commentBody}Thanks,\n${data.name}`;

  if (isMd) {
    finalComment = finalComment.split('\n').map(line => {
      if (line.trim().length > 0 && !line.trim().endsWith('\\')) {
        return `${line.trimEnd()} \\`;
      }
      return line;
    }).join('\n');
  }

  return finalComment;
};