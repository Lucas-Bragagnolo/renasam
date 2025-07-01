/**
 * Servicio de API para la aplicación de Cartilla de Salud Mental
 * Maneja todas las peticiones HTTP a los diferentes endpoints
 *
 * ESTRUCTURA DE LA API:
 * - Base URL: https://api.cartilla-salud.com/v1
 * - Autenticación: Bearer Token en headers
 * - Formato: JSON
 * - Códigos de respuesta estándar HTTP
 */

class ApiService {
    constructor() {
      this.baseURL = "https://api.cartilla-salud.com/v1"
      this.token = localStorage.getItem("authToken") || null
  
      // Headers por defecto para todas las peticiones
      this.defaultHeaders = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    }
  
    /**
     * Método genérico para hacer peticiones HTTP
     * @param {string} endpoint - Endpoint de la API
     * @param {string} method - Método HTTP (GET, POST, PUT, DELETE)
     * @param {Object} data - Datos a enviar (para POST/PUT)
     * @param {Object} params - Parámetros de query string
     */
    async makeRequest(endpoint, method = "GET", data = null, params = null) {
      try {
        const url = new URL(`${this.baseURL}${endpoint}`)
  
        // Agregar parámetros de query si existen
        if (params) {
          Object.keys(params).forEach((key) => {
            if (params[key] !== null && params[key] !== undefined) {
              url.searchParams.append(key, params[key])
            }
          })
        }
  
        const headers = { ...this.defaultHeaders }
  
        // Agregar token de autenticación si existe
        if (this.token) {
          headers["Authorization"] = `Bearer ${this.token}`
        }
  
        const config = {
          method,
          headers,
        }
  
        // Agregar body para métodos que lo requieren
        if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
          config.body = JSON.stringify(data)
        }
  
        const response = await fetch(url.toString(), config)
  
        // Manejar errores HTTP
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP Error: ${response.status}`)
        }
  
        return await response.json()
      } catch (error) {
        console.error(`API Error [${method} ${endpoint}]:`, error)
        throw error
      }
    }
  
    // ==========================================
    // 1. AUTENTICACIÓN Y USUARIO
    // ==========================================
  
    /**
     * LOGIN - Autenticar usuario
     * POST /auth/login
     *
     * Request Body:
     * {
     *   "email": "usuario@email.com",
     *   "password": "password123"
     * }
     */
    async login(email, password) {
      const response = await this.makeRequest("/auth/login", "POST", {
        email,
        password,
      })
  
      // Guardar token para futuras peticiones
      if (response.data.token) {
        this.token = response.data.token
        localStorage.setItem("authToken", this.token)
      }
  
      return response
    }
  
    /*
     * RESPUESTA ESPERADA LOGIN:
     * {
     *   "success": true,
     *   "message": "Login exitoso",
     *   "data": {
     *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     *     "user": {
     *       "id": 123,
     *       "email": "usuario@email.com",
     *       "nombre": "Juan Pérez",
     *       "telefono": "+54 9 11 1234-5678",
     *       "fecha_nacimiento": "1990-01-01",
     *       "genero": "masculino",
     *       "direccion": "Av. Siempre Viva 742",
     *       "foto_perfil": "https://cdn.cartilla-salud.com/users/123/avatar.jpg",
     *       "solicitudes_restantes": 5,
     *       "plan": "gratuito",
     *       "created_at": "2024-01-01T00:00:00Z"
     *     }
     *   }
     * }
     */
  
    /**
     * REGISTRO - Crear nueva cuenta
     * POST /auth/register
     */
    async register(userData) {
      return await this.makeRequest("/auth/register", "POST", userData)
    }
  
    /**
     * PERFIL DEL USUARIO - Obtener datos del usuario actual
     * GET /user/profile
     */
    async getUserProfile() {
      return await this.makeRequest("/user/profile")
    }
  
    /**
     * ACTUALIZAR PERFIL - Modificar datos del usuario
     * PUT /user/profile
     */
    async updateUserProfile(userData) {
      return await this.makeRequest("/user/profile", "PUT", userData)
    }
  
    // ==========================================
    // 2. BÚSQUEDA DE PROFESIONALES
    // ==========================================
  
    /**
     * BUSCAR PROFESIONALES - Búsqueda con filtros
     * GET /professionals/search
     *
     * Parámetros de query:
     * - ubicacion: string (ciudad, provincia, código postal)
     * - especialidad: string
     * - obra_social: string
     * - disponibilidad: enum (hoy, manana, semana)
     * - ordenar_por: enum (rating, distancia, disponibilidad)
     * - radio_km: number (radio de búsqueda en km)
     * - lat: number (latitud para búsqueda por coordenadas)
     * - lng: number (longitud para búsqueda por coordenadas)
     * - page: number (paginación)
     * - limit: number (cantidad por página, máx 50)
     */
    async searchProfessionals(filters = {}) {
      return await this.makeRequest("/professionals/search", "GET", null, filters)
    }
  
    /*
     * RESPUESTA ESPERADA BÚSQUEDA:
     * {
     *   "success": true,
     *   "data": {
     *     "professionals": [
     *       {
     *         "id": 1,
     *         "nombre": "Dr. Carlos Rodríguez",
     *         "especialidad": "Psicología Clínica",
     *         "subespecialidades": ["Terapia Cognitivo-Conductual", "Trastornos de Ansiedad"],
     *         "rating": 4.8,
     *         "total_reviews": 124,
     *         "zona_publica": "Zona Norte",
     *         "distancia_km": 2.5,
     *         "disponibilidad": "Disponible hoy",
     *         "proxima_cita": "2025-01-08T09:00:00Z",
     *         "obras_sociales": ["OSDE", "Swiss Medical", "Medifé"],
     *         "idiomas": ["Español", "Inglés"],
     *         "foto_perfil": "https://cdn.cartilla-salud.com/professionals/1/avatar.jpg",
     *         "verificado": true,
     *         "años_experiencia": 15,
     *         "precio_consulta": {
     *           "min": 8000,
     *           "max": 12000,
     *           "moneda": "ARS"
     *         }
     *       }
     *     ],
     *     "pagination": {
     *       "current_page": 1,
     *       "total_pages": 5,
     *       "total_results": 47,
     *       "per_page": 10
     *     },
     *     "filters_applied": {
     *       "ubicacion": "Buenos Aires",
     *       "especialidad": "Psicología Clínica",
     *       "radio_km": 10
     *     }
     *   }
     * }
     */
  
    /**
     * OBTENER ESPECIALIDADES - Lista de todas las especialidades disponibles
     * GET /specialties
     */
    async getSpecialties() {
      return await this.makeRequest("/specialties")
    }
  
    /*
     * RESPUESTA ESPECIALIDADES:
     * {
     *   "success": true,
     *   "data": {
     *     "specialties": [
     *       {
     *         "id": 1,
     *         "nombre": "Psicología Clínica",
     *         "descripcion": "Evaluación y tratamiento de trastornos mentales",
     *         "categoria": "Psicología",
     *         "icono": "psychology",
     *         "popular": true
     *       },
     *       {
     *         "id": 2,
     *         "nombre": "Psiquiatría",
     *         "descripcion": "Diagnóstico y tratamiento médico de trastornos mentales",
     *         "categoria": "Medicina",
     *         "icono": "medical_services",
     *         "popular": true
     *       }
     *     ]
     *   }
     * }
     */
  
    /**
     * OBTENER OBRAS SOCIALES - Lista de obras sociales disponibles
     * GET /insurance-providers
     */
    async getInsuranceProviders() {
      return await this.makeRequest("/insurance-providers")
    }
  
    // ==========================================
    // 3. PERFIL DETALLADO DEL PROFESIONAL
    // ==========================================
  
    /**
     * OBTENER PERFIL COMPLETO DEL PROFESIONAL
     * GET /professionals/{id}
     *
     * Incluye toda la información detallada del profesional
     */
    async getProfessionalProfile(professionalId) {
      return await this.makeRequest(`/professionals/${professionalId}`)
    }
  
    /*
     * RESPUESTA PERFIL PROFESIONAL:
     * {
     *   "success": true,
     *   "data": {
     *     "professional": {
     *       "id": 1,
     *       "informacion_basica": {
     *         "nombre": "Dr. Carlos Rodríguez",
     *         "especialidad_principal": "Psicología Clínica",
     *         "especialidades": ["Psicología Clínica", "Terapia Cognitivo-Conductual"],
     *         "rating": 4.8,
     *         "total_reviews": 124,
     *         "años_experiencia": 15,
     *         "descripcion": "Psicólogo clínico con más de 15 años de experiencia...",
     *         "foto_perfil": "https://cdn.cartilla-salud.com/professionals/1/avatar.jpg",
     *         "verificado": true,
     *         "idiomas": ["Español", "Inglés", "Portugués"]
     *       },
     *       "ubicacion": {
     *         "zona_publica": "Zona Norte",
     *         "ciudad": "Buenos Aires",
     *         "provincia": "Buenos Aires",
     *         "pais": "Argentina"
     *       },
     *       "experiencia_laboral": [
     *         {
     *           "puesto": "Psicólogo Clínico Senior",
     *           "institucion": "Centro de Salud Mental Integral",
     *           "fecha_inicio": "2015-01-01",
     *           "fecha_fin": null,
     *           "actual": true,
     *           "descripcion": [
     *             "Atención psicológica individual y grupal",
     *             "Coordinación de programas de prevención"
     *           ]
     *         }
     *       ],
     *       "educacion": [
     *         {
     *           "titulo": "Posgrado en Terapia Cognitivo-Conductual",
     *           "institucion": "Universidad de Barcelona",
     *           "pais": "España",
     *           "fecha_inicio": "2014-01-01",
     *           "fecha_fin": "2015-12-31",
     *           "tipo": "posgrado"
     *         }
     *       ],
     *       "acreditaciones": [
     *         {
     *           "nombre": "Matrícula Profesional de Psicólogo",
     *           "numero": "MP 12345",
     *           "emisor": "Colegio de Psicólogos de Buenos Aires",
     *           "fecha_emision": "2008-03-15",
     *           "fecha_vencimiento": "2025-12-31",
     *           "vigente": true
     *         }
     *       ],
     *       "obras_sociales": ["OSDE", "Swiss Medical", "Medifé", "Galeno"],
     *       "lugares_atencion": [
     *         {
     *           "id": "consultorio-1",
     *           "nombre": "Consultorio Privado",
     *           "tipo": "consultorio_privado",
     *           "zona_publica": "Zona Norte",
     *           "horarios": {
     *             "lunes": [{"inicio": "14:00", "fin": "19:00"}],
     *             "miercoles": [{"inicio": "09:00", "fin": "13:00"}]
     *           },
     *           "modalidades": ["presencial", "virtual"],
     *           "precio_consulta": {
     *             "presencial": 10000,
     *             "virtual": 8000,
     *             "moneda": "ARS"
     *           }
     *         }
     *       ]
     *     }
     *   }
     * }
     */
  
    // ==========================================
    // 4. SISTEMA DE SOLICITUDES DE CONTACTO
    // ==========================================
  
    /**
     * OBTENER ESTADO DE SOLICITUDES DEL USUARIO
     * GET /user/contact-requests/status
     */
    async getContactRequestsStatus() {
      return await this.makeRequest("/user/contact-requests/status")
    }
  
    /*
     * RESPUESTA ESTADO SOLICITUDES:
     * {
     *   "success": true,
     *   "data": {
     *     "solicitudes_restantes": 3,
     *     "solicitudes_totales": 5,
     *     "solicitudes_usadas": 2,
     *     "plan": "gratuito",
     *     "fecha_renovacion": "2025-02-01T00:00:00Z",
     *     "historial": [
     *       {
     *         "id": 1,
     *         "professional_id": 5,
     *         "professional_name": "Dra. Ana López",
     *         "fecha_solicitud": "2025-01-05T10:30:00Z",
     *         "estado": "completada"
     *       }
     *     ]
     *   }
     * }
     */
  
    /**
     * SOLICITAR CONTACTO DE PROFESIONAL
     * POST /professionals/{id}/request-contact
     */
    async requestProfessionalContact(professionalId, contactData) {
      return await this.makeRequest(`/professionals/${professionalId}/request-contact`, "POST", contactData)
    }
  
    /*
     * RESPUESTA SOLICITUD CONTACTO ACTUALIZADA:
     * {
     *   "success": true,
     *   "message": "Solicitud de contacto procesada exitosamente",
     *   "data": {
     *     "solicitud_id": 123,
     *     "professional": {
     *       "id": 1,
     *       "nombre": "Dr. Carlos Rodríguez"
     *     },
     *     "solicitante": {
     *       "id": 456,
     *       "nombre": "María González",
     *       "email": "maria.gonzalez@email.com",
     *       "telefono": "+54 9 11 9876-5432",
     *       "relacion_paciente": "madre" // si no es el mismo paciente
     *     },
     *     "paciente": {
     *       "id": 789, // null si yo_soy_paciente es true
     *       "nombre": "Juan González",
     *       "edad": 12,
     *       "genero": "masculino",
     *       "fecha_nacimiento": "2012-05-15",
     *       "obra_social": "OSDE",
     *       "es_menor": true
     *     },
     *     "detalles_solicitud": {
     *       "motivo_consulta": "Consulta por ansiedad",
     *       "notas_adicionales": "Primera consulta para mi hijo",
     *       "urgencia": "normal",
     *       "fecha_solicitud": "2025-01-07T15:30:00Z"
     *     },
     *     "contacto_revelado": {
     *       "telefono": "+54 11 4567-8901",
     *       "email": "carlos.rodriguez@email.com",
     *       "lugares_atencion": [
     *         {
     *           "id": "consultorio-1",
     *           "nombre": "Consultorio Privado",
     *           "direccion_completa": "Av. Santa Fe 1234, Piso 5, Oficina 12, CABA",
     *           "telefono": "+54 11 4567-8901",
     *           "horarios_detallados": "Lunes: 14:00 - 19:00 | Miércoles: 09:00 - 13:00"
     *         }
     *       ]
     *     },
     *     "solicitudes_restantes": 2
     *   }
     * }
     */
  
    /**
     * OBTENER PACIENTES A CARGO DEL USUARIO
     * GET /user/patients
     */
    async getUserPatients() {
      return await this.makeRequest("/user/patients")
    }
  
    /*
     * RESPUESTA PACIENTES:
     * {
     *   "success": true,
     *   "data": {
     *     "patients": [
     *       {
     *         "id": 789,
     *         "nombre": "Juan González",
     *         "apellido": "González",
     *         "edad": 12,
     *         "fecha_nacimiento": "2012-05-15",
     *         "genero": "masculino",
     *         "relacion": "hijo",
     *         "es_menor": true,
     *         "obra_social": "OSDE",
     *         "numero_afiliado": "123456789",
     *         "foto_perfil": "https://cdn.cartilla-salud.com/patients/789/avatar.jpg",
     *         "activo": true,
     *         "created_at": "2024-06-01T00:00:00Z"
     *       },
     *       {
     *         "id": 790,
     *         "nombre": "Ana González",
     *         "apellido": "González",
     *         "edad": 8,
     *         "fecha_nacimiento": "2016-03-20",
     *         "genero": "femenino",
     *         "relacion": "hija",
     *         "es_menor": true,
     *         "obra_social": "OSDE",
     *         "numero_afiliado": "123456790",
     *         "foto_perfil": "https://cdn.cartilla-salud.com/patients/790/avatar.jpg",
     *         "activo": true,
     *         "created_at": "2024-06-01T00:00:00Z"
     *       }
     *     ],
     *     "total_patients": 2,
     *     "can_add_more": true,
     *     "max_patients": 10
     *   }
     * }
     */
  
    /**
     * AGREGAR NUEVO PACIENTE
     * POST /user/patients
     */
    async addPatient(patientData) {
      return await this.makeRequest("/user/patients", "POST", patientData)
    }
  
    /**
     * ACTUALIZAR PACIENTE
     * PUT /user/patients/{id}
     */
    async updatePatient(patientId, patientData) {
      return await this.makeRequest(`/user/patients/${patientId}`, "PUT", patientData)
    }
  
    // ==========================================
    // 5. SISTEMA DE RESEÑAS
    // ==========================================
  
    /**
     * OBTENER RESEÑAS DE UN PROFESIONAL
     * GET /professionals/{id}/reviews
     */
    async getProfessionalReviews(professionalId, page = 1, limit = 10) {
      return await this.makeRequest(`/professionals/${professionalId}/reviews`, "GET", null, {
        page,
        limit,
      })
    }
  
    /*
     * RESPUESTA RESEÑAS:
     * {
     *   "success": true,
     *   "data": {
     *     "reviews": [
     *       {
     *         "id": 1,
     *         "usuario": {
     *           "nombre": "María González",
     *           "iniciales": "MG",
     *           "verificado": true
     *         },
     *         "rating": 5,
     *         "comentario": "Excelente profesional. Me ayudó muchísimo con mi ansiedad.",
     *         "fecha": "2024-05-15T10:00:00Z",
     *         "verificada": true,
     *         "util_count": 12,
     *         "respuesta_profesional": {
     *           "comentario": "Muchas gracias por sus palabras. Me alegra haber podido ayudarla.",
     *           "fecha": "2024-05-16T09:00:00Z"
     *         }
     *       }
     *     ],
     *     "estadisticas": {
     *       "rating_promedio": 4.8,
     *       "total_reviews": 124,
     *       "distribucion": {
     *         "5_estrellas": 89,
     *         "4_estrellas": 25,
     *         "3_estrellas": 8,
     *         "2_estrellas": 2,
     *         "1_estrella": 0
     *       }
     *     },
     *     "pagination": {
     *       "current_page": 1,
     *       "total_pages": 13,
     *       "per_page": 10
     *     }
     *   }
     * }
     */
  
    /**
     * CREAR RESEÑA
     * POST /professionals/{id}/reviews
     */
    async createReview(professionalId, reviewData) {
      return await this.makeRequest(`/professionals/${professionalId}/reviews`, "POST", reviewData)
    }
  
    // ==========================================
    // 6. SISTEMA DE CITAS/TURNOS
    // ==========================================
  
    /**
     * OBTENER DISPONIBILIDAD DE UN PROFESIONAL
     * GET /professionals/{id}/availability
     */
    async getProfessionalAvailability(professionalId, params = {}) {
      return await this.makeRequest(`/professionals/${professionalId}/availability`, "GET", null, params)
    }
  
    /*
     * RESPUESTA DISPONIBILIDAD:
     * {
     *   "success": true,
     *   "data": {
     *     "professional_id": 1,
     *     "lugares_atencion": [
     *       {
     *         "lugar_id": "consultorio-1",
     *         "nombre": "Consultorio Privado",
     *         "disponibilidad": {
     *           "2025-01-08": {
     *             "manana": [
     *               {"hora": "09:00", "disponible": true, "precio": 10000},
     *               {"hora": "09:30", "disponible": true, "precio": 10000},
     *               {"hora": "10:00", "disponible": false, "precio": 10000}
     *             ],
     *             "tarde": [
     *               {"hora": "14:00", "disponible": true, "precio": 10000},
     *               {"hora": "14:30", "disponible": true, "precio": 10000}
     *             ],
     *             "noche": []
     *           },
     *           "2025-01-10": {
     *             "manana": [
     *               {"hora": "10:00", "disponible": true, "precio": 10000}
     *             ],
     *             "tarde": [
     *               {"hora": "15:00", "disponible": true, "precio": 10000}
     *             ]
     *           }
     *         }
     *       }
     *     ],
     *     "rango_fechas": {
     *       "desde": "2025-01-08",
     *       "hasta": "2025-02-08"
     *     }
     *   }
     * }
     */
  
    /**
     * AGENDAR CITA
     * POST /appointments
     */
    async bookAppointment(appointmentData) {
      return await this.makeRequest("/appointments", "POST", appointmentData)
    }
  
    /*
     * REQUEST AGENDAR CITA:
     * {
     *   "professional_id": 1,
     *   "lugar_id": "consultorio-1",
     *   "fecha": "2025-01-08",
     *   "hora": "09:00",
     *   "modalidad": "presencial",
     *   "motivo_consulta": "Consulta por ansiedad",
     *   "notas_adicionales": "Primera consulta"
     * }
     *
     * RESPUESTA AGENDAR CITA:
     * {
     *   "success": true,
     *   "message": "Cita agendada exitosamente",
     *   "data": {
     *     "appointment": {
     *       "id": 456,
     *       "professional": {
     *         "id": 1,
     *         "nombre": "Dr. Carlos Rodríguez"
     *       },
     *       "fecha": "2025-01-08",
     *       "hora": "09:00",
     *       "lugar": {
     *         "nombre": "Consultorio Privado",
     *         "direccion": "Av. Santa Fe 1234, Piso 5, Oficina 12, CABA"
     *       },
     *       "modalidad": "presencial",
     *       "precio": 10000,
     *       "moneda": "ARS",
     *       "estado": "confirmada",
     *       "codigo_confirmacion": "CITA-456-2025",
     *       "instrucciones": "Llegar 10 minutos antes de la cita",
     *       "politica_cancelacion": "Cancelación gratuita hasta 24hs antes"
     *     }
     *   }
     * }
     */
  
    /**
     * OBTENER CITAS DEL USUARIO
     * GET /user/appointments
     */
    async getUserAppointments(status = null) {
      const params = status ? { status } : {}
      return await this.makeRequest("/user/appointments", "GET", null, params)
    }
  
    /**
     * CANCELAR CITA
     * DELETE /appointments/{id}
     */
    async cancelAppointment(appointmentId, reason = null) {
      const data = reason ? { motivo_cancelacion: reason } : null
      return await this.makeRequest(`/appointments/${appointmentId}`, "DELETE", data)
    }
  
    // ==========================================
    // 7. MENSAJERÍA
    // ==========================================
  
    /**
     * OBTENER CONVERSACIONES DEL USUARIO
     * GET /user/conversations
     */
    async getUserConversations() {
      return await this.makeRequest("/user/conversations")
    }
  
    /**
     * OBTENER MENSAJES DE UNA CONVERSACIÓN
     * GET /conversations/{id}/messages
     */
    async getConversationMessages(conversationId, page = 1) {
      return await this.makeRequest(`/conversations/${conversationId}/messages`, "GET", null, { page })
    }
  
    /**
     * ENVIAR MENSAJE
     * POST /conversations/{id}/messages
     */
    async sendMessage(conversationId, messageData) {
      return await this.makeRequest(`/conversations/${conversationId}/messages`, "POST", messageData)
    }
  
    // ==========================================
    // 8. NOTIFICACIONES
    // ==========================================
  
    /**
     * OBTENER NOTIFICACIONES DEL USUARIO
     * GET /user/notifications
     */
    async getUserNotifications(unread_only = false) {
      const params = unread_only ? { unread_only: true } : {}
      return await this.makeRequest("/user/notifications", "GET", null, params)
    }
  
    /**
     * MARCAR NOTIFICACIÓN COMO LEÍDA
     * PUT /notifications/{id}/read
     */
    async markNotificationAsRead(notificationId) {
      return await this.makeRequest(`/notifications/${notificationId}/read`, "PUT")
    }
  
    // ==========================================
    // 9. GEOCODIFICACIÓN Y UBICACIONES
    // ==========================================
  
    /**
     * GEOCODIFICAR DIRECCIÓN
     * GET /geocode
     */
    async geocodeAddress(address) {
      return await this.makeRequest("/geocode", "GET", null, { address })
    }
  
    /*
     * RESPUESTA GEOCODIFICACIÓN:
     * {
     *   "success": true,
     *   "data": {
     *     "direccion_formateada": "Buenos Aires, Argentina",
     *     "coordenadas": {
     *       "lat": -34.6037,
     *       "lng": -58.3816
     *     },
     *     "componentes": {
     *       "ciudad": "Buenos Aires",
     *       "provincia": "Buenos Aires",
     *       "pais": "Argentina",
     *       "codigo_postal": null
     *     },
     *     "precision": "ciudad"
     *   }
     * }
     */
  
    /**
     * BÚSQUEDA INVERSA (coordenadas a dirección)
     * GET /reverse-geocode
     */
    async reverseGeocode(lat, lng) {
      return await this.makeRequest("/reverse-geocode", "GET", null, { lat, lng })
    }
  
    // ==========================================
    // 10. MÉTODOS DE UTILIDAD
    // ==========================================
  
    /**
     * Cerrar sesión
     */
    logout() {
      this.token = null
      localStorage.removeItem("authToken")
    }
  
    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
      return !!this.token
    }
  
    /**
     * Obtener token actual
     */
    getToken() {
      return this.token
    }
  
    /**
     * Establecer token manualmente
     */
    setToken(token) {
      this.token = token
      localStorage.setItem("authToken", token)
    }
  }
  
  // Instancia global del servicio de API
  window.apiService = new ApiService()
  
  // Exportar para uso en módulos
  if (typeof module !== "undefined" && module.exports) {
    module.exports = ApiService
  }
  