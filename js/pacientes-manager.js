/**
 * Gestor simple de pacientes
 * Carga y muestra los pacientes del solicitante
 */

class PacientesManager {
    constructor() {
        this.pacientes = [];
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando PacientesManager...');
        
        // Verificar autenticación
        if (!this.checkAuth()) {
            console.error('❌ No hay autenticación válida');
            return;
        }

        // Cargar pacientes
        await this.loadPacientes();
        
        // Renderizar pacientes
        this.renderPacientes();
    }

    checkAuth() {
        const token = localStorage.getItem('auth_token');
        return !!token;
    }

    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    async makeAPIRequest(url, method = 'POST', data = null) {
        const token = this.getAuthToken();

        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const config = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            console.error('❌ Error en la API:', response.status, response.statusText);
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    async loadPacientes() {
        try {
            console.log('📡 Cargando pacientes desde la API...');
            
            const authToken = this.getAuthToken();
            
            // Usar la misma API que usa perfil-manager
            const response = await this.makeAPIRequest(
                'http://190.184.224.217/renasam/api/solicitantes/pacientes',
                'POST',
                { token: authToken }
            );

            console.log('📡 Respuesta de la API:', response);

            if (response.success && response.pacientes) {
                this.pacientes = response.pacientes;
                console.log('✅ Pacientes cargados:', this.pacientes.length);
            } else {
                console.warn('⚠️ No se encontraron pacientes o respuesta inválida');
                this.pacientes = [];
            }

        } catch (error) {
            console.error('❌ Error al cargar pacientes:', error);
            this.pacientes = [];
        }
    }

    renderPacientes() {
        const container = document.getElementById('pacientes-container');
        const emptyState = document.getElementById('empty-state');

        if (!container) {
            console.error('❌ No se encontró el contenedor de pacientes');
            return;
        }

        // Limpiar contenedor
        container.innerHTML = '';

        if (this.pacientes.length === 0) {
            // Mostrar estado vacío
            if (emptyState) {
                emptyState.classList.remove('hidden');
            }
            console.log('📝 Mostrando estado vacío - no hay pacientes');
            return;
        }

        // Ocultar estado vacío
        if (emptyState) {
            emptyState.classList.add('hidden');
        }

        // Renderizar cada paciente
        this.pacientes.forEach(paciente => {
            const pacienteCard = this.createPacienteCard(paciente);
            container.appendChild(pacienteCard);
        });

        console.log('✅ Pacientes renderizados:', this.pacientes.length);
    }

    createPacienteCard(paciente) {
        const card = document.createElement('div');
        card.className = 'patient-card border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-200';
        
        // Calcular edad si hay fecha de nacimiento
        let edad = 'No especificada';
        if (paciente.edad) {
            edad = `${paciente.edad} años`;
        }

        // Obtener diagnóstico principal
        const diagnostico = paciente.diagnostico || 'Sin diagnóstico';

        card.innerHTML = `
            <!-- Desktop view -->
            <div class="hidden md:grid md:grid-cols-6 gap-4 items-center">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span class="material-icons text-blue-600 text-sm">person</span>
                    </div>
                    <div>
                        <div class="font-medium text-gray-900">${paciente.paciente || 'Sin nombre'}</div>
                        <div class="text-sm text-gray-600">${paciente.parentesco || 'Sin parentesco'}</div>
                    </div>
                </div>
                <div class="text-gray-700">${paciente.documento || 'Sin DNI'}</div>
                <div class="text-gray-700">${edad}</div>
                <div class="text-gray-700">${diagnostico}</div>
                <div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            onclick="pacientesManager.viewPaciente(${paciente.paciente_id})" 
                            title="Ver detalles">
                        <span class="material-icons text-sm">visibility</span>
                    </button>
                    <button class="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors" 
                            onclick="pacientesManager.editPaciente(${paciente.paciente_id})" 
                            title="Editar">
                        <span class="material-icons text-sm">edit</span>
                    </button>
                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            onclick="pacientesManager.deletePaciente(${paciente.paciente_id})" 
                            title="Eliminar">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </div>
            </div>

            <!-- Mobile view -->
            <div class="md:hidden">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span class="material-icons text-blue-600">person</span>
                        </div>
                        <div>
                            <div class="font-medium text-gray-900">${paciente.paciente || 'Sin nombre'}</div>
                            <div class="text-sm text-gray-600">${paciente.documento || 'Sin DNI'}</div>
                        </div>
                    </div>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Activo
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                        <span class="text-gray-500">Edad:</span>
                        <span class="text-gray-900 ml-1">${edad}</span>
                    </div>
                    <div>
                        <span class="text-gray-500">Parentesco:</span>
                        <span class="text-gray-900 ml-1">${paciente.parentesco || 'Sin especificar'}</span>
                    </div>
                </div>
                <div class="text-sm mb-3">
                    <span class="text-gray-500">Diagnóstico:</span>
                    <span class="text-gray-900 ml-1">${diagnostico}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button class="flex-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors" 
                            onclick="pacientesManager.viewPaciente(${paciente.paciente_id})">
                        <span class="material-icons text-sm mr-1">visibility</span>
                        Ver
                    </button>
                    <button class="flex-1 bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors" 
                            onclick="pacientesManager.editPaciente(${paciente.paciente_id})">
                        <span class="material-icons text-sm mr-1">edit</span>
                        Editar
                    </button>
                    <button class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            onclick="pacientesManager.deletePaciente(${paciente.paciente_id})" 
                            title="Eliminar">
                        <span class="material-icons text-sm">delete</span>
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Métodos placeholder para las acciones
    viewPaciente(id) {
        console.log('👁️ Ver paciente:', id);
        // TODO: Implementar vista de detalles
    }

    editPaciente(id) {
        console.log('✏️ Editar paciente:', id);
        // TODO: Implementar edición
    }

    deletePaciente(id) {
        console.log('🗑️ Eliminar paciente:', id);
        // TODO: Implementar eliminación
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página de pacientes
    if (document.getElementById('pacientes-section')) {
        window.pacientesManager = new PacientesManager();
    }
});

// También inicializar cuando se navegue a la sección de pacientes
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-section="pacientes"]');
    if (target && !window.pacientesManager) {
        setTimeout(() => {
            window.pacientesManager = new PacientesManager();
        }, 100);
    }
});