/**
 * Gestor de búsqueda y resultados
 * Maneja los pasos de búsqueda, filtros y mapa
 */
class SearchManager {
    constructor() {
      this.currentStep = 1
      this.selectedLocation = ""
      this.selectedSpecialty = ""
      this.map = null
      this.markers = []
  
      this.searchCenter = null // Centro de búsqueda
      this.searchRadius = 10000 // 10km en metros
      this.searchCircle = null // Círculo de búsqueda en el mapa
  
      this.elements = {
        step1: document.getElementById("search-step-1"),
        step2: document.getElementById("search-step-2"),
        step3: document.getElementById("search-step-3"),
        locationInput: document.getElementById("ubicacion"),
        specialtyInput: document.getElementById("especialidad-input"),
        continueBtn: document.getElementById("btn-continuar"),
        geoBtn: document.getElementById("btn-geo"),
        searchBtn: document.getElementById("btn-buscar"),
        recentSearches: document.getElementById("recent-searches"),
        specialtiesContainer: document.getElementById("especialidades-container"),
        selectedLocationDisplay: document.querySelector(".selected-location"),
        resultsTitle: document.getElementById("resultados-titulo"),
        professionalsContainer: document.getElementById("profesionales-container"),
        mapContainer: document.getElementById("mapa-profesionales"),
      }
  
      this.init()
    }
  
    init() {
      this.loadRecentSearches()
      this.loadSpecialties()
      this.setupEventListeners()
      this.setupFilters()
    }
  
    /**
     * Carga las búsquedas recientes
     */
    loadRecentSearches() {
      if (!this.elements.recentSearches) return
  
      const locations = window.dataManager.getUbicacionesRecientes()
      this.elements.recentSearches.innerHTML = locations
        .map(
          (location) => `
        <button class="recent-item bg-gray-200 border-0 p-2.5 rounded-lg text-left cursor-pointer text-sm hover:bg-gray-300 transition-colors duration-200 w-full" 
                onclick="searchManager.selectRecentLocation('${location}')">
          🕒 ${location}
        </button>
      `,
        )
        .join("")
    }
  
    /**
     * Carga las especialidades populares
     */
    loadSpecialties() {
      if (!this.elements.specialtiesContainer) return
  
      const specialties = window.dataManager.getEspecialidades()
      this.elements.specialtiesContainer.innerHTML = specialties
        .map(
          (specialty) => `
        <button class="tag bg-gray-200 border-0 py-2 px-4 rounded-full text-sm cursor-pointer transition-colors duration-200 hover:bg-gray-300 hover:bg-sky-100 hover:text-sky-700" 
                onclick="searchManager.selectSpecialty('${specialty}')">
          ${specialty}
        </button>
      `,
        )
        .join("")
    }
  
    /**
     * Configura los event listeners
     */
    setupEventListeners() {
      // Paso 1 -> Paso 2
      if (this.elements.continueBtn) {
        this.elements.continueBtn.addEventListener("click", () => {
          this.goToStep2()
        })
      }
  
      // Paso 2 -> Paso 3
      if (this.elements.searchBtn) {
        this.elements.searchBtn.addEventListener("click", () => {
          this.goToStep3()
        })
      }
  
      // Geolocalización
      if (this.elements.geoBtn) {
        this.elements.geoBtn.addEventListener("click", () => {
          this.getCurrentLocation()
        })
      }
  
      // Búsqueda en tiempo real de especialidades
      if (this.elements.specialtyInput) {
        this.elements.specialtyInput.addEventListener("input", (e) => {
          this.filterSpecialties(e.target.value)
        })
      }
    }
  
    /**
     * Selecciona una ubicación reciente
     */
    selectRecentLocation(location) {
      if (this.elements.locationInput) {
        this.elements.locationInput.value = location
      }
    }
  
    /**
     * Selecciona una especialidad
     */
    selectSpecialty(specialty) {
      if (this.elements.specialtyInput) {
        this.elements.specialtyInput.value = specialty
      }
  
      // Resaltar la especialidad seleccionada
      const tags = document.querySelectorAll(".tag")
      tags.forEach((tag) => {
        tag.classList.remove("bg-sky-100", "text-sky-700")
        tag.classList.add("bg-gray-200")
  
        if (tag.textContent.trim() === specialty) {
          tag.classList.add("bg-sky-100", "text-sky-700")
          tag.classList.remove("bg-gray-200")
        }
      })
    }
  
    /**
     * Filtra especialidades en tiempo real
     */
    filterSpecialties(searchText) {
      const tags = document.querySelectorAll(".tag")
      tags.forEach((tag) => {
        const specialty = tag.textContent.trim()
        if (specialty.toLowerCase().includes(searchText.toLowerCase())) {
          tag.style.display = "inline-block"
        } else {
          tag.style.display = "none"
        }
      })
    }
  
    /**
     * Avanza al paso 2
     */
    goToStep2() {
      const location = this.elements.locationInput?.value.trim()
      if (!location) {
        this.showAlert("Por favor, ingresa una ubicación.")
        return
      }
  
      this.selectedLocation = location
      window.dataManager.agregarUbicacionReciente(location)
  
      // Geocodificar la ubicación para obtener coordenadas
      this.geocodeLocation(location)
  
      if (this.elements.selectedLocationDisplay) {
        this.elements.selectedLocationDisplay.textContent = `📍 ${location}`
      }
  
      this.showStep(2)
      this.updateStepProgress(2)
    }
  
    /**
     * Geocodifica una ubicación para obtener coordenadas
     */
    geocodeLocation(address) {
      const google = window.google
      if (google && google.maps) {
        const geocoder = new google.maps.Geocoder()
  
        geocoder.geocode({ address: address }, (results, status) => {
          if (status === "OK" && results[0]) {
            this.searchCenter = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            }
          } else {
            // Fallback a Buenos Aires si no se puede geocodificar
            this.searchCenter = { lat: -34.6037, lng: -58.3816 }
          }
        })
      } else {
        // Fallback a Buenos Aires
        this.searchCenter = { lat: -34.6037, lng: -58.3816 }
      }
    }
  
    /**
     * Avanza al paso 3
     */
    goToStep3() {
      const specialty = this.elements.specialtyInput?.value.trim()
      if (!specialty) {
        this.showAlert("Por favor, selecciona una especialidad.")
        return
      }
  
      this.selectedSpecialty = specialty
  
      // Actualizar título de resultados
      if (this.elements.resultsTitle) {
        this.elements.resultsTitle.textContent = `Profesionales de ${specialty} en ${this.selectedLocation}`
      }
  
      this.showStep(3)
      this.updateStepProgress(3)
      this.loadResults()
  
      // Inicializar mapa después de un delay
      setTimeout(() => {
        this.initializeMap()
      }, 100)
    }
  
    /**
     * Muestra un paso específico
     */
    showStep(stepNumber) {
      // Ocultar todos los pasos
      ;[this.elements.step1, this.elements.step2, this.elements.step3].forEach((step) => {
        if (step) {
          step.classList.add("hidden")
          step.classList.remove("active")
        }
      })
  
      // Mostrar el paso actual
      const currentStepElement = this.elements[`step${stepNumber}`]
      if (currentStepElement) {
        currentStepElement.classList.remove("hidden")
        currentStepElement.classList.add("active")
      }
  
      this.currentStep = stepNumber
    }
  
    /**
     * Actualiza el progreso visual de los pasos
     */
    updateStepProgress(currentStep) {
      const stepNumbers = document.querySelectorAll(".step-number")
  
      stepNumbers.forEach((stepEl, index) => {
        const stepNum = index + 1
  
        stepEl.classList.remove("active", "complete", "bg-sky-500", "bg-green-500", "bg-gray-200")
  
        if (stepNum < currentStep) {
          stepEl.classList.add("complete", "bg-green-500")
          stepEl.textContent = "✔"
        } else if (stepNum === currentStep) {
          stepEl.classList.add("active", "bg-sky-500")
          stepEl.textContent = stepNum
        } else {
          stepEl.classList.add("bg-gray-200")
          stepEl.textContent = stepNum
        }
      })
    }
  
    /**
     * Obtiene la ubicación actual del usuario
     */
    getCurrentLocation() {
      if (!navigator.geolocation) {
        this.showAlert("Tu navegador no soporta geolocalización.")
        return
      }
  
      const btn = this.elements.geoBtn
      const originalText = btn.textContent
      btn.textContent = "📡 Obteniendo ubicación..."
      btn.disabled = true
  
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
  
          // Guardar centro de búsqueda
          this.searchCenter = { lat: latitude, lng: longitude }
  
          const google = window.google
          if (google && google.maps) {
            const geocoder = new google.maps.Geocoder()
            const latlng = { lat: latitude, lng: longitude }
  
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === "OK" && results[0]) {
                this.elements.locationInput.value = results[0].formatted_address
              } else {
                this.elements.locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
              }
  
              btn.textContent = originalText
              btn.disabled = false
            })
          } else {
            this.elements.locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            btn.textContent = originalText
            btn.disabled = false
          }
        },
        (error) => {
          console.error("Error de geolocalización:", error)
          this.showAlert("No se pudo obtener tu ubicación.")
          btn.textContent = originalText
          btn.disabled = false
        },
      )
    }
  
    /**
     * Carga los resultados de búsqueda
     */
    loadResults() {
      if (!this.elements.professionalsContainer) return
  
      const professionals = window.dataManager.filtrarProfesionales({
        especialidad: this.selectedSpecialty,
      })
  
      const sortedProfessionals = window.dataManager.ordenarProfesionales(professionals, "rating")
  
      this.elements.professionalsContainer.innerHTML = sortedProfessionals
        .map((prof) => this.createProfessionalCard(prof))
        .join("")
    }
  
    /**
     * Crea una tarjeta de profesional
     */
    createProfessionalCard(professional) {
      return `
      <div class="card-profesional bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-4 text-sm mb-4 hover:shadow-xl transition-shadow duration-300">
        <div class="card-header flex flex-col w-full">
          <div class="card-main flex justify-between items-start gap-2.5">
            <div class="nombre-especialidad">
              <h3 class="m-0 text-lg font-semibold">${professional.nombre}</h3>
              <p class="mt-0.5 mb-0 text-sm text-gray-500">${professional.especialidad}</p>
            </div>
            <div class="rating text-amber-500 font-semibold text-sm whitespace-nowrap">
              ⭐ <strong>${professional.rating}</strong> 
              <span class="rating-count text-gray-500 font-normal text-xs ml-1">(${professional.reviewCount})</span>
            </div>
          </div>
          <div class="card-subinfo mt-2">
            <p class="my-1 flex items-center text-gray-600 text-sm">
              <span class="icon mr-1.5">📍</span> ${professional.zona || "Zona Centro"} 
              <span class="distancia text-gray-400 text-xs ml-1.5">(~${professional.distancia} km)</span>
            </p>
            <p class="my-1 flex items-center text-gray-600 text-sm">
              <span class="icon mr-1.5">📅</span> ${professional.disponibilidad}
            </p>
          </div>
          <div class="obras-sociales mt-2">
            <span class="label font-medium mb-1 block text-gray-700">Obras sociales:</span>
            <div class="badges flex flex-wrap gap-1.5">
              ${professional.obrasSociales
                .map(
                  (obra) =>
                    `<span class="badge bg-gray-100 text-gray-700 py-1 px-2.5 text-xs rounded-full font-medium">${obra}</span>`,
                )
                .join("")}
            </div>
          </div>
  
          <div class="card-actions flex justify-center items-center mt-4">
            <button class="ver-perfil flex items-center justify-center bg-sky-500 text-white py-3 px-6 rounded-lg text-sm font-semibold cursor-pointer transition-colors duration-200 hover:bg-sky-600 w-full" 
                    onclick="searchManager.verPerfil(${professional.id})">
              👨‍⚕️ Ver perfil completo
            </button>
          </div>
        </div>
      </div>
    `
    }
  
    /**
     * Maneja la acción de ver perfil (ahora gratuito)
     */
    verPerfil(professionalId) {
      // Guardar el ID del profesional seleccionado
      sessionStorage.setItem("selectedProfessionalId", professionalId)
  
      // Redirigir a la página del profesional
      window.location.href = "profesional.html"
    }
  
    /**
     * Configura los filtros de búsqueda
     */
    setupFilters() {
      const filterDisponibilidad = document.getElementById("filter-disponibilidad")
      const filterObraSocial = document.getElementById("filter-obra-social")
      const sortBy = document.getElementById("sort-by")
      ;[filterDisponibilidad, filterObraSocial, sortBy].forEach((filter) => {
        if (filter) {
          filter.addEventListener("change", () => {
            this.applyFilters()
          })
        }
      })
    }
  
    /**
     * Aplica los filtros seleccionados
     */
    applyFilters() {
      const filters = {
        especialidad: this.selectedSpecialty,
        disponibilidad: document.getElementById("filter-disponibilidad")?.value || "",
        obraSocial: document.getElementById("filter-obra-social")?.value || "",
      }
  
      const sortCriteria = document.getElementById("sort-by")?.value || "rating"
  
      let professionals = window.dataManager.filtrarProfesionales(filters)
      professionals = window.dataManager.ordenarProfesionales(professionals, sortCriteria)
  
      if (this.elements.professionalsContainer) {
        this.elements.professionalsContainer.innerHTML = professionals
          .map((prof) => this.createProfessionalCard(prof))
          .join("")
      }
  
      // Actualizar marcadores del mapa
      //this.updateMapMarkers(professionals)
    }
  
    /**
     * Inicializa el mapa con zona de búsqueda
     */
    initializeMap() {
      if (!this.elements.mapContainer) return
  
      const google = window.google
      if (!google || !google.maps) {
        this.elements.mapContainer.innerHTML =
          '<div class="w-full h-full bg-red-100 rounded-xl flex items-center justify-center text-red-500">Google Maps no disponible</div>'
        return
      }
  
      try {
        // Usar el centro de búsqueda o Buenos Aires por defecto
        const center = this.searchCenter || { lat: -34.6037, lng: -58.3816 }
  
        this.map = new google.maps.Map(this.elements.mapContainer, {
          center: center,
          zoom: 11, // Zoom para mostrar bien el área de 10km
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        })
  
        // Crear círculo de zona de búsqueda
        this.searchCircle = new google.maps.Circle({
          strokeColor: "#0ea5e9",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 0.15,
          map: this.map,
          center: center,
          radius: this.searchRadius, // 10km
        })
  
        // Marcador central
        new google.maps.Marker({
          position: center,
          map: this.map,
          title: `Zona de búsqueda: ${this.selectedLocation}`,
          icon: {
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="18" fill="#0ea5e9" stroke="white" stroke-width="4"/>
              <text x="20" y="26" text-anchor="middle" font-family="Arial" font-size="16" fill="white" font-weight="bold">📍</text>
            </svg>
          `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          },
        })
  
        // Info window para la zona
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="p-3 text-center">
            <h3 class="font-semibold text-gray-800 mb-2">Zona de Búsqueda</h3>
            <p class="text-sm text-gray-600 mb-2">📍 ${this.selectedLocation}</p>
            <p class="text-sm text-gray-600 mb-2">🔍 ${this.selectedSpecialty}</p>
            <p class="text-xs text-gray-500">Radio de búsqueda: 10 km</p>
            <div class="mt-2 p-2 bg-blue-50 rounded">
              <p class="text-xs text-blue-700">Los profesionales se encuentran dentro de esta área por privacidad</p>
            </div>
          </div>
        `,
          position: center,
        })
  
        // Mostrar info window automáticamente
        infoWindow.open(this.map)
      } catch (error) {
        console.error("Error al inicializar el mapa:", error)
        this.elements.mapContainer.innerHTML =
          '<div class="w-full h-full bg-red-100 rounded-xl flex items-center justify-center text-red-500">Error al cargar el mapa</div>'
      }
    }
  
    /**
     * Muestra una alerta al usuario
     */
    showAlert(message) {
      // Implementación simple de alerta
      // En una aplicación real, usarías un modal o toast más elegante
      alert(message)
    }
  }
  
  // Instancia global del gestor de búsqueda
  window.searchManager = new SearchManager()
  