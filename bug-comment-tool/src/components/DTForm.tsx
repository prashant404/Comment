import type { FormDataType } from "../types";

export default function DTForm({ formData, setFormData }: { formData: FormDataType, setFormData: any }) {
  return (
    <div className="card">
      <input
        placeholder="Gearloose Link *"
        value={formData.gearloose}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, gearloose: e.target.value }))}
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
      <input
        placeholder="OR Bug Link *"
        value={formData.bugLink}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, bugLink: e.target.value }))}
      />
      <input
        placeholder="Your Name *"
        value={formData.name}
        onChange={(e) => setFormData((p: FormDataType) => ({ ...p, name: e.target.value }))}
      />
    </div>
  );
}