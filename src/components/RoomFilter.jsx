export default function RoomFilter({
    rooms,
    selectedRooms,
    toggleRoom,
    toggleAllRooms,
  }) {
    const allSelected = rooms.length > 0 && selectedRooms.length === rooms.length;
  
    return (
      <div style={{ marginBottom: '1rem' }}>
        <strong>Filtrar por despacho:</strong>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
          <label>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAllRooms}
            />
            Todos
          </label>
          {rooms.map((room) => (
            <label key={room.id}>
              <input
                type="checkbox"
                checked={selectedRooms.includes(room.id)}
                onChange={() => toggleRoom(room.id)}
              />
              {room.name}
            </label>
          ))}
        </div>
      </div>
    );
  }
  