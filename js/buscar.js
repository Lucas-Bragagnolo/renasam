   // Variables globales para el mapa
    let ubicacionElegida = "";
    let especialidadElegida = "";

    // Función para inicializar el mapa
    function inicializarMapa() {
      console.log('Inicializando mapa...');
      
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
        const mapa = new google.maps.Map(mapElement, {
          center: {
            lat: parseFloat(sessionStorage.getItem('ubicacion_lat')) || -34.6037,
            lng: parseFloat(sessionStorage.getItem('ubicacion_lon')) || -58.3816
          },
          zoom: 12,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Profesionales simulados
        const profesionales = [
          { nombre: "Dr. Carlos Rodríguez", lat: -34.5895, lng: -58.4068, especialidad: "Cardiología" },
          { nombre: "Dra. Sofía Gómez", lat: -34.5638, lng: -58.4562, especialidad: "Psiquiatría" },
          { nombre: "Dr. Francisco Pérez", lat: -34.6253, lng: -58.5161, especialidad: "Odontología" },
          { nombre: "Dra. Ana López", lat: -34.6931, lng: -58.5946, especialidad: "Dermatología" },
          { nombre: "Dr. Juan Pérez", lat: -34.7565, lng: -58.6531, especialidad: "Neurología" }
        ];

        // Crear marcadores
        profesionales.forEach(pro => {
          const marker = new google.maps.Marker({
            position: { lat: pro.lat, lng: pro.lng },
            map: mapa,
            title: `${pro.nombre} - ${pro.especialidad}`,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 0C6.7 0 0 6.7 0 15c0 8.3 15 25 15 25s15-16.7 15-25C30 6.7 23.3 0 15 0z" fill="#0ea5e9"/>
                  <circle cx="15" cy="15" r="8" fill="white"/>
                  <text x="15" y="19" text-anchor="middle" font-family="Arial" font-size="12" fill="#0ea5e9">+</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 40),
              anchor: new google.maps.Point(15, 40)
            }
          });

          // Info window para cada marcador
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold text-gray-800">${pro.nombre}</h3>
                <p class="text-sm text-gray-600">${pro.especialidad}</p>
                <button class="mt-2 bg-sky-500 text-white px-3 py-1 rounded text-sm hover:bg-sky-600">
                  Ver perfil
                </button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapa, marker);
          });
        });

        console.log('Mapa inicializado correctamente');
        
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

      // Botones
      const btnContinuar = document.getElementById("btn-continuar");
      const btnGeo = document.getElementById("btn-geo");
      const btnBuscar = paso2?.querySelector(".continue-button");

      // Inputs
      const inputUbicacion = document.getElementById("ubicacion");
      const inputEspecialidad = paso2?.querySelector("input[type='text']");

      // Especialidades populares
      const especialidades = paso2?.querySelectorAll(".tag");
      const selectedLocation = paso2?.querySelector(".selected-location");
      const resultadosTitulo = paso3?.querySelector(".lista-profesionales h2");

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

      // Paso 1 -> Paso 2
      if (btnContinuar) {
        btnContinuar.addEventListener("click", function () {
          const ubicacion = inputUbicacion?.value.trim();
          if (!ubicacion) {
            alert("Por favor, ingresá una ubicación.");
            return;
          }

          ubicacionElegida = ubicacion;

          // Mostrar ubicación elegida en el paso 2
          if (selectedLocation) {
            selectedLocation.textContent = "📍 " + ubicacionElegida;
          }

          // Actualizar pasos visuales
          irAlPaso(paso1, paso2, 2);
        });
      }

      // Paso 2 -> Paso 3
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
            resultadosTitulo.textContent = `Profesionales disponibles en ${ubicacionElegida} para ${especialidadElegida}`;
          }

          // Mostrar paso 3
          irAlPaso(paso2, paso3, 3);

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
