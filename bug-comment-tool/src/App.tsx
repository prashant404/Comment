import { useState, useEffect, useCallback } from "react";
import { generateComment } from "./utils/generateComment";
import type { FormDataType } from "./types/index";

const getInitialState = (): FormDataType => ({
  name: localStorage.getItem("buganizer_ldap") || "",
  attribute: "", gearloose: "", activeScenarios: [],
  overruleType: "", mismatchSS: "", bugLink: "", extractor: "", dashboardSS: "", userAgents: "",
  orIssues: [{ description: "", rating: "", inspector: "", referenceLP: "" }],
  clSamples: [{ cds: "", lp: "", debug: "", rating: "", inspector: "" }],
  historyReasonSS: "", historyAIUOptedSS: "", historySamples: [{ cds: "", lp: "", debug: "" }],
  coverageImproved: "waiting", coverageSS: "",
  outputFormat: "text" // Default to standard plain text
});

export default function App() {
  const [toast, setToast] = useState("");
  const [output, setOutput] = useState("");
  const [formData, setFormData] = useState<FormDataType>(getInitialState());

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    return (localStorage.getItem("buganizer_theme") as "dark" | "light") || "dark";
  });

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

  useEffect(() => {
    localStorage.setItem("buganizer_ldap", formData.name);
  }, [formData.name]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

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
    showToast("🗑️ History item deleted!");
  };

  const handleGenerate = useCallback(() => {
    if (!formData.name || !formData.attribute || !formData.gearloose) {
      showToast("⚠️ Please fill Global Fields (Name, Attribute, Main Gearloose)");
      return null;
    }
    if (formData.activeScenarios.length === 0) {
      showToast("⚠️ Please select at least one scenario block");
      return null;
    }

    const isValidLink = (str: string) => {
      if (!str) return true; 
      const clean = str.trim().toLowerCase();
      if (clean === "na" || clean === "none" || clean === "n/a") return true;
      return clean.includes("."); 
    };

    if (!isValidLink(formData.gearloose)) {
      showToast("❌ Invalid Gearloose Link! Please provide a real URL or 'NA'.");
      return null; 
    }

    if (formData.activeScenarios.includes("overrule") && !isValidLink(formData.mismatchSS)) {
      showToast("❌ Invalid Mismatch SS Link! Please provide a real URL.");
      return null;
    }

    if (formData.activeScenarios.includes("coverage") && !isValidLink(formData.coverageSS)) {
      showToast("❌ Invalid Coverage SS Link! Please provide a real URL.");
      return null;
    }

    const result = generateComment(formData);
    setOutput(result);
    saveToHistory(result);
    setActiveTab("output"); 
    showToast("✅ Comment Generated successfully!");
    return result;
  }, [formData]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const generated = handleGenerate();
        if (generated) {
          navigator.clipboard.writeText(generated);
          showToast("⚡ Generated & Copied to Clipboard!");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleGenerate]);

  const handleReset = () => {
    setFormData((prev) => ({
      ...getInitialState(),
      name: prev.name,        
      attribute: prev.attribute,
      outputFormat: prev.outputFormat
    }));
    setOutput("");
    showToast("🧹 Form Reset for Next Bug");
  };

  const handleToggleScenario = (scenario: string) => {
    setFormData((prev) => {
      const isStandalone = scenario === "coverage";
      let newActive = [...prev.activeScenarios];
      if (newActive.includes(scenario)) {
        newActive = newActive.filter((s) => s !== scenario);
      } else {
        if (isStandalone) {
          newActive = ["coverage"];
        } else {
          newActive = newActive.filter((s) => s !== "coverage");
          newActive.push(scenario);
        }
      }
      return { ...prev, activeScenarios: newActive };
    });
  };

  const handleChange = (field: keyof FormDataType, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const addArrayItem = (field: "orIssues" | "clSamples" | "historySamples", defaultObj: any) => 
    setFormData((p: any) => ({ ...p, [field]: [...p[field], defaultObj] }));

  const updateArrayItem = (field: "orIssues" | "clSamples" | "historySamples", index: number, key: string, value: string) => {
    setFormData((p: any) => {
      const newArr = [...p[field]];
      newArr[index] = { ...newArr[index], [key]: value };
      return { ...p, [field]: newArr };
    });
  };

  const removeArrayItem = (field: "orIssues" | "clSamples" | "historySamples", index: number) => {
    setFormData((p: any) => {
      const newArr = [...p[field]];
      newArr.splice(index, 1);
      return { ...p, [field]: newArr };
    });
  };

  return (
    <div className="app-wrapper">
      <div className="top-bar">
        <h1>⚡ Buganizer Tool</h1>
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div className="main-layout">
        <div className="left-panel">
          <div className="card border-blue">
            <h2>🌍 Global Details</h2>
            
            {/* ✨ YOUR MARKDOWN TOGGLE IS RIGHT HERE! */}
            <div className="input-group" style={{ marginBottom: "12px" }}>
              <label>Output Format</label>
              <div className="segmented-control">
                <button 
                  className={`segment-btn ${formData.outputFormat === "text" ? "active-segment" : ""}`} 
                  onClick={() => handleChange("outputFormat", "text")}
                >
                  📄 Plain Text
                </button>
                <button 
                  className={`segment-btn ${formData.outputFormat === "markdown" ? "active-segment" : ""}`} 
                  onClick={() => handleChange("outputFormat", "markdown")}
                >
                  📝 Markdown
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Your Name / LDAP *</label>
              <input placeholder="e.g. prashant" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            </div>
            <div className="input-group">
              <label>Attribute *</label>
              <input placeholder="price / availability" value={formData.attribute} onChange={(e) => handleChange("attribute", e.target.value)} />
            </div>
            <div className="input-group">
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
            <button className={formData.activeScenarios.includes("coverage") ? "active-warning" : "secondary"} onClick={() => handleToggleScenario("coverage")}>
              Stand-alone: Waiting for Coverage
            </button>
          </div>

          {formData.activeScenarios.includes("overrule") && (
            <div className="card highlight-card">
              <h2>Block A: Overruling</h2>
              <div className="segmented-control" style={{ marginBottom: "16px" }}>
                <button className={`segment-btn ${formData.overruleType === "dt" ? "active-segment" : ""}`} onClick={() => handleChange("overruleType", "dt")}>DT Comment</button>
                <button className={`segment-btn ${formData.overruleType === "or" ? "active-segment" : ""}`} onClick={() => handleChange("overruleType", "or")}>OR Comment</button>
              </div>
              <div className="input-group">
                <label>Mismatches SS Link *</label>
                <input placeholder="https://..." value={formData.mismatchSS} onChange={(e) => handleChange("mismatchSS", e.target.value)} />
              </div>
              {formData.overruleType === "dt" && (
                <div className="input-group">
                  <label>OR Bug Link *</label>
                  <input placeholder="https://..." value={formData.bugLink} onChange={(e) => handleChange("bugLink", e.target.value)} />
                </div>
              )}
              {formData.overruleType === "or" && (
                <>
                  <div className="input-group">
                    <label>Extractor Link *</label>
                    <input placeholder="https://..." value={formData.extractor} onChange={(e) => handleChange("extractor", e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Dashboard SS Link *</label>
                    <input placeholder="https://..." value={formData.dashboardSS} onChange={(e) => handleChange("dashboardSS", e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>User Agents *</label>
                    <input placeholder="all / specific" value={formData.userAgents} onChange={(e) => handleChange("userAgents", e.target.value)} />
                  </div>
                  <div className="divider-line"></div>
                  <h3>Issues</h3>
                  {formData.orIssues.map((issue, i) => (
                    <div key={i} className="sample-block">
                      <div className="sample-header">
                        <strong>Issue {i + 1}</strong>
                        {formData.orIssues.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("orIssues", i)}>Remove</button>}
                      </div>
                      <textarea placeholder="Issue Description *" value={issue.description} onChange={(e) => updateArrayItem("orIssues", i, "description", e.target.value)} />
                      <input placeholder="Rating" value={issue.rating} onChange={(e) => updateArrayItem("orIssues", i, "rating", e.target.value)} />
                      <input placeholder="Inspector" value={issue.inspector} onChange={(e) => updateArrayItem("orIssues", i, "inspector", e.target.value)} />
                      <input placeholder="Reference LP (optional)" value={issue.referenceLP} onChange={(e) => updateArrayItem("orIssues", i, "referenceLP", e.target.value)} />
                    </div>
                  ))}
                  <button className="secondary outline-btn" onClick={() => addArrayItem("orIssues", { description: "", rating: "", inspector: "", referenceLP: "" })}>+ Add Issue</button>
                </>
              )}
            </div>
          )}

          {formData.activeScenarios.includes("history") && (
            <div className="card highlight-card">
              <h2>Block B: History Mismatches</h2>
              <div className="input-group">
                <label>Reason SS Link *</label>
                <input placeholder="https://..." value={formData.historyReasonSS} onChange={(e) => handleChange("historyReasonSS", e.target.value)} />
              </div>
              <div className="input-group">
                <label>AIU Opted SS Link *</label>
                <input placeholder="https://..." value={formData.historyAIUOptedSS} onChange={(e) => handleChange("historyAIUOptedSS", e.target.value)} />
              </div>
              <div className="divider-line"></div>
              <h3>History Samples</h3>
              {formData.historySamples.map((sample, i) => (
                <div key={i} className="sample-block">
                  <div className="sample-header">
                    <strong>Sample {i + 1}</strong>
                    {formData.historySamples.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("historySamples", i)}>Remove</button>}
                  </div>
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
                  <div className="sample-header">
                    <strong>Sample {i + 1}</strong>
                    {formData.clSamples.length > 1 && <button className="danger-text" onClick={() => removeArrayItem("clSamples", i)}>Remove</button>}
                  </div>
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

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="tabs-container">
            <button className={`tab-btn ${activeTab === "output" ? "active-tab" : ""}`} onClick={() => setActiveTab("output")}>
              📄 Current Document
            </button>
            <button className={`tab-btn ${activeTab === "history" ? "active-tab" : ""}`} onClick={() => setActiveTab("history")}>
              🕰️ History ({history.length})
            </button>
          </div>

          {activeTab === "output" && (
            <div className="card sticky-output">
              <h2>Generated Document</h2>
              <div className="hint-text">💡 Power User: Press <b>Ctrl + Enter</b> to Generate & Copy instantly!</div>
              
              <div className="actions">
                <button className="primary-action" onClick={handleGenerate}>⚙️ Generate</button>
                <button className="copy-action" onClick={() => { navigator.clipboard.writeText(output); showToast("📋 Copied!"); }} disabled={!output}>📋 Copy</button>
                <button className="danger-action" onClick={handleReset}>🧹 Next Bug</button>
              </div>
              
              {/* ✨ NEW INLINE SCROLLING CONTAINER */}
              <div className="output-container">
                {output ? (
                  <pre className="output">{output}</pre>
                ) : (
                  <div className="empty-state">Comment will appear here...</div>
                )}
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
                        <span className="accordion-title">
                          <span className="badge">#{history.length - index}</span> 
                          {item.substring(0, 45).replace(/\n/g, " ")}...
                        </span>
                        <span className="icon">{expandedIndex === index ? "▲" : "▼"}</span>
                      </div>
                      
                      {expandedIndex === index && (
                        <div className="accordion-body">
                          <div className="actions" style={{ marginBottom: "12px", display: "flex", gap: "12px" }}>
                            <button className="copy-action" style={{ flex: 1 }} onClick={() => { navigator.clipboard.writeText(item); showToast("📋 History Copied!"); }}>
                              📋 Copy Comment
                            </button>
                            <button className="danger-action" style={{ flex: 0, padding: "12px 20px" }} onClick={() => deleteFromHistory(index)}>
                              🗑️ Delete
                            </button>
                          </div>
                          <div className="output-container" style={{ maxHeight: "300px" }}>
                            <pre className="output">{item}</pre>
                          </div>
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