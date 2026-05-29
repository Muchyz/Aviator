export default function PhoneInput({ value, onChange }) {
  return (
    <div className="phone-wrap">
      <div className="phone-flag">🇰🇪 +254</div>
      <input
        className="phone-input"
        placeholder="7XX XXX XXX"
        value={value.replace(/^254/, "")}
        onChange={e =>
          onChange("254" + e.target.value.replace(/^0/, "").replace(/\D/g, ""))
        }
      />
    </div>
  );
}