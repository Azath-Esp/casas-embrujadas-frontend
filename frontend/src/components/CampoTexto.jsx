
export default function CampoTexto({ etiqueta, nombre, id = nombre, valor, onChange, error, filas = 4 }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      <textarea id={id} name={nombre} rows={filas} value={valor} onChange={onChange}
        className={`form-control ${error ? 'is-invalid' : ''}`} />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
}
