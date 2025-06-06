export default function RoomFilter({
  rooms,
  selectedRooms,
  toggleRoom,
  toggleAllRooms,
  hideAllOption = false,
}) {
  const allSelected = rooms.length > 0 &&
    selectedRooms.length === rooms.length;

  return (
    <div style={{ marginBottom: '1rem' }}>
      {!hideAllOption && (
        <label style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAllRooms}
          />
          Todos
        </label>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: hideAllOption ? 0 : '0.5rem' }}>
        {rooms.map((room) => (
          <label
            key={room.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}
          >
            <span
              onClick={() => toggleRoom(room.id)}
              style={{
                width: '18px',
                height: '18px',
                backgroundColor: selectedRooms.includes(room.id) ? room.color : 'transparent',
                border: `2px solid ${room.color}`,
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
              {selectedRooms.includes(room.id) && '✓'}
            </span>
            <span>{room.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

  