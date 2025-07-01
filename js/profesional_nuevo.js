    // Variables globales para el calendario
    const { DateTime } = luxon;
    let currentDate = DateTime.now();
    let selectedDate = null;
    let selectedLugar = 'Consultorio Privado';
    let selectedHora = null;

    // Función para generar el calendario
    function generateCalendar(date) {
      const grid = document.getElementById('calendarioGrid');
      const monthYear = document.getElementById('currentMonthYear');
      
      // Actualizar título del mes
      monthYear.textContent = date.toFormat('MMMM yyyy', { locale: 'es' });
      
      // Limpiar grid
      grid.innerHTML = '';
      
      // Obtener primer día del mes y días en el mes
      const firstDay = date.startOf('month');
      const lastDay = date.endOf('month');
      const daysInMonth = lastDay.day;
      
      // Obtener día de la semana del primer día (0 = domingo, 1 = lunes, etc.)
      // Ajustar para que lunes sea 0
      let startDayOfWeek = firstDay.weekday - 1;
      
      // Agregar días vacíos al inicio
      for (let i = 0; i < startDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'h-10';
        grid.appendChild(emptyDay);
      }
      
      // Agregar días del mes
      for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        const dayDate = date.set({ day });
        const isToday = dayDate.hasSame(DateTime.now(), 'day');
        const isPast = dayDate < DateTime.now().startOf('day');
        
        dayElement.className = `
          h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
          ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}
          ${isToday ? 'bg-blue-100 text-blue-600 font-semibold' : ''}
        `;
        
        dayElement.textContent = day;
        
        // Marcar algunos días como disponibles (simulado)
        const availableDays = [5, 6, 10, 11, 12, 13, 19, 20, 26, 27];
        if (availableDays.includes(day) && !isPast) {
          if (day === 5) {
            // Día seleccionado
            dayElement.className = `
              h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
              bg-sky-500 text-white font-semibold border-2 border-sky-600
            `;
          } else if ([6, 10, 11, 19, 27].includes(day)) {
            // Días disponibles
            dayElement.className = `
              h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
              bg-green-100 text-green-700 border border-green-300 hover:bg-green-200
            `;
          }
        }
        
        // Agregar event listener si no es un día pasado
        if (!isPast) {
          dayElement.addEventListener('click', () => selectDate(dayDate, dayElement));
        }
        
        grid.appendChild(dayElement);
      }
    }

    // Función para seleccionar fecha
    function selectDate(date, element) {
      // Remover selección anterior
      document.querySelectorAll('#calendarioGrid > div').forEach(day => {
        day.classList.remove('bg-sky-500', 'text-white', 'font-semibold', 'border-2', 'border-sky-600');
        if (day.textContent && !day.classList.contains('text-gray-300')) {
          const dayNum = parseInt(day.textContent);
          const availableDays = [6, 10, 11];
          if (availableDays.includes(dayNum)) {
            day.className = `
              h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
              bg-green-100 text-green-700 border border-green-300 hover:bg-green-200
            `;
          } else {
            day.className = `
              h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
              text-gray-700 hover:bg-gray-100
            `;
          }
        }
      });
      
      // Aplicar nueva selección
      element.className = `
        h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
        bg-sky-500 text-white font-semibold border-2 border-sky-600
      `;
      
      selectedDate = date;
      document.getElementById('resumenFecha').textContent = date.toFormat('dd \'de\' MMMM yyyy', { locale: 'es' });
      updateConfirmButton();
    }

    // Navigation and tab functionality
    document.addEventListener('DOMContentLoaded', function() {
      const sidebar = document.getElementById('sidebar');

      // Sidebar hover effect
      sidebar.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 768) {
          this.classList.add('sidebar-expanded');
          document.body.classList.add('sidebar-is-expanded');
          document.body.style.paddingLeft = '200px';
          
          const labels = this.querySelectorAll('.label');
          labels.forEach(label => {
            label.classList.remove('label-hidden');
            label.classList.add('label-visible');
          });
        }
      });

      sidebar.addEventListener('mouseleave', function() {
        if (window.innerWidth >= 768) {
          this.classList.remove('sidebar-expanded');
          document.body.classList.remove('sidebar-is-expanded');
          document.body.style.paddingLeft = '60px';
          
          const labels = this.querySelectorAll('.label');
          labels.forEach(label => {
            label.classList.remove('label-visible');
            label.classList.add('label-hidden');
          });
        }
      });

      // Tab functionality
      const tabButtons = document.querySelectorAll('.tab-button');
      const tabContents = document.querySelectorAll('.tab-content');
      const tabSelect = document.getElementById('tabs-select');

      function showTab(tabId) {
        tabButtons.forEach(btn => {
          btn.classList.remove('active', 'bg-sky-500', 'text-white');
          btn.classList.add('bg-gray-100');
        });
        tabContents.forEach(tab => {
          tab.classList.add('hidden');
          tab.classList.remove('block');
        });

        const targetTab = document.getElementById(tabId);
        if (targetTab) {
          targetTab.classList.remove('hidden');
          targetTab.classList.add('block');
          
          // Si es la pestaña de agendar, generar el calendario
          if (tabId === 'agendar') {
            setTimeout(() => generateCalendar(currentDate), 100);
          }
        }

        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if (activeButton) {
          activeButton.classList.add('active', 'bg-sky-500', 'text-white');
          activeButton.classList.remove('bg-gray-100');
        }

        if (tabSelect) {
          tabSelect.value = tabId;
        }
      }

      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.getAttribute('data-tab');
          showTab(tabId);
        });
      });

      if (tabSelect) {
        tabSelect.addEventListener('change', (e) => {
          showTab(e.target.value);
        });
      }

      // Calendar navigation
      document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate = currentDate.minus({ months: 1 });
        generateCalendar(currentDate);
      });

      document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate = currentDate.plus({ months: 1 });
        generateCalendar(currentDate);
      });

      // Accordion functionality
      document.querySelectorAll('.cv-subsection-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
          const targetId = toggle.getAttribute('data-target');
          const content = document.getElementById(targetId);
          const icon = toggle.querySelector('.toggle-icon');
          
          toggle.classList.toggle('active');
          content.classList.toggle('hidden');
          content.classList.toggle('block');
          
          if (toggle.classList.contains('active')) {
            toggle.classList.add('bg-sky-50', 'text-sky-500');
            toggle.classList.remove('bg-gray-100');
            icon.style.transform = 'rotate(180deg)';
          } else {
            toggle.classList.remove('bg-sky-50', 'text-sky-500');
            toggle.classList.add('bg-gray-100');
            icon.style.transform = 'rotate(0deg)';
          }
        });
      });

      // Appointment booking functionality
      const lugarCards = document.querySelectorAll('.card-lugar-seleccionable');
      const horarios = document.querySelectorAll('.horario');
      const filtroButtons = document.querySelectorAll('.filtro-btn');
      const btnConfirmar = document.getElementById('btnConfirmarTurno');
      const resumenLugar = document.getElementById('resumenLugar');
      const resumenHora = document.getElementById('resumenHora');

      // Lugar selection
      lugarCards.forEach(card => {
        card.addEventListener('click', () => {
          lugarCards.forEach(c => {
            c.classList.remove('active', 'border-sky-500', 'bg-sky-50');
            c.classList.add('border-gray-200', 'bg-gray-50');
          });
          card.classList.add('active', 'border-sky-500', 'bg-sky-50');
          card.classList.remove('border-gray-200', 'bg-gray-50');
          
          selectedLugar = card.querySelector('strong').textContent;
          resumenLugar.textContent = selectedLugar;
          updateConfirmButton();
        });
      });

      // Time slot selection
      horarios.forEach(horario => {
        horario.addEventListener('click', () => {
          horarios.forEach(h => {
            h.classList.remove('selected', 'bg-sky-500', 'text-white', 'border-sky-600');
            h.classList.add('bg-gray-50', 'border-gray-300', 'text-gray-700');
          });
          horario.classList.add('selected', 'bg-sky-500', 'text-white', 'border-sky-600');
          horario.classList.remove('bg-gray-50', 'border-gray-300', 'text-gray-700');
          
          selectedHora = horario.textContent;
          resumenHora.textContent = selectedHora;
          updateConfirmButton();
        });
      });

      // Filter buttons
      filtroButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          filtroButtons.forEach(b => {
            b.classList.remove('active', 'bg-sky-400', 'text-white');
            b.classList.add('bg-gray-200', 'text-gray-700');
          });
          btn.classList.add('active', 'bg-sky-400', 'text-white');
          btn.classList.remove('bg-gray-200', 'text-gray-700');
          
          // Actualizar horarios según el filtro
          updateAvailableHours(btn.dataset.turno);
        });
      });

      function updateAvailableHours(turno) {
        const horariosContainer = document.getElementById('horariosDisponibles');
        let horarios = [];
        
        switch(turno) {
          case 'manana':
            horarios = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
            break;
          case 'tarde':
            horarios = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
            break;
          case 'noche':
            horarios = ['18:00', '18:30', '19:00', '19:30', '20:00'];
            break;
        }
        
        horariosContainer.innerHTML = '';
        horarios.forEach(hora => {
          const horarioElement = document.createElement('div');
          horarioElement.className = 'horario bg-gray-50 border border-gray-300 py-2.5 px-4 rounded-lg cursor-pointer font-medium transition-all duration-200 text-gray-700 hover:bg-sky-50 hover:border-sky-300';
          horarioElement.textContent = hora;
          
          horarioElement.addEventListener('click', () => {
            document.querySelectorAll('.horario').forEach(h => {
              h.classList.remove('selected', 'bg-sky-500', 'text-white', 'border-sky-600');
              h.classList.add('bg-gray-50', 'border-gray-300', 'text-gray-700');
            });
            horarioElement.classList.add('selected', 'bg-sky-500', 'text-white', 'border-sky-600');
            horarioElement.classList.remove('bg-gray-50', 'border-gray-300', 'text-gray-700');
            
            selectedHora = hora;
            document.getElementById('resumenHora').textContent = selectedHora;
            updateConfirmButton();
          });
          
          horariosContainer.appendChild(horarioElement);
        });
      }

      function updateConfirmButton() {
        const btnConfirmar = document.getElementById('btnConfirmarTurno');
        if (selectedLugar && selectedDate && selectedHora) {
          btnConfirmar.disabled = false;
          btnConfirmar.classList.remove('bg-gray-300', 'cursor-not-allowed');
          btnConfirmar.classList.add('bg-green-500', 'hover:bg-green-600');
        } else {
          btnConfirmar.disabled = true;
          btnConfirmar.classList.add('bg-gray-300', 'cursor-not-allowed');
          btnConfirmar.classList.remove('bg-green-500', 'hover:bg-green-600');
        }
      }

      // Confirm appointment
      document.getElementById('btnConfirmarTurno').addEventListener('click', () => {
        if (selectedLugar && selectedDate && selectedHora) {
          const fechaFormateada = selectedDate.toFormat('dd \'de\' MMMM \'de\' yyyy', { locale: 'es' });
          alert(`Turno confirmado:\nLugar: ${selectedLugar}\nFecha: ${fechaFormateada}\nHora: ${selectedHora}`);
        }
      });

      // Inicializar el estado del sidebar - solo en desktop
      function initializeSidebarPadding() {
        if (window.innerWidth >= 768) { // md breakpoint
          document.body.style.paddingLeft = '60px';
        } else {
          document.body.style.paddingLeft = '0';
        }
      }

      // Llamar al inicializar
      initializeSidebarPadding();

      // Escuchar cambios de tamaño de ventana
      window.addEventListener('resize', initializeSidebarPadding);
      
      // Generar calendario inicial
      generateCalendar(currentDate);
    });

    // Hacer updateConfirmButton global
    window.updateConfirmButton = function() {
      const btnConfirmar = document.getElementById('btnConfirmarTurno');
      if (selectedLugar && selectedDate && selectedHora) {
        btnConfirmar.disabled = false;
        btnConfirmar.classList.remove('bg-gray-300', 'cursor-not-allowed');
        btnConfirmar.classList.add('bg-green-500', 'hover:bg-green-600');
      } else {
        btnConfirmar.disabled = true;
        btnConfirmar.classList.add('bg-gray-300', 'cursor-not-allowed');
        btnConfirmar.classList.remove('bg-green-500', 'hover:bg-green-600');
      }
    };
