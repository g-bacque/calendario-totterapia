import { useState, useEffect } from "react";

export default function EventFormModal({ isOpen, onClose, onSave, slotInfo }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (isOpen) setTitle("");
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) return;
    onSave({
      title,
      start: slotInfo.start,
      end: slotInfo.end,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={modalStyle}>
      <h3>Nuevo Evento</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Título del evento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <br />
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: "30%",
  left: "30%",
  background: "white",
  border: "1px solid gray",
  padding: "20px",
  zIndex: 1000
};
