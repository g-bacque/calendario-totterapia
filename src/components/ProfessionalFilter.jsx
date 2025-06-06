export default function ProfessionalFilter({
  professionals,
  selectedProfessionals,
  toggleProfessional,
  toggleAllProfessionals,
  hideAllOption = false,
}) {
  const allSelected = professionals.length > 0 &&
    selectedProfessionals.length === professionals.length;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {!hideAllOption && (
        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAllProfessionals}
          />
          Todos
        </label>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: hideAllOption ? 0 : '0.5rem' }}>
        {professionals.map((pro) => (
          <label
            key={pro.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <span
              onClick={() => toggleProfessional(pro.id)}
              style={{
                width: '18px',
                height: '18px',
                backgroundColor: selectedProfessionals.includes(pro.id) ? pro.color : 'transparent',
                border: `2px solid ${pro.color}`,
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                color: 'white',
                fontWeight: 'bold',
                transition: 'background-color 0.2s',
                userSelect: 'none',
              }}
            >
              {selectedProfessionals.includes(pro.id) && '✓'}
            </span>
            <span>{pro.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

  