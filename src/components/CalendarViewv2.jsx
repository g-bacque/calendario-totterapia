
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
import { professionals } from '../data/professionals';
import Sidebar from './Sidebar';


const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

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
    setSelectedProfessionals(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(pid => pid !== id)
        : [...prev, id];
  
      // 👇 Si después de cambiar el profesional, no hay despachos seleccionados, seleccionamos todos
      if (selectedRooms.length === 0) {
        setSelectedRooms(rooms.map(r => r.id));
      }
  
      return newSelection;
    });
  };
  

  const toggleRoom = (id) => {
    setSelectedRooms(prev => {
      const newSelection = prev.includes(id)
        ? prev.filter(rid => rid !== id)
        : [...prev, id];
  
      // 👇 Si no hay profesionales seleccionados, seleccionamos todos
      if (selectedProfessionals.length === 0) {
        setSelectedProfessionals(professionals.map(p => p.id));
      }
  
      return newSelection;
    });
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
    const professional = professionals.find(p => p.id === event.professionalId);
    const room = rooms.find(r => r.id === event.roomId);
  
    const bgColor = professional?.color || '#D3D3D3';
    const borderColor = room?.color || '#888';
  
    return {
      style: {
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '5px',
        color: 'black',
        padding: '4px',
      },
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

  const handleEventDrop = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end),
      };
  
      const { data, error } = await supabase
        .from('events')
        .update({
          start: updatedEvent.start.toISOString(),
          end: updatedEvent.end.toISOString(),
        })
        .eq('id', event.id)
        .select()
        .single();
  
      if (error) {
        console.error("Error al actualizar evento con drag and drop:", error.message);
        alert("No se pudo mover el evento.");
        return;
      }
  
      setEvents((prev) =>
        prev.map((e) =>
          e.id === data.id ? { ...data, start: new Date(data.start), end: new Date(data.end) } : e
        )
      );
    } catch (err) {
      console.error("Error inesperado al mover evento:", err);
      alert("Ocurrió un error al mover el evento.");
    }
  };

  const handleEventResize = async ({ event, start, end }) => {
    try {
      const updatedEvent = {
        ...event,
        start: new Date(start),
        end: new Date(end),
      };
  
      const { data, error } = await supabase
        .from('events')
        .update({
          start: updatedEvent.start.toISOString(),
          end: updatedEvent.end.toISOString(),
        })
        .eq('id', event.id)
        .select()
        .single();
  
      if (error) {
        console.error("Error al cambiar duración del evento:", error.message);
        alert("No se pudo modificar la duración del evento.");
        return;
      }
  
      setEvents((prev) =>
        prev.map((e) =>
          e.id === data.id ? { ...data, start: new Date(data.start), end: new Date(data.end) } : e
        )
      );
    } catch (err) {
      console.error("Error inesperado al modificar duración:", err);
      alert("Ocurrió un error al modificar el evento.");
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
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        professionals={professionals}
        selectedProfessionals={selectedProfessionals}
        toggleProfessional={toggleProfessional}
        toggleAllProfessionals={toggleAllProfessionals}
        rooms={rooms}
        selectedRooms={selectedRooms}
        toggleRoom={toggleRoom}
        toggleAllRooms={toggleAllRooms}
      />
  
      <div style={{ flex: 1, padding: "1rem" }}>
        <h2>Calendario de Profesionales</h2>
  
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
          selectable={!modalOpen}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
          draggableAccessor={() => true}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
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
            setModalOpen(false);
            setSelectedEvent(null);
          }}
        />
      </div>
    </div>
  );
  
}
