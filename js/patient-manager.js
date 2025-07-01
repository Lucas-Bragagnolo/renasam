/**
 * Gestor de pacientes para el sistema de solicitudes
 * Maneja la selección de pacientes y formularios de solicitud
 */

class PatientManager {
    constructor() {
      this.patients = []
      this.selectedPatient = null
      this.isUserPatient = true // Por defecto, el usuario es el paciente
  
      // No llamar init() aquí, se llamará cuando la API esté lista
      this.setupEventListeners()
    }
  
    /**
     * Inicializar cuando la API esté disponible
     */
    async initializeWhenReady() {
      // Esperar a que la API esté disponible
      const maxAttempts = 10
      let attempts = 0
  
      while (attempts < maxAttempts) {
        if (window.apiIntegration?.api || window.apiMockService) {
          console.log("✅ API disponible, inicializando PatientManager...")
          await this.loadPatients()
          return
        }
  
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
  
      console.warn("⚠️ API no disponible después de varios intentos, usando datos vacíos")
    }
  
    /**
     * Cargar pacientes del usuario desde la API
     */
    async loadPatients() {
      try {
        console.log("📋 Cargando pacientes del usuario...")
  
        const api = window.apiIntegration?.api || window.apiMockService
  
        if (!api) {
          console.warn("⚠️ API no disponible, usando lista vacía de pacientes")
          this.patients = []
          return
        }
  
        const response = await api.getUserPatients()
  
        if (response.success) {
          this.patients = response.data.patients
          console.log("✅ Pacientes cargados:", this.patients)
        } else {
          console.warn("⚠️ Error en respuesta de API:", response.message)
          this.patients = []
        }
      } catch (error) {
        console.error("❌ Error al cargar pacientes:", error)
        this.patients = [] // Fallback a lista vacía
      }
    }
  
    /**
     * Configurar event listeners
     */
    setupEventListeners() {
      // Este método se llamará cuando se necesite mostrar el modal
    }
  
    /**
     * Mostrar modal de selección de paciente para solicitud de contacto
     */
    async showPatientSelectionModal(professionalData) {
      const patientsOptions = this.patients
        .map(
          (patient) => `
        <div class="patient-option border border-gray-200 rounded-lg p-3 mb-2 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-all duration-200" data-patient-id="${patient.id}">
          <div class="flex items-center gap-3">
            <img src="${patient.foto_perfil}" alt="${patient.nombre}" class="w-10 h-10 rounded-full object-cover">
            <div class="flex-1">
              <h4 class="font-medium text-gray-800">${patient.nombre} ${patient.apellido}</h4>
              <p class="text-sm text-gray-600">${patient.edad} años • ${patient.relacion} • ${patient.obra_social}</p>
            </div>
            <div class="radio-container">
              <input type="radio" name="selected_patient" value="${patient.id}" class="w-4 h-4 text-blue-600">
            </div>
          </div>
        </div>
      `,
        )
        .join("")
  
      const result = await window.Swal.fire({
        title: "¿Para quién es la consulta?",
        html: `
          <div class="text-left max-w-md mx-auto">
            <p class="mb-4 text-gray-700">Selecciona para quién solicitas el contacto con <strong>${professionalData.nombre}</strong>:</p>
            
            <!-- Opción: Yo soy el paciente -->
            <div class="patient-option border-2 border-blue-500 bg-blue-50 rounded-lg p-3 mb-3 cursor-pointer selected" data-patient-id="self">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  <span class="material-icons text-lg">person</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-800">Para mí mismo/a</h4>
                  <p class="text-sm text-gray-600">Soy yo quien necesita la consulta</p>
                </div>
                <div class="radio-container">
                  <input type="radio" name="selected_patient" value="self" checked class="w-4 h-4 text-blue-600">
                </div>
              </div>
            </div>
  
            ${
              this.patients.length > 0
                ? `
              <!-- Separador -->
              <div class="flex items-center my-4">
                <div class="flex-1 h-px bg-gray-300"></div>
                <span class="px-3 text-sm text-gray-500">O selecciona un paciente a tu cargo</span>
                <div class="flex-1 h-px bg-gray-300"></div>
              </div>
  
              <!-- Pacientes a cargo -->
              ${patientsOptions}
  
              <!-- Botón agregar paciente -->
              <button type="button" id="add-patient-btn" class="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors duration-200 flex items-center justify-center gap-2">
                <span class="material-icons">add</span>
                <span>Agregar nuevo paciente</span>
              </button>
            `
                : `
              <!-- Sin pacientes -->
              <div class="text-center py-4">
                <p class="text-gray-500 mb-3">No tienes pacientes registrados</p>
                <button type="button" id="add-patient-btn" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 mx-auto">
                  <span class="material-icons text-sm">add</span>
                  <span>Agregar paciente</span>
                </button>
              </div>
            `
            }
  
            <!-- Formulario de detalles -->
            <div class="mt-6 pt-4 border-t border-gray-200">
              <h4 class="font-medium text-gray-800 mb-3">Detalles de la solicitud</h4>
              
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de consulta</label>
                <select id="motivo-consulta" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="">Selecciona un motivo</option>
                  <option value="Primera consulta">Primera consulta</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Consulta por ansiedad">Consulta por ansiedad</option>
                  <option value="Consulta por depresión">Consulta por depresión</option>
                  <option value="Terapia familiar">Terapia familiar</option>
                  <option value="Evaluación psicológica">Evaluación psicológica</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
  
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Urgencia</label>
                <select id="urgencia-consulta" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>
  
              <div class="mb-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Notas adicionales (opcional)</label>
                <textarea id="notas-adicionales" rows="3" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" placeholder="Información adicional que consideres relevante..."></textarea>
              </div>
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Solicitar contacto",
        cancelButtonText: "Cancelar",
        width: "600px",
        customClass: {
          htmlContainer: "patient-selection-modal",
        },
        didOpen: () => {
          this.setupModalEventListeners()
        },
        preConfirm: () => {
          return this.validateAndGetFormData()
        },
      })
  
      if (result.isConfirmed) {
        await this.processContactRequest(professionalData, result.value)
      }
    }
  
    /**
     * Configurar event listeners del modal
     */
    setupModalEventListeners() {
      // Selección de paciente
      const patientOptions = document.querySelectorAll(".patient-option")
      patientOptions.forEach((option) => {
        option.addEventListener("click", () => {
          // Remover selección anterior
          patientOptions.forEach((opt) => {
            opt.classList.remove("selected", "border-blue-500", "bg-blue-50")
            opt.classList.add("border-gray-200")
            opt.querySelector('input[type="radio"]').checked = false
          })
  
          // Aplicar nueva selección
          option.classList.add("selected", "border-blue-500", "bg-blue-50")
          option.classList.remove("border-gray-200")
          option.querySelector('input[type="radio"]').checked = true
        })
      })
  
      // Botón agregar paciente
      const addPatientBtn = document.getElementById("add-patient-btn")
      if (addPatientBtn) {
        addPatientBtn.addEventListener("click", () => {
          this.showAddPatientModal()
        })
      }
  
      // Cambio en motivo de consulta
      const motivoSelect = document.getElementById("motivo-consulta")
      if (motivoSelect) {
        motivoSelect.addEventListener("change", (e) => {
          if (e.target.value === "Otro") {
            // Agregar campo de texto personalizado
            const customInput = document.createElement("input")
            customInput.type = "text"
            customInput.id = "motivo-personalizado"
            customInput.className =
              "w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 mt-2"
            customInput.placeholder = "Especifica el motivo..."
            e.target.parentNode.appendChild(customInput)
          } else {
            // Remover campo personalizado si existe
            const customInput = document.getElementById("motivo-personalizado")
            if (customInput) {
              customInput.remove()
            }
          }
        })
      }
    }
  
    /**
     * Validar y obtener datos del formulario
     */
    validateAndGetFormData() {
      const selectedPatientInput = document.querySelector('input[name="selected_patient"]:checked')
      const motivoConsulta = document.getElementById("motivo-consulta").value
      const urgencia = document.getElementById("urgencia-consulta").value
      const notasAdicionales = document.getElementById("notas-adicionales").value
  
      if (!selectedPatientInput) {
        window.Swal.showValidationMessage("Por favor selecciona para quién es la consulta")
        return false
      }
  
      if (!motivoConsulta) {
        window.Swal.showValidationMessage("Por favor selecciona un motivo de consulta")
        return false
      }
  
      let motivoFinal = motivoConsulta
      if (motivoConsulta === "Otro") {
        const motivoPersonalizado = document.getElementById("motivo-personalizado")
        if (!motivoPersonalizado || !motivoPersonalizado.value.trim()) {
          window.Swal.showValidationMessage("Por favor especifica el motivo de consulta")
          return false
        }
        motivoFinal = motivoPersonalizado.value.trim()
      }
  
      return {
        paciente_id: selectedPatientInput.value === "self" ? null : Number.parseInt(selectedPatientInput.value),
        yo_soy_paciente: selectedPatientInput.value === "self",
        motivo_consulta: motivoFinal,
        urgencia: urgencia,
        notas_adicionales: notasAdicionales.trim(),
      }
    }
  
    /**
     * Procesar solicitud de contacto
     */
    async processContactRequest(professionalData, formData) {
      try {
        console.log("📡 Procesando solicitud de contacto:", formData)
  
        const api = window.apiIntegration?.api || window.apiMockService
        const response = await api.requestProfessionalContact(professionalData.id, formData)
  
        if (response.success) {
          const data = response.data
  
          // Determinar información del paciente para mostrar
          let pacienteInfo = ""
          if (data.paciente) {
            pacienteInfo = `
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 class="font-semibold text-blue-800 mb-2">👤 Paciente</h4>
                <p class="text-sm text-blue-700">
                  <strong>Nombre:</strong> ${data.paciente.nombre} ${data.paciente.apellido || ""}<br>
                  <strong>Edad:</strong> ${data.paciente.edad} años<br>
                  <strong>Relación:</strong> ${data.solicitante.relacion_paciente}<br>
                  <strong>Obra Social:</strong> ${data.paciente.obra_social}
                </p>
              </div>
            `
          }
  
          await window.Swal.fire({
            icon: "success",
            title: "¡Solicitud enviada!",
            html: `
              <div class="text-left">
                <p class="mb-4">Tu solicitud ha sido procesada exitosamente.</p>
                
                ${pacienteInfo}
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-green-800 mb-2">📱 Datos de contacto</h4>
                  <div class="text-sm text-green-700 space-y-2">
                    <p><strong>Profesional:</strong> ${professionalData.nombre}</p>
                    <p><strong>Teléfono:</strong> ${data.contacto_revelado.telefono}</p>
                    <p><strong>Email:</strong> ${data.contacto_revelado.email}</p>
                    <p><strong>Dirección:</strong> ${data.contacto_revelado.lugares_atencion[0].direccion_completa}</p>
                    <p><strong>Horarios:</strong> ${data.contacto_revelado.lugares_atencion[0].horarios_detallados}</p>
                  </div>
                </div>
  
                <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <h4 class="font-semibold text-amber-800 mb-2">📋 Detalles de la solicitud</h4>
                  <div class="text-sm text-amber-700 space-y-1">
                    <p><strong>Motivo:</strong> ${data.detalles_solicitud.motivo_consulta}</p>
                    <p><strong>Urgencia:</strong> ${data.detalles_solicitud.urgencia}</p>
                    ${data.detalles_solicitud.notas_adicionales ? `<p><strong>Notas:</strong> ${data.detalles_solicitud.notas_adicionales}</p>` : ""}
                  </div>
                </div>
  
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p class="text-sm text-blue-700">
                    <strong>Solicitudes restantes:</strong> ${data.solicitudes_restantes}/5
                  </p>
                </div>
              </div>
            `,
            confirmButtonColor: "#0ea5e9",
            confirmButtonText: "Entendido",
            width: "600px",
          })
  
          // Actualizar UI si estamos en la página del profesional
          if (window.profesionalManager) {
            window.profesionalManager.updateSolicitudesUI()
            window.profesionalManager.showContactInfo()
          }
        } else {
          throw new Error(response.message || "Error al procesar solicitud")
        }
      } catch (error) {
        console.error("❌ Error al procesar solicitud:", error)
  
        await window.Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Hubo un problema al procesar tu solicitud. Inténtalo nuevamente.",
          confirmButtonColor: "#0ea5e9",
        })
      }
    }
  
    /**
     * Mostrar modal para agregar nuevo paciente
     */
    async showAddPatientModal() {
      const result = await window.Swal.fire({
        title: "Agregar nuevo paciente",
        html: `
          <div class="text-left max-w-md mx-auto">
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input type="text" id="patient-nombre" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Apellido *</label>
                <input type="text" id="patient-apellido" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
              </div>
            </div>
  
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento *</label>
                <input type="date" id="patient-fecha-nacimiento" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                <select id="patient-genero" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                  <option value="prefiero_no_decir">Prefiero no decir</option>
                </select>
              </div>
            </div>
  
            <div class="mb-3">
              <label class="block text-sm font-medium text-gray-700 mb-1">Relación contigo *</label>
              <select id="patient-relacion" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" required>
                <option value="">Seleccionar</option>
                <option value="hijo">Hijo/a</option>
                <option value="padre">Padre</option>
                <option value="madre">Madre</option>
                <option value="esposo">Esposo</option>
                <option value="esposa">Esposa</option>
                <option value="hermano">Hermano/a</option>
                <option value="abuelo">Abuelo/a</option>
                <option value="nieto">Nieto/a</option>
                <option value="tutelado">Persona bajo mi tutela</option>
                <option value="otro_familiar">Otro familiar</option>
              </select>
            </div>
  
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Obra Social</label>
                <select id="patient-obra-social" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
                  <option value="">Sin obra social</option>
                  <option value="OSDE">OSDE</option>
                  <option value="Swiss Medical">Swiss Medical</option>
                  <option value="OMINT">OMINT</option>
                  <option value="Galeno">Galeno</option>
                  <option value="Medifé">Medifé</option>
                  <option value="PAMI">PAMI</option>
                  <option value="IOMA">IOMA</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Número de afiliado</label>
                <input type="text" id="patient-numero-afiliado" class="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500">
              </div>
            </div>
  
            <div class="text-xs text-gray-500 mt-4">
              * Campos obligatorios
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Agregar paciente",
        cancelButtonText: "Cancelar",
        width: "500px",
        preConfirm: () => {
          return this.validatePatientForm()
        },
      })
  
      if (result.isConfirmed) {
        await this.addNewPatient(result.value)
      }
    }
  
    /**
     * Validar formulario de nuevo paciente
     */
    validatePatientForm() {
      const nombre = document.getElementById("patient-nombre").value.trim()
      const apellido = document.getElementById("patient-apellido").value.trim()
      const fechaNacimiento = document.getElementById("patient-fecha-nacimiento").value
      const genero = document.getElementById("patient-genero").value
      const relacion = document.getElementById("patient-relacion").value
      const obraSocial = document.getElementById("patient-obra-social").value
      const numeroAfiliado = document.getElementById("patient-numero-afiliado").value.trim()
  
      if (!nombre) {
        window.Swal.showValidationMessage("El nombre es obligatorio")
        return false
      }
  
      if (!apellido) {
        window.Swal.showValidationMessage("El apellido es obligatorio")
        return false
      }
  
      if (!fechaNacimiento) {
        window.Swal.showValidationMessage("La fecha de nacimiento es obligatoria")
        return false
      }
  
      if (!genero) {
        window.Swal.showValidationMessage("El género es obligatorio")
        return false
      }
  
      if (!relacion) {
        window.Swal.showValidationMessage("La relación es obligatoria")
        return false
      }
  
      // Calcular edad
      const birthDate = new Date(fechaNacimiento)
      const today = new Date()
      let edad = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
  
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        edad--
      }
  
      return {
        nombre,
        apellido,
        fecha_nacimiento: fechaNacimiento,
        genero,
        relacion,
        obra_social: obraSocial || null,
        numero_afiliado: numeroAfiliado || null,
        edad,
        es_menor: edad < 18,
      }
    }
  
    /**
     * Agregar nuevo paciente
     */
    async addNewPatient(patientData) {
      try {
        console.log("👤 Agregando nuevo paciente:", patientData)
  
        const api = window.apiIntegration?.api || window.apiMockService
        const response = await api.addPatient(patientData)
  
        if (response.success) {
          // Actualizar lista local
          this.patients.push(response.data.patient)
  
          await window.Swal.fire({
            icon: "success",
            title: "Paciente agregado",
            text: `${patientData.nombre} ${patientData.apellido} ha sido agregado exitosamente.`,
            confirmButtonColor: "#0ea5e9",
          })
  
          console.log("✅ Paciente agregado exitosamente")
        } else {
          throw new Error(response.message || "Error al agregar paciente")
        }
      } catch (error) {
        console.error("❌ Error al agregar paciente:", error)
  
        await window.Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Hubo un problema al agregar el paciente. Inténtalo nuevamente.",
          confirmButtonColor: "#0ea5e9",
        })
      }
    }
  }
  
  // No instanciar inmediatamente, esperar a que todo esté listo
  window.patientManager = null
  
  // Función para inicializar PatientManager cuando esté todo listo
  window.initializePatientManager = async () => {
    if (!window.patientManager) {
      console.log("🔗 Inicializando PatientManager...")
      window.patientManager = new PatientManager()
      await window.patientManager.initializeWhenReady()
      console.log("✅ PatientManager inicializado correctamente")
    }
  }
  
  // Inicializar cuando el DOM esté listo y la API disponible
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(window.initializePatientManager, 1500)
  })
  
  // También intentar inicializar si el DOM ya está listo
  if (document.readyState !== "loading") {
    setTimeout(window.initializePatientManager, 1500)
  }
  