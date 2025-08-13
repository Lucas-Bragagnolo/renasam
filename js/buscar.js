   // Variables globales para el mapa
    let pacienteElegido = null;
    let ubicacionElegida = "";
    let especialidadElegida = "";

    // Función para inicializar el mapa con zona de búsqueda (sin ubicaciones exactas)
    function inicializarMapa() {
      console.log('Inicializando mapa con zona de búsqueda...');
      
      const mapElement = document.getElementById("mapa-profesionales");
      if (!mapElement) {
        console.error('Elemento del mapa no encontrado');
        return;
      }

      // Verificar si Google Maps está disponible
      if (typeof google === 'undefined' || !google.maps) {
        console.error('Google Maps API no está cargada');
        mapElement.innerHTML = '<div class="w-full h-full bg-red-100 rounded-xl flex items-center justify-center text-red-500">Error: Google Maps no disponible</div>';
        return;
      }

      try {
        // Obtener centro de búsqueda
        const center = {
          lat: parseFloat(sessionStorage.getItem('ubicacion_lat')) || -34.6037,
          lng: parseFloat(sessionStorage.getItem('ubicacion_lon')) || -58.3816
        };

        const mapa = new google.maps.Map(mapElement, {
          center: center,
          zoom: 11, // Zoom apropiado para mostrar área de 10km
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Crear círculo de zona de búsqueda (10km de radio)
        const searchCircle = new google.maps.Circle({
          strokeColor: "#0ea5e9",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 0.15,
          map: mapa,
          center: center,
          radius: 10000 // 10km en metros
        });

        // Marcador central de la zona de búsqueda
        const centralMarker = new google.maps.Marker({
          position: center,
          map: mapa,
          title: `Zona de búsqueda: ${ubicacionElegida}`,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#0ea5e9" stroke="white" stroke-width="4"/>
                <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="16" fill="white" font-weight="bold">📍</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20)
          }
        });

        // Info window para la zona de búsqueda
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-3 text-center">
              <h3 class="font-semibold text-gray-800 mb-2">Zona de Búsqueda</h3>
              <p class="text-sm text-gray-600 mb-2">📍 ${ubicacionElegida}</p>
              <p class="text-sm text-gray-600 mb-2">🔍 ${especialidadElegida}</p>
              <p class="text-sm text-gray-600 mb-2">👤 Para: ${pacienteElegido ? pacienteElegido.nombre + ' ' + pacienteElegido.apellido : 'Paciente'}</p>
              <p class="text-xs text-gray-500 mb-2">Radio de búsqueda: 10 km</p>
              <div class="mt-2 p-2 bg-blue-50 rounded">
                <p class="text-xs text-blue-700">Los profesionales mostrados se encuentran dentro de esta área.</p>
                <p class="text-xs text-blue-700">Las ubicaciones exactas se revelan al contactar al profesional.</p>
              </div>
            </div>
          `,
          position: center
        });

        // Mostrar info window automáticamente
        infoWindow.open(mapa);

        // Agregar evento click al marcador central
        centralMarker.addListener('click', () => {
          infoWindow.open(mapa, centralMarker);
        });

        console.log('Mapa con zona de búsqueda inicializado correctamente');
        
      } catch (error) {
        console.error('Error al inicializar el mapa:', error);
        mapElement.innerHTML = '<div class="w-full h-full bg-red-100 rounded-xl flex items-center justify-center text-red-500">Error al cargar el mapa</div>';
      }
    }

    // Función para avanzar entre pasos
    function irAlPaso(pasoActual, pasoSiguiente, numeroPaso) {
      // Ocultar paso actual
      pasoActual.classList.add('hidden');
      pasoActual.classList.remove('active');
      
      // Mostrar paso siguiente
      pasoSiguiente.classList.remove('hidden');
      pasoSiguiente.classList.add('active');

      // Actualizar indicadores de progreso
      const pasos = pasoSiguiente.querySelectorAll(".step-number");
      pasos.forEach((el, i) => {
        el.classList.remove("active", "complete");
        
        if (i + 1 < numeroPaso) {
          el.classList.add("complete");
          el.style.backgroundColor = "#10b981"; // green-500
          el.textContent = "✔";
        } else if (i + 1 === numeroPaso) {
          el.classList.add("active");
          el.style.backgroundColor = "#0ea5e9"; // sky-500
          el.textContent = i + 1;
        } else {
          el.style.backgroundColor = "#e5e7eb"; // gray-200
          el.textContent = i + 1;
        }
      });
    }

    // Navigation functionality
    document.addEventListener('DOMContentLoaded', function() {
      const sidebarItems = document.querySelectorAll('nav li[data-section]');
      const bottomNavItems = document.querySelectorAll('.bottom-nav a[data-section]');
      const sections = document.querySelectorAll('.section');
      const sidebar = document.getElementById('sidebar');
      const content = document.getElementById('content');

      // Elementos de pasos
      const paso1 = document.getElementById("search-step-1");
      const paso2 = document.getElementById("search-step-2");
      const paso3 = document.getElementById("search-step-3");
      const paso4 = document.getElementById("search-step-4");

      // Botones
      const btnContinuarPaciente = document.getElementById("btn-continuar-paciente");
      const btnContinuar = document.getElementById("btn-continuar");
      const btnGeo = document.getElementById("btn-geo");
      const btnBuscar = paso3?.querySelector(".continue-button");

      // Inputs
      const inputUbicacion = document.getElementById("ubicacion");
      const inputEspecialidad = paso3?.querySelector("input[type='text']");

      // Especialidades populares
      const especialidades = paso3?.querySelectorAll(".tag");
      const selectedLocation = paso3?.querySelector(".selected-location");
      const resultadosTitulo = paso4?.querySelector(".lista-profesionales h2");

      // Sidebar hover effect - MEJORADO
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

      // Section navigation
      function showSection(sectionId) {
        sections.forEach(section => {
          section.classList.add('hidden');
          section.classList.remove('block');
          section.classList.add('opacity-0');
          section.classList.remove('opacity-100');
        });

        const targetSection = document.getElementById(sectionId + '-section');
        if (targetSection) {
          targetSection.classList.remove('hidden');
          targetSection.classList.add('block');
          setTimeout(() => {
            targetSection.classList.remove('opacity-0');
            targetSection.classList.add('opacity-100');
          }, 10);
        }

        // Update active states
        [...sidebarItems, ...bottomNavItems].forEach(item => {
          item.classList.remove('active');
          const icon = item.querySelector('.material-icons');
          if (icon) {
            icon.classList.remove('text-blue-600');
          }
        });

        const activeItems = document.querySelectorAll(`[data-section="${sectionId}"]`);
        activeItems.forEach(item => {
          item.classList.add('active');
          const icon = item.querySelector('.material-icons');
          if (icon) {
            icon.classList.add('text-blue-600');
          }
        });
      }

      // Add click listeners
      [...sidebarItems, ...bottomNavItems].forEach(item => {
        item.addEventListener('click', function(e) {
          e.preventDefault();
          const sectionId = this.getAttribute('data-section');
          showSection(sectionId);
        });
      });

      // La carga de pacientes se maneja ahora en busqueda-pacientes.js

      // Paso 1 -> Paso 2 (Selección de paciente -> Ubicación)
      if (btnContinuarPaciente) {
        btnContinuarPaciente.addEventListener("click", function () {
          if (!pacienteElegido) {
            alert("Por favor, selecciona un paciente.");
            return;
          }

          // Mostrar paciente elegido en el paso 2
          const selectedPatientDisplay = document.getElementById("selected-patient-display");
          if (selectedPatientDisplay) {
            selectedPatientDisplay.textContent = `${pacienteElegido.nombre} ${pacienteElegido.apellido}`;
          }

          // Actualizar pasos visuales
          irAlPaso(paso1, paso2, 2);
        });
      }

      // Paso 2 -> Paso 3 (Ubicación -> Especialidad)
      if (btnContinuar) {
        btnContinuar.addEventListener("click", function () {
          const ubicacion = inputUbicacion?.value.trim();
          if (!ubicacion) {
            alert("Por favor, ingresá una ubicación.");
            return;
          }

          ubicacionElegida = ubicacion;

          // Geocodificar la ubicación para asegurar coordenadas correctas
          geocodificarUbicacion(ubicacion);

          // Mostrar información elegida en el paso 3
          const selectedLocationDisplay = document.getElementById("selected-location-display");
          const selectedPatientDisplayStep3 = document.getElementById("selected-patient-display-step3");
          
          if (selectedLocationDisplay) {
            selectedLocationDisplay.textContent = ubicacionElegida;
          }
          if (selectedPatientDisplayStep3) {
            selectedPatientDisplayStep3.textContent = `${pacienteElegido.nombre} ${pacienteElegido.apellido}`;
          }

          // Actualizar pasos visuales
          irAlPaso(paso2, paso3, 3);
        });
      }

      // Paso 3 -> Paso 4 (Especialidad -> Resultados)
      if (btnBuscar) {
        btnBuscar.addEventListener("click", function () {
          const especialidad = inputEspecialidad?.value.trim();
          if (!especialidad) {
            alert("Por favor, seleccioná una especialidad.");
            return;
          }

          especialidadElegida = especialidad;

          // Actualizar resultados
          if (resultadosTitulo) {
            resultadosTitulo.textContent = `Profesionales de ${especialidadElegida} disponibles en la zona`;
          }

          // Actualizar información de zona de búsqueda
          const zonaBusquedaDisplay = document.getElementById("zona-busqueda-display");
          const especialidadBusquedaDisplay = document.getElementById("especialidad-busqueda-display");
          
          if (zonaBusquedaDisplay) {
            zonaBusquedaDisplay.textContent = ubicacionElegida;
          }
          if (especialidadBusquedaDisplay) {
            especialidadBusquedaDisplay.textContent = especialidadElegida;
          }

          // Mostrar paso 4
          irAlPaso(paso3, paso4, 4);

          // Inicializar mapa después de un pequeño delay para asegurar que el elemento esté visible
          setTimeout(() => {
            inicializarMapa();
          }, 100);
        });
      }

      // Click en especialidades populares
      if (especialidades) {
        especialidades.forEach(btn => {
          btn.addEventListener("click", () => {
            if (inputEspecialidad) {
              inputEspecialidad.value = btn.textContent;
            }
          });
        });
      }

      // Geolocalización
      if (btnGeo) {
        btnGeo.addEventListener("click", () => {
          if (!navigator.geolocation) {
            alert("Tu navegador no soporta geolocalización.");
            return;
          }

          btnGeo.textContent = "📡 Obteniendo ubicación...";
          btnGeo.disabled = true;

          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;

            // Verificar si Google Maps está disponible
            if (typeof google !== 'undefined' && google.maps) {
              const geocoder = new google.maps.Geocoder();
              const latlng = { lat: latitude, lng: longitude };

              geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK" && results[0]) {
                  const locationName = results[0].formatted_address;
                  if (inputUbicacion) {
                    inputUbicacion.value = locationName;
                  }
                }
                
                // Guardamos en sessionStorage
                sessionStorage.setItem("ubicacion_lat", latitude.toFixed(4));
                sessionStorage.setItem("ubicacion_lon", longitude.toFixed(4));
                
                btnGeo.textContent = "📡 Usar mi ubicación actual";
                btnGeo.disabled = false;
              });
            } else {
              // Fallback si Google Maps no está disponible
              if (inputUbicacion) {
                inputUbicacion.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              }
              // Guardamos en sessionStorage
              sessionStorage.setItem("ubicacion_lat", latitude.toFixed(4));
              sessionStorage.setItem("ubicacion_lon", longitude.toFixed(4));
              btnGeo.textContent = "📡 Usar mi ubicación actual";
              btnGeo.disabled = false;
            }
          }, (error) => {
            console.error('Error de geolocalización:', error);
            alert("No se pudo obtener tu ubicación.");
            btnGeo.textContent = "📡 Usar mi ubicación actual";
            btnGeo.disabled = false;
          });
        });
      }

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

      // Verificar si Google Maps está cargado al inicio
      if (typeof google === 'undefined') {
        console.log('Google Maps API aún no está cargada, esperando...');
        
        // Función para verificar cuando Google Maps esté disponible
        function checkGoogleMaps() {
          if (typeof google !== 'undefined' && google.maps) {
            console.log('Google Maps API cargada correctamente');
          } else {
            setTimeout(checkGoogleMaps, 100);
          }
        }
        checkGoogleMaps();
      }

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
    });

    // ===== INTEGRACIÓN CON SELECCIÓN DE PACIENTES =====
    
    // Escuchar cuando se seleccione un paciente
    document.addEventListener('pacienteSeleccionado', (event) => {
      pacienteElegido = event.detail;
      console.log('Paciente seleccionado para búsqueda:', pacienteElegido);
    });

    // ===== FUNCIÓN PARA GEOCODIFICAR UBICACIONES =====
    
    function geocodificarUbicacion(direccion) {
      const google = window.google;
      if (google && google.maps) {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: direccion }, (results, status) => {
          console.log(`[buscar.js] Geocodificando: "${direccion}" - Status: ${status}`);
          
          if (status === "OK" && results[0]) {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            
            // Actualizar sessionStorage con las coordenadas correctas
            sessionStorage.setItem("ubicacion_lat", lat.toFixed(4));
            sessionStorage.setItem("ubicacion_lon", lng.toFixed(4));
            
            console.log(`✅ [buscar.js] Ubicación geocodificada exitosamente: ${direccion} -> ${lat}, ${lng}`);
            console.log(`📍 [buscar.js] Coordenadas guardadas en sessionStorage: lat=${lat.toFixed(4)}, lng=${lng.toFixed(4)}`);
          } else {
            console.warn(`❌ [buscar.js] No se pudo geocodificar: ${direccion} (Status: ${status})`);
            // Mantener coordenadas por defecto si ya existen
            if (!sessionStorage.getItem("ubicacion_lat")) {
              sessionStorage.setItem("ubicacion_lat", "-34.6037");
              sessionStorage.setItem("ubicacion_lon", "-58.3816");
              console.log(`🔄 [buscar.js] Usando coordenadas por defecto de Buenos Aires`);
            }
          }
        });
      } else {
        console.warn("Google Maps no disponible para geocodificación");
        // Mantener coordenadas por defecto si ya existen
        if (!sessionStorage.getItem("ubicacion_lat")) {
          sessionStorage.setItem("ubicacion_lat", "-34.6037");
          sessionStorage.setItem("ubicacion_lon", "-58.3816");
        }
      }
    }
