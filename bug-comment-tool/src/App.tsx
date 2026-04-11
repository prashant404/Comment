import { useState, useEffect } from "react";
import OutputBox from "./components/OutputBox";
import { generateComment } from "./utils/generateComment";
import type { FormDataType, SampleType, ORIssueType } from "./types/index";

export default function App() {
  const [toast, setToast] = useState("");
  const [output, setOutput] = useState("");

 const [formData, setFormData] = useState<FormDataType>({
    name: localStorage.getItem("buganizer_ldap") || "", 
    attribute: "", gearloose: "", activeScenarios: [],
    overruleType: "", mismatchSS: "", bugLink: "", extractor: "", dashboardSS: "", userAgents: "",
    orIssues: [{ description: "", rating: "", inspector: "", referenceLP: "" }],
    clSamples: [{ cds: "", lp: "", debug: "", rating: "", inspector: "" }], isTrustedCL: "yes",
    historyReasonSS: "", historyAIUOptedSS: "", historySamples: [{ cds: "", lp: "", debug: "" }],
    coverageStatus: "", coverageImproved: "waiting", coverageSS: "", coverageDashboardSS: ""
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

  // Helper functions for dynamic arrays
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
        <h1>⚡</h1>
      </div>

      <div className="main-layout">
        <div className="left-panel">
          
          {/* GLOBAL BLOCK */}
          <div className="card border-blue">
            <h2>🌍 Global Details</h2>
            <input placeholder="Your Name / LDAP *" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
            <input placeholder="Attribute (price/availability) *" value={formData.attribute} onChange={(e) => handleChange("attribute", e.target.value)} />
            {/* Dynamic Placeholder for Gearloose */}
            <input 
              placeholder={formData.overruleType === "dt" ? "Main Gearloose Link (Screenshot SS) *" : "Main Gearloose Link *"} 
              value={formData.gearloose} 
              onChange={(e) => handleChange("gearloose", e.target.value)} 
            />
          </div>

          {/* SCENARIO TOGGLES */}
          <div className="card">
            <h2>🧩 Select Scenarios to Stack</h2>
            <div className="button-group-row">
              <button className={formData.activeScenarios.includes("overrule") ? "active" : "secondary"} onClick={() => handleToggleScenario("overrule")}>+ Overrule</button>
              <button className={formData.activeScenarios.includes("history") ? "active" : "secondary"} onClick={() => handleToggleScenario("history")}>+ History Mismatch</button>
              <button className={formData.activeScenarios.includes("cl") ? "active" : "secondary"} onClick={() => handleToggleScenario("cl")}>+ CL Creation</button>
            </div>
            <div style={{ marginTop: '10px', borderTop: '1px solid #2a2f4c', paddingTop: '10px' }}>
              <button className={formData.activeScenarios.includes("coverage") ? "active-warning" : "secondary"} onClick={() => handleToggleScenario("coverage")}>
                Stand-alone: Waiting for Coverage
              </button>
            </div>
          </div>

          {/* BLOCK A: OVERRULE */}
          {formData.activeScenarios.includes("overrule") && (
            <div className="card">
              <h2>Block A: Overruling</h2>
              <div className="radio-group" style={{ marginBottom: "15px" }}>
                <label className="radio-label"><input type="radio" checked={formData.overruleType === "dt"} onChange={() => handleChange("overruleType", "dt")} /> DT Comment</label>
                <label className="radio-label"><input type="radio" checked={formData.overruleType === "or"} onChange={() => handleChange("overruleType", "or")} /> OR Comment</label>
              </div>
              
              <input placeholder="Mismatches SS Link *" value={formData.mismatchSS} onChange={(e) => handleChange("mismatchSS", e.target.value)} />
              
              {formData.overruleType === "dt" && (
                <input placeholder="OR Bug Link *" value={formData.bugLink} onChange={(e) => handleChange("bugLink", e.target.value)} />
              )}

              {formData.overruleType === "or" && (
                <>
                  <input placeholder="Extractor Link *" value={formData.extractor} onChange={(e) => handleChange("extractor", e.target.value)} />
                  <input placeholder="Dashboard SS Link *" value={formData.dashboardSS} onChange={(e) => handleChange("dashboardSS", e.target.value)} />
                  <input placeholder="User Agents (all / specific) *" value={formData.userAgents} onChange={(e) => handleChange("userAgents", e.target.value)} />
                  
                  {/* DYNAMIC OR ISSUES */}
                  <label>Issues</label>
                  {formData.orIssues.map((issue, i) => (
                    <div key={i} className="sample-block">
                      <strong>Issue {i + 1}</strong>
                      <textarea placeholder="Issue Description *" value={issue.description} onChange={(e) => updateArrayItem("orIssues", i, "description", e.target.value)} />
                      <input placeholder="Rating" value={issue.rating} onChange={(e) => updateArrayItem("orIssues", i, "rating", e.target.value)} />
                      <input placeholder="Inspector" value={issue.inspector} onChange={(e) => updateArrayItem("orIssues", i, "inspector", e.target.value)} />
                      <input placeholder="Reference LP (optional)" value={issue.referenceLP} onChange={(e) => updateArrayItem("orIssues", i, "referenceLP", e.target.value)} />
                      {formData.orIssues.length > 1 && (
                        <button className="danger" onClick={() => removeArrayItem("orIssues", i)}>Remove Issue</button>
                      )}
                    </div>
                  ))}
                  <button className="secondary" onClick={() => addArrayItem("orIssues", { description: "", rating: "", inspector: "", referenceLP: "" })}>+ Add Another Issue</button>
                </>
              )}
            </div>
          )}

          {/* BLOCK B: HISTORY */}
          {formData.activeScenarios.includes("history") && (
            <div className="card">
              <h2>Block B: History Mismatches</h2>
              <input placeholder="Reason SS Link *" value={formData.historyReasonSS} onChange={(e) => handleChange("historyReasonSS", e.target.value)} />
              <input placeholder="AIU Opted SS Link *" value={formData.historyAIUOptedSS} onChange={(e) => handleChange("historyAIUOptedSS", e.target.value)} />
              
              <label>History Samples</label>
              {formData.historySamples.map((sample, i) => (
                <div key={i} className="sample-block">
                  <strong>History Sample {i + 1}</strong>
                  <input placeholder="CDS Link" value={sample.cds} onChange={(e) => updateArrayItem("historySamples", i, "cds", e.target.value)} />
                  <input placeholder="LP Link" value={sample.lp} onChange={(e) => updateArrayItem("historySamples", i, "lp", e.target.value)} />
                  <input placeholder="Debug Link" value={sample.debug} onChange={(e) => updateArrayItem("historySamples", i, "debug", e.target.value)} />
                  {formData.historySamples.length > 1 && (
                    <button className="danger" onClick={() => removeArrayItem("historySamples", i)}>Remove Sample</button>
                  )}
                </div>
              ))}
              <button className="secondary" onClick={() => addArrayItem("historySamples", { cds: "", lp: "", debug: "" })}>+ Add Another Sample</button>
            </div>
          )}

          {/* BLOCK C: CL CREATION */}
          {formData.activeScenarios.includes("cl") && (
            <div className="card">
              <h2>Block C: CL Creation</h2>
              <div className="radio-group" style={{ marginBottom: "15px" }}>
                <label className="radio-label"><input type="radio" checked={formData.isTrustedCL === "yes"} onChange={() => handleChange("isTrustedCL", "yes")} /> Script is Trusted</label>
                <label className="radio-label"><input type="radio" checked={formData.isTrustedCL === "no"} onChange={() => handleChange("isTrustedCL", "no")} /> Script NOT Trusted</label>
              </div>
              
              <label>CL Samples</label>
              {formData.clSamples.map((sample, i) => (
                <div key={i} className="sample-block">
                  <strong>CL Sample {i + 1}</strong>
                  <input placeholder="CDS Link *" value={sample.cds} onChange={(e) => updateArrayItem("clSamples", i, "cds", e.target.value)} />
                  <input placeholder="LP Link *" value={sample.lp} onChange={(e) => updateArrayItem("clSamples", i, "lp", e.target.value)} />
                  <input placeholder="Debug Link *" value={sample.debug} onChange={(e) => updateArrayItem("clSamples", i, "debug", e.target.value)} />
                  <input placeholder="Rating (optional)" value={sample.rating} onChange={(e) => updateArrayItem("clSamples", i, "rating", e.target.value)} />
                  <input placeholder="Inspector (optional)" value={sample.inspector} onChange={(e) => updateArrayItem("clSamples", i, "inspector", e.target.value)} />
                  {formData.clSamples.length > 1 && (
                    <button className="danger" onClick={() => removeArrayItem("clSamples", i)}>Remove Sample</button>
                  )}
                </div>
              ))}
              <button className="secondary" onClick={() => addArrayItem("clSamples", { cds: "", lp: "", debug: "", rating: "", inspector: "" })}>+ Add Another Sample</button>
            </div>
          )}

          {/* BLOCK D: COVERAGE */}
          {formData.activeScenarios.includes("coverage") && (
            <div className="card">
              <h2>Stand-alone: Waiting for Coverage</h2>
              <div className="radio-group" style={{ marginBottom: "15px" }}>
                <label className="radio-label"><input type="radio" checked={formData.coverageStatus === "trusted"} onChange={() => handleChange("coverageStatus", "trusted")} /> Trusted</label>
                <label className="radio-label"><input type="radio" checked={formData.coverageStatus === "not_trusted"} onChange={() => handleChange("coverageStatus", "not_trusted")} /> Not Trusted</label>
              </div>
              
              <input placeholder="Current Coverage Screenshot (SS) *" value={formData.coverageSS} onChange={(e) => handleChange("coverageSS", e.target.value)} />
              
              {formData.coverageStatus === "trusted" && (
                <div className="radio-group">
                  <label className="radio-label"><input type="radio" checked={formData.coverageImproved === "improved"} onChange={() => handleChange("coverageImproved", "improved")} /> Coverage Improved</label>
                  <label className="radio-label"><input type="radio" checked={formData.coverageImproved === "waiting"} onChange={() => handleChange("coverageImproved", "waiting")} /> Waiting to reflect</label>
                </div>
              )}

              {formData.coverageStatus === "not_trusted" && (
                <input placeholder="Dashboard SS *" value={formData.coverageDashboardSS} onChange={(e) => handleChange("coverageDashboardSS", e.target.value)} />
              )}
            </div>
          )}

        </div>

        {/* RIGHT PANEL: Output */}
        <div className="right-panel">
          <div className="card sticky-output">
            <h2>Generated Output</h2>
            <div className="actions">
              <button className="primary-action" onClick={handleGenerate}>⚙️ Generate Comment</button>
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