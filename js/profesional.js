  const tabs = document.querySelectorAll('.tab-button');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      target.classList.add('active');
    });
  });

  // Lógica para las subsecciones de CV (acordeón)
  document.querySelectorAll('.cv-subsection-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const targetId = toggle.dataset.target;
      const targetContent = document.getElementById(targetId);

      // Si ya está activo, colapsarlo
      if (toggle.classList.contains('active')) {
        toggle.classList.remove('active');
        targetContent.classList.remove('active');
        toggle.querySelector('.toggle-icon').textContent = '▼'; // Cambiar a flecha hacia abajo
      } else {
        // Colapsar todos los demás y expandir el seleccionado
        document.querySelectorAll('.cv-subsection-toggle').forEach(t => {
          t.classList.remove('active');
          t.querySelector('.toggle-icon').textContent = '▼';
        });
        document.querySelectorAll('.cv-subsection-content').forEach(c => c.classList.remove('active'));

        toggle.classList.add('active');
        targetContent.classList.add('active');
        toggle.querySelector('.toggle-icon').textContent = '▲'; // Cambiar a flecha hacia arriba
      }
    });
  });

  // --- LÓGICA DE AGENDAMIENTO DE TURNOS ---
  const currentMonthYearSpan = document.getElementById('currentMonthYear');
  const prevMonthBtn = document.getElementById('prevMonth');
  const nextMonthBtn = document.getElementById('nextMonth');
  const calendarioGrid = document.getElementById('calendarioGrid');
  const horariosDisponiblesDiv = document.getElementById('horariosDisponibles');
  const filtroTurnoBtns = document.querySelectorAll('.filtros-horario .filtro-btn');
  const cardLugares = document.querySelectorAll('.card-lugar-seleccionable');
  const resumenLugarSpan = document.getElementById('resumenLugar');
  const resumenFechaSpan = document.getElementById('resumenFecha');
  const resumenHoraSpan = document.getElementById('resumenHora');
  const btnConfirmarTurno = document.getElementById('btnConfirmarTurno');

  let currentMonth = new Date().getMonth();
  let currentYear = new Date().getFullYear();
  let selectedDate = null;
  let selectedTime = null;
  let selectedLocationId = cardLugares[0].dataset.id; // Por defecto el primer lugar

  // Datos de disponibilidad (ejemplo, esto vendría de un backend real)
  const disponibilidad = {
      'consultorio-privado': {
          '2025-06-05': {
              manana: ['09:00', '09:30', '10:00'],
              tarde: ['14:00', '14:30', '15:00']
          },
          '2025-06-06': {
              manana: ['10:00', '10:30'],
              tarde: ['15:00', '15:30', '16:00']
          },
          '2025-06-10': { // Martes
            manana: [],
            tarde: ['15:00', '16:00'],
            noche: []
          },
          '2025-06-11': { // Miércoles
            manana: ['09:00', '10:00'],
            tarde: [],
            noche: []
          }
          // ... más fechas
      },
      'hospital-italiano': {
          '2025-06-07': {
              manana: ['08:00', '08:30'],
              tarde: ['13:00', '13:30', '14:00']
          },
          '2025-06-08': {
              manana: ['09:00', '09:30'],
              tarde: ['14:00']
          },
          '2025-06-10': { // Martes
            manana: ['10:00', '11:00'],
            tarde: ['13:00', '14:00'],
            noche: []
          },
          '2025-06-12': { // Jueves
            manana: [],
            tarde: ['12:00', '13:00', '14:00'],
            noche: ['18:00', '19:00']
          }
          // ... más fechas
      }
  };

  // Nombres de los meses y días de la semana
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // --- Funciones de Renderizado ---

  function renderCalendar() {
      calendarioGrid.innerHTML = `
          <div class="dia-nombre">Lun</div><div class="dia-nombre">Mar</div><div class="dia-nombre">Mié</div>
          <div class="dia-nombre">Jue</div><div class="dia-nombre">Vie</div><div class="dia-nombre">Sáb</div>
          <div class="dia-nombre">Dom</div>
      `;
      currentMonthYearSpan.textContent = `${monthNames[currentMonth]} ${currentYear}`;

      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo, 1 = Lunes...
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Para comparar solo la fecha

      // Ajustar para que el primer día de la semana sea Lunes (si getDay() es 0 (Dom), debe ser 6 para el desfase)
      let startDayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

      // Días vacíos al inicio del mes
      for (let i = 0; i < startDayOffset; i++) {
          const emptyDiv = document.createElement('div');
          emptyDiv.classList.add('dia-calendario', 'empty');
          calendarioGrid.appendChild(emptyDiv);
      }

      // Días del mes
      for (let i = 1; i <= daysInMonth; i++) {
          const dayDiv = document.createElement('div');
          dayDiv.classList.add('dia-calendario');
          dayDiv.textContent = i;

          const date = new Date(currentYear, currentMonth, i);
          const dateString = date.toISOString().split('T')[0];

          // Deshabilitar días pasados
          if (date < today) {
              dayDiv.classList.add('disabled');
          } else {
              dayDiv.dataset.date = dateString;

              // Resaltar días con disponibilidad
              if (hasAvailability(dateString, selectedLocationId)) {
                  dayDiv.classList.add('has-availability');
              }
              
              // Marcar día seleccionado
              if (selectedDate === dateString) {
                  dayDiv.classList.add('selected');
              }
          }
          calendarioGrid.appendChild(dayDiv);
      }
      updateSummary(); // Actualizar resumen cada vez que el calendario se renderiza
  }

  function hasAvailability(dateString, locationId) {
      return disponibilidad[locationId] && disponibilidad[locationId][dateString] && 
             (Object.values(disponibilidad[locationId][dateString]).some(arr => arr.length > 0));
  }


  function renderHorarios() {
      horariosDisponiblesDiv.innerHTML = '';
      if (!selectedDate || !selectedLocationId) {
          horariosDisponiblesDiv.innerHTML = '<p>Selecciona una fecha y un lugar para ver los horarios.</p>';
          return;
      }

      const horariosDelDia = disponibilidad[selectedLocationId] && disponibilidad[selectedLocationId][selectedDate] || {};
      const franjaActual = document.querySelector('.filtros-horario .filtro-btn.active').dataset.turno;
      const horariosFiltrados = horariosDelDia[franjaActual] || [];

      if (horariosFiltrados.length === 0) {
          horariosDisponiblesDiv.innerHTML = '<p>No hay turnos disponibles para esta franja.</p>';
          selectedTime = null; // Resetear hora si no hay disponibilidad
      } else {
          horariosFiltrados.forEach(hora => {
              const horaDiv = document.createElement('div');
              horaDiv.classList.add('horario');
              horaDiv.textContent = hora;
              if (selectedTime === hora) {
                  horaDiv.classList.add('selected');
              }
              horaDiv.addEventListener('click', () => {
                  document.querySelectorAll('.horario').forEach(h => h.classList.remove('selected'));
                  horaDiv.classList.add('selected');
                  selectedTime = hora;
                  updateSummary();
              });
              horariosDisponiblesDiv.appendChild(horaDiv);
          });
      }
      updateSummary();
  }

  function updateSummary() {
      const selectedLocationName = document.querySelector(`.card-lugar-seleccionable.active strong`) ?
                                   document.querySelector(`.card-lugar-seleccionable.active strong`).textContent : 'No seleccionado';
      
      const formattedDate = selectedDate ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('es-AR', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      }) : 'No seleccionada';

      resumenLugarSpan.textContent = selectedLocationName;
      resumenFechaSpan.textContent = formattedDate;
      resumenHoraSpan.textContent = selectedTime || 'No seleccionada';

      // Habilitar/deshabilitar botón de confirmar
      if (selectedLocationId && selectedDate && selectedTime) {
          btnConfirmarTurno.disabled = false;
      } else {
          btnConfirmarTurno.disabled = true;
      }
  }

  // --- Event Listeners ---

  prevMonthBtn.addEventListener('click', () => {
      currentMonth--;
      if (currentMonth < 0) {
          currentMonth = 11;
          currentYear--;
      }
      selectedDate = null; // Resetear selección de fecha al cambiar de mes
      selectedTime = null; // Resetear selección de hora
      renderCalendar();
      renderHorarios(); // Refrescar horarios (mostrar mensaje de selección si no hay fecha)
  });

  nextMonthBtn.addEventListener('click', () => {
      currentMonth++;
      if (currentMonth > 11) {
          currentMonth = 0;
          currentYear++;
      }
      selectedDate = null; // Resetear selección de fecha al cambiar de mes
      selectedTime = null; // Resetear selección de hora
      renderCalendar();
      renderHorarios(); // Refrescar horarios
  });

  calendarioGrid.addEventListener('click', (e) => {
      const selectedDay = e.target.closest('.dia-calendario');
      if (selectedDay && !selectedDay.classList.contains('disabled') && !selectedDay.classList.contains('empty')) {
          document.querySelectorAll('.dia-calendario').forEach(day => day.classList.remove('selected'));
          selectedDay.classList.add('selected');
          selectedDate = selectedDay.dataset.date;
          selectedTime = null; // Resetear hora al cambiar de día
          renderHorarios();
          updateSummary();
      }
  });

  filtroTurnoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          filtroTurnoBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          selectedTime = null; // Resetear hora al cambiar de franja
          renderHorarios();
      });
  });

  cardLugares.forEach(card => {
      card.addEventListener('click', () => {
          cardLugares.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          selectedLocationId = card.dataset.id;
          selectedDate = null; // Resetear fecha y hora al cambiar de lugar
          selectedTime = null;
          renderCalendar(); // Volver a renderizar el calendario para el nuevo lugar
          renderHorarios(); // Volver a renderizar horarios
      });
  });

  btnConfirmarTurno.addEventListener('click', () => {
      if (selectedLocationId && selectedDate && selectedTime) {
          alert(`Turno confirmado para el ${selectedDate} a las ${selectedTime} en ${document.querySelector(`.card-lugar-seleccionable.active strong`).textContent}.`);
          // Aquí iría la lógica para enviar los datos al servidor
      } else {
          alert('Por favor, selecciona el lugar, la fecha y la hora.');
      }
  });

  // Inicialización
  // Asegurarse de que el primer lugar esté marcado como activo al cargar
  if (cardLugares.length > 0) {
      cardLugares[0].classList.add('active');
      selectedLocationId = cardLugares[0].dataset.id;
  }
  renderCalendar();
  renderHorarios(); // Para mostrar el mensaje inicial de "selecciona una fecha..."