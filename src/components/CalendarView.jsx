// Este componente contendrá la vista general del calendario y orquestará los demás
// Empezaremos dividiendo CalendarView en subcomponentes en los siguientes pasos

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './CalendarCustomStyles.css';
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
//import EventFormModal from "./EventFormModal";
import EventFormModal from "./EventFormModal";
import ProfessionalFilter from './ProfessionalFilter';
import RoomFilter from './RoomFilter';
import { generateSeriesId, getNextEventId, generateRepeatedEvents } from "../utils/eventUtils";
import { rooms } from '../data/rooms'; // ajusta ruta si es necesario





const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);


const professionals = [
    { id: 1, name: "Dra. Martínez" },
    { id: 2, name: "Dr. Rodríguez" },
    { id: 3, name: "Lic. García" }
  ];


  //-----------------------------------------


export default function CalendarView() {
    const [events, setEvents] = useState([
        {
          id: 1,
          title: "Sesión con Juan Pérez",
          start: new Date(2025, 5, 3, 16, 0),
          end: new Date(2025, 5, 3, 16, 45),
          professionalId: 1,
          roomId: 2
        },
        {
          id: 2,
          title: "Evaluación inicial",
          start: new Date(2025, 5, 4, 10, 0),
          end: new Date(2025, 5, 4, 10, 45),
          professionalId: 2,
          roomId: 1
        }
      ]);
      
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedProfessionals, setSelectedProfessionals] = useState(
    professionals.map((p) => p.id) // al principio, todos están seleccionados
  );


  const toggleProfessional = (id) => {
    setSelectedProfessionals((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((pid) => pid !== id)
        : [...prevSelected, id]
    );
  };

  const [selectedRooms, setSelectedRooms] = useState(rooms.map((r) => r.id));

  const toggleRoom = (id) => {
    setSelectedRooms((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };
  
  const toggleAllProfessionals = () => {
    if (selectedProfessionals.length === professionals.length) {
      setSelectedProfessionals([]); // si ya están todos, desmarcar
    } else {
      setSelectedProfessionals(professionals.map((p) => p.id)); // si no, marcar todos
    }
  };
  

 const toggleAllRooms = () => {
  if (selectedRooms.length === rooms.length) {
    setSelectedRooms([]); // si ya están todos, desmarcar
  } else {
    setSelectedRooms(rooms.map((r) => r.id)); // si no, marcar todos
  }
};


  
  
  const filteredEvents = events.filter((e) => {
    const professionalMatch =
      selectedProfessionals.length === 0 ? false : selectedProfessionals.includes(e.professionalId);
  
    const roomMatch =
      selectedRooms.length === 0 ? false : selectedRooms.includes(e.roomId);
  
    return professionalMatch || roomMatch
      ? (selectedProfessionals.length > 0 && selectedRooms.length > 0
          ? selectedProfessionals.includes(e.professionalId) && selectedRooms.includes(e.roomId)
          : selectedProfessionals.includes(e.professionalId) || selectedRooms.includes(e.roomId))
      : false;
  });
  
  
  

  const eventStyleGetter = (event) => {
    const color = professionalColors[event.professionalId] || '#D3D3D3'; // gris por defecto
    return {
      style: {
        backgroundColor: color,
        borderRadius: '5px',
        color: 'black',
        border: 'none',
        padding: '4px'
      }
    };
  };
  

  const handleSelectSlot = (slotInfo) => {
    setSelectedSlot(slotInfo);
    setModalOpen(true); // 👈 esta línea es la que abre el modal
  };
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null); // opcional: evita conflictos con nuevos slots
    setModalOpen(true); // 👉 esto abre el modal
  };
  
  
  const handleDeleteEvent = (idToDelete, seriesId = null) => {
    if (seriesId) {
      // Borrar todos los eventos con ese seriesId
      setEvents((prev) => prev.filter((e) => e.seriesId !== seriesId));
    } else {
      // Borrar solo uno
      setEvents((prev) => prev.filter((e) => e.id !== idToDelete));
    }
  };

  const hasConflict = (newEvent, events) => {
    return events.some((event) => {
      // Si estamos editando un evento, ignoramos ese mismo evento
      if (event.id === newEvent.id) return false;
  
      const sameProfessional = event.professionalId === newEvent.professionalId;
      const sameRoom = event.roomId === newEvent.roomId;
  
      const overlaps =
        new Date(newEvent.start) < new Date(event.end) &&
        new Date(newEvent.end) > new Date(event.start);
  
      // Hay conflicto si se superpone con el mismo profesional o la misma sala
      return (sameProfessional || sameRoom) && overlaps;
    });
  };
  
  

  const handleSaveEvent = (newEvent) => {
    console.log("Guardando evento:", newEvent);

     // Validar conflictos antes de guardar

  
    const nextId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  
    // 1. Edición de evento existente
    if (newEvent.id !== undefined) {
      if (newEvent.applyToSeries && newEvent.seriesId) {
        // Editar toda la serie
        setEvents((prevEvents) =>
          prevEvents.map((e) =>
            e.seriesId === newEvent.seriesId
              ? {
                  ...e,
                  ...(newEvent.title !== undefined && { title: newEvent.title }),
                  ...(newEvent.professionalId !== undefined && { professionalId: newEvent.professionalId }),
                  ...(newEvent.roomId !== undefined && { roomId: newEvent.roomId }),
                  // Hora: calculada de forma relativa
                  start: new Date(
                    new Date(e.start).setHours(
                      new Date(newEvent.start).getHours(),
                      new Date(newEvent.start).getMinutes()
                    )
                  ),
                  end: new Date(
                    new Date(e.end).setHours(
                      new Date(newEvent.end).getHours(),
                      new Date(newEvent.end).getMinutes()
                    )
                  ),
                }
              : e
          )
        );
      } else {
        // Editar un solo evento
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === newEvent.id ? newEvent : e))
        );
      }
      return;
    }
  
    // 2. Evento único
    if (!newEvent.repeat || newEvent.repeat === 'none') {
      setEvents([...events, { ...newEvent, id: nextId }]);
      return;
    }
  
    // 3. Crear eventos repetitivos
    const startDate = new Date(newEvent.start);
    const endDate = new Date(newEvent.end);
    const untilDate = newEvent.repeatUntil ? new Date(newEvent.repeatUntil) : null;
  
    const repeatedEvents = [];
    let count = 0;
    const maxRepeats = 100;
    const interval = newEvent.repeat === 'daily' ? 1 : 7;
    const seriesId = Date.now();
  
    let currentStart = new Date(startDate);
    let currentEnd = new Date(endDate);
  
    while ((!untilDate || currentStart <= untilDate) && count < maxRepeats) {
      repeatedEvents.push({
        ...newEvent,
        id: nextId + count,
        start: new Date(currentStart),
        end: new Date(currentEnd),
        seriesId,
      });
  
      currentStart.setDate(currentStart.getDate() + interval);
      currentEnd.setDate(currentEnd.getDate() + interval);
      count++;
    }
  
    setEvents([...events, ...repeatedEvents]);
  };
  

  
  const professionalColors = {
    1: '#FFB6C1', // Dra. Martínez
    2: '#ADD8E6', // Dr. Rodríguez
    3: '#90EE90', // Lic. García
    // Añade más si agregas más profesionales
  };
  

  return (
    
    <div style={{ padding: "1rem" }}>
        <h2>Calendario de Profesionales</h2>

    {/* Filtro por profesional */}
    <div style={{ marginBottom: '1rem' }}>

      <ProfessionalFilter
      professionals={professionals}
      selectedProfessionals={selectedProfessionals}
      toggleProfessional={toggleProfessional}
      toggleAllProfessionals={toggleAllProfessionals}
    />

      <RoomFilter
      rooms={rooms}
      selectedRooms={selectedRooms}
      toggleRoom={toggleRoom}
      toggleAllRooms={toggleAllRooms}
    />
      

      
    </div>


        <DnDCalendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "80vh" }}
          views={["month", "week", "day"]}
          view={view}
          date={date}
          onView={setView}
          onNavigate={setDate}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          onEventDrop={({ event, start, end }) => {
            const updatedEvent = { ...event, start, end };
            handleSaveEvent(updatedEvent);
          }}
          onEventResize={({ event, start, end }) => {
            const updatedEvent = { ...event, start, end };
            handleSaveEvent(updatedEvent);
          }}
          resizable
          step={15}
          timeslots={4}
          components={{
            event: ({ event }) => {
              const professional = professionals.find(p => p.id === event.professionalId);
              return (
                <span>
                  {event.title}
                  <br />
                  <small>{professional?.name || "Profesional desconocido"}</small>
                </span>
              );
            }
          }}
          eventPropGetter={eventStyleGetter}
        />

        <EventFormModal
        isOpen={modalOpen}
        onRequestClose={() => {
            setModalOpen(false);
            setSelectedEvent(null); // limpia al cerrar
            
        }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent} // esto si agregas un botón de borrar
        slotInfo={selectedSlot}
        selectedEvent={selectedEvent} // 👈 aquí pasamos el evento
        professionals={professionals}
        events={events}
        />


    </div>
  );
}