/**
 * Servicio Mock para simular las respuestas de la API
 * Útil para desarrollo y testing sin backend
 *
 * Este archivo simula todas las respuestas de la API real
 * con datos ficticios pero con la estructura exacta esperada
 */

class ApiMockService {
    constructor() {
      this.delayMs = 500 // Simular latencia de red
      this.currentUser = null
      this.isLoggedIn = false
  
      // Datos mock
      this.mockData = {
        users: [
          {
            id: 123,
            email: "usuario@email.com",
            nombre: "Juan Pérez",
            telefono: "+54 9 11 1234-5678",
            fecha_nacimiento: "1990-01-01",
            genero: "masculino",
            direccion: "Av. Siempre Viva 742",
            foto_perfil: "/placeholder.svg?height=120&width=120&text=JP",
            solicitudes_restantes: 5,
            plan: "gratuito",
            created_at: "2024-01-01T00:00:00Z",
          },
        ],
        patients: [
          {
            id: 789,
            user_id: 123, // ID del usuario solicitante
            nombre: "Juan",
            apellido: "González",
            edad: 12,
            fecha_nacimiento: "2012-05-15",
            genero: "masculino",
            relacion: "hijo",
            es_menor: true,
            obra_social: "OSDE",
            numero_afiliado: "123456789",
            foto_perfil: "/placeholder.svg?height=60&width=60&text=JG",
            activo: true,
            created_at: "2024-06-01T00:00:00Z",
          },
          {
            id: 790,
            user_id: 123,
            nombre: "Ana",
            apellido: "González",
            edad: 8,
            fecha_nacimiento: "2016-03-20",
            genero: "femenino",
            relacion: "hija",
            es_menor: true,
            obra_social: "OSDE",
            numero_afiliado: "123456790",
            foto_perfil: "/placeholder.svg?height=60&width=60&text=AG",
            activo: true,
            created_at: "2024-06-01T00:00:00Z",
          },
          {
            id: 791,
            user_id: 123,
            nombre: "Roberto",
            apellido: "González",
            edad: 65,
            fecha_nacimiento: "1959-08-10",
            genero: "masculino",
            relacion: "padre",
            es_menor: false,
            obra_social: "PAMI",
            numero_afiliado: "987654321",
            foto_perfil: "/placeholder.svg?height=60&width=60&text=RG",
            activo: true,
            created_at: "2024-06-01T00:00:00Z",
          },
        ],
        professionals: [
          {
            id: 1,
            nombre: "Dr. Carlos Rodríguez",
            especialidad: "Psicología Clínica",
            subespecialidades: ["Terapia Cognitivo-Conductual", "Trastornos de Ansiedad"],
            rating: 4.8,
            total_reviews: 124,
            zona_publica: "Zona Norte",
            distancia_km: 2.5,
            disponibilidad: "Disponible hoy",
            proxima_cita: "2025-01-08T09:00:00Z",
            obras_sociales: ["OSDE", "Swiss Medical", "Medifé"],
            idiomas: ["Español", "Inglés"],
            foto_perfil: "/placeholder.svg?height=120&width=120&text=CR",
            verificado: true,
            años_experiencia: 15,
            precio_consulta: {
              min: 8000,
              max: 12000,
              moneda: "ARS",
            },
          },
          {
            id: 2,
            nombre: "Dra. Sofía Gómez",
            especialidad: "Psiquiatría",
            subespecialidades: ["Trastornos del Estado de Ánimo", "Psicofarmacología"],
            rating: 4.9,
            total_reviews: 89,
            zona_publica: "Zona Centro",
            distancia_km: 1.8,
            disponibilidad: "Disponible mañana",
            proxima_cita: "2025-01-09T10:00:00Z",
            obras_sociales: ["OSDE", "OMINT", "Galeno"],
            idiomas: ["Español", "Inglés", "Francés"],
            foto_perfil: "/placeholder.svg?height=120&width=120&text=SG",
            verificado: true,
            años_experiencia: 12,
            precio_consulta: {
              min: 12000,
              max: 18000,
              moneda: "ARS",
            },
          },
        ],
  
        specialties: [
          {
            id: 1,
            nombre: "Psicología Clínica",
            descripcion: "Evaluación y tratamiento de trastornos mentales",
            categoria: "Psicología",
            icono: "psychology",
            popular: true,
          },
          {
            id: 2,
            nombre: "Psiquiatría",
            descripcion: "Diagnóstico y tratamiento médico de trastornos mentales",
            categoria: "Medicina",
            icono: "medical_services",
            popular: true,
          },
          {
            id: 3,
            nombre: "Psicología Infantil",
            descripcion: "Atención psicológica especializada en niños y adolescentes",
            categoria: "Psicología",
            icono: "child_care",
            popular: true,
          },
        ],
  
        reviews: [
          {
            id: 1,
            usuario: {
              nombre: "María González",
              iniciales: "MG",
              verificado: true,
            },
            rating: 5,
            comentario:
              "Excelente profesional. Me ayudó muchísimo con mi ansiedad. Muy empático y profesional en su trato.",
            fecha: "2024-05-15T10:00:00Z",
            verificada: true,
            util_count: 12,
            respuesta_profesional: {
              comentario: "Muchas gracias por sus palabras. Me alegra haber podido ayudarla.",
              fecha: "2024-05-16T09:00:00Z",
            },
          },
          {
            id: 2,
            usuario: {
              nombre: "Juan Pérez",
              iniciales: "JP",
              verificado: true,
            },
            rating: 4,
            comentario:
              "Muy buena atención, me sentí cómodo durante todo el proceso. Las técnicas que me enseñó me sirvieron mucho.",
            fecha: "2024-04-03T14:30:00Z",
            verificada: true,
            util_count: 8,
            respuesta_profesional: null,
          },
        ],
      }
    }
  
    // Simular delay de red
    async simulateDelay(ms = this.delayMs) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    }
  
    // Simular respuesta exitosa
    successResponse(data, message = "Operación exitosa") {
      return {
        success: true,
        message,
        data,
      }
    }
  
    // Simular respuesta de error
    errorResponse(message = "Error en la operación", code = 400) {
      return {
        success: false,
        message,
        error: {
          code,
          details: message,
        },
      }
    }
  
    // ==========================================
    // MÉTODOS MOCK DE LA API
    // ==========================================
  
    /**
     * Mock: Login
     */
    async login(email, password) {
      await this.simulateDelay()
  
      if (email === "usuario@email.com" && password === "password123") {
        this.isLoggedIn = true
        this.currentUser = this.mockData.users[0]
  
        return this.successResponse(
          {
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token",
            user: this.currentUser,
          },
          "Login exitoso",
        )
      }
  
      throw new Error("Credenciales inválidas")
    }
  
    /**
     * Mock: Búsqueda de profesionales
     */
    async searchProfessionals(filters = {}) {
      await this.simulateDelay()
  
      let professionals = [...this.mockData.professionals]
  
      // Simular filtros
      if (filters.especialidad) {
        professionals = professionals.filter((p) =>
          p.especialidad.toLowerCase().includes(filters.especialidad.toLowerCase()),
        )
      }
  
      if (filters.obra_social) {
        professionals = professionals.filter((p) => p.obras_sociales.includes(filters.obra_social))
      }
  
      return this.successResponse({
        professionals,
        pagination: {
          current_page: 1,
          total_pages: 1,
          total_results: professionals.length,
          per_page: 10,
        },
        filters_applied: filters,
      })
    }
  
    /**
     * Mock: Perfil detallado del profesional
     */
    async getProfessionalProfile(professionalId) {
      await this.simulateDelay()
  
      const professional = {
        id: Number.parseInt(professionalId),
        informacion_basica: {
          nombre: "Dr. Carlos Rodríguez",
          especialidad_principal: "Psicología Clínica",
          especialidades: ["Psicología Clínica", "Terapia Cognitivo-Conductual", "Trastornos de Ansiedad"],
          rating: 4.8,
          total_reviews: 124,
          años_experiencia: 15,
          descripcion:
            "Psicólogo clínico con más de 15 años de experiencia especializado en terapia cognitivo-conductual y tratamiento de trastornos de ansiedad. Formado en la Universidad de Buenos Aires con posgrado en Terapia Cognitivo-Conductual en la Universidad de Barcelona.",
          foto_perfil: "/placeholder.svg?height=120&width=120&text=CR",
          verificado: true,
          idiomas: ["Español", "Inglés", "Portugués"],
        },
        ubicacion: {
          zona_publica: "Zona Norte",
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          pais: "Argentina",
        },
        experiencia_laboral: [
          {
            puesto: "Psicólogo Clínico Senior",
            institucion: "Centro de Salud Mental Integral",
            fecha_inicio: "2015-01-01",
            fecha_fin: null,
            actual: true,
            descripcion: [
              "Atención psicológica individual y grupal especializada en trastornos de ansiedad y depresión",
              "Coordinación de programas de prevención en salud mental comunitaria",
              "Supervisión de residentes de psicología clínica",
            ],
          },
          {
            puesto: "Psicólogo Clínico",
            institucion: "Hospital Universitario",
            fecha_inicio: "2010-01-01",
            fecha_fin: "2015-12-31",
            actual: false,
            descripcion: [
              "Evaluación y tratamiento psicológico en consulta externa",
              "Participación en equipos interdisciplinarios de salud mental",
            ],
          },
        ],
        educacion: [
          {
            titulo: "Posgrado en Terapia Cognitivo-Conductual",
            institucion: "Universidad de Barcelona",
            pais: "España",
            fecha_inicio: "2014-01-01",
            fecha_fin: "2015-12-31",
            tipo: "posgrado",
          },
          {
            titulo: "Licenciatura en Psicología",
            institucion: "Universidad de Buenos Aires",
            pais: "Argentina",
            fecha_inicio: "2003-01-01",
            fecha_fin: "2008-12-31",
            tipo: "grado",
          },
        ],
        acreditaciones: [
          {
            nombre: "Matrícula Profesional de Psicólogo",
            numero: "MP 12345",
            emisor: "Colegio de Psicólogos de Buenos Aires",
            fecha_emision: "2008-03-15",
            fecha_vencimiento: "2025-12-31",
            vigente: true,
          },
          {
            nombre: "Certificación en Terapia Cognitivo-Conductual",
            numero: "TCC-2015-089",
            emisor: "Asociación Argentina de Terapia Cognitiva",
            fecha_emision: "2015-06-01",
            fecha_vencimiento: null,
            vigente: true,
          },
        ],
        obras_sociales: ["OSDE", "Swiss Medical", "Medifé", "Galeno", "PAMI", "IOMA"],
        lugares_atencion: [
          {
            id: "consultorio-1",
            nombre: "Consultorio Privado",
            tipo: "consultorio_privado",
            zona_publica: "Zona Norte",
            horarios: {
              lunes: [{ inicio: "14:00", fin: "19:00" }],
              miercoles: [{ inicio: "09:00", fin: "13:00" }],
            },
            modalidades: ["presencial", "virtual"],
            precio_consulta: {
              presencial: 10000,
              virtual: 8000,
              moneda: "ARS",
            },
          },
          {
            id: "centro-salud",
            nombre: "Centro de Salud Mental Integral",
            tipo: "centro_medico",
            zona_publica: "Zona Centro",
            horarios: {
              martes: [{ inicio: "10:00", fin: "16:00" }],
              jueves: [{ inicio: "12:00", fin: "18:00" }],
            },
            modalidades: ["presencial"],
            precio_consulta: {
              presencial: 8000,
              moneda: "ARS",
            },
          },
        ],
      }
  
      return this.successResponse({ professional })
    }
  
    /**
     * Mock: Solicitar contacto
     */
    async requestProfessionalContact(professionalId, contactData) {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }
  
      if (this.currentUser.solicitudes_restantes <= 0) {
        throw new Error("No tienes solicitudes restantes")
      }
  
      this.currentUser.solicitudes_restantes--
  
      // Determinar paciente
      let pacienteData = null
      if (!contactData.yo_soy_paciente && contactData.paciente_id) {
        pacienteData = this.mockData.patients.find((p) => p.id === contactData.paciente_id)
      }
  
      return this.successResponse(
        {
          solicitud_id: 123,
          professional: {
            id: Number.parseInt(professionalId),
            nombre: "Dr. Carlos Rodríguez",
          },
          solicitante: {
            id: this.currentUser.id,
            nombre: this.currentUser.nombre,
            email: this.currentUser.email,
            telefono: this.currentUser.telefono,
            relacion_paciente: pacienteData ? pacienteData.relacion : null,
          },
          paciente: contactData.yo_soy_paciente ? null : pacienteData,
          detalles_solicitud: {
            motivo_consulta: contactData.motivo_consulta || "Consulta general",
            notas_adicionales: contactData.notas_adicionales || "",
            urgencia: contactData.urgencia || "normal",
            fecha_solicitud: new Date().toISOString(),
          },
          contacto_revelado: {
            telefono: "+54 11 4567-8901",
            email: "carlos.rodriguez@email.com",
            lugares_atencion: [
              {
                id: "consultorio-1",
                nombre: "Consultorio Privado",
                direccion_completa: "Av. Santa Fe 1234, Piso 5, Oficina 12, CABA",
                telefono: "+54 11 4567-8901",
                horarios_detallados: "Lunes: 14:00 - 19:00 | Miércoles: 09:00 - 13:00",
              },
            ],
          },
          solicitudes_restantes: this.currentUser.solicitudes_restantes,
        },
        "Solicitud de contacto procesada exitosamente",
      )
    }
  
    /**
     * Mock: Estado de solicitudes
     */
    async getContactRequestsStatus() {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }
  
      return this.successResponse({
        solicitudes_restantes: this.currentUser.solicitudes_restantes,
        solicitudes_totales: 5,
        solicitudes_usadas: 5 - this.currentUser.solicitudes_restantes,
        plan: "gratuito",
        fecha_renovacion: "2025-02-01T00:00:00Z",
        historial: [
          {
            id: 1,
            professional_id: 5,
            professional_name: "Dra. Ana López",
            fecha_solicitud: "2025-01-05T10:30:00Z",
            estado: "completada",
          },
        ],
      })
    }
  
    /**
     * Mock: Obtener especialidades
     */
    async getSpecialties() {
      await this.simulateDelay()
  
      return this.successResponse({
        specialties: this.mockData.specialties,
      })
    }
  
    /**
     * Mock: Obtener reseñas
     */
    async getProfessionalReviews(professionalId, page = 1, limit = 10) {
      await this.simulateDelay()
  
      return this.successResponse({
        reviews: this.mockData.reviews,
        estadisticas: {
          rating_promedio: 4.8,
          total_reviews: 124,
          distribucion: {
            "5_estrellas": 89,
            "4_estrellas": 25,
            "3_estrellas": 8,
            "2_estrellas": 2,
            "1_estrella": 0,
          },
        },
        pagination: {
          current_page: page,
          total_pages: 1,
          per_page: limit,
        },
      })
    }
  
    /**
     * Mock: Disponibilidad del profesional
     */
    async getProfessionalAvailability(professionalId, params = {}) {
      await this.simulateDelay()
  
      return this.successResponse({
        professional_id: Number.parseInt(professionalId),
        lugares_atencion: [
          {
            lugar_id: "consultorio-1",
            nombre: "Consultorio Privado",
            disponibilidad: {
              "2025-01-08": {
                manana: [
                  { hora: "09:00", disponible: true, precio: 10000 },
                  { hora: "09:30", disponible: true, precio: 10000 },
                  { hora: "10:00", disponible: false, precio: 10000 },
                ],
                tarde: [
                  { hora: "14:00", disponible: true, precio: 10000 },
                  { hora: "14:30", disponible: true, precio: 10000 },
                ],
                noche: [],
              },
              "2025-01-10": {
                manana: [{ hora: "10:00", disponible: true, precio: 10000 }],
                tarde: [{ hora: "15:00", disponible: true, precio: 10000 }],
              },
            },
          },
        ],
        rango_fechas: {
          desde: "2025-01-08",
          hasta: "2025-02-08",
        },
      })
    }
  
    /**
     * Mock: Agendar cita
     */
    async bookAppointment(appointmentData) {
      await this.simulateDelay()
  
      return this.successResponse(
        {
          appointment: {
            id: 456,
            professional: {
              id: appointmentData.professional_id,
              nombre: "Dr. Carlos Rodríguez",
            },
            fecha: appointmentData.fecha,
            hora: appointmentData.hora,
            lugar: {
              nombre: "Consultorio Privado",
              direccion: "Av. Santa Fe 1234, Piso 5, Oficina 12, CABA",
            },
            modalidad: appointmentData.modalidad,
            precio: 10000,
            moneda: "ARS",
            estado: "confirmada",
            codigo_confirmacion: "CITA-456-2025",
            instrucciones: "Llegar 10 minutos antes de la cita",
            politica_cancelacion: "Cancelación gratuita hasta 24hs antes",
          },
        },
        "Cita agendada exitosamente",
      )
    }
  
    /**
     * Mock: Geocodificación
     */
    async geocodeAddress(address) {
      await this.simulateDelay()
  
      return this.successResponse({
        direccion_formateada: "Buenos Aires, Argentina",
        coordenadas: {
          lat: -34.6037,
          lng: -58.3816,
        },
        componentes: {
          ciudad: "Buenos Aires",
          provincia: "Buenos Aires",
          pais: "Argentina",
          codigo_postal: null,
        },
        precision: "ciudad",
      })
    }
  
    /**
     * Mock: Obtener pacientes del usuario
     */
    async getUserPatients() {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        // Simular usuario logueado para testing
        this.isLoggedIn = true
        this.currentUser = this.mockData.users[0]
      }
  
      const userPatients = this.mockData.patients.filter((p) => p.user_id === this.currentUser.id)
  
      return this.successResponse({
        patients: userPatients,
        total_patients: userPatients.length,
        can_add_more: userPatients.length < 10,
        max_patients: 10,
      })
    }
  
    /**
     * Mock: Agregar paciente
     */
    async addPatient(patientData) {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        // Simular usuario logueado para testing
        this.isLoggedIn = true
        this.currentUser = this.mockData.users[0]
      }
  
      const newPatient = {
        id: Date.now(), // ID temporal
        user_id: this.currentUser.id,
        ...patientData,
        foto_perfil: `/placeholder.svg?height=60&width=60&text=${patientData.nombre.charAt(0)}${patientData.apellido.charAt(0)}`,
        activo: true,
        created_at: new Date().toISOString(),
      }
  
      this.mockData.patients.push(newPatient)
  
      return this.successResponse(
        {
          patient: newPatient,
        },
        "Paciente agregado exitosamente",
      )
    }
  
    /**
     * Mock: Actualizar paciente
     */
    async updatePatient(patientId, patientData) {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        throw new Error("Usuario no autenticado")
      }
  
      const patientIndex = this.mockData.patients.findIndex(
        (p) => p.id === patientId && p.user_id === this.currentUser.id,
      )
  
      if (patientIndex === -1) {
        throw new Error("Paciente no encontrado")
      }
  
      this.mockData.patients[patientIndex] = {
        ...this.mockData.patients[patientIndex],
        ...patientData,
      }
  
      return this.successResponse(
        {
          patient: this.mockData.patients[patientIndex],
        },
        "Paciente actualizado exitosamente",
      )
    }
  
    /**
     * Mock: Obtener perfil del usuario
     */
    async getUserProfile() {
      await this.simulateDelay()
  
      if (!this.isLoggedIn) {
        // Simular usuario logueado para testing
        this.isLoggedIn = true
        this.currentUser = this.mockData.users[0]
      }
  
      return this.successResponse({
        user: this.currentUser,
      })
    }
  }
  
  // Instancia global del servicio mock
  window.apiMockService = new ApiMockService()
  