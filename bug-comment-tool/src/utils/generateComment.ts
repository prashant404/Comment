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

// ✨ VERCEL FAILSAFE: FORCE ANY
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

  // 🛡️ DYNAMIC SCENARIO ENGINE
  const getScenarioDetails = (scenario: 'overrule' | 'history' | 'global') => {
    let attrs: string[] = Array.isArray(data.attribute) ? data.attribute : [data.attribute].filter(Boolean);
    let uasPrice: string[] = Array.isArray(data.userAgentsPrice) ? data.userAgentsPrice : [];
    let uasAvail: string[] = Array.isArray(data.userAgentsAvail) ? data.userAgentsAvail : [];

    const historyOverride = data.historyOverride;
    const historyAttr: string[] = data.historyAttr || [];

    if (scenario === 'history' && historyOverride && activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
      attrs = historyAttr.length ? historyAttr : attrs;
      uasPrice = data.historyUAsPrice || [];
      uasAvail = data.historyUAsAvail || [];
    }

    const formatUA = (uas: string[]) => {
      if (uas.includes("all")) return { uaStr: "all", uaPlural: "user agents" };
      if (uas.length === 1) return { uaStr: String(uas), uaPlural: "user agent" };
      if (uas.length > 1) {
        const last = String(uas[uas.length - 1]);
        const rest = uas.slice(0, -1).map(String).join(", ");
        return { uaStr: `${rest} and ${last}`, uaPlural: "user agents" };
      }
      return { uaStr: "_______", uaPlural: "user agents" };
    };

    const priceUA = formatUA(uasPrice);
    const availUA = formatUA(uasAvail);
    const attrStr = attrs.join(" and ") || "_______";
    const sameUAs = JSON.stringify([...uasPrice].sort()) === JSON.stringify([...uasAvail].sort());

    return { attrs, attrStr, uasPrice, uasAvail, priceUA, availUA, sameUAs };
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

  // ✨ DYNAMIC INTRO SENTENCE GENERATOR
  let introCombined = "";
  if (ov.attrs.includes("price") && ov.attrs.includes("availability")) {
    if (ov.sameUAs) {
      introCombined = `script for price and availability is distrusted for ${ov.priceUA.uaStr} ${ov.priceUA.uaPlural} due to mismatches in price and availability which needs to be overruled.`;
    } else {
      introCombined = `script for price is distrusted for ${ov.priceUA.uaStr} ${ov.priceUA.uaPlural} due to mismatches in price and script for availability is distrusted for ${ov.availUA.uaStr} ${ov.availUA.uaPlural} due to mismatches in availability which needs to be overruled.`;
    }
  } else if (ov.attrs.includes("price")) {
    introCombined = `script for price is distrusted for ${ov.priceUA.uaStr} ${ov.priceUA.uaPlural} due to mismatches in price which needs to be overruled.`;
  } else if (ov.attrs.includes("availability")) {
    introCombined = `script for availability is distrusted for ${ov.availUA.uaStr} ${ov.availUA.uaPlural} due to mismatches in availability which needs to be overruled.`;
  }

  // ✨ DYNAMIC HISTORY SENTENCE GENERATOR
  let historySentence = "";
  if (hist.attrs.includes("price") && hist.attrs.includes("availability")) {
    if (hist.sameUAs) {
      historySentence = `there are high percentage of history mismatches for price and availability for ${hist.priceUA.uaStr} ${hist.priceUA.uaPlural} where the respective attribute present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.`;
    } else {
      historySentence = `there are high percentage of history mismatches for price for ${hist.priceUA.uaStr} ${hist.priceUA.uaPlural} and for availability for ${hist.availUA.uaStr} ${hist.availUA.uaPlural} where the attribute present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.`;
    }
  } else if (hist.attrs.includes("price")) {
    historySentence = `there are high percentage of history mismatches for price for ${hist.priceUA.uaStr} ${hist.priceUA.uaPlural} where price present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.`;
  } else if (hist.attrs.includes("availability")) {
    historySentence = `there are high percentage of history mismatches for availability for ${hist.availUA.uaStr} ${hist.availUA.uaPlural} where availability present in feed differs from what is present on the landing page leading to "${data.historyCondition}" condition.`;
  }

  // ✨ DYNAMIC PLEASE OVERRULE SENTENCE (OR)
  let pleaseOverrule = "";
  if (ov.attrs.includes("price") && ov.attrs.includes("availability")) {
    if (ov.sameUAs) {
      pleaseOverrule = `Please overrule similar mismatches for ${ov.priceUA.uaStr} ${ov.priceUA.uaPlural}.`;
    } else {
      pleaseOverrule = `Please overrule similar mismatches for price (${ov.priceUA.uaStr} ${ov.priceUA.uaPlural}) and availability (${ov.availUA.uaStr} ${ov.availUA.uaPlural}).`;
    }
  } else if (ov.attrs.includes("price")) {
    pleaseOverrule = `Please overrule similar mismatches for ${ov.priceUA.uaStr} ${ov.priceUA.uaPlural}.`;
  } else {
    pleaseOverrule = `Please overrule similar mismatches for ${ov.availUA.uaStr} ${ov.availUA.uaPlural}.`;
  }

  let commentBody = "";

  // -------------------------------------------------------------
  // SCENARIO D: WAITING FOR COVERAGE (Standalone)
  // -------------------------------------------------------------
  if (activeScenarios.includes("coverage")) {
    let coverageStatement = data.coverageImproved === "improved" 
      ? "Moreover, the coverage has improved to some extent but not reached the threshold.\n" 
      : "Waiting for the coverage to be reflected on the dashboard.\n";

    commentBody = `The overruling has been carried out and script is now trusted for ${glob.attrStr}.\n${link('Gearloose', data.gearloose)}\n\n${coverageStatement}Current coverage: ${isMd ? `[SS](${data.coverageSS})` : data.coverageSS}\n\nI will update once the coverage reaches the threshold.\n\n`;
  }

  // -------------------------------------------------------------
  // CASE 4: COMBINED OVERRULE (DT ONLY) + HISTORY MISMATCH
  // -------------------------------------------------------------
  else if (activeScenarios.includes("overrule") && activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s: any) => {
      if (s.cds || s.lp || s.debug) historySampleText += `${formatSampleLinks(s)}\n`;
    });

    const aiuText = isAIUOpted ? ` However AIU is opted for ${hist.attrStr} and feed will get updated.` : "";
    const aiuSS = isAIUOpted ? `${link('SS(Opted)', data.historyAIUOptedSS)}\n` : "";

    commentBody += `After analyzing the merchant, it has been observed that ${introCombined} Also, ${historySentence}${aiuText}\n\n`;

    commentBody += `${link('Gearloose', data.gearloose)}\n`;
    if (ov.attrs.includes("price") && data.mismatchPriceSS) commentBody += `${link('Mismatches(price)', data.mismatchPriceSS)}\n`;
    if (ov.attrs.includes("availability") && data.mismatchAvailSS) commentBody += `${link('Mismatches(availability)', data.mismatchAvailSS)}\n`;

    commentBody += `\n${isMd ? `[Overruling Bug](${data.bugLink})` : `Overruling Bug(${data.bugLink || ""})`} has been raised for mismatches in ${ov.attrStr}.\n\n`;
    commentBody += `${link('Reason', data.historyReasonSS)}\n\n`;
    commentBody += `Sample:\n${historySampleText}${aiuSS}\nI will update once the overruling has been done and the script gets trusted for ${ov.attrStr}.\n\n`;
  } 
  
  // -------------------------------------------------------------
  // CASE 1: OVERRULE ONLY (DT or OR)
  // -------------------------------------------------------------
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

      // ✨ CHANGED: Removed the introductory paragraph for OR case completely.
      commentBody += `${link('Gearloose', data.gearloose)}\n`;
      commentBody += `${link('Extractor', data.extractor)}\n\n`;
      commentBody += `${issuesText}`;

      if (ov.attrs.includes("price") && data.dashboardPriceSS) commentBody += `${link('Dashboard(Price)', data.dashboardPriceSS)}\n`;
      if (ov.attrs.includes("availability") && data.dashboardAvailSS) commentBody += `${link('Dashboard(Availability)', data.dashboardAvailSS)}\n`;

      commentBody += `\n${pleaseOverrule}\n\n`;
    }
  }

  // -------------------------------------------------------------
  // CASE 3: HISTORY MISMATCH ONLY
  // -------------------------------------------------------------
  else if (activeScenarios.includes("history")) {
    let historySampleText = "";
    data.historySamples.forEach((s: any) => {
      if (s.cds || s.lp || s.debug) historySampleText += `${formatSampleLinks(s)}\n`;
    });

    const aiuText = isAIUOpted ? ` However AIU is opted for ${hist.attrStr} and feed will get updated.` : "";
    const aiuSS = isAIUOpted ? `${link('SS(Opted)', data.historyAIUOptedSS)}\n` : "";

    commentBody += `After analyzing the merchant it has been observed that ${historySentence}${aiuText}\n\n${link('Gearloose', data.gearloose)}\n${link('Reason', data.historyReasonSS)}\n\nSample:\n${historySampleText}${aiuSS}\nI will update the status accordingly.\n\n`;
  }

  // -------------------------------------------------------------
  // INDEPENDENT SCENARIO: CL CREATION
  // -------------------------------------------------------------
  if (activeScenarios.includes("cl")) {
    let clSampleText = "";
    data.clSamples.forEach((s: any) => {
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

    commentBody += `Sample for reference:\n${clSampleText}Due to above mentioned issues the crawzall is currently not trusted for ${glob.attrStr}.\nMoreover, the script is under modification for aforementioned issues.\nI will update here once the new version of crawzall gets reflected on gearloose.\n\n`;
  }

  let finalComment = `Hi,\n\n${commentBody}Thanks,\n${data.name}`;

  if (isMd) {
    finalComment = finalComment.split('\n').map((line: string) => {
      if (line.trim().length > 0 && !line.trim().endsWith('\\')) {
        return `${line.trimEnd()} \\`;
      }
      return line;
    }).join('\n');
  }

  return finalComment;
};
