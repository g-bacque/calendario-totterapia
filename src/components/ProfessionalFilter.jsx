export default function ProfessionalFilter({
    professionals,
    selectedProfessionals,
    toggleProfessional,
    toggleAllProfessionals,
  }) {
    const allSelected = professionals.length > 0 &&
      selectedProfessionals.length === professionals.length;
  
    return (
      <div style={{ marginBottom: '1rem' }}>
        <strong>Filtrar por profesional:</strong>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAllProfessionals}
            />
            Todos
          </label>
          {professionals.map((pro) => (
            <label key={pro.id}>
              <input
                type="checkbox"
                checked={selectedProfessionals.includes(pro.id)}
                onChange={() => toggleProfessional(pro.id)}
              />
              {pro.name}
            </label>
          ))}
        </div>
      </div>
    );
  }
  