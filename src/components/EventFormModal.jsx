import Modal from 'react-modal';
import { useState, useEffect } from 'react';

Modal.setAppElement('#root'); // para accesibilidad

export default function EventFormModal({ isOpen, onRequestClose, onSave, slotInfo, professionals, selectedEvent, onDelete }) {
  const [title, setTitle] = useState('');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [repeat, setRepeat] = useState('none');


  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setProfessionalId(String(selectedEvent.professionalId) || '');
      setStart(new Date(selectedEvent.start));
      setEnd(new Date(selectedEvent.end));
    } else if (slotInfo) {
      setTitle('');
      setProfessionalId(professionals[0]?.id || '');
      setStart(slotInfo.start);
      setEnd(slotInfo.end);
    } else {
      setTitle('');
      setProfessionalId(professionals[0]?.id || '');
      setStart(null);
      setEnd(null);
    }
  }, [slotInfo, selectedEvent, professionals]);
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !start || !end) return;
  
    const eventData = {
      title,
      start,
      end,
      professionalId: Number(professionalId), // 👈 nos aseguramos de que es un número
    };
  
    // Si es una edición, incluye el id existente
    if (selectedEvent?.id !== undefined) {
      eventData.id = selectedEvent.id;
    }
  
    onSave(eventData);
    onRequestClose();
  };


  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Crear o editar evento"
      style={{
        content: {
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          padding: '2rem', width: '300px'
        }
      }}
    >
      <h3>{selectedEvent ? 'Editar evento' : 'Nuevo evento'}</h3>
      <form onSubmit={handleSubmit}>
        <label>Título:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label>Profesional:</label>
        <select
          value={professionalId}
          onChange={(e) => setProfessionalId(Number(e.target.value))}
        >
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <label>Inicio:</label>
        <input
          type="datetime-local"
          value={start ? new Date(start).toISOString().slice(0, 16) : ""}
          onChange={(e) => setStart(new Date(e.target.value))}
        />

        <label>Fin:</label>
        <input
          type="datetime-local"
          value={end ? new Date(end).toISOString().slice(0, 16) : ""}
          onChange={(e) => setEnd(new Date(e.target.value))}
        />

        {/* Aquí podrías poner inputs de fecha si lo deseas */}

        <button type="submit" style={{ marginTop: '1rem' }}>
          {selectedEvent ? 'Guardar cambios' : 'Crear evento'}
        </button>
        {selectedEvent && (
          <button
            type="button"
            style={{ marginLeft: '1rem', backgroundColor: 'red', color: 'white' }}
            onClick={() => {
              onDelete(selectedEvent.id);
              onRequestClose();
            }}
          >
            Eliminar
          </button>
        )}
      </form>
    </Modal>
  );
}
