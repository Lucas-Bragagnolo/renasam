/**
 * Integración de la API con los componentes existentes
 * Este archivo adapta los datos de la API real a los componentes actuales
 */

class ApiIntegration {
    constructor() {
      // Usar servicio mock por defecto, cambiar a apiService para producción
      this.api = window.apiMockService || window.apiService
      this.useMock = true // Cambiar a false para usar API real
    }
  
    /**
     * Adaptar datos de profesionales de la API al formato esperado por los componentes
     */
    adaptProfessionalData(apiData) {
      return {
        id: apiData.id,
        nombre: apiData.nombre,
        especialidad: apiData.especialidad,
        rating: apiData.rating.toString(),
        reviewCount: apiData.total_reviews,
        zona: apiData.zona_publica,
        distancia: apiData.distancia_km?.toString() || "2.5",
        disponibilidad: apiData.disponibilidad,
        obrasSociales: apiData.obras_sociales,
        lat: -34.6037 + (Math.random() - 0.5) * 0.2, // Coordenadas aproximadas
        lng: -58.3816 + (Math.random() - 0.5) * 0.2,
        foto: apiData.foto_perfil,
      }
    }
  
    /**
     * Adaptar perfil detallado del profesional
     */
    adaptProfessionalProfile(apiData) {
      const professional = apiData.professional
  
      return {
        id: professional.id,
        nombre: professional.informacion_basica.nombre,
        especialidad: professional.informacion_basica.especialidad_principal,
        rating: professional.informacion_basica.rating.toString(),
        reviewCount: professional.informacion_basica.total_reviews,
        zona: professional.ubicacion.zona_publica,
        descripcion: professional.informacion_basica.descripcion,
        obrasSociales: professional.obras_sociales,
        especialidades: professional.informacion_basica.especialidades,
        idiomas: professional.informacion_basica.idiomas,
        experienciaLaboral: professional.experiencia_laboral.map((exp) => ({
          puesto: `${exp.puesto} - ${exp.institucion}`,
          periodo: `${exp.fecha_inicio.split("-")[0]} - ${exp.actual ? "Presente" : exp.fecha_fin.split("-")[0]}`,
          descripcion: exp.descripcion,
        })),
        educacion: professional.educacion.map((edu) => ({
          titulo: edu.titulo,
          institucion: `${edu.institucion}, ${edu.pais}`,
          periodo: `${edu.fecha_inicio.split("-")[0]}-${edu.fecha_fin.split("-")[0]}`,
        })),
        acreditaciones: professional.acreditaciones.map((acred) => ({
          nombre: acred.nombre,
          numero: acred.numero,
          emisor: acred.emisor,
          vigencia: acred.fecha_vencimiento || "Permanente",
        })),
        lugares: professional.lugares_atencion.map((lugar) => ({
          id: lugar.id,
          nombre: lugar.nombre,
          zona: lugar.zona_publica,
          direccionPublica: `${lugar.zona_publica} - Dirección exacta tras contacto`,
          direccionCompleta: "Dirección disponible tras solicitar contacto",
          telefono: "Teléfono disponible tras solicitar contacto",
          horarios: this.formatHorarios(lugar.horarios),
        })),
      }
    }
  
    /**
     * Formatear horarios de la API
     */
    formatHorarios(horarios) {
      const dias = {
        lunes: "Lunes",
        martes: "Martes",
        miercoles: "Miércoles",
        jueves: "Jueves",
        viernes: "Viernes",
        sabado: "Sábado",
        domingo: "Domingo",
      }
  
      const horariosFormateados = []
  
      Object.entries(horarios).forEach(([dia, turnos]) => {
        if (turnos && turnos.length > 0) {
          const turnosStr = turnos.map((turno) => `${turno.inicio} - ${turno.fin}`).join(", ")
          horariosFormateados.push(`${dias[dia]}: ${turnosStr}`)
        }
      })
  
      return horariosFormateados.join(" | ")
    }
  
    /**
     * Integrar búsqueda de profesionales con DataManager
     */
    async integrateProfessionalSearch() {
      try {
        console.log("🔍 Integrando búsqueda de profesionales con API...")
  
        // Reemplazar método de DataManager
        if (window.dataManager) {
          const originalMethod = window.dataManager.filtrarProfesionales.bind(window.dataManager)
  
          window.dataManager.filtrarProfesionales = async (filtros = {}) => {
            try {
              console.log("📡 Llamando a API para buscar profesionales:", filtros)
  
              // Mapear filtros al formato de la API
              const apiFilters = {
                ubicacion: filtros.ubicacion,
                especialidad: filtros.especialidad,
                obra_social: filtros.obraSocial,
                disponibilidad: filtros.disponibilidad,
              }
  
              const response = await this.api.searchProfessionals(apiFilters)
  
              if (response.success) {
                console.log("✅ Datos recibidos de la API:", response.data)
  
                // Adaptar datos al formato esperado
                const adaptedProfessionals = response.data.professionals.map((prof) => this.adaptProfessionalData(prof))
  
                console.log("🔄 Datos adaptados:", adaptedProfessionals)
                return adaptedProfessionals
              } else {
                console.error("❌ Error en respuesta de API:", response)
                return originalMethod(filtros)
              }
            } catch (error) {
              console.error("❌ Error al llamar API, usando datos mock:", error)
              return originalMethod(filtros)
            }
          }
  
          console.log("✅ Búsqueda de profesionales integrada con API")
        }
      } catch (error) {
        console.error("❌ Error al integrar búsqueda:", error)
      }
    }
  
    /**
     * Integrar perfil detallado del profesional
     */
    async integrateProfessionalProfile() {
      try {
        console.log("👤 Integrando perfil de profesional con API...")
  
        if (window.profesionalManager) {
          const originalLoadData = window.profesionalManager.loadProfessionalData.bind(window.profesionalManager)
  
          window.profesionalManager.loadProfessionalData = async function () {
            try {
              const professionalId = sessionStorage.getItem("selectedProfessionalId") || "1"
              console.log("📡 Cargando perfil del profesional ID:", professionalId)
  
              const response = await window.apiIntegration.api.getProfessionalProfile(professionalId)
  
              if (response.success) {
                console.log("✅ Perfil recibido de la API:", response.data)
  
                // Adaptar datos al formato esperado
                const adaptedData = window.apiIntegration.adaptProfessionalProfile(response.data)
                console.log("🔄 Perfil adaptado:", adaptedData)
  
                // Reemplazar datos mock con datos de la API
                this.professionalData = adaptedData
  
                // Llamar métodos de población con los nuevos datos
                this.populateProfessionalInfo()
                this.populateExperienceSection()
                this.populateEducationSection()
                this.populateAccreditationsSection()
                this.populateReviewsSection()
                this.populatePlacesSection()
  
                console.log("✅ Perfil del profesional cargado desde API")
              } else {
                console.error("❌ Error en respuesta de API, usando datos mock")
                originalLoadData()
              }
            } catch (error) {
              console.error("❌ Error al cargar perfil desde API, usando datos mock:", error)
              originalLoadData()
            }
          }
  
          console.log("✅ Perfil de profesional integrado con API")
        }
      } catch (error) {
        console.error("❌ Error al integrar perfil:", error)
      }
    }
  
    /**
     * Integrar sistema de solicitudes de contacto
     */
    async integrateContactRequests() {
      try {
        console.log("📞 Integrando solicitudes de contacto con API...")
  
        if (window.profesionalManager) {
          const originalHandleContact = window.profesionalManager.handleContactRequest.bind(window.profesionalManager)
  
          window.profesionalManager.handleContactRequest = async function () {
            try {
              console.log("📡 Verificando estado de solicitudes...")
  
              // Verificar estado actual de solicitudes
              const statusResponse = await window.apiIntegration.api.getContactRequestsStatus()
  
              if (!statusResponse.success || statusResponse.data.solicitudes_restantes <= 0) {
                await window.Swal.fire({
                  icon: "error",
                  title: "Sin solicitudes disponibles",
                  text: "Has agotado tus solicitudes gratuitas. Contacta con soporte para obtener más.",
                  confirmButtonColor: "#0ea5e9",
                })
                return
              }
  
              // Asegurar que PatientManager esté inicializado
              if (!window.patientManager) {
                console.log("🔄 PatientManager no inicializado, inicializando...")
                await window.initializePatientManager()
              }
  
              // Mostrar modal de selección de paciente usando PatientManager
              if (window.patientManager) {
                await window.patientManager.showPatientSelectionModal(this.professionalData)
              } else {
                console.error("❌ PatientManager no disponible después de inicialización")
                // Fallback al método original
                await originalHandleContact()
              }
            } catch (error) {
              console.error("❌ Error al procesar solicitud de contacto:", error)
              await window.Swal.fire({
                icon: "error",
                title: "Error",
                text: "Hubo un problema al procesar tu solicitud. Inténtalo nuevamente.",
                confirmButtonColor: "#0ea5e9",
              })
            }
          }
  
          console.log("✅ Solicitudes de contacto integradas con API")
        }
      } catch (error) {
        console.error("❌ Error al integrar solicitudes de contacto:", error)
      }
    }
  
    /**
     * Inicializar todas las integraciones
     */
    async initializeIntegrations() {
      console.log("🚀 Inicializando integraciones con API...")
  
      try {
        await this.integrateProfessionalSearch()
        await this.integrateProfessionalProfile()
        await this.integrateContactRequests()
  
        // Inicializar PatientManager después de que la API esté lista
        if (window.initializePatientManager) {
          await window.initializePatientManager()
        }
  
        console.log("✅ Todas las integraciones inicializadas correctamente")
      } catch (error) {
        console.error("❌ Error al inicializar integraciones:", error)
      }
    }
  
    /**
     * Cambiar entre API real y mock
     */
    toggleApiMode(useMock = true) {
      this.useMock = useMock
      this.api = useMock ? window.apiMockService : window.apiService
      console.log(`🔄 Cambiado a modo: ${useMock ? "MOCK" : "REAL"}`)
    }
  }
  
  // Inicializar integración cuando el DOM esté listo
  document.addEventListener("DOMContentLoaded", () => {
    console.log("🔗 Inicializando ApiIntegration...")
    window.apiIntegration = new ApiIntegration()
  
    // Esperar a que los otros componentes estén listos
    setTimeout(() => {
      window.apiIntegration.initializeIntegrations()
    }, 1000)
  })
  
  // También intentar inicializar inmediatamente si el DOM ya está listo
  if (document.readyState !== "loading") {
    console.log("🔗 DOM ya listo, inicializando ApiIntegration inmediatamente...")
    window.apiIntegration = new ApiIntegration()
  
    setTimeout(() => {
      window.apiIntegration.initializeIntegrations()
    }, 1000)
  }
  