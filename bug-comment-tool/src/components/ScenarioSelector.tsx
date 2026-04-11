export default function ScenarioSelector({ formData, setFormData }: any) {
  return (
    <div className="card">
      <select
        value={formData.scenario}
        onChange={(e) =>
          setFormData((prev: any) => ({
            ...prev,
            scenario: e.target.value,
            type: "",
          }))
        }
      >
        <option value="">Select Scenario</option>
        <option value="overrule">Overrule</option>
        <option value="cl">CL Creation</option>
      </select>
    </div>
  );
}