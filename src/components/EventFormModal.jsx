import Modal from 'react-modal';
import { useState, useEffect } from 'react';
import { rooms } from '../data/rooms';


Modal.setAppElement('#root'); // para accesibilidad

export default function EventFormModal({ isOpen, onRequestClose, onSave, slotInfo, professionals, selectedEvent, onDelete, events }) {
  
  //HOOK STATES
  
  const [title, setTitle] = useState('');
  const [professionalId, setProfessionalId] = useState(professionals[0]?.id || '');
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [repeat, setRepeat] = useState('none');
  const [repeatUntil, setRepeatUntil] = useState('');
  const [applyToSeries, setApplyToSeries] = useState(false);
  const [roomId, setRoomId] = useState(rooms[0]?.id || '');
  const [conflictMessage, setConflictMessage] = useState('');
  const [forceSave, setForceSave] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(null);






  


  useEffect(() => {
    if (selectedEvent) {
      setTitle(selectedEvent.title || '');
      setProfessionalId(String(selectedEvent.professionalId) || '');
      setRoomId(String(selectedEvent.roomId) || rooms[0]?.id || '');
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
      setRoomId(rooms[0]?.id || '');
      setStart(slotInfo.start);
      setEnd(slotInfo.end);
      setRepeat('none');
      setRepeatUntil('');
      setApplyToSeries(false);
    } else {
      setTitle('');
      setProfessionalId(professionals[0]?.id || '');
      setRoomId(rooms[0]?.id || '');
      setStart(null);
      setEnd(null);
      setRepeat('none');
      setRepeatUntil('');
      setApplyToSeries(false);
    }
  }, [slotInfo, selectedEvent, professionals]);


  
  
  
  
  const checkConflict = (newEvent) => {
    return events.some((event) => {
      if (event.id === newEvent.id) return false;
  
      const sameProfessional = event.professionalId === newEvent.professionalId;
      const sameRoom = event.roomId === newEvent.roomId;
  
      const overlaps =
        new Date(newEvent.start) < new Date(event.end) &&
        new Date(newEvent.end) > new Date(event.start);
  
      return (sameProfessional || sameRoom) && overlaps;
    });
  };
  
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !start || !end) return;
  
    const eventData = {
      id: selectedEvent?.id,
      title,
      start,
      end,
      professionalId: Number(professionalId),
      roomId: Number(roomId), // 👈 Aquí añadimos roomId
      repeat,
      repeatUntil: repeatUntil ? new Date(repeatUntil) : null,
      seriesId: selectedEvent?.seriesId,
      applyToSeries,
    };

    const hasConflict = checkConflict(eventData);

    if (hasConflict && !forceSave) {
      setConflictMessage("⚠️ Este profesional o despacho ya tienen un evento en ese horario.");
      setPendingEvent(eventData); // guardamos el evento temporalmente
      setForceSave(true);         // marcamos que se desea forzar
      return;
    }
  
    // Si no hay conflicto o el usuario ya confirmó que quiere guardar igual
    setConflictMessage('');
    onSave(eventData);
    onRequestClose();
    setForceSave(false);     // limpiamos
    setPendingEvent(null);   // limpiamos
  };

  const handleClose = () => {
    setConflictMessage('');
    setForceSave(false);
    onRequestClose(); // Esta sigue viniendo de CalendarView
  };
  
  

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={handleClose}
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

        <label>Consultorio:</label>
        <select
          value={roomId}
          onChange={(e) => setRoomId(Number(e.target.value))}
        >
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>{room.name}</option>
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

        {conflictMessage && (
          <>
            <div style={{ color: 'red', marginTop: '1rem' }}>
              {conflictMessage}
            </div>
            {forceSave && (
              <button
                type="button"
                style={{ marginTop: '1rem', backgroundColor: 'orange' }}
                onClick={() => {
                  if (pendingEvent) {
                    onSave(pendingEvent);
                    onRequestClose();
                    setForceSave(false);
                    setPendingEvent(null);
                    setConflictMessage('');
                  }
                }}
              >
                Guardar de todos modos
              </button>
            )}
          </>
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
        handleClose();
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
                handleClose();
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
