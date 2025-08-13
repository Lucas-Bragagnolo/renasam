


/**
 * Gestor del perfil del solicitante
 * Maneja las tabs, formularios y funcionalidades del perfil
 */
class PerfilManager {
  constructor() {
    this.currentTab = 'datos-personales'
    this.isEditing = false
    this.datosYaCargados = false
    this.init()
  }

  async init() {
    this.setupTabs()
    this.setupFormHandlers()
    this.setupImageUpload()
    await this.loadUserData()
  }

  /**
   * Configura el sistema de tabs del perfil
   */
  setupTabs() {
    // Desktop tabs
    const tabButtons = document.querySelectorAll('.perfil-tab-button')
    const tabContents = document.querySelectorAll('.perfil-tab-content')

    tabButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const tabId = e.currentTarget.dataset.tab
        this.switchTab(tabId)
      })
    })

    // Mobile dropdown
    const mobileSelect = document.getElementById('perfil-tabs-select')
    if (mobileSelect) {
      mobileSelect.addEventListener('change', (e) => {
        this.switchTab(e.target.value)
      })
    }
  }

  /**
   * Cambia entre tabs
   */
  switchTab(tabId) {
    // Actualizar botones desktop
    document.querySelectorAll('.perfil-tab-button').forEach(btn => {
      btn.classList.remove('active', 'border-blue-500', 'text-blue-600', 'bg-blue-50')
      btn.classList.add('border-transparent', 'text-gray-600')
    })

    const activeButton = document.querySelector(`[data-tab="${tabId}"]`)
    if (activeButton) {
      activeButton.classList.add('active', 'border-blue-500', 'text-blue-600', 'bg-blue-50')
      activeButton.classList.remove('border-transparent', 'text-gray-600')
    }

    // Actualizar contenido
    document.querySelectorAll('.perfil-tab-content').forEach(content => {
      content.classList.add('hidden')
      content.classList.remove('block')
    })

    const activeContent = document.getElementById(tabId)
    if (activeContent) {
      activeContent.classList.remove('hidden')
      activeContent.classList.add('block')
    }

    // Actualizar dropdown mobile
    const mobileSelect = document.getElementById('perfil-tabs-select')
    if (mobileSelect) {
      mobileSelect.value = tabId
    }

    this.currentTab = tabId
  }

  /**
   * Configura los manejadores de formularios
   */
  setupFormHandlers() {
    // Guardar datos personales
    const btnGuardarDatos = document.getElementById('btn-guardar-datos')
    if (btnGuardarDatos) {
      btnGuardarDatos.addEventListener('click', () => {
        this.guardarDatosPersonales()
      })
    }

    // Guardar información familiar
    const btnGuardarFamiliar = document.getElementById('btn-guardar-familiar')
    if (btnGuardarFamiliar) {
      btnGuardarFamiliar.addEventListener('click', () => {
        this.guardarInformacionFamiliar()
      })
    }

    // Guardar configuración
    const btnGuardarConfig = document.getElementById('btn-guardar-configuracion')
    if (btnGuardarConfig) {
      btnGuardarConfig.addEventListener('click', () => {
        this.guardarConfiguracion()
      })
    }

    // Cambiar contraseña
    const btnCambiarPassword = document.getElementById('btn-cambiar-password')
    if (btnCambiarPassword) {
      btnCambiarPassword.addEventListener('click', () => {
        this.cambiarPassword()
      })
    }

    // Configurar 2FA
    const btnConfigurar2FA = document.getElementById('btn-configurar-2fa')
    if (btnConfigurar2FA) {
      btnConfigurar2FA.addEventListener('click', () => {
        this.configurar2FA()
      })
    }
  }

  /**
   * Configura la subida de imagen de perfil
   */
  setupImageUpload() {
    const btnCambiarFoto = document.getElementById('btn-cambiar-foto')
    if (btnCambiarFoto) {
      btnCambiarFoto.addEventListener('click', () => {
        this.cambiarFotoPerfil()
      })
    }
  }

  /**
   * Carga los datos del usuario desde la API
   */
  async loadUserData() {
    try {
      const userData = await this.getUserDataFromAPI()
      this.populateForm(userData)
      this.datosYaCargados = true
    } catch (error) {
      console.error('Error cargando datos del usuario:', error)
      // Cargar datos por defecto en caso de error
      const defaultData = this.getDefaultUserData()
      this.populateForm(defaultData)
      this.datosYaCargados = true
    }
  }

  /**
   * Obtiene los datos del usuario desde la API
   */
  async getUserDataFromAPI() {
    try {
      const authToken = this.getAuthToken()
      if (!authToken) {
        throw new Error('No hay token de autenticación disponible')
      }

      console.log('🔍 Cargando datos del perfil del solicitante...')

      // Usar la misma API que usa patient-manager para obtener datos del solicitante
      const response = await this.makeAPIRequest(
        'http://190.184.224.217/renasam/api/solicitantes/pacientes',
        'POST',
        { token: authToken }
      )

      console.log('📡 Respuesta de la API para perfil:', response)

      if (response.success && response.solicitante) {
        const solicitante = response.solicitante

        // Mapear los datos de la API a la estructura esperada por el frontend
        return {
          nombreCompleto: `${solicitante.nombre || ''} ${solicitante.apellido || ''}`.trim(),
          dni: solicitante.dni || '',
          email: solicitante.email || '',
          telefono: solicitante.telefono || '',
          direccion: solicitante.direccion || '',
          fechaNacimiento: solicitante.fecha_nacimiento || solicitante.fechaNacimiento || '',
          genero: solicitante.genero || solicitante.sexo || '',
          estadoCivil: solicitante.estado_civil || solicitante.estadoCivil || '',
          ocupacion: solicitante.ocupacion || '',
          cantidadHijos: solicitante.cantidad_hijos || solicitante.cantidadHijos || '0',
          obraSocial: solicitante.obra_social || solicitante.obraSocial || '',
          contactoEmergenciaNombre: solicitante.contacto_emergencia_nombre || solicitante.contactoEmergenciaNombre || '',
          contactoEmergenciaTelefono: solicitante.contacto_emergencia_telefono || solicitante.contactoEmergenciaTelefono || ''
        }
      } else {
        throw new Error('No se pudieron obtener los datos del solicitante')
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario desde API:', error)
      throw error
    }
  }

  /**
   * Obtiene el token de autenticación
   */
  getAuthToken() {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
  }

  /**
   * Realiza una petición a la API
   */
  async makeAPIRequest(endpoint, method = 'GET', data = null) {
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    }

    if (data) {
      config.body = JSON.stringify(data)
    }

    const response = await fetch(endpoint, config)
    return await response.json()
  }

  /**
   * Datos por defecto en caso de error
   */
  getDefaultUserData() {
    return {
      nombreCompleto: '',
      dni: '',
      email: '',
      telefono: '',
      direccion: '',
      fechaNacimiento: '',
      genero: '',
      estadoCivil: '',
      ocupacion: '',
      cantidadHijos: '0',
      obraSocial: '',
      contactoEmergenciaNombre: '',
      contactoEmergenciaTelefono: ''
    }
  }

  /**
   * Llena el formulario con los datos del usuario
   */
  populateForm(userData) {
    const fields = [
      'nombre-completo', 'dni', 'email', 'telefono', 'direccion', 'fecha-nacimiento', 'genero',
      'estado-civil', 'ocupacion', 'cantidad-hijos', 'obra-social',
      'contacto-emergencia-nombre', 'contacto-emergencia-telefono'
    ]

    fields.forEach(fieldId => {
      const field = document.getElementById(fieldId)
      let key = fieldId.replace(/-/g, '')

      // Mapear algunos campos específicos
      if (key === 'fechanacimiento') key = 'fechaNacimiento'
      if (key === 'estadocivil') key = 'estadoCivil'
      if (key === 'cantidadhijos') key = 'cantidadHijos'
      if (key === 'obrasocial') key = 'obraSocial'
      if (key === 'contactoemergencianombre') key = 'contactoEmergenciaNombre'
      if (key === 'contactoemergenciatelefono') key = 'contactoEmergenciaTelefono'

      if (field && userData[key]) {
        field.value = userData[key]
      }
    })
  }

  /**
   * Guarda los datos personales
   */
  async guardarDatosPersonales() {
    const btn = document.getElementById('btn-guardar-datos')
    const originalText = btn.innerHTML

    try {
      // Mostrar loading
      btn.innerHTML = '<span class="material-icons text-sm animate-spin mr-2">refresh</span>Guardando...'
      btn.disabled = true

      // Recopilar datos del formulario
      const datos = {
        nombreCompleto: document.getElementById('nombre-completo').value,
        dni: document.getElementById('dni').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value
      }

      // Validar datos
      if (!this.validarDatosPersonales(datos)) {
        return
      }

      // Simular guardado
      await this.delay(1500)

      // Mostrar éxito
      this.mostrarNotificacion('Datos personales actualizados correctamente', 'success')

    } catch (error) {
      console.error('Error al guardar datos personales:', error)
      this.mostrarNotificacion('Error al guardar los datos', 'error')
    } finally {
      // Restaurar botón
      btn.innerHTML = originalText
      btn.disabled = false
    }
  }

  /**
   * Guarda la información familiar
   */
  async guardarInformacionFamiliar() {
    const btn = document.getElementById('btn-guardar-familiar')
    const originalText = btn.innerHTML

    try {
      btn.innerHTML = '<span class="material-icons text-sm animate-spin mr-2">refresh</span>Guardando...'
      btn.disabled = true

      const datos = {
        estadoCivil: document.getElementById('estado-civil').value,
        ocupacion: document.getElementById('ocupacion').value,
        cantidadHijos: document.getElementById('cantidad-hijos').value,
        obraSocial: document.getElementById('obra-social').value,
        contactoEmergenciaNombre: document.getElementById('contacto-emergencia-nombre').value,
        contactoEmergenciaTelefono: document.getElementById('contacto-emergencia-telefono').value
      }

      await this.delay(1500)
      this.mostrarNotificacion('Información familiar actualizada correctamente', 'success')

    } catch (error) {
      console.error('Error al guardar información familiar:', error)
      this.mostrarNotificacion('Error al guardar la información', 'error')
    } finally {
      btn.innerHTML = originalText
      btn.disabled = false
    }
  }

  /**
   * Guarda la configuración
   */
  async guardarConfiguracion() {
    const btn = document.getElementById('btn-guardar-configuracion')
    const originalText = btn.innerHTML

    try {
      btn.innerHTML = '<span class="material-icons text-sm animate-spin mr-2">refresh</span>Guardando...'
      btn.disabled = true

      await this.delay(1000)
      this.mostrarNotificacion('Configuración guardada correctamente', 'success')

    } catch (error) {
      console.error('Error al guardar configuración:', error)
      this.mostrarNotificacion('Error al guardar la configuración', 'error')
    } finally {
      btn.innerHTML = originalText
      btn.disabled = false
    }
  }

  /**
   * Cambia la contraseña
   */
  async cambiarPassword() {
    const passwordActual = document.getElementById('password-actual').value
    const passwordNueva = document.getElementById('password-nueva').value
    const passwordConfirmar = document.getElementById('password-confirmar').value

    if (!passwordActual || !passwordNueva || !passwordConfirmar) {
      this.mostrarNotificacion('Todos los campos son obligatorios', 'error')
      return
    }

    if (passwordNueva !== passwordConfirmar) {
      this.mostrarNotificacion('Las contraseñas no coinciden', 'error')
      return
    }

    if (passwordNueva.length < 8) {
      this.mostrarNotificacion('La contraseña debe tener al menos 8 caracteres', 'error')
      return
    }

    const btn = document.getElementById('btn-cambiar-password')
    const originalText = btn.innerHTML

    try {
      btn.innerHTML = '<span class="material-icons text-sm animate-spin mr-2">refresh</span>Cambiando...'
      btn.disabled = true

      await this.delay(2000)

      // Limpiar campos
      document.getElementById('password-actual').value = ''
      document.getElementById('password-nueva').value = ''
      document.getElementById('password-confirmar').value = ''

      this.mostrarNotificacion('Contraseña cambiada correctamente', 'success')

    } catch (error) {
      console.error('Error al cambiar contraseña:', error)
      this.mostrarNotificacion('Error al cambiar la contraseña', 'error')
    } finally {
      btn.innerHTML = originalText
      btn.disabled = false
    }
  }

  /**
   * Configura la autenticación de dos factores
   */
  configurar2FA() {
    this.mostrarNotificacion('Funcionalidad de 2FA en desarrollo', 'info')
  }

  /**
   * Cambia la foto de perfil
   */
  cambiarFotoPerfil() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = document.getElementById('foto-perfil-solicitante')
          if (img) {
            img.src = e.target.result
          }
          this.mostrarNotificacion('Foto de perfil actualizada', 'success')
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  /**
   * Valida los datos personales
   */
  validarDatosPersonales(datos) {
    if (!datos.nombreCompleto.trim()) {
      this.mostrarNotificacion('El nombre completo es obligatorio', 'error')
      return false
    }

    if (!datos.email.trim() || !this.validarEmail(datos.email)) {
      this.mostrarNotificacion('Email inválido', 'error')
      return false
    }

    return true
  }

  /**
   * Valida formato de email
   */
  validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  /**
   * Muestra una notificación
   */
  mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div')
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg max-w-sm transition-all duration-300 transform translate-x-full`

    const colors = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
      warning: 'bg-yellow-500 text-white'
    }

    const icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    }

    notification.className += ` ${colors[tipo]}`
    notification.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="material-icons">${icons[tipo]}</span>
          <span class="flex-1">${mensaje}</span>
          <button class="material-icons hover:bg-black hover:bg-opacity-20 rounded p-1" onclick="this.parentElement.parentElement.remove()">close</button>
        </div>
      `

    document.body.appendChild(notification)

    // Animar entrada
    setTimeout(() => {
      notification.classList.remove('translate-x-full')
    }, 100)

    // Auto-remover después de 5 segundos
    setTimeout(() => {
      notification.classList.add('translate-x-full')
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove()
        }
      }, 300)
    }, 5000)
  }

  /**
   * Utilidad para simular delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  window.perfilManager = new PerfilManager()
})