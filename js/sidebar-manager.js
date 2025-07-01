/**
 * Gestor del sidebar y navegación
 * Maneja la expansión del sidebar y cambio de secciones
 */
class SidebarManager {
    constructor() {
      this.sidebar = document.getElementById("sidebar")
      this.content = document.getElementById("content")
      this.body = document.getElementById("main-body")
      this.menuItems = document.querySelectorAll(".menu-item")
      this.bottomNavItems = document.querySelectorAll(".bottom-nav a")
      this.sections = document.querySelectorAll(".section")
      this.isExpanded = false
  
      this.init()
    }
  
    init() {
      this.setupSidebarHover()
      this.setupNavigation()
      this.setupResponsive()
      this.setInitialPadding()
    }
  
    /**
     * Configura el efecto hover del sidebar
     */
    setupSidebarHover() {
      if (!this.sidebar) return
  
      this.sidebar.addEventListener("mouseenter", () => {
        if (window.innerWidth >= 768) {
          this.expandSidebar()
        }
      })
  
      this.sidebar.addEventListener("mouseleave", () => {
        if (window.innerWidth >= 768) {
          this.collapseSidebar()
        }
      })
    }
  
    /**
     * Expande el sidebar
     */
    expandSidebar() {
      this.isExpanded = true
      this.sidebar.classList.add("w-48")
      this.sidebar.classList.remove("w-15")
      this.content.style.marginLeft = "192px" // 48 * 4 = 192px
  
      // Mostrar labels con animación
      const labels = this.sidebar.querySelectorAll(".menu-label")
      labels.forEach((label) => {
        label.classList.remove("opacity-0", "translate-x-4")
        label.classList.add("opacity-100", "translate-x-0")
      })
    }
  
    /**
     * Colapsa el sidebar
     */
    collapseSidebar() {
      this.isExpanded = false
      this.sidebar.classList.remove("w-48")
      this.sidebar.classList.add("w-15")
      this.content.style.marginLeft = "60px"
  
      // Ocultar labels con animación
      const labels = this.sidebar.querySelectorAll(".menu-label")
      labels.forEach((label) => {
        label.classList.add("opacity-0", "translate-x-4")
        label.classList.remove("opacity-100", "translate-x-0")
      })
    }
  
    /**
     * Configura la navegación entre secciones
     */
    setupNavigation() {
      // Sidebar navigation
      this.menuItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault()
          const sectionId = item.getAttribute("data-section")
          this.showSection(sectionId)
        })
      })
  
      // Bottom navigation (mobile)
      this.bottomNavItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault()
          const sectionId = item.getAttribute("data-section")
          this.showSection(sectionId)
        })
      })
    }
  
    /**
     * Muestra una sección específica
     */
    showSection(sectionId) {
      // Ocultar todas las secciones
      this.sections.forEach((section) => {
        section.classList.add("hidden", "opacity-0")
        section.classList.remove("block", "opacity-100")
      })
  
      // Mostrar la sección objetivo
      const targetSection = document.getElementById(sectionId + "-section")
      if (targetSection) {
        targetSection.classList.remove("hidden", "opacity-0")
        targetSection.classList.add("block")
  
        // Animación de aparición
        setTimeout(() => {
          targetSection.classList.add("opacity-100")
        }, 10)
      }
  
      // Actualizar estados activos
      this.updateActiveStates(sectionId)
    }
  
    /**
     * Actualiza los estados activos de los elementos de navegación
     */
    updateActiveStates(sectionId) {
      // Limpiar estados activos
      ;[...this.menuItems, ...this.bottomNavItems].forEach((item) => {
        item.classList.remove("active")
  
        // Remover indicador activo del sidebar
        const indicator = item.querySelector(".active-indicator")
        if (indicator) {
          indicator.style.opacity = "0"
        }
  
        // Resetear colores de iconos
        const icon = item.querySelector(".material-icons")
        if (icon) {
          icon.classList.remove("text-blue-600")
          icon.classList.add("text-gray-600")
        }
      })
  
      // Activar elementos correspondientes
      const activeItems = document.querySelectorAll(`[data-section="${sectionId}"]`)
      activeItems.forEach((item) => {
        item.classList.add("active")
  
        // Mostrar indicador activo del sidebar
        const indicator = item.querySelector(".active-indicator")
        if (indicator) {
          indicator.style.opacity = "1"
        }
  
        // Colorear icono activo
        const icon = item.querySelector(".material-icons")
        if (icon) {
          icon.classList.add("text-blue-600")
          icon.classList.remove("text-gray-600")
        }
      })
    }
  
    /**
     * Configura el comportamiento responsive
     */
    setupResponsive() {
      window.addEventListener("resize", () => {
        this.setInitialPadding()
  
        // En mobile, colapsar sidebar
        if (window.innerWidth < 768) {
          this.collapseSidebar()
        }
      })
    }
  
    /**
     * Establece el padding inicial del contenido
     */
    setInitialPadding() {
      if (window.innerWidth >= 768) {
        this.content.style.marginLeft = "60px"
      } else {
        this.content.style.marginLeft = "0"
      }
    }
  
    /**
     * Inicializa la aplicación mostrando la sección por defecto
     */
    initializeApp() {
      this.showSection("buscar")
    }
  }
  
  // Instancia global del gestor de sidebar
  window.sidebarManager = new SidebarManager()
  