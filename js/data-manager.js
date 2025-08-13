/**
 * Gestor de datos mockup para la aplicación
 * Maneja profesionales, especialidades y ubicaciones
 */
class DataManager {
    constructor() {
      this.especialidades = [
        "Psicología Clínica",
        "Psiquiatría",
        "Psicología Infantil",
        "Terapia de Pareja",
        "Terapia Familiar",
        "Psicología Cognitivo-Conductual",
        "Psicoanálisis",
        "Terapia Gestalt",
        "Neuropsicología",
        "Psicología del Deporte",
        "Terapia de Grupo",
        "Adicciones",
        "Trastornos Alimentarios",
        "Trastornos del Sueño",
        "Mindfulness y Meditación",
        "Terapia EMDR",
      ]
  
      this.obrasSociales = [
        "OSDE",
        "Swiss Medical",
        "OMINT",
        "Galeno",
        "Medifé",
        "Sancor Salud",
        "Accord Salud",
        "Federada Salud",
        "Prevención Salud",
        "Hospital Italiano",
      ]
  
      this.ubicacionesRecientes = [
        "Buenos Aires, Argentina",
        "Córdoba, Argentina",
        "Rosario, Santa Fe",
        "La Plata, Buenos Aires",
        "Mendoza, Argentina",
        "Mar del Plata, Buenos Aires",
      ]
  
      this.nombres = [
        "Dr. Carlos Rodríguez",
        "Dra. Sofía Gómez",
        "Dr. Francisco Pérez",
        "Dra. Ana López",
        "Dr. Juan Martínez",
        "Dra. Laura Suárez",
        "Dr. Miguel Torres",
        "Dra. Carmen Díaz",
        "Dr. Roberto Silva",
        "Dra. Patricia Morales",
        "Dr. Diego Fernández",
        "Dra. Valeria Castro",
        "Dr. Alejandro Ruiz",
        "Dra. Mónica Herrera",
        "Dr. Sebastián Vega",
        "Dra. Claudia Romero",
        "Dr. Martín Jiménez",
        "Dra. Gabriela Soto",
        "Dr. Fernando Aguilar",
        "Dra. Natalia Vargas",
      ]
  
      this.direcciones = [
        "Av. Santa Fe 1234",
        "Av. Corrientes 4567",
        "Av. 9 de Julio 654",
        "Av. Rivadavia 2890",
        "Av. Cabildo 1567",
        "Av. Las Heras 890",
        "Av. Callao 2345",
        "Av. Pueyrredón 1678",
        "Av. Scalabrini Ortiz 3456",
        "Av. Juan B. Justo 789",
        "Av. Belgrano 2134",
        "Av. Independencia 567",
      ]
  
      this.disponibilidades = [
        "Disponible hoy",
        "Disponible mañana",
        "Disponible esta semana",
        "Próximo turno en 3 días",
        "Disponible la próxima semana",
      ]
  
      // Sistema de solicitudes de contacto
      this.maxSolicitudes = 5
      this.solicitudesUsadas = Number.parseInt(localStorage.getItem("solicitudesUsadas") || "0")
  
      this.profesionales = this.generarProfesionales(20)
    }
  
    /**
     * Genera una lista de profesionales con datos aleatorios
     */
    generarProfesionales(cantidad) {
      const profesionales = []
      const zonasDisponibles = [
        "Zona Norte", "Zona Sur", "Centro", "Zona Oeste", "Zona Este",
        "Microcentro", "Barrio Norte", "Palermo", "Belgrano", "San Telmo"
      ]
  
      for (let i = 0; i < cantidad; i++) {
        const nombre = this.nombres[Math.floor(Math.random() * this.nombres.length)]
        const profesional = {
          id: i + 1,
          nombre: nombre,
          especialidad: this.especialidades[Math.floor(Math.random() * this.especialidades.length)],
          rating: (Math.random() * 1.5 + 3.5).toFixed(1),
          reviewCount: Math.floor(Math.random() * 200) + 10,
          // Solo zona general por privacidad
          zona: zonasDisponibles[Math.floor(Math.random() * zonasDisponibles.length)],
          // Distancia aproximada dentro del radio de búsqueda (10km)
          distancia: (Math.random() * 9 + 1).toFixed(1),
          disponibilidad: this.disponibilidades[Math.floor(Math.random() * this.disponibilidades.length)],
          obrasSociales: this.generarObrasSocialesAleatorias(),
          // NO incluir coordenadas exactas por privacidad
          // Las coordenadas se revelarán solo al contactar al profesional
          enZonaDeBusqueda: true, // Indica que está dentro del radio de 10km
          foto: `/placeholder.svg?height=60&width=60&text=${encodeURIComponent(nombre.split(" ")[1] || "Dr")}`,
        }
  
        profesionales.push(profesional)
      }
  
      return profesionales
    }
  
    /**
     * Genera una lista aleatoria de obras sociales para un profesional
     */
    generarObrasSocialesAleatorias() {
      const cantidad = Math.floor(Math.random() * 4) + 1 // Entre 1 y 4 obras sociales
      const seleccionadas = []
      const disponibles = [...this.obrasSociales]
  
      for (let i = 0; i < cantidad; i++) {
        const index = Math.floor(Math.random() * disponibles.length)
        seleccionadas.push(disponibles.splice(index, 1)[0])
      }
  
      return seleccionadas
    }
  
    /**
     * Obtiene todas las especialidades
     */
    getEspecialidades() {
      return [...this.especialidades]
    }
  
    /**
     * Obtiene ubicaciones recientes
     */
    getUbicacionesRecientes() {
      return [...this.ubicacionesRecientes]
    }
  
    /**
     * Obtiene todos los profesionales
     */
    getProfesionales() {
      return [...this.profesionales]
    }
  
    /**
     * Simula búsqueda de profesionales en un radio de 10km
     * @param {Object} criterios - Criterios de búsqueda
     * @param {string} criterios.ubicacion - Ubicación de búsqueda
     * @param {string} criterios.especialidad - Especialidad buscada
     * @param {Object} criterios.paciente - Datos del paciente
     * @returns {Array} Profesionales disponibles en la zona
     */
    buscarProfesionalesEnZona(criterios = {}) {
      console.log('Buscando profesionales en zona de 10km:', criterios);
      
      // Simular búsqueda en radio de 10km
      let profesionalesEnZona = this.profesionales.filter(prof => {
        // Todos los profesionales generados están "en zona" por defecto
        return prof.enZonaDeBusqueda === true;
      });

      // Filtrar por especialidad si se especifica
      if (criterios.especialidad) {
        profesionalesEnZona = profesionalesEnZona.filter(prof => 
          prof.especialidad.toLowerCase().includes(criterios.especialidad.toLowerCase())
        );
      }

      // Simular que algunos profesionales pueden no estar disponibles
      // (para hacer más realista la búsqueda)
      const disponibles = profesionalesEnZona.filter(() => Math.random() > 0.2); // 80% disponibilidad

      console.log(`Encontrados ${disponibles.length} profesionales en la zona`);
      return disponibles;
    }

    /**
     * Filtra profesionales por criterios (función original mantenida para compatibilidad)
     */
    filtrarProfesionales(filtros = {}) {
      let resultado = [...this.profesionales]
  
      if (filtros.especialidad) {
        resultado = resultado.filter((p) => p.especialidad.toLowerCase().includes(filtros.especialidad.toLowerCase()))
      }
  
      if (filtros.obraSocial) {
        resultado = resultado.filter((p) => p.obrasSociales.includes(filtros.obraSocial))
      }
  
      if (filtros.disponibilidad) {
        const filtroDisponibilidad = {
          hoy: "Disponible hoy",
          manana: "Disponible mañana",
          semana: "Disponible esta semana",
        }
  
        if (filtroDisponibilidad[filtros.disponibilidad]) {
          resultado = resultado.filter((p) => p.disponibilidad === filtroDisponibilidad[filtros.disponibilidad])
        }
      }
  
      return resultado
    }
  
    /**
     * Ordena profesionales por criterio
     */
    ordenarProfesionales(profesionales, criterio) {
      const copia = [...profesionales]
  
      switch (criterio) {
        case "rating":
          return copia.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
        case "distance":
          return copia.sort((a, b) => Number.parseFloat(a.distancia) - Number.parseFloat(b.distancia))
        case "availability":
          const prioridad = {
            "Disponible hoy": 1,
            "Disponible mañana": 2,
            "Disponible esta semana": 3,
            "Próximo turno en 3 días": 4,
            "Disponible la próxima semana": 5,
          }
          return copia.sort((a, b) => (prioridad[a.disponibilidad] || 6) - (prioridad[b.disponibilidad] || 6))
        default:
          return copia
      }
    }
  
    /**
     * Busca profesionales por texto
     */
    buscarProfesionales(texto) {
      if (!texto) return this.profesionales
  
      const textoLower = texto.toLowerCase()
      return this.profesionales.filter(
        (p) => p.nombre.toLowerCase().includes(textoLower) || p.especialidad.toLowerCase().includes(textoLower),
      )
    }
  
    /**
     * Agrega una ubicación a las búsquedas recientes
     */
    agregarUbicacionReciente(ubicacion) {
      if (!this.ubicacionesRecientes.includes(ubicacion)) {
        this.ubicacionesRecientes.unshift(ubicacion)
        if (this.ubicacionesRecientes.length > 6) {
          this.ubicacionesRecientes.pop()
        }
      }
    }
  
    /**
     * Obtiene el número de solicitudes restantes
     */
    getSolicitudesRestantes() {
      return Math.max(0, this.maxSolicitudes - this.solicitudesUsadas)
    }
  
    /**
     * Usa una solicitud de contacto
     */
    usarSolicitud() {
      if (this.solicitudesUsadas < this.maxSolicitudes) {
        this.solicitudesUsadas++
        localStorage.setItem("solicitudesUsadas", this.solicitudesUsadas.toString())
        return true
      }
      return false
    }
  
    /**
     * Resetea las solicitudes (para testing)
     */
    resetearSolicitudes() {
      this.solicitudesUsadas = 0
      localStorage.setItem("solicitudesUsadas", "0")
    }
  
    /**
     * Verifica si puede usar más solicitudes
     */
    puedeUsarSolicitud() {
      return this.solicitudesUsadas < this.maxSolicitudes
    }
  }
  
  // Instancia global del gestor de datos
  window.dataManager = new DataManager()
  