import type { FormDataType } from "../types";

export default function TypeSelector({ formData, setFormData }: { formData: FormDataType, setFormData: any }) {
  return (
    <div className="card">
      <label>Select Comment Type</label>
      <div className="radio-group">
        <label className="radio-label">
          <input
            type="radio"
            name="type"
            value="dt"
            checked={formData.type === "dt"}
            onChange={(e) => setFormData((p: FormDataType) => ({ ...p, type: e.target.value }))}
          />
          DT Comment
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="type"
            value="or"
            checked={formData.type === "or"}
            onChange={(e) => setFormData((p: FormDataType) => ({ ...p, type: e.target.value }))}
          />
          OR Comment
        </label>
      </div>
    </div>
  );
}