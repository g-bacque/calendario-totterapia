import Modal from 'react-modal';
import { useState, useEffect } from 'react';

Modal.setAppElement('#root'); // para accesibilidad

export default function EventFormModal({ isOpen, onRequestClose, onSave, slotInfo, professionals, selectedEvent, onDelete }) {
  
  //HOOK STATES
  
  const [title, setTitle] = useState('');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [repeat, setRepeat] = useState('none');
  const [repeatUntil, setRepeatUntil] = useState('');
  const [applyToSeries, setApplyToSeries] = useState(false);


  


  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setProfessionalId(String(selectedEvent.professionalId) || '');
      setStart(new Date(selectedEvent.start));
      setEnd(new Date(selectedEvent.end));
      setRepeat(selectedEvent.repeat || 'none');
      setRepeatUntil(
        selectedEvent.repeatUntil
          ? new Date(selectedEvent.repeatUntil).toISOString().split('T')[0]
          : ''
      );
      setApplyToSeries(false); // por defecto en falso al abrir
    } else if (slotInfo) {
      setTitle('');
      setProfessionalId(professionals[0]?.id || '');
      setStart(slotInfo.start);
      setEnd(slotInfo.end);
      setRepeat('none');
      setRepeatUntil('');
      setApplyToSeries(false);
    } else {
      // en caso de que no haya ni slotInfo ni selectedEvent
      setTitle('');
      setProfessionalId(professionals[0]?.id || '');
      setStart(null);
      setEnd(null);
      setRepeat('none');
      setRepeatUntil('');
      setApplyToSeries(false);
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
      repeat,
      repeatUntil: repeatUntil ? new Date(repeatUntil) : null,
      seriesId: selectedEvent?.seriesId,
      applyToSeries: applyToSeries && selectedEvent?.seriesId !== undefined,
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

        <label>Repetir:</label>
        <select value={repeat} onChange={(e) => setRepeat(e.target.value)}>
          <option value="none">No repetir</option>
          <option value="daily">Cada día</option>
          <option value="weekly">Cada semana</option>
        </select>

        {repeat !== 'none' && (
          <>
            <label>Repetir hasta:</label>
            <input
              type="date"
              value={repeatUntil}
              onChange={(e) => setRepeatUntil(e.target.value)}
            />
          </>
        )}

        {selectedEvent?.seriesId && (
          <div style={{ marginTop: '1rem' }}>
            <label>
              <input
                type="checkbox"
                checked={applyToSeries}
                onChange={(e) => setApplyToSeries(e.target.checked)}
              />
              Aplicar cambios a toda la serie
            </label>
          </div>
        )}


        <button type="submit" style={{ marginTop: '1rem' }}>
          {selectedEvent ? 'Guardar cambios' : 'Crear evento'}
        </button>
        {selectedEvent && (
  <>
    <button
      type="button"
      style={{ marginTop: '1rem', backgroundColor: 'red', color: 'white' }}
      onClick={() => {
        onDelete(selectedEvent.id); // elimina solo este
        onRequestClose();
      }}
    >
      Eliminar solo este
    </button>

          {selectedEvent.seriesId && (
            <button
              type="button"
              style={{ marginTop: '1rem', marginLeft: '1rem', backgroundColor: 'darkred', color: 'white' }}
              onClick={() => {
                onDelete(null, selectedEvent.seriesId); // elimina toda la serie
                onRequestClose();
              }}
            >
              Eliminar toda la serie
            </button>
          )}
        </>
      )}

      </form>
    </Modal>
  );
}
