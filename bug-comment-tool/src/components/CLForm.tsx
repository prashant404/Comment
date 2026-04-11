import type { FormDataType } from "../types";

export default function CLForm({ formData, setFormData }: { formData: FormDataType, setFormData: any }) {
  const addSample = () => {
    setFormData((p: FormDataType) => ({
      ...p,
      samples: [...p.samples, { cds: "", lp: "", debug: "", rating: "", inspector: "" }],
    }));
  };

  const removeSample = (index: number) => {
    const updated = formData.samples.filter((_, i) => i !== index);
    setFormData((p: FormDataType) => ({ ...p, samples: updated }));
  };

  const updateSample = (index: number, field: string, value: string) => {
    const updated = [...formData.samples];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((p: FormDataType) => ({ ...p, samples: updated }));
  };

  return (
    <div className="card">
      <input
        placeholder="Gearloose Link *"
        value={formData.gearloose}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, gearloose: e.target.value }))}
      />

      <input
        placeholder="Mismatches Screenshot Link *"
        value={formData.mismatch}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, mismatch: e.target.value }))}
      />

      <label>Samples for Reference</label>
      {formData.samples.map((sample, i) => (
        <div key={i} className="sample-block">
          <strong>Sample {i + 1}</strong>
          
          {/* Now Mandatory */}
          <input
            placeholder="CDS Link *"
            value={sample.cds}
            onChange={(e) => updateSample(i, "cds", e.target.value)}
          />
          <input
            placeholder="LP Link *"
            value={sample.lp}
            onChange={(e) => updateSample(i, "lp", e.target.value)}
          />
          <input
            placeholder="Debug Link *"
            value={sample.debug}
            onChange={(e) => updateSample(i, "debug", e.target.value)}
          />
          
          {/* Still Optional */}
          <input
            placeholder="Rating (optional)"
            value={sample.rating}
            onChange={(e) => updateSample(i, "rating", e.target.value)}
          />
          <input
            placeholder="Inspector (optional)"
            value={sample.inspector}
            onChange={(e) => updateSample(i, "inspector", e.target.value)}
          />
          
          {formData.samples.length > 1 && (
            <button className="danger" onClick={() => removeSample(i)}>Remove Sample</button>
          )}
        </div>
      ))}

      <button className="secondary" onClick={addSample}>+ Add Another Sample</button>

      <input
        placeholder="Attribute (price/availability) *"
        value={formData.attribute}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, attribute: e.target.value }))}
      />

      <input
        placeholder="Your Name *"
        value={formData.name}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, name: e.target.value }))}
      />
    </div>
  );
}