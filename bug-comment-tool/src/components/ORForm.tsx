import type { FormDataType } from "../types";

export default function ORForm({ formData, setFormData }: { formData: FormDataType, setFormData: any }) {
  const addIssue = () => {
    setFormData((p: FormDataType) => ({
      ...p,
      orIssues: [...p.orIssues, { description: "", rating: "", inspector: "", referenceLP: "" }],
    }));
  };

  const updateIssue = (index: number, field: string, value: string) => {
    const updated = [...formData.orIssues];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((p: FormDataType) => ({ ...p, orIssues: updated }));
  };

  return (
    <div className="card">
      <input
        placeholder="Gearloose Link *"
        value={formData.gearloose}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, gearloose: e.target.value }))}
      />
      <input
        placeholder="Extractor Link *"
        value={formData.extractor}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, extractor: e.target.value }))}
      />
      <input
        placeholder="Mismatch Link *"
        value={formData.mismatch}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, mismatch: e.target.value }))}
      />
      <input
        placeholder="Attribute (price/availability) *"
        value={formData.attribute}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, attribute: e.target.value }))}
      />

      <label>Issues</label>
      {formData.orIssues.map((issue, i) => (
        <div key={i} className="sample-block">
          <strong>Issue {i + 1}</strong>
          <textarea
            placeholder="Issue Description *"
            value={issue.description}
            onChange={(e) => updateIssue(i, "description", e.target.value)}
          />
          <input
            placeholder="Rating"
            value={issue.rating}
            onChange={(e) => updateIssue(i, "rating", e.target.value)}
          />
          <input
            placeholder="Inspector"
            value={issue.inspector}
            onChange={(e) => updateIssue(i, "inspector", e.target.value)}
          />
          <input
            placeholder="Reference LP (optional)"
            value={issue.referenceLP}
            onChange={(e) => updateIssue(i, "referenceLP", e.target.value)}
          />
        </div>
      ))}

      <button className="secondary" onClick={addIssue}>+ Add Another Issue</button>

      <input
        placeholder="Your Name *"
        value={formData.name}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, name: e.target.value }))}
      />
    </div>
  );
}