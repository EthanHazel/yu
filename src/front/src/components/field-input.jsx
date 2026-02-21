import "../styles/field-input.css";

export default function FieldInput({
  label,
  description,
  factoryDefault,
  type,
  name,
  onChange,
  children,
  ...props
}) {
  function handleChange(e) {
    if (!onChange) return;

    const value = type === "checkbox" ? e.target.checked : e.target.value;

    onChange(name, value);
  }

  if (type === "select") {
    return (
      <div className="field-input select-field">
        <div className="field-info">
          <label className="field-label" htmlFor={name}>
            {label}
          </label>
          <span className="field-description">{description}</span>
          {factoryDefault && (
            <span className="field-factory-default">
              Default: {factoryDefault}
            </span>
          )}
        </div>

        <select
          name={name}
          value={props.value ?? ""}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
      </div>
    );
  }

  return (
    <div className={"field-input " + type + "-field"}>
      <div className="field-info">
        <label className="field-label" htmlFor={name}>
          {label}
        </label>
        <span className="field-description">{description}</span>

        {factoryDefault && (
          <span className="field-factory-default">
            Default: {factoryDefault}
          </span>
        )}
      </div>

      <input
        name={name}
        type={type}
        value={type !== "checkbox" ? (props.value ?? "") : undefined}
        checked={type === "checkbox" ? (props.value ?? false) : undefined}
        onChange={handleChange}
        {...props}
      />
    </div>
  );
}
