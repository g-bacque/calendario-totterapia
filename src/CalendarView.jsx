import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useState } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import './CalendarCustomStyles.css';
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
//import EventFormModal from "./EventFormModal";
import EventFormModal from "./components/EventFormModal";



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
          professionalId: 1
        },
        {
          id: 2,
          title: "Evaluación inicial",
          start: new Date(2025, 5, 4, 10, 0),
          end: new Date(2025, 5, 4, 10, 45),
          professionalId: 2
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

  
  
  const filteredEvents = events.filter((e) =>
    selectedProfessionals.includes(e.professionalId)
  );

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
  
  
  const handleDeleteEvent = (idToDelete) => {
    setEvents(events.filter((e) => e.id !== idToDelete));
  };

  const handleSaveEvent = (newEvent) => {
    console.log("Guardando evento:", newEvent);
    if (newEvent.id) {
        // Es una edición: reemplaza el evento con el mismo ID
        setEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === newEvent.id ? newEvent : e))
        );
      } else {
        // Es un nuevo evento
        const nextId = events.length > 0 ? Math.max(...events.map((e) => e.id)) + 1 : 1;
        setEvents([...events, { ...newEvent, id: nextId }]);
      }
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
    <strong>Filtrar por profesional:</strong>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
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
        console.log("Eventos actuales:", events);

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
        />


    </div>
  );
}
