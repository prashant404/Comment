import { useState, useEffect, useCallback } from "react";
import { generateComment } from "./utils/generateComment";
import type { FormDataType } from "./types/index";

const getInitialState = (): FormDataType => ({
  name: localStorage.getItem("buganizer_ldap") || "",
  attribute: [], gearloose: "", activeScenarios: [], 
  userAgentsPrice: [], userAgentsAvail: [],
  overruleType: "", bugLink: "", extractor: "", 
  mismatchPriceSS: "", mismatchAvailSS: "", dashboardPriceSS: "", dashboardAvailSS: "",
  orIssues: [{ attribute: "", description: "", mismatchSS: "", rating: "", inspector: "", referenceLP: "" }],
  clSamples: [{ cds: "", lp: "", debug: "", rating: "", inspector: "" }],
  historyCondition: "", historyReasonSS: "", isAIUOpted: false, historyAIUOptedSS: "", historySamples: [{ cds: "", lp: "", debug: "" }],
  historyOverride: false, historyAttr: [], historyUAsPrice: [], historyUAsAvail: [],
  coverageImproved: "waiting", coverageSS: "", outputFormat: "text"
});

const AVAILABLE_USER_AGENTS = ["desktop", "webkit_desktop", "mobile", "webkit_mobile"];

export default function App() {
  const [toast, setToast] = useState("");
  const [output, setOutput] = useState("");
  const [formData, setFormData] = useState<FormDataType>(getInitialState());

  const [theme, setTheme] = useState<"dark" | "light">(() => (localStorage.getItem("buganizer_theme") as "dark" | "light") || "dark");
  const [activeTab, setActiveTab] = useState<"output" | "history">("output");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("buganizer_history");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("buganizer_theme", theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem("buganizer_ldap", formData.name); }, [formData.name]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const saveToHistory = (newComment: string) => {
    setHistory((prev) => {
      const newHist = [newComment, ...prev].slice(0, 10);
      localStorage.setItem("buganizer_history", JSON.stringify(newHist));
      return newHist;
    });
  };

  const deleteFromHistory = (indexToDelete: number) => {
    setHistory((prev) => {
      const newHist = prev.filter((_, i) => i !== indexToDelete);
      localStorage.setItem("buganizer_history", JSON.stringify(newHist));
      return newHist;
    });
    if (expandedIndex === indexToDelete) setExpandedIndex(null);
    showToast("History item deleted!");
  };

  const handleGenerate = useCallback(() => {
    if (!formData.name || formData.attribute.length === 0 || !formData.gearloose) {
      showToast("Please fill Global Fields (Name, Attribute, Main Gearloose)"); return null;
    }
    if (formData.activeScenarios.length === 0) {
      showToast("Please select at least one scenario block"); return null;
    }

    const isPrice = formData.attribute.includes("price");
    const isAvail = formData.attribute.includes("availability");

    if (formData.activeScenarios.includes("overrule") || formData.activeScenarios.includes("history")) {
      if (!formData.historyOverride) {
        if (isPrice && formData.userAgentsPrice.length === 0) { showToast("Select User Agents for Price!"); return null; }
        if (isAvail && formData.userAgentsAvail.length === 0) { showToast("Select User Agents for Availability!"); return null; }
      }
    }

    const isValidLink = (str: string) => {
      if (!str) return true; 
      const clean = str.trim().toLowerCase();
      if (clean === "na" || clean === "none" || clean === "n/a") return true;
      return clean.includes("."); 
    };

    if (!isValidLink(formData.gearloose)) { showToast("Invalid Gearloose Link!"); return null; }
    
    if (formData.activeScenarios.includes("overrule")) {
      if (formData.overruleType === "dt") {
        if (isPrice && !isValidLink(formData.mismatchPriceSS)) { showToast("Invalid Price Mismatch Link!"); return null; }
        if (isAvail && !isValidLink(formData.mismatchAvailSS)) { showToast("Invalid Availability Mismatch Link!"); return null; }
      }
      if (formData.overruleType === "or") {
        if (isPrice && !isValidLink(formData.dashboardPriceSS)) { showToast("Invalid Price Dashboard Link!"); return null; }
        if (isAvail && !isValidLink(formData.dashboardAvailSS)) { showToast("Invalid Availability Dashboard Link!"); return null; }
        for (let issue of formData.orIssues) {
          if (!isValidLink(issue.mismatchSS)) { showToast("Invalid Mismatch SS in Issues!"); return null; }
        }
      }
    }
    
    if (formData.activeScenarios.includes("history")) {
      if (!formData.historyCondition) { showToast("Please select a History Condition!"); return null; }
      if (!isValidLink(formData.historyReasonSS)) { showToast("Invalid Reason SS Link!"); return null; }
      if (formData.isAIUOpted && !isValidLink(formData.historyAIUOptedSS)) { showToast("Invalid AIU Opted SS Link!"); return null; }
    }

    const result = generateComment(formData);
    setOutput(result); saveToHistory(result); setActiveTab("output"); 
    showToast("Comment Generated successfully!");
    return result;
  }, [formData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const generated = handleGenerate();
        if (generated) { navigator.clipboard.writeText(generated); showToast("Generated & Copied to Clipboard!"); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate]);

  const handleReset = () => {
    setFormData((prev) => ({
      ...getInitialState(),
      name: prev.name, attribute: prev.attribute, outputFormat: prev.outputFormat, 
      userAgentsPrice: prev.userAgentsPrice, userAgentsAvail: prev.userAgentsAvail
    }));
    setOutput(""); showToast("🧹 Form Reset for Next Bug");
  };

  const handleToggleScenario = (scenario: string) => {
    setFormData((prev) => {
      let newActive = [...prev.activeScenarios];
      
      if (scenario === "history" && prev.activeScenarios.includes("overrule") && prev.overruleType === "or") {
        showToast("ℹ️ Switched Overrule to DT (OR is incompatible with History)");
        return { ...prev, activeScenarios: [...newActive, scenario], overruleType: "dt" };
      }

      if (newActive.includes(scenario)) {
        newActive = newActive.filter((s) => s !== scenario);
      } else {
        if (scenario === "coverage") newActive = ["coverage"];
        else {
          newActive = newActive.filter((s) => s !== "coverage");
          newActive.push(scenario);
        }
      }
      return { ...prev, activeScenarios: newActive };
    });
  };

  const handleChange = (field: keyof FormDataType, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
  
  const toggleArrayItem = (field: keyof FormDataType, item: string) => {
    setFormData((prev) => {
      if (field === "userAgentsPrice" || field === "userAgentsAvail" || field === "historyUAsPrice" || field === "historyUAsAvail") {
        let current = [...(prev[field] as string[])];
        if (item === "all") {
          return { ...prev, [field]: current.includes("all") ? [] : ["all"] };
        }
        current = current.filter(a => a !== "all");
        if (current.includes(item)) return { ...prev, [field]: current.filter(a => a !== item) };
        return { ...prev, [field]: [...current, item] };
      } else {
        const exists = (prev[field] as string[]).includes(item);
        if (exists) return { ...prev, [field]: (prev[field] as string[]).filter(a => a !== item) };
        return { ...prev, [field]: [...(prev[field] as string[]), item] };
      }
    });
  };

  const addArrayItem = (field: "orIssues" | "clSamples" | "historySamples", defaultObj: any) => setFormData((p: any) => ({ ...p, [field]: [...p[field], defaultObj] }));
  const updateArrayItem = (field: "orIssues" | "clSamples" | "historySamples", index: number, key: string, value: string) => {
    setFormData((p: any) => { const newArr = [...p[field]]; newArr[index] = { ...newArr[index], [key]: value }; return { ...p, [field]: newArr }; });
  };
  const removeArrayItem = (field: "orIssues" | "clSamples" | "historySamples", index: number) => {
    setFormData((p: any) => { const newArr = [...p[field]]; newArr.splice(index, 1); return { ...p, [field]: newArr }; });
  };

  const isHistoryActive = formData.activeScenarios.includes("history");
  const isOverruleActive = formData.activeScenarios.includes("overrule");
  const activeHistoryAttrs = (isHistoryActive && isOverruleActive && formData.historyOverride && formData.historyAttr.length) 
    ? formData.historyAttr : formData.attribute;

  const isPrice = formData.attribute.includes("price");
  const isAvail = formData.attribute.includes("availability");

  const isHistPrice = activeHistoryAttrs.includes("price");
  const isHistAvail = activeHistoryAttrs.includes("availability");

  return (
    <div className="app-wrapper">
      <div className="top-bar">
        <h1>⚡ Buganizer Tool</h1>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>{theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}</button>
      </div>

      <div className="main-layout">
        <div className="left-panel">
          <div className="card border-blue">
            <h2>🌍 Global Details</h2>
            <div className="input-group" style={{ marginBottom: "12px" }}>
              <label>Output Format</label>
              <div className="segmented-control">
                <button className={`segment-btn ${formData.outputFormat === "text" ? "active-segment" : ""}`} onClick={() => handleChange("outputFormat", "text")}>📄 Plain Text</button>
                <button className={`segment-btn ${formData.outputFormat === "markdown" ? "active-segment" : ""}`} onClick={() => handleChange("outputFormat", "markdown")}>📝 Markdown</button>
              </div>
            </div>
            
            <div className="input-group">
              <label>Your Name / LDAP *</label>
              <input placeholder="e.g. prashant" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>

            <div className="input-group">
              <label>Attribute *</label>
              <div className="segmented-control">
                <button className={`segment-btn ${isPrice ? "active-segment" : ""}`} onClick={() => toggleArrayItem("attribute", "price")}>Price</button>
                <button className={`segment-btn ${isAvail ? "active-segment" : ""}`} onClick={() => toggleArrayItem("attribute", "availability")}>Availability</button>
              </div>
            </div>

            {/* SPLIT USER AGENTS BASED ON SELECTION */}
            {isPrice && (
              <div className="input-group">
                <label>User Agents (Price) *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button className={`segment-btn ${formData.userAgentsPrice.includes("all") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("userAgentsPrice", "all")} style={{ gridColumn: "span 2", border: "1px solid var(--input-border)", background: formData.userAgentsPrice.includes("all") ? "var(--segment-active-bg)" : "var(--input-bg)" }}>All User Agents</button>
                  {AVAILABLE_USER_AGENTS.map((ua) => (
                    <button key={ua} className={`segment-btn ${formData.userAgentsPrice.includes(ua) ? "active-segment" : ""}`} onClick={() => toggleArrayItem("userAgentsPrice", ua)} style={{ border: "1px solid var(--input-border)", background: formData.userAgentsPrice.includes(ua) ? "var(--segment-active-bg)" : "var(--input-bg)" }}>{ua}</button>
                  ))}
                </div>
              </div>
            )}

            {isAvail && (
              <div className="input-group">
                <label>User Agents (Availability) *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <button className={`segment-btn ${formData.userAgentsAvail.includes("all") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("userAgentsAvail", "all")} style={{ gridColumn: "span 2", border: "1px solid var(--input-border)", background: formData.userAgentsAvail.includes("all") ? "var(--segment-active-bg)" : "var(--input-bg)" }}>All User Agents</button>
                  {AVAILABLE_USER_AGENTS.map((ua) => (
                    <button key={ua} className={`segment-btn ${formData.userAgentsAvail.includes(ua) ? "active-segment" : ""}`} onClick={() => toggleArrayItem("userAgentsAvail", ua)} style={{ border: "1px solid var(--input-border)", background: formData.userAgentsAvail.includes(ua) ? "var(--segment-active-bg)" : "var(--input-bg)" }}>{ua}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="input-group" style={{marginTop: "12px"}}>
              <label>{formData.overruleType === "dt" ? "Main Gearloose Link (SS) *" : "Main Gearloose Link *"}</label>
              <input placeholder="https://..." value={formData.gearloose} onChange={(e) => handleChange("gearloose", e.target.value)} />
            </div>
          </div>

          <div className="card">
            <h2>🧩 Select Scenarios</h2>
            <div className="button-group-row">
              <button className={formData.activeScenarios.includes("overrule") ? "active" : "secondary"} onClick={() => handleToggleScenario("overrule")}>+ Overrule</button>
              <button className={formData.activeScenarios.includes("history") ? "active" : "secondary"} onClick={() => handleToggleScenario("history")}>+ History Mismatch</button>
              <button className={formData.activeScenarios.includes("cl") ? "active" : "secondary"} onClick={() => handleToggleScenario("cl")}>+ CL Creation</button>
            </div>
            <div className="divider-line"></div>
            <button className={formData.activeScenarios.includes("coverage") ? "active-warning" : "secondary"} onClick={() => handleToggleScenario("coverage")}>Stand-alone: Waiting for Coverage</button>
          </div>

          {formData.activeScenarios.includes("overrule") && (
            <div className="card highlight-card">
              <h2>Block A: Overruling</h2>
              <div className="segmented-control" style={{ marginBottom: "16px" }}>
                <button className={`segment-btn ${formData.overruleType === "dt" ? "active-segment" : ""}`} onClick={() => handleChange("overruleType", "dt")}>DT Comment</button>
                <button 
                  className={`segment-btn ${formData.overruleType === "or" ? "active-segment" : ""}`} 
                  onClick={() => {
                    handleChange("overruleType", "or");
                    if (formData.activeScenarios.includes("history")) {
                      handleChange("activeScenarios", formData.activeScenarios.filter(s => s !== "history"));
                      showToast("ℹ️ History Mismatch disabled (Incompatible with OR Comment)");
                    }
                  }}
                >OR Comment</button>
              </div>

              {formData.overruleType === "dt" && (
                <>
                  {isPrice && (
                    <div className="input-group">
                      <label>Mismatches SS Link (Price) *</label>
                      <input placeholder="https://..." value={formData.mismatchPriceSS} onChange={(e) => handleChange("mismatchPriceSS", e.target.value)} />
                    </div>
                  )}
                  {isAvail && (
                    <div className="input-group">
                      <label>Mismatches SS Link (Availability) *</label>
                      <input placeholder="https://..." value={formData.mismatchAvailSS} onChange={(e) => handleChange("mismatchAvailSS", e.target.value)} />
                    </div>
                  )}
                  <div className="input-group" style={{marginTop: "8px"}}><label>OR Bug Link *</label><input placeholder="https://..." value={formData.bugLink} onChange={(e) => handleChange("bugLink", e.target.value)} /></div>
                </>
              )}

              {formData.overruleType === "or" && (
                <>
                  <div className="input-group"><label>Extractor Link *</label><input placeholder="https://..." value={formData.extractor} onChange={(e) => handleChange("extractor", e.target.value)} /></div>
                  <div className="divider-line"></div>
                  <h3>Issues</h3>
                  {formData.orIssues.map((issue, i) => (
                    <div key={i} className="sample-block">
                      <div className="sample-header"><strong>Issue {i + 1}</strong>{formData.orIssues.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("orIssues", i)}>Remove</button>}</div>
                      
                      {(isPrice && isAvail) && (
                        <div className="segmented-control" style={{marginBottom: "6px"}}>
                          <button className={`segment-btn ${issue.attribute === "price" ? "active-segment" : ""}`} onClick={() => updateArrayItem("orIssues", i, "attribute", "price")}>Price</button>
                          <button className={`segment-btn ${issue.attribute === "availability" ? "active-segment" : ""}`} onClick={() => updateArrayItem("orIssues", i, "attribute", "availability")}>Availability</button>
                        </div>
                      )}

                      <textarea placeholder="Issue Description *" value={issue.description} onChange={(e) => updateArrayItem("orIssues", i, "description", e.target.value)} />
                      <input placeholder={`Mismatches SS ${issue.attribute ? `(${issue.attribute})` : (isPrice ? "(price)" : isAvail ? "(availability)" : "")} *`} value={issue.mismatchSS} onChange={(e) => updateArrayItem("orIssues", i, "mismatchSS", e.target.value)} />
                      <input placeholder="Rating" value={issue.rating} onChange={(e) => updateArrayItem("orIssues", i, "rating", e.target.value)} />
                      <input placeholder="Inspector" value={issue.inspector} onChange={(e) => updateArrayItem("orIssues", i, "inspector", e.target.value)} />
                      <input placeholder="Reference LP (optional)" value={issue.referenceLP} onChange={(e) => updateArrayItem("orIssues", i, "referenceLP", e.target.value)} />
                    </div>
                  ))}
                  <button className="secondary outline-btn" onClick={() => addArrayItem("orIssues", { attribute: "", description: "", mismatchSS: "", rating: "", inspector: "", referenceLP: "" })}>+ Add Issue</button>
                  <div className="divider-line" style={{marginTop:"12px"}}></div>
                  
                  {isPrice && (
                    <div className="input-group">
                      <label>Dashboard SS Link (Price) *</label>
                      <input placeholder="https://..." value={formData.dashboardPriceSS} onChange={(e) => handleChange("dashboardPriceSS", e.target.value)} />
                    </div>
                  )}
                  {isAvail && (
                    <div className="input-group">
                      <label>Dashboard SS Link (Availability) *</label>
                      <input placeholder="https://..." value={formData.dashboardAvailSS} onChange={(e) => handleChange("dashboardAvailSS", e.target.value)} />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {formData.activeScenarios.includes("history") && (
            <div className="card highlight-card">
              <h2>Block B: History Mismatches</h2>

              {(isHistoryActive && isOverruleActive) && (
                <>
                  <div className="input-group" style={{ marginBottom: "12px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", color: "var(--accent-primary)" }}>
                      <input type="checkbox" checked={formData.historyOverride} onChange={(e) => handleChange("historyOverride", e.target.checked)} style={{ width: "16px", height: "16px", margin: 0, cursor: "pointer" }} />
                      🛠️ Use different Attribute/User Agents for History?
                    </label>
                  </div>

                  {formData.historyOverride && (
                    <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "8px", marginBottom: "16px", border: "1px dashed var(--accent-primary)" }}>
                      <div className="input-group" style={{ marginBottom: "12px" }}>
                        <label>Local Attribute</label>
                        <div className="segmented-control">
                          <button className={`segment-btn ${formData.historyAttr.includes("price") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyAttr", "price")}>Price</button>
                          <button className={`segment-btn ${formData.historyAttr.includes("availability") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyAttr", "availability")}>Availability</button>
                        </div>
                      </div>
                      
                      {/* LOCAL HISTORY UAs SPLIT */}
                      {isHistPrice && (
                        <div className="input-group">
                          <label>History User Agents (Price)</label>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <button className={`segment-btn ${formData.historyUAsPrice.includes("all") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyUAsPrice", "all")} style={{ gridColumn: "span 2", border: "1px solid var(--input-border)", background: formData.historyUAsPrice.includes("all") ? "var(--segment-active-bg)" : "var(--input-bg)" }}>✨ All User Agents</button>
                            {AVAILABLE_USER_AGENTS.map((ua) => (
                              <button key={ua} className={`segment-btn ${formData.historyUAsPrice.includes(ua) ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyUAsPrice", ua)} style={{ border: "1px solid var(--input-border)", background: formData.historyUAsPrice.includes(ua) ? "var(--segment-active-bg)" : "var(--input-bg)" }}>{ua}</button>
                            ))}
                          </div>
                        </div>
                      )}
                      {isHistAvail && (
                        <div className="input-group">
                          <label>History User Agents (Availability)</label>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <button className={`segment-btn ${formData.historyUAsAvail.includes("all") ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyUAsAvail", "all")} style={{ gridColumn: "span 2", border: "1px solid var(--input-border)", background: formData.historyUAsAvail.includes("all") ? "var(--segment-active-bg)" : "var(--input-bg)" }}>All User Agents</button>
                            {AVAILABLE_USER_AGENTS.map((ua) => (
                              <button key={ua} className={`segment-btn ${formData.historyUAsAvail.includes(ua) ? "active-segment" : ""}`} onClick={() => toggleArrayItem("historyUAsAvail", ua)} style={{ border: "1px solid var(--input-border)", background: formData.historyUAsAvail.includes(ua) ? "var(--segment-active-bg)" : "var(--input-bg)" }}>{ua}</button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
              <div className="input-group">
                <label>History Condition *</label>
                {(isHistPrice || isHistAvail) ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {isHistPrice && (
                      <>
                        <button className={`segment-btn ${formData.historyCondition === "BASE_INSTEAD_OF_SALE_THRESHOLD_REACHED" ? "active-segment" : ""}`} onClick={() => handleChange("historyCondition", "BASE_INSTEAD_OF_SALE_THRESHOLD_REACHED")} style={{ border: "1px solid var(--input-border)", background: formData.historyCondition === "BASE_INSTEAD_OF_SALE_THRESHOLD_REACHED" ? "var(--segment-active-bg)" : "var(--input-bg)", padding: "12px", textAlign: "left" }}>BASE_INSTEAD_OF_SALE_THRESHOLD_REACHED</button>
                        <button className={`segment-btn ${formData.historyCondition === "BASE_PRICE_DISTRUST_THRESHOLD_REACHED" ? "active-segment" : ""}`} onClick={() => handleChange("historyCondition", "BASE_PRICE_DISTRUST_THRESHOLD_REACHED")} style={{ border: "1px solid var(--input-border)", background: formData.historyCondition === "BASE_PRICE_DISTRUST_THRESHOLD_REACHED" ? "var(--segment-active-bg)" : "var(--input-bg)", padding: "12px", textAlign: "left" }}>BASE_PRICE_DISTRUST_THRESHOLD_REACHED</button>
                      </  >
                    )}
                    {isHistAvail && (
                      <button className={`segment-btn ${formData.historyCondition === "AVAILABILITY_DISTRUST_THRESHOLD_REACHED" ? "active-segment" : ""}`} onClick={() => handleChange("historyCondition", "AVAILABILITY_DISTRUST_THRESHOLD_REACHED")} style={{ border: "1px solid var(--input-border)", background: formData.historyCondition === "AVAILABILITY_DISTRUST_THRESHOLD_REACHED" ? "var(--segment-active-bg)" : "var(--input-bg)", padding: "12px", textAlign: "left" }}>AVAILABILITY_DISTRUST_THRESHOLD_REACHED</button>
                    )}
                  </div>
                ) : (<div className="empty-state" style={{ padding: "10px", fontSize: "0.85rem", color: "#f59e0b" }}>Please select an Attribute above!</div>)}
              </div>

              <div className="input-group"><label>Reason SS Link *</label><input placeholder="https://..." value={formData.historyReasonSS} onChange={(e) => handleChange("historyReasonSS", e.target.value)} /></div>
              <div className="input-group" style={{ marginTop: "10px", marginBottom: "10px" }}><label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9rem" }}><input type="checkbox" checked={formData.isAIUOpted} onChange={(e) => handleChange("isAIUOpted", e.target.checked)} style={{ width: "18px", height: "18px", margin: 0, cursor: "pointer" }}/>Has AIU been opted for this attribute?</label></div>
              {formData.isAIUOpted && (<div className="input-group animate-slide-down"><label>AIU Opted SS Link *</label><input placeholder="https://..." value={formData.historyAIUOptedSS} onChange={(e) => handleChange("historyAIUOptedSS", e.target.value)} /></div>)}

              <div className="divider-line"></div>
              <h3>History Samples</h3>
              {formData.historySamples.map((sample, i) => (
                <div key={i} className="sample-block">
                  <div className="sample-header"><strong>Sample {i + 1}</strong>{formData.historySamples.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("historySamples", i)}>Remove</button>}</div>
                  <input placeholder="CDS Link" value={sample.cds} onChange={(e) => updateArrayItem("historySamples", i, "cds", e.target.value)} />
                  <input placeholder="LP Link" value={sample.lp} onChange={(e) => updateArrayItem("historySamples", i, "lp", e.target.value)} />
                  <input placeholder="Debug Link" value={sample.debug} onChange={(e) => updateArrayItem("historySamples", i, "debug", e.target.value)} />
                </div>
              ))}
              <button className="secondary outline-btn" onClick={() => addArrayItem("historySamples", { cds: "", lp: "", debug: "" })}>+ Add Sample</button>
            </div>
          )}

          {formData.activeScenarios.includes("cl") && (
             <div className="card highlight-card">
              <h2>Block C: CL Creation</h2>
              <div className="divider-line"></div>
              <h3>CL Samples</h3>
              {formData.clSamples.map((sample, i) => (
                <div key={i} className="sample-block">
                  <div className="sample-header"><strong>Sample {i + 1}</strong>{formData.clSamples.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("clSamples", i)}>Remove</button>}</div>
                  <input placeholder="CDS Link *" value={sample.cds} onChange={(e) => updateArrayItem("clSamples", i, "cds", e.target.value)} />
                  <input placeholder="LP Link *" value={sample.lp} onChange={(e) => updateArrayItem("clSamples", i, "lp", e.target.value)} />
                  <input placeholder="Debug Link *" value={sample.debug} onChange={(e) => updateArrayItem("clSamples", i, "debug", e.target.value)} />
                  <input placeholder="Rating (optional)" value={sample.rating} onChange={(e) => updateArrayItem("clSamples", i, "rating", e.target.value)} />
                  <input placeholder="Inspector (optional)" value={sample.inspector} onChange={(e) => updateArrayItem("clSamples", i, "inspector", e.target.value)} />
                </div>
              ))}
              <button className="secondary outline-btn" onClick={() => addArrayItem("clSamples", { cds: "", lp: "", debug: "", rating: "", inspector: "" })}>+ Add Sample</button>
            </div>
          )}

          {formData.activeScenarios.includes("coverage") && (
            <div className="card highlight-card">
              <h2>Stand-alone: Waiting for Coverage</h2>
              <div className="input-group">
                <label>Current Coverage SS *</label>
                <input placeholder="https://..." value={formData.coverageSS} onChange={(e) => handleChange("coverageSS", e.target.value)} />
              </div>
              <div className="segmented-control" style={{ marginTop: "12px" }}>
                <button className={`segment-btn ${formData.coverageImproved === "improved" ? "active-segment" : ""}`} onClick={() => handleChange("coverageImproved", "improved")}>Coverage Improved</button>
                <button className={`segment-btn ${formData.coverageImproved === "waiting" ? "active-segment" : ""}`} onClick={() => handleChange("coverageImproved", "waiting")}>Waiting to reflect</button>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === "output" ? "active-tab" : ""}`} onClick={() => setActiveTab("output")}>📄 Current Document</button>
            <button className={`tab-btn ${activeTab === "history" ? "active-tab" : ""}`} onClick={() => setActiveTab("history")}>🕰️ History ({history.length})</button>
          </div>

          {activeTab === "output" && (
            <div className="card sticky-output">
              <h2>Generated Document</h2>
              <div className="hint-text">Press <b>Ctrl + Enter</b> to Generate & Copy instantly!</div>
              <div className="actions">
                <button className="primary-action" onClick={handleGenerate}>⚙️ Generate</button>
                <button className="copy-action" onClick={() => { navigator.clipboard.writeText(output); showToast("Copied!"); }} disabled={!output}>Copy</button>
                <button className="danger-action" onClick={handleReset}>Next Bug</button>
              </div>
              <div className="output-container">
                {output ? <pre className="output">{output}</pre> : <div className="empty-state">Comment will appear here...</div>}
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="card sticky-output history-card">
              <h2>🕰️ Past Comments</h2>
              {history.length === 0 ? (
                <div className="empty-state">No history yet. Generate a comment first!</div>
              ) : (
                <div className="accordion-list">
                  {history.map((item, index) => (
                    <div key={index} className={`accordion-item ${expandedIndex === index ? "expanded" : ""}`}>
                      <div className="accordion-header" onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}>
                        <span className="accordion-title"><span className="badge">#{history.length - index}</span> {item.substring(0, 45).replace(/\n/g, " ")}...</span>
                        <span className="icon">{expandedIndex === index ? "▲" : "▼"}</span>
                      </div>
                      {expandedIndex === index && (
                        <div className="accordion-body">
                          <div className="actions" style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
                            <button className="copy-action" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(item); showToast("History Copied!"); }}>Copy Comment</button>
                            <button className="danger-action" style={{ flex: 0, padding: "12px 20px" }} onClick={() => deleteFromHistory(index)}>Delete</button>
                          </div>
                          <div className="output-container" style={{ maxHeight: "300px", overflowY: "auto" }}><pre className="output">{item}</pre></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
