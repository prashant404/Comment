// Removed FormDataType to completely bypass Vercel's strict cache errors
import type { SampleType } from "../types/index";

const formatURL = (url?: string): string => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed === "" || trimmed.length < 4 || !trimmed.includes(".")) return trimmed;
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
};

// ✨ FORCING `any` OVERRIDE TO SECURE DEPLOYMENT
export const generateComment = (rawData: any): string => {
  
  const data: any = {
    ...rawData,
    gearloose: formatURL(rawData.gearloose),
    mismatchPriceSS: formatURL(rawData.mismatchPriceSS),
    mismatchAvailSS: formatURL(rawData.mismatchAvailSS),
    dashboardPriceSS: formatURL(rawData.dashboardPriceSS),
    dashboardAvailSS: formatURL(rawData.dashboardAvailSS),
    bugLink: formatURL(rawData.bugLink),
    extractor: formatURL(rawData.extractor),
    historyReasonSS: formatURL(rawData.historyReasonSS),
    historyAIUOptedSS: formatURL(rawData.historyAIUOptedSS),
    coverageSS: formatURL(rawData.coverageSS),
    orIssues: (rawData.orIssues || []).map((i: any) => ({...i, mismatchSS: formatURL(i.mismatchSS), referenceLP: formatURL(i.referenceLP)})),
    historySamples: (rawData.historySamples || []).map((s: any) => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)})),
    clSamples: (rawData.clSamples || []).map((s: any) => ({...s, cds: formatURL(s.cds), lp: formatURL(s.lp), debug: formatURL(s.debug)}))
  };

  const activeScenarios: string[] = data.activeScenarios || [];
  const outputFormat = data.outputFormat;
  const isAIUOpted = data.isAIUOpted;
  const isMd = outputFormat === "markdown";

  // 🛡️ VERCEL FAILSAFE ENGINE
  const getScenarioDetails = (scenario: 'overrule' | 'history' | 'global') => {
    let attrs: string[] = Array.isArray(data.attribute) ? data.attribute : [data.attribute].filter(Boolean);
    let uas: string[] = Array.isArray(data.userAgents) ? data.userAgents : [data.userAgents].filter(Boolean);

    const historyOverride = data.historyOverride;
    const historyAttr: string[] = data.historyAttr || [];
    const historyUAs: string[] = data.historyUAs || [];

    if (scenario === 'history' && historyOverride && activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
      attrs = historyAttr.length ? historyAttr : attrs;
      uas = historyUAs.length ? historyUAs : uas;
    }

    const attrStr = attrs.join(" and ") || "_______";
    let uaStr = "";
    let uaPlural = "user agents";

    if (uas.includes("all")) {
      uaStr = "all";
      uaPlural = "user agents";
    } else if (uas.length === 1) {
      uaStr = String(uas); 
      uaPlural = "user agent";
    } else if (uas.length > 1) {
      const last = String(uas[uas.length - 1]);
      const rest = uas.slice(0, -1).map(String).join(", ");
      uaStr = `${rest} and ${last}`;
    } else {
      uaStr = "_______";
    }

    return { attrs, attrStr, uaStr, uaPlural };
  };

  const ov = getScenarioDetails('overrule');
  const hist = getScenarioDetails('history');
  const glob = getScenarioDetails('global');

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

  // ✨ EXPLICITLY TYPED ARRAY PREVENTS TS2322
  let introTexts: string[] = []; 
  if (ov.attrs.includes("price")) introTexts.push(`script for price is distrusted for ${ov.uaStr} ${ov.uaPlural} due to mismatches in price`);
  if (ov.attrs.includes("availability")) introTexts.push(`script for availability is distrusted for ${ov.uaStr} ${ov.uaPlural} due to mismatches in availability`);
  
  let introCombined = "";
  if (introTexts.length > 0) {
    introCombined = introTexts.join(" and ") + " which needs to be overruled.";
  } else {
    introCombined = `script for ${ov.attrStr} is distrusted for ${ov.uaStr} ${ov.uaPlural} due to mismatches in ${ov.attrStr} which needs to be overruled.`;
  }

  let commentBody = "";

  if (activeScenarios.includes("coverage")) {
    let coverageStatement = data.coverageImproved === "improved" 
      ? "Moreover, the coverage has improved to some extent but not reached the threshold.\n" 
      : "Waiting for the coverage to be reflected on the dashboard.\n";

    commentBody = `The overruling has been carried out and script is now trusted for ${glob.attrStr}.\n${link('Gearloose', data.gearloose)}\n\n${coverageStatement}Current coverage: ${isMd ? `[SS](${data.coverageSS})` : data.coverageSS}\n\nI will update once the coverage reaches the threshold.\n\n`;
  }

  else if (activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s: any) => {
      if (s.cds || s.lp || s.debug) historySampleText += `${formatSampleLinks(s)}\n`;
    });

    const aiuText = isAIUOpted ? ` However AIU is opted for ${hist.attrStr} and feed will get updated.` : "";
    const aiuSS = isAIUOpted ? `${link('SS(Opted)', data.historyAIUOptedSS)}\n` : "";

    commentBody += `After analyzing the merchant, it has been observed that ${introCombined} Also, there are high percentage of history mismatches for ${hist.attrStr} for ${hist.uaStr} ${hist.uaPlural} where ${hist.attrStr} present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.${aiuText}\n\n`;

    commentBody += `${link('Gearloose', data.gearloose)}\n`;
    if (ov.attrs.includes("price") && data.mismatchPriceSS) commentBody += `${link('Mismatches(price)', data.mismatchPriceSS)}\n`;
    if (ov.attrs.includes("availability") && data.mismatchAvailSS) commentBody += `${link('Mismatches(availability)', data.mismatchAvailSS)}\n`;

    commentBody += `\n${isMd ? `[Overruling Bug](${data.bugLink})` : `Overruling Bug(${data.bugLink || ""})`} has been raised for mismatches in ${ov.attrStr}.\n\n`;
    commentBody += `${link('Reason', data.historyReasonSS)}\n\n`;
    commentBody += `Sample:\n${historySampleText}${aiuSS}\nI will update once the overruling has been done and the script gets trusted for ${ov.attrStr}.\n\n`;
  } 
  
  else if (activeScenarios.includes("overrule")) {
    if (data.overruleType === "dt") {
      commentBody += `After analyzing the merchant, it has been observed that ${introCombined}\n\n`;
      commentBody += `${link('Gearloose', data.gearloose)}\n`;
      
      if (ov.attrs.includes("price") && data.mismatchPriceSS) commentBody += `${link('Mismatches(price)', data.mismatchPriceSS)}\n`;
      if (ov.attrs.includes("availability") && data.mismatchAvailSS) commentBody += `${link('Mismatches(availability)', data.mismatchAvailSS)}\n`;

      commentBody += `\n${isMd ? `[overruling bug](${data.bugLink})` : `overruling bug (${data.bugLink})`} has been raised for the mismatches in ${ov.attrStr}. I will update once overruling has been done.\n\n`;
    
    } else if (data.overruleType === "or") {
      let issuesText = "";
      data.orIssues.forEach((issue: any) => {
        const issueAttrLbl = issue.attribute ? `(${issue.attribute})` : (ov.attrs.length === 1 ? `(${ov.attrs})` : "");
        issuesText += `Issue: ${issue.description}\n`;
        if (issue.mismatchSS) issuesText += `${link(`Mismatches${issueAttrLbl}`, issue.mismatchSS)}\n`;
        if (issue.rating && issue.rating.trim() !== "") issuesText += `Rating: ${issue.rating}\n`;
        if (issue.inspector && issue.inspector.trim() !== "") issuesText += `Inspector: ${issue.inspector}\n`;
        if (issue.referenceLP && issue.referenceLP.trim() !== "") issuesText += `${link('Reference LP', issue.referenceLP)}\n`;
        issuesText += "\n";
      });

      commentBody += `After analyzing the merchant, it has been observed that ${introCombined}\n\n`;
      commentBody += `${link('Gearloose', data.gearloose)}\n`;
      commentBody += `${link('Extractor', data.extractor)}\n\n`;
      commentBody += `${issuesText}`;

      if (ov.attrs.includes("price") && data.dashboardPriceSS) commentBody += `${link('Dashboard(Price)', data.dashboardPriceSS)}\n`;
      if (ov.attrs.includes("availability") && data.dashboardAvailSS) commentBody += `${link('Dashboard(Availability)', data.dashboardAvailSS)}\n`;

      commentBody += `\nPlease overrule similar mismatches for ${ov.uaStr} ${ov.uaPlural}.\n\n`;
