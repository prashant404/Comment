import { useState, useEffect } from "react";
import OutputBox from "./components/OutputBox";
import { generateComment } from "./utils/generateComment";
import type { FormDataType } from "./types/index";

export default function App() {
  const [toast, setToast] = useState("");
  const [output, setOutput] = useState("");

  const [formData, setFormData] = useState<FormDataType>({
    name: localStorage.getItem("buganizer_ldap") || "", 
    attribute: "", gearloose: "", activeScenarios: [],
    overruleType: "", mismatchSS: "", bugLink: "", extractor: "", dashboardSS: "", userAgents: "",
    orIssues: [{ description: "", rating: "", inspector: "", referenceLP: "" }],
    clSamples: [{ cds: "", lp: "", debug: "", rating: "", inspector: "" }],
    historyReasonSS: "", historyAIUOptedSS: "", historySamples: [{ cds: "", lp: "", debug: "" }],
    coverageImproved: "waiting", coverageSS: ""
  });

  useEffect(() => {
    localStorage.setItem("buganizer_ldap", formData.name);
  }, [formData.name]);

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

  const handleChange = (field: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: "orIssues" | "clSamples" | "historySamples", defaultObj: any) => {
    setFormData((p: any) => ({ ...p, [field]: [...p[field], defaultObj] }));
  };

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleGenerate = () => {
    if (!formData.name || !formData.attribute || !formData.gearloose) {
      showToast("⚠️ Please fill Global Fields (Name, Attribute, Main Gearloose)");
      return;
    }
    if (formData.activeScenarios.length === 0) {
      showToast("⚠️ Please select at least one scenario block");
      return;
    }

    const result = generateComment(formData);
    setOutput(result);
    showToast("✅ Comment Generated successfully!");
  };

  return (
    <div className="app-wrapper">
      <div className="top-bar">
        <h1>⚡ Buganizer Tool</h1>
      </div>

      <div className="main-layout">
        <div className="left-panel">
          
          <div className="card border-blue">
            <h2>Global Details</h2>
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
            <h2>Select Scenarios</h2>
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
              <div className="radio-group" style={{ marginBottom: "16px" }}>
                <label className={`radio-label ${formData.overruleType === "dt" ? "selected" : ""}`}>
                  <input type="radio" checked={formData.overruleType === "dt"} onChange={() => handleChange("overruleType", "dt")} /> DT Comment
                </label>
                <label className={`radio-label ${formData.overruleType === "or" ? "selected" : ""}`}>
                  <input type="radio" checked={formData.overruleType === "or"} onChange={() => handleChange("overruleType", "or")} /> OR Comment
                </label>
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
              
              <div className="radio-group" style={{ marginTop: "12px" }}>
                <label className={`radio-label ${formData.coverageImproved === "improved" ? "selected" : ""}`}>
                  <input type="radio" checked={formData.coverageImproved === "improved"} onChange={() => handleChange("coverageImproved", "improved")} /> Coverage Improved
                </label>
                <label className={`radio-label ${formData.coverageImproved === "waiting" ? "selected" : ""}`}>
                  <input type="radio" checked={formData.coverageImproved === "waiting"} onChange={() => handleChange("coverageImproved", "waiting")} /> Waiting to reflect
                </label>
              </div>
            </div>
          )}

        </div>

        <div className="right-panel">
          <div className="card sticky-output">
            <h2>Generated Document</h2>
            <div className="actions">
              <button className="primary-action" onClick={handleGenerate}>⚙️ Generate</button>
              <button className="copy-action" onClick={() => { navigator.clipboard.writeText(output); showToast("📋 Copied!"); }} disabled={!output}>📋 Copy</button>
            </div>
            <OutputBox output={output} />
          </div>
        </div>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}