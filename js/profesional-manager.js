/**
 * Gestor del perfil del profesional
 * Maneja la carga de datos, sistema de solicitudes y funcionalidades del perfil
 */

// Import Luxon if available
const DateTime = window.luxon ? window.luxon.DateTime : null

class ProfesionalManager {
  constructor() {
    this.professionalData = null
    this.currentDate = null
    this.selectedDate = null
    this.selectedLugar = "Consultorio Privado"
    this.selectedHora = null

    // Datos mockup completos del profesional
    this.mockupData = {
      1: {
        id: 1,
        nombre: "Dr. Carlos Rodríguez",
        especialidad: "Psicología Clínica",
        rating: "4.8",
        reviewCount: 124,
        zona: "Zona Norte",
        descripcion:
          "Psicólogo clínico con más de 15 años de experiencia especializado en terapia cognitivo-conductual y tratamiento de trastornos de ansiedad. Formado en la Universidad de Buenos Aires con posgrado en Terapia Cognitivo-Conductual en la Universidad de Barcelona.",
        obrasSociales: ["OSDE", "Swiss Medical", "Medifé", "Galeno", "PAMI", "IOMA"],
        especialidades: [
          "Psicología Clínica",
          "Terapia Cognitivo-Conductual",
          "Trastornos de Ansiedad",
          "Terapia Individual",
        ],
        idiomas: ["Español", "Inglés", "Portugués"],
        experienciaLaboral: [
          {
            puesto: "Psicólogo Clínico Senior - Centro de Salud Mental Integral",
            periodo: "2015 - Presente",
            descripcion: [
              "Atención psicológica individual y grupal especializada en trastornos de ansiedad y depresión.",
              "Coordinación de programas de prevención en salud mental comunitaria.",
              "Supervisión de residentes de psicología clínica.",
            ],
          },
          {
            puesto: "Psicólogo Clínico - Hospital Universitario",
            periodo: "2010 - 2015",
            descripcion: [
              "Evaluación y tratamiento psicológico en consulta externa.",
              "Participación en equipos interdisciplinarios de salud mental.",
              "Desarrollo de protocolos de atención psicológica.",
            ],
          },
          {
            puesto: "Psicólogo Residente - Clínica de Salud Mental",
            periodo: "2008 - 2010",
            descripcion: [
              "Rotación por diferentes servicios de salud mental.",
              "Atención de pacientes bajo supervisión especializada.",
              "Participación en guardias de emergencias psiquiátricas.",
            ],
          },
        ],
        educacion: [
          {
            titulo: "Posgrado en Terapia Cognitivo-Conductual",
            institucion: "Universidad de Barcelona, España",
            periodo: "2014-2015",
          },
          {
            titulo: "Especialización en Trastornos de Ansiedad",
            institucion: "Instituto de Neurociencias, Buenos Aires",
            periodo: "2012-2013",
          },
          {
            titulo: "Licenciatura en Psicología",
            institucion: "Universidad de Buenos Aires, Argentina",
            periodo: "2003-2008",
          },
        ],
        acreditaciones: [
          {
            nombre: "Matrícula Profesional de Psicólogo",
            numero: "MP 12345",
            emisor: "Colegio de Psicólogos de Buenos Aires",
            vigencia: "31/12/2025",
          },
          {
            nombre: "Certificación en Terapia Cognitivo-Conductual",
            numero: "TCC-2015-089",
            emisor: "Asociación Argentina de Terapia Cognitiva",
            vigencia: "Permanente",
          },
          {
            nombre: "Habilitación en Emergencias Psiquiátricas",
            numero: "EP-2018-156",
            emisor: "Ministerio de Salud de la Nación",
            vigencia: "15/06/2026",
          },
        ],
        reseñas: [
          {
            nombre: "María González",
            rating: 5,
            comentario:
              "Excelente profesional. Me ayudó muchísimo con mi ansiedad. Muy empático y profesional en su trato.",
            fecha: "15 de mayo de 2024",
          },
          {
            nombre: "Juan Pérez",
            rating: 4,
            comentario:
              "Muy buena atención, me sentí cómodo durante todo el proceso. Las técnicas que me enseñó me sirvieron mucho.",
            fecha: "3 de abril de 2024",
          },
          {
            nombre: "Ana López",
            rating: 5,
            comentario:
              "Increíble profesional. Su enfoque me ayudó a superar problemas que tenía hace años. Lo recomiendo totalmente.",
            fecha: "20 de marzo de 2024",
          },
          {
            nombre: "Roberto Gómez",
            rating: 4,
            comentario: "Atento y puntual. Me explicó todo con claridad y paciencia. Muy recomendable.",
            fecha: "8 de febrero de 2024",
          },
          {
            nombre: "Laura Martínez",
            rating: 5,
            comentario:
              "Excelente trato humano y gran profesionalismo. Me ayudó a encontrar herramientas para manejar el estrés.",
            fecha: "25 de enero de 2024",
          },
        ],
        lugares: [
          {
            id: "consultorio-privado",
            nombre: "Consultorio Privado",
            zona: "Zona Norte",
            direccionPublica: "Zona Norte - Dirección exacta tras contacto",
            direccionCompleta: "Av. Santa Fe 1234, Piso 5, Oficina 12, CABA",
            telefono: "+54 11 4567-8901",
            horarios: "Lunes: 14:00 - 19:00 | Miércoles: 09:00 - 13:00",
          },
          {
            id: "centro-salud-mental",
            nombre: "Centro de Salud Mental Integral",
            zona: "Zona Centro",
            direccionPublica: "Zona Centro - Dirección exacta tras contacto",
            direccionCompleta: "Av. Corrientes 2456, Piso 8, CABA",
            telefono: "+54 11 4321-5678",
            horarios: "Martes: 10:00 - 16:00 | Jueves: 12:00 - 18:00",
          },
        ],
      },
    }

    // Datos de disponibilidad para el calendario
    this.disponibilidad = {
      "consultorio-privado": {
        "2025-01-08": { manana: ["09:00", "09:30", "10:00"], tarde: ["14:00", "14:30", "15:00"], noche: [] },
        "2025-01-10": { manana: ["10:00", "10:30"], tarde: ["15:00", "15:30", "16:00"], noche: [] },
        "2025-01-13": { manana: [], tarde: ["15:00", "16:00"], noche: [] },
        "2025-01-15": { manana: ["09:00", "10:00"], tarde: [], noche: [] },
        "2025-01-17": { manana: ["09:00", "09:30", "10:00"], tarde: ["14:00", "15:00"], noche: [] },
        "2025-01-20": { manana: ["10:00", "11:00"], tarde: ["14:00", "15:00", "16:00"], noche: [] },
      },
      "centro-salud-mental": {
        "2025-01-07": { manana: ["08:00", "08:30"], tarde: ["13:00", "13:30", "14:00"], noche: [] },
        "2025-01-09": { manana: ["09:00", "09:30"], tarde: ["14:00"], noche: [] },
        "2025-01-14": { manana: ["10:00", "11:00"], tarde: ["13:00", "14:00"], noche: [] },
        "2025-01-16": { manana: [], tarde: ["12:00", "13:00", "14:00"], noche: ["18:00", "19:00"] },
        "2025-01-21": { manana: ["09:00", "10:00"], tarde: ["13:00", "14:00"], noche: [] },
        "2025-01-23": { manana: ["08:30", "09:00"], tarde: ["13:30", "14:30"], noche: [] },
      },
    }

    this.init()

    // Debug flag
    this.debugMode = true
  }

  init() {
    console.log("ProfesionalManager.init() called")
    // Inicializar Luxon si está disponible
    this.currentDate = DateTime ? DateTime.now() : new Date()

    // Inicializar inmediatamente
    this.initializeComponents()
  }

  initializeComponents() {
    console.log("=== INICIANDO COMPONENTES ===")

    this.loadProfessionalData()
    this.updateSolicitudesUI()
    this.setupEventListeners()

    // Debug de elementos antes de configurar
    this.debugElements()

    this.setupTabs()
    this.setupAccordions()
    this.setupSidebar()
    this.setupAppointmentBooking()
    this.generateCalendar()

    console.log("=== COMPONENTES INICIALIZADOS ===")
  }

  /**
   * Carga los datos del profesional
   */
  loadProfessionalData() {
    const professionalId = sessionStorage.getItem("selectedProfessionalId") || "1"
    this.professionalData = this.mockupData[professionalId] || this.mockupData["1"]

    this.populateProfessionalInfo()
    this.populateExperienceSection()
    this.populateEducationSection()
    this.populateAccreditationsSection()
    this.populateReviewsSection()
    this.populatePlacesSection()
  }

  /**
   * Rellena la información básica del profesional
   */
  populateProfessionalInfo() {
    const data = this.professionalData

    document.getElementById("professional-name").textContent = data.nombre
    document.getElementById("professional-specialty").textContent = data.especialidad
    document.getElementById("professional-rating").textContent = data.rating
    document.getElementById("professional-reviews").textContent = `(${data.reviewCount} reseñas)`
    document.getElementById("professional-zone").textContent = data.zona
    document.getElementById("professional-description").textContent = data.descripcion

    // Especialidades
    const specialtiesContainer = document.getElementById("professional-specialties")
    if (specialtiesContainer && data.especialidades) {
      specialtiesContainer.innerHTML = data.especialidades
        .map(
          (esp) =>
            `<span class="badge bg-gray-100 text-gray-700 py-1.5 px-2.5 text-sm rounded-full font-medium">${esp}</span>`,
        )
        .join("")
    }

    // Obras sociales
    const insuranceContainer = document.getElementById("professional-insurance")
    if (insuranceContainer && data.obrasSociales) {
      insuranceContainer.innerHTML = data.obrasSociales
        .map(
          (obra) =>
            `<span class="badge bg-gray-100 text-gray-700 py-1.5 px-2.5 text-sm rounded-full font-medium">${obra}</span>`,
        )
        .join("")
    }

    // Idiomas
    const idiomasContainer = document.querySelector("#info .badges:last-of-type")
    if (idiomasContainer && data.idiomas) {
      idiomasContainer.innerHTML = data.idiomas
        .map(
          (idioma) =>
            `<span class="badge bg-gray-100 text-gray-700 py-1.5 px-2.5 text-sm rounded-full font-medium">${idioma}</span>`,
        )
        .join("")
    }

    // Foto
    const photo = document.getElementById("professional-photo")
    if (photo) {
      photo.src = `/placeholder.svg?height=120&width=120&text=${encodeURIComponent(data.nombre.split(" ")[1] || "Dr")}`
    }
  }

  /**
   * Rellena la sección de experiencia laboral
   */
  populateExperienceSection() {
    const container = document.getElementById("experiencia-content")
    if (!container || !this.professionalData.experienciaLaboral) return

    container.innerHTML = this.professionalData.experienciaLaboral
      .map(
        (exp, index) => `
        <div class="job-entry mb-4 pb-4 ${index < this.professionalData.experienciaLaboral.length - 1 ? "border-b border-dashed border-gray-200" : ""}">
          <h5 class="m-0 mb-1 text-sm font-medium text-gray-800">${exp.puesto}</h5>
          <p class="m-0 text-xs text-gray-600 mb-2">${exp.periodo}</p>
          <ul class="mt-2 pl-5 text-xs text-gray-600 list-disc">
            ${exp.descripcion.map((desc) => `<li>${desc}</li>`).join("")}
          </ul>
        </div>
      `,
      )
      .join("")
  }

  /**
   * Rellena la sección de educación
   */
  populateEducationSection() {
    const container = document.getElementById("educacion-content")
    if (!container || !this.professionalData.educacion) return

    container.innerHTML = this.professionalData.educacion
      .map(
        (edu, index) => `
        <div class="education-entry mb-4 pb-4 ${index < this.professionalData.educacion.length - 1 ? "border-b border-dashed border-gray-200" : ""}">
          <h5 class="m-0 mb-1 text-sm font-medium text-gray-800">${edu.titulo}</h5>
          <p class="m-0 text-xs text-gray-600">${edu.institucion} (${edu.periodo})</p>
        </div>
      `,
      )
      .join("")
  }

  /**
   * Rellena la sección de acreditaciones
   */
  populateAccreditationsSection() {
    const container = document.getElementById("acreditaciones-content")
    if (!container || !this.professionalData.acreditaciones) return

    container.innerHTML = this.professionalData.acreditaciones
      .map(
        (acred, index) => `
        <div class="accreditation-item mb-4 pb-4 ${index < this.professionalData.acreditaciones.length - 1 ? "border-b border-dashed border-gray-200" : ""}">
          <h5 class="m-0 mb-1 text-sm font-medium text-gray-800">${acred.nombre}</h5>
          <p class="m-0 text-xs text-gray-600">Número: ${acred.numero}</p>
          <p class="m-0 text-xs text-gray-600">Emitida por: ${acred.emisor}</p>
          <p class="m-0 text-xs text-gray-600">Válido hasta: ${acred.vigencia}</p>
        </div>
      `,
      )
      .join("")
  }

  /**
   * Rellena la sección de reseñas
   */
  populateReviewsSection() {
    const container = document.querySelector("#resenas .opiniones-detalladas")
    if (!container || !this.professionalData.reseñas) return

    container.innerHTML = this.professionalData.reseñas
      .map(
        (resena, index) => `
        <div class="opinion-card bg-gray-50 rounded-xl p-4">
          <div class="opinion-header flex justify-between items-center font-medium mb-2">
            <strong>${resena.nombre}</strong>
            <span class="estrellas text-amber-500 text-lg">${"★".repeat(resena.rating)}${"☆".repeat(5 - resena.rating)}</span>
          </div>
          <p class="opinion-comentario text-sm text-gray-700 mb-2">${resena.comentario}</p>
          <div class="opinion-fecha text-xs text-right text-gray-400">${resena.fecha}</div>
        </div>
        ${index < this.professionalData.reseñas.length - 1 ? '<hr class="border-0 h-px bg-gray-200 my-5">' : ""}
      `,
      )
      .join("")

    // Actualizar resumen de reseñas
    const promedioElement = document.querySelector(".numero-promedio")
    const totalElement = document.querySelector(".total-resenas")

    if (promedioElement) promedioElement.textContent = this.professionalData.rating
    if (totalElement) totalElement.textContent = `${this.professionalData.reviewCount} reseñas`
  }

  /**
   * Rellena la sección de lugares de atención
   */
  populatePlacesSection() {
    const container = document.querySelector(".lugares-grid")
    if (!container || !this.professionalData.lugares) return

    container.innerHTML = this.professionalData.lugares
      .map(
        (lugar, index) => `
        <div class="card-lugar-seleccionable ${index === 0 ? "active border-sky-500 bg-sky-50" : "border-gray-200 bg-gray-50"} rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-sm hover:border-sky-300 hover:bg-sky-50" data-id="${lugar.id}">
          <strong class="block text-base text-gray-800 mb-3">${lugar.nombre}</strong>
          <div class="flex items-center mb-2">
            <span class="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
            <span class="text-sm text-gray-600">${lugar.direccionPublica}</span>
          </div>
          <div class="flex items-center mb-3">
            <span class="text-red-500 mr-2">📞</span>
            <span class="text-sm text-gray-600">Teléfono disponible tras contacto</span>
          </div>
          <div class="text-xs text-gray-500 border-t border-dashed border-gray-200 pt-2">
            ${lugar.horarios}
          </div>
        </div>
      `,
      )
      .join("")

    // Establecer el primer lugar como seleccionado
    if (this.professionalData.lugares.length > 0) {
      this.selectedLugar = this.professionalData.lugares[0].nombre
      document.getElementById("resumenLugar").textContent = this.selectedLugar
    }
  }

  /**
   * Actualiza la UI del contador de solicitudes
   */
  updateSolicitudesUI() {
    if (!window.dataManager) return

    const restantes = window.dataManager.getSolicitudesRestantes()
    const total = window.dataManager.maxSolicitudes

    const solicitudesInfo = document.getElementById("solicitudes-info")
    if (solicitudesInfo) {
      solicitudesInfo.textContent = `${restantes}/${total} contactos gratuitos`
    }

    const dots = document.getElementById("solicitudes-dots")
    if (dots) {
      dots.innerHTML = Array.from(
        { length: total },
        (_, i) => `<div class="w-2 h-2 rounded-full ${i < restantes ? "bg-blue-500" : "bg-gray-300"}"></div>`,
      ).join("")
    }

    const btnContactar = document.getElementById("btn-contactar")
    if (btnContactar) {
      if (restantes > 0) {
        btnContactar.disabled = false
        btnContactar.classList.remove("bg-gray-400", "cursor-not-allowed")
        btnContactar.classList.add("bg-green-500", "hover:bg-green-600")
        btnContactar.innerHTML = "📞 Solicitar contacto"
      } else {
        btnContactar.disabled = true
        btnContactar.classList.add("bg-gray-400", "cursor-not-allowed")
        btnContactar.classList.remove("bg-green-500", "hover:bg-green-600")
        btnContactar.innerHTML = "❌ Sin solicitudes disponibles"
      }
    }
  }

  /**
   * Configura los event listeners principales
   */
  setupEventListeners() {
    const btnContactar = document.getElementById("btn-contactar")
    if (btnContactar) {
      btnContactar.addEventListener("click", () => {
        this.handleContactRequest()
      })
    }

    // Navegación del calendario
    const prevMonth = document.getElementById("prevMonth")
    const nextMonth = document.getElementById("nextMonth")

    if (prevMonth) {
      prevMonth.addEventListener("click", () => {
        this.navigateMonth(-1)
      })
    }

    if (nextMonth) {
      nextMonth.addEventListener("click", () => {
        this.navigateMonth(1)
      })
    }
  }

  /**
   * Navega entre meses del calendario
   */
  navigateMonth(direction) {
    if (DateTime) {
      this.currentDate = this.currentDate.plus({ months: direction })
    } else {
      // Fallback para Date nativo
      const newDate = new Date(this.currentDate)
      newDate.setMonth(newDate.getMonth() + direction)
      this.currentDate = newDate
    }

    this.selectedDate = null
    this.selectedHora = null
    this.generateCalendar()
    this.renderHorarios()
  }

  /**
   * Maneja la solicitud de contacto con Sweet Alert
   */
  async handleContactRequest() {
    if (!window.dataManager || !window.dataManager.puedeUsarSolicitud()) {
      await window.Swal.fire({
        icon: "error",
        title: "Sin solicitudes disponibles",
        text: "Has agotado tus 5 solicitudes gratuitas. Contacta con soporte para obtener más.",
        confirmButtonColor: "#0ea5e9",
      })
      return
    }

    const restantes = window.dataManager.getSolicitudesRestantes()

    const result = await window.Swal.fire({
      title: "¿Solicitar contacto?",
      html: `
        <div class="text-left">
          <p class="mb-4">Estás a punto de solicitar el contacto con <strong>${this.professionalData.nombre}</strong>.</p>
          
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 class="font-semibold text-blue-800 mb-2">📞 ¿Qué incluye esta solicitud?</h4>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• Teléfono directo del profesional</li>
              <li>• Dirección exacta del consultorio</li>
              <li>• Email de contacto</li>
              <li>• Horarios de atención detallados</li>
            </ul>
          </div>

          <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 class="font-semibold text-amber-800 mb-2">⚠️ Importante</h4>
            <p class="text-sm text-amber-700">
              Tienes <strong>${restantes} solicitudes restantes</strong> de un total de 5 gratuitas.
              Úsalas sabiamente para contactar solo a los profesionales que realmente te interesen.
            </p>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, solicitar contacto",
      cancelButtonText: "Cancelar",
      width: "500px",
    })

    if (result.isConfirmed) {
      if (window.dataManager.usarSolicitud()) {
        const lugar = this.professionalData.lugares[0] // Primer lugar como ejemplo

        await window.Swal.fire({
          icon: "success",
          title: "¡Solicitud enviada!",
          html: `
            <div class="text-left">
              <p class="mb-4">Tu solicitud ha sido procesada exitosamente.</p>
              
              <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 class="font-semibold text-green-800 mb-2">📱 Datos de contacto</h4>
                <div class="text-sm text-green-700 space-y-2">
                  <p><strong>Teléfono:</strong> ${lugar.telefono}</p>
                  <p><strong>Email:</strong> ${this.professionalData.nombre.toLowerCase().replace(/\s+/g, ".").replace("dr.", "")}@email.com</p>
                  <p><strong>Dirección:</strong> ${lugar.direccionCompleta}</p>
                  <p><strong>Horarios:</strong> ${lugar.horarios}</p>
                </div>
              </div>

              <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p class="text-sm text-blue-700">
                  <strong>Solicitudes restantes:</strong> ${window.dataManager.getSolicitudesRestantes()}/5
                </p>
              </div>
            </div>
          `,
          confirmButtonColor: "#0ea5e9",
          confirmButtonText: "Entendido",
        })

        this.updateSolicitudesUI()
        this.showContactInfo()
      }
    }
  }

  /**
   * Muestra la información de contacto en la página
   */
  showContactInfo() {
    // Actualizar las cards de lugares con información real
    this.professionalData.lugares.forEach((lugar, index) => {
      const card = document.querySelector(`[data-id="${lugar.id}"]`)
      if (card) {
        card.innerHTML = `
          <strong class="block text-base text-gray-800 mb-3">${lugar.nombre}</strong>
          <div class="flex items-center mb-2">
            <span class="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
            <span class="text-sm text-gray-600">${lugar.direccionCompleta}</span>
          </div>
          <div class="flex items-center mb-3">
            <span class="text-red-500 mr-2">📞</span>
            <span class="text-sm text-gray-600">${lugar.telefono}</span>
          </div>
          <div class="text-xs text-gray-500 border-t border-dashed border-gray-200 pt-2">
            ${lugar.horarios}
          </div>
        `
      }
    })

    // Actualizar zona en el perfil
    const zoneElement = document.getElementById("professional-zone")
    if (zoneElement) {
      zoneElement.innerHTML = `${this.professionalData.lugares[0].direccionCompleta} - <span class="text-green-600 text-sm font-medium">✓ Contacto disponible</span>`
    }
  }

  /**
   * Configura el sistema de tabs
   */
  setupTabs() {
    this.debug("=== CONFIGURANDO TABS ===")

    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
    const tabSelect = document.getElementById("tabs-select")

    this.debug("Elementos encontrados:", {
      tabButtons: tabButtons.length,
      tabContents: tabContents.length,
      tabSelect: !!tabSelect,
    })

    if (tabButtons.length === 0) {
      this.debug("ERROR: No se encontraron botones de tab")
      return
    }

    if (tabContents.length === 0) {
      this.debug("ERROR: No se encontraron contenidos de tab")
      return
    }

    const showTab = (tabId) => {
      this.debug("Mostrando tab:", tabId)

      // Actualizar botones
      tabButtons.forEach((btn, i) => {
        btn.classList.remove("active", "bg-sky-500", "text-white")
        btn.classList.add("bg-gray-100")
        this.debug(`Button ${i} updated:`, btn.className)
      })

      // Actualizar contenido
      tabContents.forEach((tab, i) => {
        tab.classList.add("hidden")
        tab.classList.remove("block")
        this.debug(`Content ${i} hidden:`, tab.className)
      })

      // Mostrar pestaña activa
      const targetTab = document.getElementById(tabId)
      if (targetTab) {
        targetTab.classList.remove("hidden")
        targetTab.classList.add("block")
        this.debug("Target tab shown:", targetTab.className)

        if (tabId === "agendar") {
          setTimeout(() => this.generateCalendar(), 100)
        }
      } else {
        this.debug("ERROR: Tab no encontrada:", tabId)
      }

      // Activar botón correspondiente
      const activeButton = document.querySelector(`.tab-button[data-tab="${tabId}"]`)
      if (activeButton) {
        activeButton.classList.add("active", "bg-sky-500", "text-white")
        activeButton.classList.remove("bg-gray-100")
        this.debug("Active button updated:", activeButton.className)
      } else {
        this.debug("ERROR: Botón activo no encontrado para:", tabId)
      }

      // Actualizar select móvil
      if (tabSelect) {
        tabSelect.value = tabId
        this.debug("Select updated:", tabSelect.value)
      }
    }

    // Event listeners para botones de pestañas
    tabButtons.forEach((button, i) => {
      this.debug(`Configurando listener para button ${i}`)

      button.addEventListener("click", (e) => {
        e.preventDefault()
        const tabId = button.getAttribute("data-tab")
        this.debug(`Tab button ${i} clicked:`, tabId)
        showTab(tabId)
      })
    })

    // Event listener para select móvil
    if (tabSelect) {
      tabSelect.addEventListener("change", (e) => {
        this.debug("Select changed:", e.target.value)
        showTab(e.target.value)
      })
    }

    // Mostrar la primera tab por defecto
    if (tabButtons.length > 0) {
      const firstTabId = tabButtons[0].getAttribute("data-tab")
      this.debug("Mostrando primera tab por defecto:", firstTabId)
      showTab(firstTabId)
    }

    this.debug("=== TABS CONFIGURADAS ===")
  }

  /**
   * Configura los acordeones
   */
  setupAccordions() {
    this.debug("=== CONFIGURANDO ACORDEONES ===")

    const accordionToggles = document.querySelectorAll(".cv-subsection-toggle")

    this.debug("Acordeones encontrados:", accordionToggles.length)

    if (accordionToggles.length === 0) {
      this.debug("ERROR: No se encontraron acordeones")
      return
    }

    accordionToggles.forEach((toggle, index) => {
      this.debug(`Configurando acordeón ${index}:`, {
        text: toggle.textContent.trim(),
        target: toggle.getAttribute("data-target"),
      })

      toggle.addEventListener("click", (e) => {
        e.preventDefault()
        this.debug(`Acordeón ${index} clicked`)

        const targetId = toggle.getAttribute("data-target")
        const content = document.getElementById(targetId)
        const icon = toggle.querySelector(".toggle-icon")

        this.debug("Elementos del acordeón:", {
          targetId,
          hasContent: !!content,
          hasIcon: !!icon,
        })

        if (!content) {
          this.debug("ERROR: Contenido del acordeón no encontrado:", targetId)
          return
        }

        if (!icon) {
          this.debug("ERROR: Icono del acordeón no encontrado")
          return
        }

        // Toggle del acordeón
        const isActive = toggle.classList.contains("active")
        this.debug(`Acordeón ${index} estado actual:`, { isActive })

        if (isActive) {
          // Cerrar
          toggle.classList.remove("active", "bg-sky-50", "text-sky-500")
          toggle.classList.add("bg-gray-100", "text-gray-700")
          content.classList.add("hidden")
          content.classList.remove("block")
          icon.style.transform = "rotate(0deg)"
          this.debug(`Acordeón ${index} cerrado`)
        } else {
          // Abrir
          toggle.classList.add("active", "bg-sky-50", "text-sky-500")
          toggle.classList.remove("bg-gray-100", "text-gray-700")
          content.classList.remove("hidden")
          content.classList.add("block")
          icon.style.transform = "rotate(180deg)"
          this.debug(`Acordeón ${index} abierto`)
        }
      })
    })

    this.debug("=== ACORDEONES CONFIGURADOS ===")
  }

  /**
   * Configura el sidebar
   */
  setupSidebar() {
    const sidebar = document.getElementById("sidebar")
    if (!sidebar) return

    sidebar.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 768) {
        sidebar.classList.add("w-48")
        sidebar.classList.remove("w-15")
        document.getElementById("content").style.marginLeft = "192px"

        const labels = sidebar.querySelectorAll(".menu-label")
        labels.forEach((label) => {
          label.classList.remove("opacity-0", "translate-x-4")
          label.classList.add("opacity-100", "translate-x-0")
        })
      }
    })

    sidebar.addEventListener("mouseleave", () => {
      if (window.innerWidth >= 768) {
        sidebar.classList.remove("w-48")
        sidebar.classList.add("w-15")
        document.getElementById("content").style.marginLeft = "60px"

        const labels = sidebar.querySelectorAll(".menu-label")
        labels.forEach((label) => {
          label.classList.add("opacity-0", "translate-x-4")
          label.classList.remove("opacity-100", "translate-x-0")
        })
      }
    })

    // Inicializar padding
    if (window.innerWidth >= 768) {
      document.getElementById("content").style.marginLeft = "60px"
    }
  }

  /**
   * Configura el sistema de agendamiento
   */
  setupAppointmentBooking() {
    // Configurar después de que se carguen los lugares
    setTimeout(() => {
      const lugarCards = document.querySelectorAll(".card-lugar-seleccionable")
      const filtroButtons = document.querySelectorAll(".filtro-btn")
      const btnConfirmar = document.getElementById("btnConfirmarTurno")

      // Selección de lugar
      lugarCards.forEach((card) => {
        card.addEventListener("click", () => {
          lugarCards.forEach((c) => {
            c.classList.remove("active", "border-sky-500", "bg-sky-50")
            c.classList.add("border-gray-200", "bg-gray-50")
          })
          card.classList.add("active", "border-sky-500", "bg-sky-50")
          card.classList.remove("border-gray-200", "bg-gray-50")

          this.selectedLugar = card.querySelector("strong").textContent
          document.getElementById("resumenLugar").textContent = this.selectedLugar
          this.updateConfirmButton()
        })
      })

      // Filtros de horario
      filtroButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          filtroButtons.forEach((b) => {
            b.classList.remove("active", "bg-sky-400", "text-white")
            b.classList.add("bg-gray-200", "text-gray-700")
          })
          btn.classList.add("active", "bg-sky-400", "text-white")
          btn.classList.remove("bg-gray-200", "text-gray-700")

          this.selectedHora = null
          this.updateAvailableHours(btn.dataset.turno)
        })
      })

      // Confirmar turno
      if (btnConfirmar) {
        btnConfirmar.addEventListener("click", () => {
          if (this.selectedLugar && this.selectedDate && this.selectedHora) {
            const fechaFormateada = this.selectedDate.toFormat("dd 'de' MMMM 'de' yyyy", { locale: "es" })

            window.Swal.fire({
              icon: "success",
              title: "¡Turno confirmado!",
              html: `
                <div class="text-left">
                  <p class="mb-4">Tu turno ha sido agendado exitosamente.</p>
                  <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 class="font-semibold text-green-800 mb-2">📅 Detalles del turno</h4>
                    <div class="text-sm text-green-700 space-y-1">
                      <p><strong>Profesional:</strong> ${this.professionalData.nombre}</p>
                      <p><strong>Lugar:</strong> ${this.selectedLugar}</p>
                      <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                      <p><strong>Hora:</strong> ${this.selectedHora}</p>
                    </div>
                  </div>
                </div>
              `,
              confirmButtonColor: "#0ea5e9",
            })
          }
        })
      }
    }, 500)
  }

  /**
   * Genera el calendario
   */
  generateCalendar() {
    const grid = document.getElementById("calendarioGrid")
    const monthYear = document.getElementById("currentMonthYear")

    if (!grid || !monthYear) return

    // Limpiar grid
    grid.innerHTML = ""

    let firstDay, lastDay, daysInMonth, startDayOfWeek

    if (DateTime && this.currentDate.startOf) {
      // Usar Luxon
      firstDay = this.currentDate.startOf("month")
      lastDay = this.currentDate.endOf("month")
      daysInMonth = lastDay.day
      startDayOfWeek = firstDay.weekday - 1
      monthYear.textContent = this.currentDate.toFormat("MMMM yyyy", { locale: "es" })
    } else {
      // Usar Date nativo
      const year = this.currentDate.getFullYear()
      const month = this.currentDate.getMonth()
      firstDay = new Date(year, month, 1)
      lastDay = new Date(year, month + 1, 0)
      daysInMonth = lastDay.getDate()
      startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

      const monthNames = [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ]
      monthYear.textContent = `${monthNames[month]} ${year}`
    }

    // Agregar días vacíos al inicio
    for (let i = 0; i < startDayOfWeek; i++) {
      const emptyDay = document.createElement("div")
      emptyDay.className = "h-10"
      grid.appendChild(emptyDay)
    }

    // Agregar días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const dayElement = document.createElement("div")
      const dayDate = DateTime
        ? this.currentDate.set({ day })
        : new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day)
      const isToday = DateTime
        ? dayDate.hasSame(DateTime.now(), "day")
        : dayDate.getDate() === new Date().getDate() &&
          dayDate.getMonth() === new Date().getMonth() &&
          dayDate.getFullYear() === new Date().getFullYear()
      const isPast = DateTime
        ? dayDate < DateTime.now().startOf("day")
        : dayDate < new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())

      dayElement.className = `
        h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
        ${isPast ? "text-gray-300 cursor-not-allowed" : "text-gray-700 hover:bg-gray-100"}
        ${isToday ? "bg-blue-100 text-blue-600 font-semibold" : ""}
      `

      dayElement.textContent = day

      // Marcar algunos días como disponibles
      const availableDays = [5, 6, 10, 11, 12, 13, 19, 20, 26, 27]
      if (availableDays.includes(day) && !isPast) {
        if (this.selectedDate && (DateTime ? this.selectedDate.day === day : this.selectedDate.getDate() === day)) {
          dayElement.className = `
            h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
            bg-sky-500 text-white font-semibold border-2 border-sky-600
          `
        } else {
          dayElement.className = `
            h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
            bg-green-100 text-green-700 border border-green-300 hover:bg-green-200
          `
        }
      }

      if (!isPast) {
        dayElement.addEventListener("click", () => this.selectDate(dayDate, dayElement))
      }

      grid.appendChild(dayElement)
    }
  }

  /**
   * Selecciona una fecha en el calendario
   */
  selectDate(date, element) {
    // Remover selección anterior
    document.querySelectorAll("#calendarioGrid > div").forEach((day) => {
      if (day.textContent && !day.classList.contains("text-gray-300")) {
        const dayNum = Number.parseInt(day.textContent)
        const availableDays = [5, 6, 10, 11, 12, 13, 19, 20, 26, 27]
        if (availableDays.includes(dayNum)) {
          day.className = `
            h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
            bg-green-100 text-green-700 border border-green-300 hover:bg-green-200
          `
        } else {
          day.className = `
            h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
            text-gray-700 hover:bg-gray-100
          `
        }
      }
    })

    // Aplicar nueva selección
    element.className = `
      h-10 flex items-center justify-center text-sm cursor-pointer rounded-lg transition-all duration-200
      bg-sky-500 text-white font-semibold border-2 border-sky-600
    `

    this.selectedDate = date

    const fechaFormateada = DateTime
      ? date.toFormat("dd 'de' MMMM yyyy", { locale: "es" })
      : `${date.getDate()} de ${date.toLocaleString("default", { month: "long" })} de ${date.getFullYear()}`

    document.getElementById("resumenFecha").textContent = fechaFormateada
    this.selectedHora = null
    this.renderHorarios()
    this.updateConfirmButton()
  }

  /**
   * Renderiza los horarios disponibles
   */
  renderHorarios() {
    const horariosContainer = document.getElementById("horariosDisponibles")
    if (!horariosContainer) return

    horariosContainer.innerHTML = ""

    if (!this.selectedDate) {
      horariosContainer.innerHTML = ""
      return
    }

    const lugarId = this.professionalData.lugares.find((lugar) => lugar.nombre === this.selectedLugar).id
    const disponibilidadDia = this.disponibilidad[lugarId][this.selectedDate.toFormat("yyyy-MM-dd")]

    if (!disponibilidadDia) {
      horariosContainer.innerHTML = "<p>No hay horarios disponibles para esta fecha.</p>"
      return
    }

    const horarios = Object.entries(disponibilidadDia).flatMap(([turno, horas]) =>
      horas.map((hora) => `<button class="horario-btn">${hora}</button>`),
    )

    horariosContainer.innerHTML = horarios.join("")

    const horarioButtons = document.querySelectorAll(".horario-btn")
    horarioButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.selectedHora = btn.textContent
        document.getElementById("resumenHora").textContent = this.selectedHora
        this.updateConfirmButton()
      })
    })
  }

  /**
   * Actualiza el estado del botón de confirmación de turno
   */
  updateAvailableHours(turno) {
    const horariosContainer = document.getElementById("horariosDisponibles")
    if (!horariosContainer) return

    let horarios = []

    switch (turno) {
      case "manana":
        horarios = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
        break
      case "tarde":
        horarios = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30"]
        break
      case "noche":
        horarios = ["18:00", "18:30", "19:00", "19:30", "20:00"]
        break
    }

    horariosContainer.innerHTML = ""
    horarios.forEach((hora) => {
      const horarioElement = document.createElement("div")
      horarioElement.className =
        "horario bg-gray-50 border border-gray-300 py-2.5 px-4 rounded-lg cursor-pointer font-medium transition-all duration-200 text-gray-700 hover:bg-sky-50 hover:border-sky-300"
      horarioElement.textContent = hora

      horarioElement.addEventListener("click", () => {
        // Remover selección anterior
        document.querySelectorAll(".horario").forEach((h) => {
          h.classList.remove("selected", "bg-sky-500", "text-white", "border-sky-600")
          h.classList.add("bg-gray-50", "border-gray-300", "text-gray-700")
        })

        // Aplicar nueva selección
        horarioElement.classList.add("selected", "bg-sky-500", "text-white", "border-sky-600")
        horarioElement.classList.remove("bg-gray-50", "border-gray-300", "text-gray-700")

        this.selectedHora = hora
        document.getElementById("resumenHora").textContent = this.selectedHora
        this.updateConfirmButton()
      })

      horariosContainer.appendChild(horarioElement)
    })
  }

  /**
   * Actualiza el estado del botón de confirmación de turno
   */
  updateConfirmButton() {
    const btnConfirmar = document.getElementById("btnConfirmarTurno")
    if (!btnConfirmar) return

    if (this.selectedLugar && this.selectedDate && this.selectedHora) {
      btnConfirmar.disabled = false
      btnConfirmar.classList.remove("bg-gray-300", "cursor-not-allowed")
      btnConfirmar.classList.add("bg-green-500", "hover:bg-green-600")
      btnConfirmar.textContent = "Confirmar turno"
    } else {
      btnConfirmar.disabled = true
      btnConfirmar.classList.add("bg-gray-300", "cursor-not-allowed")
      btnConfirmar.classList.remove("bg-green-500", "hover:bg-green-600")
      btnConfirmar.textContent = "Selecciona fecha y hora"
    }
  }

  /**
   * Método de debugging
   */
  debug(message, data = null) {
    if (this.debugMode) {
      console.log(`[ProfesionalManager] ${message}`, data || "")
    }
  }

  /**
   * Debug de elementos del DOM
   */
  debugElements() {
    this.debug("=== DEBUG DE ELEMENTOS ===")

    // Verificar tabs
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")
    const tabSelect = document.getElementById("tabs-select")

    this.debug("Tabs encontrados:", {
      buttons: tabButtons.length,
      contents: tabContents.length,
      select: !!tabSelect,
    })

    tabButtons.forEach((btn, i) => {
      this.debug(`Tab button ${i}:`, {
        text: btn.textContent.trim(),
        dataTab: btn.getAttribute("data-tab"),
        classes: btn.className,
      })
    })

    tabContents.forEach((content, i) => {
      this.debug(`Tab content ${i}:`, {
        id: content.id,
        classes: content.className,
        visible: !content.classList.contains("hidden"),
      })
    })

    // Verificar acordeones
    const accordionToggles = document.querySelectorAll(".cv-subsection-toggle")

    this.debug("Acordeones encontrados:", accordionToggles.length)

    accordionToggles.forEach((toggle, i) => {
      const targetId = toggle.getAttribute("data-target")
      const content = document.getElementById(targetId)
      const icon = toggle.querySelector(".toggle-icon")

      this.debug(`Acordeón ${i}:`, {
        text: toggle.textContent.trim(),
        targetId: targetId,
        hasContent: !!content,
        hasIcon: !!icon,
        classes: toggle.className,
      })
    })

    this.debug("=== FIN DEBUG ELEMENTOS ===")
  }

  /**
   * Test manual de tabs
   */
  testTabs() {
    this.debug("=== TESTING TABS MANUALMENTE ===")
    const tabButtons = document.querySelectorAll(".tab-button")

    if (tabButtons.length > 0) {
      this.debug("Simulando click en primera tab...")
      tabButtons[0].click()
    } else {
      this.debug("ERROR: No se encontraron botones de tab")
    }
  }

  /**
   * Test manual de acordeones
   */
  testAccordions() {
    this.debug("=== TESTING ACORDEONES MANUALMENTE ===")
    const accordionToggles = document.querySelectorAll(".cv-subsection-toggle")

    if (accordionToggles.length > 0) {
      this.debug("Simulando click en primer acordeón...")
      accordionToggles[0].click()
    } else {
      this.debug("ERROR: No se encontraron acordeones")
    }
  }
}

// Inicializar el gestor del profesional cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing ProfesionalManager...")
  window.profesionalManager = new ProfesionalManager()
  console.log("ProfesionalManager initialized:", window.profesionalManager)
})

// También intentar inicializar inmediatamente si el DOM ya está listo
if (document.readyState !== "loading") {
  console.log("DOM already ready, initializing ProfesionalManager immediately...")
  window.profesionalManager = new ProfesionalManager()
  console.log("ProfesionalManager initialized:", window.profesionalManager)
}
