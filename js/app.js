/**
 * Archivo principal de la aplicación
 * Inicializa todos los componentes y gestiona el estado global
 */
class App {
    constructor() {
      this.isInitialized = false
      this.init()
    }
  
    /**
     * Inicializa la aplicación
     */
    init() {
      // Esperar a que el DOM esté completamente cargado
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          this.initializeApp()
        })
      } else {
        this.initializeApp()
      }
    }
  
    /**
     * Inicializa todos los componentes de la aplicación
     */
    initializeApp() {
      try {
        // Inicializar componentes principales
        this.initializeComponents()
  
        // Configurar tabs del perfil
        this.setupProfileTabs()
  
        // Configurar acordeones
        this.setupAccordions()
  
        // Configurar eventos globales
        this.setupGlobalEvents()
  
        // Mostrar sección inicial
        window.sidebarManager.initializeApp()
  
        // Actualizar contador de solicitudes en la UI
        this.updateSolicitudesUI()
  
        this.isInitialized = true
        console.log("Aplicación inicializada correctamente")
      } catch (error) {
        console.error("Error al inicializar la aplicación:", error)
      }
    }
  
    /**
     * Inicializa los componentes principales
     */
    initializeComponents() {
      // Los componentes ya están inicializados globalmente
      // Aquí podríamos agregar configuraciones adicionales
  
      // Verificar que todos los componentes estén disponibles
      if (!window.dataManager) {
        throw new Error("DataManager no está disponible")
      }
  
      if (!window.sidebarManager) {
        throw new Error("SidebarManager no está disponible")
      }
  
      if (!window.searchManager) {
        throw new Error("SearchManager no está disponible")
      }
  
      // PatientManager se inicializará de forma diferida
      console.log("ℹ️ PatientManager se inicializará cuando la API esté disponible")
    }
  
    /**
     * Configura las pestañas del perfil
     */
    setupProfileTabs() {
      const tabButtons = document.querySelectorAll(".tab-button")
      const tabContents = document.querySelectorAll(".tab-content")
      const tabSelect = document.getElementById("tabs-select")
  
      // Función para mostrar una pestaña
      const showTab = (tabId) => {
        // Actualizar botones
        tabButtons.forEach((btn) => {
          btn.classList.remove("active", "bg-sky-500", "text-white")
          btn.classList.add("bg-gray-100")
        })
  
        // Actualizar contenido
        tabContents.forEach((tab) => {
          tab.classList.add("hidden")
          tab.classList.remove("block")
        })
  
        // Mostrar pestaña activa
        const targetTab = document.getElementById(tabId)
        if (targetTab) {
          targetTab.classList.remove("hidden")
          targetTab.classList.add("block")
        }
  
        // Activar botón correspondiente
        const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`)
        if (activeButton) {
          activeButton.classList.add("active", "bg-sky-500", "text-white")
          activeButton.classList.remove("bg-gray-100")
        }
  
        // Actualizar select móvil
        if (tabSelect) {
          tabSelect.value = tabId
        }
      }
  
      // Event listeners para botones de pestañas
      tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const tabId = button.getAttribute("data-tab")
          showTab(tabId)
        })
      })
  
      // Event listener para select móvil
      if (tabSelect) {
        tabSelect.addEventListener("change", (e) => {
          showTab(e.target.value)
        })
      }
    }
  
    /**
     * Configura los acordeones del historial clínico
     */
    setupAccordions() {
      const accordionToggles = document.querySelectorAll(".cv-subsection-toggle")
  
      accordionToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const targetId = toggle.getAttribute("data-target")
          const content = document.getElementById(targetId)
          const icon = toggle.querySelector(".toggle-icon")
  
          if (!content || !icon) return
  
          // Toggle del acordeón
          const isActive = toggle.classList.contains("active")
  
          if (isActive) {
            // Cerrar
            toggle.classList.remove("active", "bg-sky-50", "text-sky-500")
            toggle.classList.add("bg-gray-100")
            content.classList.add("hidden")
            content.classList.remove("block")
            icon.style.transform = "rotate(0deg)"
          } else {
            // Abrir
            toggle.classList.add("active", "bg-sky-50", "text-sky-500")
            toggle.classList.remove("bg-gray-100")
            content.classList.remove("hidden")
            content.classList.add("block")
            icon.style.transform = "rotate(180deg)"
          }
        })
      })
    }
  
    /**
     * Configura eventos globales
     */
    setupGlobalEvents() {
      // Manejar cambios de tamaño de ventana
      window.addEventListener("resize", () => {
        this.handleResize()
      })
  
      // Manejar errores globales
      window.addEventListener("error", (event) => {
        console.error("Error global:", event.error)
      })
  
      // Manejar promesas rechazadas
      window.addEventListener("unhandledrejection", (event) => {
        console.error("Promesa rechazada:", event.reason)
      })
    }
  
    /**
     * Maneja los cambios de tamaño de ventana
     */
    handleResize() {
      // Reajustar el sidebar si es necesario
      if (window.sidebarManager) {
        window.sidebarManager.setInitialPadding()
      }
  
      // Reajustar el mapa si está visible
      if (window.searchManager && window.searchManager.map) {
        window.google.maps.event.trigger(window.searchManager.map, "resize")
      }
    }
  
    /**
     * Método para debugging - muestra el estado de la aplicación
     */
    getAppState() {
      return {
        initialized: this.isInitialized,
        currentSection: document.querySelector(".section.block")?.id || "none",
        currentStep: window.searchManager?.currentStep || 0,
        selectedLocation: window.searchManager?.selectedLocation || "",
        selectedSpecialty: window.searchManager?.selectedSpecialty || "",
        professionalsCount: window.dataManager?.getProfesionales().length || 0,
      }
    }
  
    /**
     * Actualiza la UI del contador de solicitudes
     */
    updateSolicitudesUI() {
      const counter = document.getElementById("solicitudes-counter")
      const dots = document.getElementById("solicitudes-dots")
  
      if (counter && dots) {
        const restantes = window.dataManager.getSolicitudesRestantes()
        const total = window.dataManager.maxSolicitudes
  
        counter.textContent = `${restantes}/${total} disponibles`
  
        // Actualizar dots
        dots.innerHTML = Array.from(
          { length: total },
          (_, i) => `<div class="w-2 h-2 rounded-full ${i < restantes ? "bg-blue-500" : "bg-gray-300"}"></div>`,
        ).join("")
      }
  
      // Actualizar display de zona
      const zonaDisplay = document.getElementById("zona-busqueda-display")
      if (zonaDisplay && window.searchManager.selectedLocation) {
        zonaDisplay.textContent = `10 km alrededor de ${window.searchManager.selectedLocation}`
      }
    }
  
    /**
     * Método para resetear solicitudes (para testing)
     */
    resetSolicitudes() {
      window.dataManager.resetearSolicitudes()
      this.updateSolicitudesUI()
      if (window.searchManager.currentStep === 3) {
        window.searchManager.loadResults()
      }
      console.log("Solicitudes reseteadas para testing")
    }
  }
  
  // Inicializar la aplicación
  window.app = new App()
  
  // Función global para debugging
  window.debugApp = () => {
    console.log("Estado de la aplicación:", window.app.getAppState())
  }
  
  // Declare the google variable
  window.google = window.google || {}
  window.google.maps = window.google.maps || {}
  