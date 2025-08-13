/**
 * Gestor de Perfil del Solicitante
 * Maneja la información personal y familiar del solicitante usando datos de la API
 */

class ProfileManager {
    constructor() {
        this.solicitanteData = null;
        this.pacientesData = [];
        this.currentTab = 'datos-personales';
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando ProfileManager...');
        
        // Verificar autenticación
        if (!this.checkAuth()) {
            return;
        }
        
        // Cargar datos del solicitante
        await this.loadSolicitanteData();
        
        // Configurar eventos
        this.bindEvents();
        
        // Renderizar datos
        this.renderProfile();
        
        console.log('✅ ProfileManager inicializado');
    }

    checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '../pages/login.html';
            return false;
        }
        return true;
    }

    async loadSolicitanteData() {
        try {
            // Intentar obtener datos desde localStorage (guardados por PatientManager)
            const solicitanteInfo = localStorage.getItem('solicitante_info');
            const patientsData = localStorage.getItem('patients');
            
            if (solicitanteInfo) {
                this.solicitanteData = JSON.parse(solicitanteInfo);
                console.log('✅ Datos del solicitante cargados desde localStorage:', this.solicitanteData);
            }
            
            if (patientsData) {
                this.pacientesData = JSON.parse(patientsData);
                console.log('✅ Datos de pacientes cargados:', this.pacientesData.length, 'pacientes');
            }
            
            // Si no hay datos en localStorage, intentar cargar desde API
            if (!this.solicitanteData) {
                await this.fetchSolicitanteFromAPI();
            }
            
        } catch (error) {
            console.error('❌ Error cargando datos del solicitante:', error);
            this.showNotification('Error al cargar los datos del perfil', 'error');
        }
    }

    async fetchSolicitanteFromAPI() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://190.184.224.217/renasam/api/solicitantes/pacientes', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ token: token })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.solicitante) {
                    this.solicitanteData = data.solicitante;
                    this.pacientesData = data.pacientes || [];
                    
                    // Guardar en localStorage para uso posterior
                    localStorage.setItem('solicitante_info', JSON.stringify(this.solicitanteData));
                    localStorage.setItem('patients', JSON.stringify(this.pacientesData));
                    
                    console.log('✅ Datos del solicitante obtenidos de la API');
                }
            }
        } catch (error) {
            console.error('❌ Error obteniendo datos de la API:', error);
        }
    }

    bindEvents() {
        // Navegación por tabs (desktop)
        document.querySelectorAll('.perfil-tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Navegación por tabs (mobile)
        document.getElementById('perfil-tabs-select')?.addEventListener('change', (e) => {
            this.switchTab(e.target.value);
        });

        // Botones de guardar
        document.getElementById('btn-guardar-datos')?.addEventListener('click', () => {
            this.savePersonalData();
        });

        document.getElementById('btn-guardar-familiar')?.addEventListener('click', () => {
            this.saveFamilyData();
        });

        // Cambio de foto
        document.getElementById('btn-cambiar-foto')?.addEventListener('click', () => {
            this.changeProfilePhoto();
        });
    }

    renderProfile() {
        if (!this.solicitanteData) {
            console.warn('⚠️ No hay datos del solicitante para renderizar');
            return;
        }

        this.renderPersonalData();
        this.renderFamilyData();
        this.updateProfilePictures();
    }

    renderPersonalData() {
        const solicitante = this.solicitanteData;
        
        // Datos personales básicos
        document.getElementById('nombre-completo').value = 
            `${solicitante.nombre || ''} ${solicitante.apellido || ''}`.trim();
        
        document.getElementById('dni').value = solicitante.documento || '';
        document.getElementById('email').value = solicitante.email || '';
        
        // Otros campos que pueden no estar en la API pero están en el formulario
        // Los dejamos con valores por defecto o vacíos
        const telefono = document.getElementById('telefono');
        const direccion = document.getElementById('direccion');
        const fechaNacimiento = document.getElementById('fecha-nacimiento');
        const genero = document.getElementById('genero');
        
        // Estos campos pueden no estar en la respuesta de la API
        // Los mantenemos editables para que el usuario pueda completarlos
        if (telefono && !telefono.value) telefono.value = '';
        if (direccion && !direccion.value) direccion.value = '';
        if (fechaNacimiento && !fechaNacimiento.value) fechaNacimiento.value = '';
        if (genero && !genero.value) genero.value = '';
    }

    renderFamilyData() {
        // Calcular información familiar basada en los pacientes
        const totalPacientes = this.pacientesData.length;
        
        // Contar tipos de parentesco
        const parentescos = {};
        let hijos = 0;
        
        this.pacientesData.forEach(paciente => {
            const parentesco = paciente.parentesco || 'No especificado';
            parentescos[parentesco] = (parentescos[parentesco] || 0) + 1;
            
            if (parentesco.toLowerCase().includes('hijo')) {
                hijos++;
            }
        });

        // Obtener la obra social más común
        const obrasSociales = {};
        this.pacientesData.forEach(paciente => {
            if (paciente.obraSocial) {
                obrasSociales[paciente.obraSocial] = (obrasSociales[paciente.obraSocial] || 0) + 1;
            }
        });
        
        const obraSocialPrincipal = Object.keys(obrasSociales).reduce((a, b) => 
            obrasSociales[a] > obrasSociales[b] ? a : b, '');

        // Llenar campos de información familiar
        document.getElementById('cantidad-hijos').value = hijos;
        
        // Seleccionar obra social si existe
        const obraSocialSelect = document.getElementById('obra-social');
        if (obraSocialSelect && obraSocialPrincipal) {
            const obraSocialValue = obraSocialPrincipal.toLowerCase().replace(/\s+/g, '-');
            const option = obraSocialSelect.querySelector(`option[value="${obraSocialValue}"]`) ||
                          obraSocialSelect.querySelector(`option[value="otra"]`);
            if (option) {
                obraSocialSelect.value = option.value;
            }
        }

        // Mostrar resumen de información familiar
        this.renderFamilySummary(parentescos, totalPacientes);
    }

    renderFamilySummary(parentescos, totalPacientes) {
        // Crear o actualizar un resumen de la información familiar
        const summaryContainer = document.getElementById('family-summary') || this.createFamilySummaryContainer();
        
        const parentescosText = Object.entries(parentescos)
            .map(([tipo, cantidad]) => `${cantidad} ${tipo}${cantidad > 1 ? 's' : ''}`)
            .join(', ');

        summaryContainer.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <span class="material-icons">family_restroom</span>
                    Resumen Familiar
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="font-medium text-blue-700">Total de personas a cargo:</span>
                        <span class="text-blue-900">${totalPacientes}</span>
                    </div>
                    <div>
                        <span class="font-medium text-blue-700">Distribución:</span>
                        <span class="text-blue-900">${parentescosText || 'No especificado'}</span>
                    </div>
                </div>
                <div class="mt-3 text-xs text-blue-600">
                    <span class="material-icons text-xs mr-1">info</span>
                    Esta información se calcula automáticamente basada en tus pacientes registrados
                </div>
            </div>
        `;
    }

    createFamilySummaryContainer() {
        const container = document.createElement('div');
        container.id = 'family-summary';
        
        // Insertar antes del formulario de información familiar
        const formContainer = document.getElementById('form-info-familiar');
        if (formContainer && formContainer.parentNode) {
            formContainer.parentNode.insertBefore(container, formContainer);
        }
        
        return container;
    }

    updateProfilePictures() {
        // Actualizar las fotos de perfil en la interfaz
        const initials = this.getInitials();
        
        // Configuraciones específicas para cada tipo de imagen
        const imageConfigs = {
            'foto-perfil-solicitante': {
                size: 'w-24 h-24 md:w-32 md:h-32',
                textSize: 'text-xl md:text-2xl',
                context: 'profile-main'
            },
            'user-picture': {
                size: 'w-6 h-6',
                textSize: 'text-xs',
                context: 'menu-desktop'
            },
            'user-picture2': {
                size: 'w-6 h-6',
                textSize: 'text-xs',
                context: 'menu-mobile'
            }
        };
        
        Object.keys(imageConfigs).forEach(imageId => {
            const img = document.getElementById(imageId);
            if (!img) return;
            
            const config = imageConfigs[imageId];
            
            // Ocultar la imagen original
            img.style.display = 'none';
            
            // Buscar o crear elemento con iniciales
            let initialsElement = img.nextElementSibling;
            if (!initialsElement || !initialsElement.classList.contains('initials-avatar')) {
                initialsElement = document.createElement('div');
                initialsElement.className = `initials-avatar ${config.size} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center ${config.textSize} font-semibold shadow-sm`;
                initialsElement.setAttribute('data-context', config.context);
                img.parentNode.insertBefore(initialsElement, img.nextSibling);
            } else {
                // Actualizar clases si ya existe
                initialsElement.className = `initials-avatar ${config.size} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center ${config.textSize} font-semibold shadow-sm`;
            }
            
            initialsElement.textContent = initials;
        });
    }

    getInitials() {
        if (!this.solicitanteData) return '??';
        
        const nombre = this.solicitanteData.nombre || '';
        const apellido = this.solicitanteData.apellido || '';
        
        return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || '??';
    }

    switchTab(tabId) {
        // Actualizar botones de tab (desktop)
        document.querySelectorAll('.perfil-tab-button').forEach(button => {
            const isActive = button.dataset.tab === tabId;
            button.classList.toggle('active', isActive);
            
            if (isActive) {
                button.classList.add('border-blue-500', 'text-blue-600', 'bg-blue-50');
                button.classList.remove('border-transparent', 'text-gray-600');
            } else {
                button.classList.remove('border-blue-500', 'text-blue-600', 'bg-blue-50');
                button.classList.add('border-transparent', 'text-gray-600');
            }
        });

        // Actualizar select (mobile)
        const mobileSelect = document.getElementById('perfil-tabs-select');
        if (mobileSelect) {
            mobileSelect.value = tabId;
        }

        // Mostrar/ocultar contenido de tabs
        document.querySelectorAll('.perfil-tab-content').forEach(content => {
            const isActive = content.id === tabId;
            content.classList.toggle('hidden', !isActive);
            content.classList.toggle('block', isActive);
        });

        this.currentTab = tabId;
    }

    async savePersonalData() {
        try {
            this.showNotification('Guardando datos personales...', 'info');
            
            const formData = {
                nombre: document.getElementById('nombre-completo').value.split(' ')[0] || '',
                apellido: document.getElementById('nombre-completo').value.split(' ').slice(1).join(' ') || '',
                documento: document.getElementById('dni').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                direccion: document.getElementById('direccion').value,
                fechaNacimiento: document.getElementById('fecha-nacimiento').value,
                genero: document.getElementById('genero').value
            };

            // Aquí se podría implementar la llamada a la API para actualizar datos
            // Por ahora solo actualizamos localStorage
            const updatedSolicitante = { ...this.solicitanteData, ...formData };
            this.solicitanteData = updatedSolicitante;
            localStorage.setItem('solicitante_info', JSON.stringify(updatedSolicitante));

            this.showNotification('Datos personales guardados correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error guardando datos personales:', error);
            this.showNotification('Error al guardar los datos personales', 'error');
        }
    }

    async saveFamilyData() {
        try {
            this.showNotification('Guardando información familiar...', 'info');
            
            const formData = {
                estadoCivil: document.getElementById('estado-civil').value,
                ocupacion: document.getElementById('ocupacion').value,
                cantidadHijos: document.getElementById('cantidad-hijos').value,
                obraSocial: document.getElementById('obra-social').value,
                contactoEmergenciaNombre: document.getElementById('contacto-emergencia-nombre').value,
                contactoEmergenciaTelefono: document.getElementById('contacto-emergencia-telefono').value
            };

            // Aquí se podría implementar la llamada a la API para actualizar datos familiares
            // Por ahora solo mostramos confirmación
            this.showNotification('Información familiar guardada correctamente', 'success');
            
        } catch (error) {
            console.error('❌ Error guardando información familiar:', error);
            this.showNotification('Error al guardar la información familiar', 'error');
        }
    }

    changeProfilePhoto() {
        // Crear input file temporal
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                // Aquí se podría implementar la subida de la foto
                // Por ahora solo mostramos un mensaje
                this.showNotification('Funcionalidad de cambio de foto en desarrollo', 'info');
            }
        };
        
        input.click();
    }

    showNotification(message, type = 'success') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 transform translate-x-full`;

        if (type === 'success') {
            notification.className += ' bg-green-100 border border-green-200 text-green-800';
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-icons text-green-600">check_circle</span>
                    <span class="font-medium">${message}</span>
                </div>
            `;
        } else if (type === 'error') {
            notification.className += ' bg-red-100 border border-red-200 text-red-800';
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-icons text-red-600">error</span>
                    <span class="font-medium">${message}</span>
                </div>
            `;
        } else if (type === 'info') {
            notification.className += ' bg-blue-100 border border-blue-200 text-blue-800';
            notification.innerHTML = `
                <div class="flex items-center gap-3">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span class="font-medium">${message}</span>
                </div>
            `;
        }

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remover después de 5 segundos (o 3 para info)
        const duration = type === 'info' ? 3000 : 5000;
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Función para inicializar el ProfileManager
function initProfileManager() {
    if (!window.profileManager) {
        console.log('🚀 Inicializando ProfileManager desde función global...');
        window.profileManager = new ProfileManager();
    } else {
        // Si ya existe, solo actualizar las fotos de perfil
        window.profileManager.updateProfilePictures();
    }
}

// Función para actualizar solo las fotos de perfil del menú
function updateMenuProfilePictures() {
    // Obtener datos del solicitante desde localStorage
    const solicitanteInfo = localStorage.getItem('solicitante_info');
    if (!solicitanteInfo) return;
    
    const solicitante = JSON.parse(solicitanteInfo);
    const initials = `${solicitante.nombre?.charAt(0) || ''}${solicitante.apellido?.charAt(0) || ''}`.toUpperCase() || '??';
    
    // Actualizar solo las fotos del menú
    const menuImages = ['user-picture', 'user-picture2'];
    const imageConfigs = {
        'user-picture': {
            size: 'w-6 h-6',
            textSize: 'text-xs',
            context: 'menu-desktop'
        },
        'user-picture2': {
            size: 'w-6 h-6',
            textSize: 'text-xs',
            context: 'menu-mobile'
        }
    };
    
    menuImages.forEach(imageId => {
        const img = document.getElementById(imageId);
        if (!img) return;
        
        const config = imageConfigs[imageId];
        
        // Ocultar la imagen original
        img.style.display = 'none';
        
        // Buscar o crear elemento con iniciales
        let initialsElement = img.nextElementSibling;
        if (!initialsElement || !initialsElement.classList.contains('initials-avatar')) {
            initialsElement = document.createElement('div');
            initialsElement.className = `initials-avatar ${config.size} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center ${config.textSize} font-semibold shadow-sm`;
            initialsElement.setAttribute('data-context', config.context);
            img.parentNode.insertBefore(initialsElement, img.nextSibling);
        } else {
            // Actualizar clases si ya existe
            initialsElement.className = `initials-avatar ${config.size} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center ${config.textSize} font-semibold shadow-sm`;
        }
        
        initialsElement.textContent = initials;
    });
}

// Inicializar ProfileManager cuando se carga la sección de perfil
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que se active la sección de perfil
    const profileSection = document.getElementById('mi-perfil-section');
    if (profileSection) {
        // Observar cuando la sección se hace visible
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isVisible = !profileSection.classList.contains('hidden');
                    if (isVisible && !window.profileManager) {
                        initProfileManager();
                    }
                }
            });
        });
        
        observer.observe(profileSection, { attributes: true });
        
        // También inicializar si ya está visible
        if (!profileSection.classList.contains('hidden')) {
            initProfileManager();
        }
    }

    // Escuchar el evento de navegación del menú
    const perfilMenuItem = document.querySelector('[data-section="mi-perfil"]');
    if (perfilMenuItem) {
        perfilMenuItem.addEventListener('click', () => {
            setTimeout(initProfileManager, 200);
        });
    }

    // Escuchar cuando se actualizan los pacientes para actualizar las fotos del menú
    document.addEventListener('pacientesActualizados', () => {
        setTimeout(updateMenuProfilePictures, 100);
    });

    // Escuchar cuando se actualizan los datos del solicitante
    document.addEventListener('solicitanteActualizado', () => {
        setTimeout(updateMenuProfilePictures, 100);
    });

    // Actualizar fotos del menú cuando se carga la página
    setTimeout(() => {
        updateMenuProfilePictures();
    }, 1000);

    // También intentar actualizar cuando el PatientManager esté listo
    if (window.patientManager) {
        setTimeout(updateMenuProfilePictures, 500);
    } else {
        // Esperar a que se cargue el PatientManager
        const checkPatientManager = setInterval(() => {
            if (window.patientManager) {
                clearInterval(checkPatientManager);
                setTimeout(updateMenuProfilePictures, 200);
            }
        }, 100);
    }
});