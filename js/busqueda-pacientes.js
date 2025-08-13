/**
 * Integración entre búsqueda y gestión de pacientes
 * Maneja la selección de pacientes para búsquedas
 */

class BusquedaPacientes {
    constructor() {
        this.pacienteSeleccionado = null;
        this.pacientes = [];
        this.init();
    }

    async init() {
        await this.cargarPacientes();
        this.renderizarPacientes();
        this.configurarEventos();
    }

    async cargarPacientes() {
        try {
            console.log('🔍 Iniciando carga de pacientes para búsqueda...');
            
            // Primero intentar cargar desde patientManager si está disponible
            if (window.patientManager) {
                console.log('📡 PatientManager disponible, cargando desde API...');
                await window.patientManager.loadPatients();
                this.pacientes = window.patientManager.patients || [];
                console.log('✅ Pacientes cargados desde PatientManager:', this.pacientes.length);
                
                if (this.pacientes.length > 0) {
                    return;
                }
            }

            // Si patientManager no está disponible o no tiene pacientes, intentar localStorage
            const pacientesGuardados = localStorage.getItem('patients');
            if (pacientesGuardados) {
                this.pacientes = JSON.parse(pacientesGuardados);
                console.log('✅ Pacientes cargados desde localStorage:', this.pacientes.length);
                return;
            }

            // Si no hay pacientes en ningún lado, intentar cargar directamente desde API
            console.log('🔄 Intentando cargar directamente desde API...');
            await this.cargarDesdeAPI();
            
        } catch (error) {
            console.warn('⚠️ Error cargando pacientes:', error);
            this.pacientes = [];
        }
    }

    async cargarDesdeAPI() {
        try {
            const authToken = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (!authToken) {
                console.warn('⚠️ No hay token de autenticación disponible');
                return;
            }

            console.log('📡 Cargando pacientes directamente desde API...');
            
            const response = await fetch('http://190.184.224.217/renasam/api/pacientes_solicitante.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: authToken })
            });

            const data = await response.json();
            console.log('📦 Respuesta de la API:', data);

            if (data.success) {
                let pacientesExtraidos = [];
                
                if (data.pacientes && Array.isArray(data.pacientes)) {
                    pacientesExtraidos = data.pacientes;
                } else if (data.data && data.data.pacientes) {
                    pacientesExtraidos = data.data.pacientes;
                } else if (Array.isArray(data.data)) {
                    pacientesExtraidos = data.data;
                }

                // Normalizar los datos
                this.pacientes = this.normalizarDatosPacientes(pacientesExtraidos);
                console.log('✅ Pacientes normalizados:', this.pacientes.length);
                
                // Guardar en localStorage para futuras consultas
                localStorage.setItem('patients', JSON.stringify(this.pacientes));
            }
        } catch (error) {
            console.error('❌ Error cargando desde API:', error);
        }
    }

    normalizarDatosPacientes(pacientesAPI) {
        return pacientesAPI.map(paciente => ({
            id: paciente.id || paciente.paciente_id,
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            dni: paciente.dni,
            fechaNacimiento: paciente.fecha_nacimiento || paciente.fechaNacimiento,
            edad: paciente.edad || this.calcularEdad(paciente.fecha_nacimiento || paciente.fechaNacimiento),
            diagnosticoPrincipal: paciente.diagnostico_principal || paciente.diagnosticoPrincipal,
            parentesco: paciente.parentesco,
            estado: paciente.estado || 'activo'
        }));
    }

    renderizarPacientes() {
        const container = document.getElementById('pacientes-selector');
        const emptyMessage = document.getElementById('no-pacientes-message');
        const btnContinuar = document.getElementById('btn-continuar-paciente');

        if (!container) return;

        if (this.pacientes.length === 0) {
            container.classList.add('hidden');
            emptyMessage?.classList.remove('hidden');
            btnContinuar.disabled = true;
            return;
        }

        container.classList.remove('hidden');
        emptyMessage?.classList.add('hidden');

        container.innerHTML = this.pacientes.map(paciente => this.crearTarjetaPaciente(paciente)).join('');
        
        // Configurar eventos de selección
        this.configurarSeleccionPacientes();
    }

    crearTarjetaPaciente(paciente) {
        const edad = paciente.edad || this.calcularEdad(paciente.fechaNacimiento) || 'No especificada';
        
        return `
            <div class="patient-option border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200" 
                 data-patient-id="${paciente.id}">
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="material-icons text-blue-600">person</span>
                    </div>
                    <div class="flex-1 text-left min-w-0">
                        <h3 class="font-semibold text-gray-900 truncate">${paciente.nombre} ${paciente.apellido}</h3>
                        <div class="flex flex-col sm:flex-row sm:gap-4 text-sm text-gray-600">
                            <span>DNI: ${paciente.dni}</span>
                            <span>Edad: ${edad}</span>
                        </div>
                        ${paciente.diagnosticoPrincipal ? `
                            <div class="mt-2">
                                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    ${paciente.diagnosticoPrincipal}
                                </span>
                            </div>
                        ` : ''}
                        ${paciente.parentesco ? `
                            <div class="mt-1">
                                <span class="text-xs text-gray-500">
                                    Parentesco: ${paciente.parentesco}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="radio-indicator w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <div class="w-3 h-3 bg-blue-500 rounded-full hidden selected-dot"></div>
                    </div>
                </div>
            </div>
        `;
    }

    configurarSeleccionPacientes() {
        const opciones = document.querySelectorAll('.patient-option');
        opciones.forEach(opcion => {
            opcion.addEventListener('click', () => {
                this.seleccionarPaciente(opcion);
            });
        });
    }

    seleccionarPaciente(opcionSeleccionada) {
        const btnContinuar = document.getElementById('btn-continuar-paciente');
        
        // Remover selección anterior
        document.querySelectorAll('.patient-option').forEach(opcion => {
            opcion.classList.remove('border-blue-500', 'bg-blue-50');
            opcion.querySelector('.selected-dot')?.classList.add('hidden');
            const indicator = opcion.querySelector('.radio-indicator');
            indicator.classList.remove('border-blue-500');
            indicator.classList.add('border-gray-300');
        });

        // Marcar como seleccionado
        opcionSeleccionada.classList.add('border-blue-500', 'bg-blue-50');
        opcionSeleccionada.querySelector('.selected-dot')?.classList.remove('hidden');
        const indicator = opcionSeleccionada.querySelector('.radio-indicator');
        indicator.classList.add('border-blue-500');
        indicator.classList.remove('border-gray-300');

        // Obtener datos del paciente
        const patientId = opcionSeleccionada.dataset.patientId;
        this.pacienteSeleccionado = this.pacientes.find(p => p.id == patientId);
        
        // Actualizar variable global para compatibilidad
        if (window.pacienteElegido !== undefined) {
            window.pacienteElegido = this.pacienteSeleccionado;
        }
        
        // Habilitar botón continuar
        btnContinuar.disabled = false;
        
        console.log('Paciente seleccionado:', this.pacienteSeleccionado);
        
        // Disparar evento personalizado
        document.dispatchEvent(new CustomEvent('pacienteSeleccionado', {
            detail: this.pacienteSeleccionado
        }));
    }

    configurarEventos() {
        // Botón para ir a la sección de pacientes
        const btnIrAPacientes = document.getElementById('btn-ir-a-pacientes');
        if (btnIrAPacientes) {
            btnIrAPacientes.addEventListener('click', () => {
                const pacientesItem = document.querySelector('[data-section="pacientes"]');
                if (pacientesItem) {
                    pacientesItem.click();
                }
            });
        }

        // Escuchar cuando se agreguen nuevos pacientes
        document.addEventListener('pacienteAgregado', () => {
            this.cargarPacientes().then(() => {
                this.renderizarPacientes();
            });
        });

        // Escuchar cuando se actualicen pacientes
        document.addEventListener('pacientesActualizados', () => {
            this.cargarPacientes().then(() => {
                this.renderizarPacientes();
            });
        });
    }

    calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return null;
        
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        return edad;
    }

    // Método público para obtener el paciente seleccionado
    getPacienteSeleccionado() {
        return this.pacienteSeleccionado;
    }

    // Método público para refrescar la lista
    async refrescar() {
        await this.cargarPacientes();
        this.renderizarPacientes();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página correcta
    if (document.getElementById('pacientes-selector')) {
        console.log('🚀 Inicializando BusquedaPacientes...');
        window.busquedaPacientes = new BusquedaPacientes();
    }
});

// También inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    // DOM aún se está cargando
} else {
    // DOM ya está listo
    if (document.getElementById('pacientes-selector') && !window.busquedaPacientes) {
        console.log('🚀 Inicializando BusquedaPacientes (DOM ya listo)...');
        window.busquedaPacientes = new BusquedaPacientes();
    }
}