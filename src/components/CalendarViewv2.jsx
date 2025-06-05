
// Este componente contendrá la vista general del calendario y orquestará los demás

import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { useEffect, useState } from 'react';
import "react-big-calendar/lib/css/react-big-calendar.css";
import './CalendarCustomStyles.css';
import { format, parse, startOfWeek, getDay } from "date-fns";
import es from "date-fns/locale/es";
import EventFormModal from "./EventFormModal";
import ProfessionalFilter from './ProfessionalFilter';
import RoomFilter from './RoomFilter';
import { rooms } from '../data/rooms';
import { supabase } from '../supabaseClient';

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

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState("week");
  const [date, setDate] = useState(new Date());

  const [selectedProfessionals, setSelectedProfessionals] = useState(professionals.map((p) => p.id));
  const [selectedRooms, setSelectedRooms] = useState(rooms.map((r) => r.id));

  const fetchEvents = async () => {
    const { data, error } = await supabase.from('events').select('*');
    if (error) {
      console.error('Error al obtener eventos:', error);
    } else {
      const parsedEvents = data.map(event => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
      }));
      setEvents(parsedEvents);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleProfessional = (id) => {
    setSelectedProfessionals(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const toggleRoom = (id) => {
    setSelectedRooms(prev =>
      prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
    );
  };

  const toggleAllProfessionals = () => {
    setSelectedProfessionals(
      selectedProfessionals.length === professionals.length ? [] : professionals.map((p) => p.id)
    );
  };

  const toggleAllRooms = () => {
    setSelectedRooms(
      selectedRooms.length === rooms.length ? [] : rooms.map((r) => r.id)
    );
  };

  const filteredEvents = events.filter((e) =>
    selectedProfessionals.includes(e.professionalId) && selectedRooms.includes(e.roomId)
  );

  const eventStyleGetter = (event) => {
    const colors = {
      1: '#FFB6C1',
      2: '#ADD8E6',
      3: '#90EE90',
    };
    const color = colors[event.professionalId] || '#D3D3D3';
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
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setSelectedSlot(null);
    setModalOpen(true);
  };

  const handleDeleteEvent = async (idToDelete, seriesId = null) => {
    try {
      if (seriesId) {
        // Eliminar en Supabase todos los eventos con esa serie
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('seriesId', seriesId);
  
        if (error) {
          console.error("Error al eliminar la serie:", error.message);
          alert("No se pudo eliminar la serie.");
          return;
        }
  
        // Eliminar en el estado local
        setEvents((prev) => prev.filter((e) => e.seriesId !== seriesId));
      } else {
        // Eliminar un solo evento
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', idToDelete);
  
        if (error) {
          console.error("Error al eliminar el evento:", error.message);
          alert("No se pudo eliminar el evento.");
          return;
        }
  
        setEvents((prev) => prev.filter((e) => e.id !== idToDelete));
      }
    } catch (err) {
      console.error("Error inesperado:", err);
      alert("Ocurrió un error inesperado al eliminar.");
    }
  };
  

  const handleSaveEvent = async (newEvent) => {
    if (newEvent.id !== undefined) {
      if (newEvent.applyToSeries && newEvent.seriesId) {
        // ✅ EDITAR CADA EVENTO INDIVIDUALMENTE PARA MANTENER LA FECHA Y CAMBIAR SOLO LA HORA
        const { data: seriesEvents, error: fetchError } = await supabase
          .from('events')
          .select('*')
          .eq('seriesId', newEvent.seriesId);
      
        if (fetchError) {
          console.error('Error obteniendo la serie:', fetchError.message);
          alert('Error al cargar los eventos de la serie.');
          return;
        }
      
        const newStartHour = new Date(newEvent.start).getHours();
        const newStartMin = new Date(newEvent.start).getMinutes();
        const newEndHour = new Date(newEvent.end).getHours();
        const newEndMin = new Date(newEvent.end).getMinutes();
      
        for (const event of seriesEvents) {
          const originalStart = new Date(event.start);
          const originalEnd = new Date(event.end);
      
          originalStart.setHours(newStartHour, newStartMin);
          originalEnd.setHours(newEndHour, newEndMin);
      
          const { error: updateError } = await supabase
            .from('events')
            .update({
              title: newEvent.title,
              professionalId: newEvent.professionalId,
              roomId: newEvent.roomId,
              start: originalStart.toISOString(),
              end: originalEnd.toISOString(),
            })
            .eq('id', event.id);
      
          if (updateError) {
            console.error(`Error actualizando evento ID ${event.id}:`, updateError.message);
            alert(`Error al actualizar el evento ${event.id}`);
            return;
          }
        }
      
        await fetchEvents();
        return;
      }
      else {
        // ✅ EDITAR SOLO ESTE EVENTO INDIVIDUAL
        const { data, error } = await supabase
          .from('events')
          .update({
            title: newEvent.title,
            professionalId: newEvent.professionalId,
            roomId: newEvent.roomId,
            start: newEvent.start.toISOString(),
            end: newEvent.end.toISOString(),
          })
          .eq('id', newEvent.id)
          .select()
          .single();
      
        if (error) {
          console.error('Error actualizando evento individual:', error.message);
          alert('Ocurrió un error al actualizar el evento.');
          return;
        }
      
        // Actualiza localmente
        setEvents((prev) =>
          prev.map((e) =>
            e.id === data.id ? { ...data, start: new Date(data.start), end: new Date(data.end) } : e
          )
        );
      
        return;
      }
      
    
      return;
    }
    
    else {
      if (!newEvent.repeat || newEvent.repeat === 'none') {
        // ✅ Evento único
        const { data, error } = await supabase
          .from('events')
          .insert([
            {
              title: newEvent.title,
              professionalId: newEvent.professionalId,
              roomId: newEvent.roomId,
              start: newEvent.start.toISOString(),
              end: newEvent.end.toISOString(),
              repeat: 'none',
              repeatUntil: null,
              seriesId: null,
            }
          ])
          .select()
          .single();
    
        if (error) {
          console.error('Error al guardar evento único:', error.message);
          alert('Ocurrió un error al guardar el evento.');
          return;
        }
    
        setEvents([...events, {
          ...data,
          start: new Date(data.start),
          end: new Date(data.end),
        }]);
    
        return;
      }
    
      // ✅ Evento repetitivo
      if (!newEvent.repeatUntil) {
        alert("Por favor, selecciona una fecha límite para la repetición.");
        return;
      }
    
      const startDate = new Date(newEvent.start);
      const endDate = new Date(newEvent.end);
      const untilDate = new Date(newEvent.repeatUntil);
      const repeatedEvents = [];
      const interval = newEvent.repeat === 'daily' ? 1 : 7;
      const seriesId = Date.now();
      let count = 0;
      const maxRepeats = 100;
    
      let currentStart = new Date(startDate);
      let currentEnd = new Date(endDate);
    
      while (currentStart <= untilDate && count < maxRepeats) {
        repeatedEvents.push({
          title: newEvent.title,
          professionalId: newEvent.professionalId,
          roomId: newEvent.roomId,
          start: currentStart.toISOString(),
          end: currentEnd.toISOString(),
          repeat: newEvent.repeat,
          repeatUntil: newEvent.repeatUntil,
          seriesId,
        });
    
        currentStart.setDate(currentStart.getDate() + interval);
        currentEnd.setDate(currentEnd.getDate() + interval);
        count++;
      }
    
      const { data, error } = await supabase.from('events').insert(repeatedEvents).select();
    
      if (error) {
        console.error("Error al guardar eventos repetitivos:", error.message);
        alert("Ocurrió un error al guardar los eventos repetitivos.");
        return;
      }
    
      setEvents([
        ...events,
        ...data.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        })),
      ]);
    }
    
    
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Calendario de Profesionales</h2>

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
        eventPropGetter={eventStyleGetter}
      />

      <EventFormModal
        isOpen={modalOpen}
        onRequestClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        
        slotInfo={selectedSlot}
        selectedEvent={selectedEvent}
        professionals={professionals}
        events={events}
        onDelete={(id, seriesId) => {
          handleDeleteEvent(id, seriesId);
          setModalOpen(false); // 👈 cerrar el modal
          setSelectedEvent(null); // 👈 limpiar evento seleccionado
        }}
        
      />
    </div>
  );
}
