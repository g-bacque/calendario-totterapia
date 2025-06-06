import { useState } from "react";
import ProfessionalFilter from './ProfessionalFilter';
import RoomFilter from './RoomFilter';

export default function Sidebar({
  professionals,
  selectedProfessionals,
  toggleProfessional,
  toggleAllProfessionals,
  rooms,
  selectedRooms,
  toggleRoom,
  toggleAllRooms
}) {
  const [showProfessionals, setShowProfessionals] = useState(true);
  const [showRooms, setShowRooms] = useState(true);

  return (
    <div style={{
      width: "260px",
      padding: "1rem",
      borderRight: "1px solid #ccc",
      backgroundColor: "#f9f9f9",
      overflowY: "auto"
    }}>
      {/* PROFESIONALES */}
      <div>
        <button
          onClick={() => setShowProfessionals(!showProfessionals)}
          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          {showProfessionals ? "▼" : "▶"} Profesionales
        </button>

         {/* Checkbox de Todos siempre visible */}
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={professionals.length > 0 && selectedProfessionals.length === professionals.length}
              onChange={toggleAllProfessionals}
            />
            Todos
          </label>
        </div>

        {/* Listado solo si expandido */}
        {showProfessionals && (
          <ProfessionalFilter
            professionals={professionals}
            selectedProfessionals={selectedProfessionals}
            toggleProfessional={toggleProfessional}
            toggleAllProfessionals={toggleAllProfessionals} // aún se pasa, por si acaso
            hideAllOption={true} // (opcional) si quieres ocultarlo dentro de ProfessionalFilter
          />
        )}
      </div>

      {/* DESPACHOS */}
      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => setShowRooms(!showRooms)}
          style={{ background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}
        >
          {showRooms ? "▼" : "▶"} Despachos
        </button>

        {/* Checkbox de Todos siempre visible */}
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={rooms.length > 0 && selectedRooms.length === rooms.length}
              onChange={toggleAllRooms}
            />
            Todos
          </label>
        </div>

        {showRooms && (
          <RoomFilter
            rooms={rooms}
            selectedRooms={selectedRooms}
            toggleRoom={toggleRoom}
            toggleAllRooms={toggleAllRooms}
            hideAllOption={true} // 👈 Evita mostrar el checkbox dentro
          />
        )}
      </div>

    </div>
  );
}
