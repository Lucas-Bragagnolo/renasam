/**
 * Gestor de Pacientes
 * Maneja todas las operaciones CRUD para los pacientes a cargo con vistas en pantalla
 */

// ===== CONFIGURACIÓN DE LA API =====
const API_CONFIG = {
    baseURL: 'http://190.184.224.217/renasam/api',
    endpoints: {
        patients: '/solicitantes/pacientes',
        createPatient: '/pacientes/agregar',
        updatePatient: '/pacientes/modificar',
        deletePatient: '/pacientes/eliminar'
    }
};

class PatientManager {
    constructor() {
        this.patients = [];
        this.currentPatient = null;
        this.currentPage = 1;
        this.patientsPerPage = 10;
        this.filteredPatients = [];
        this.currentView = 'lista'; // 'lista', 'form', 'detail'

        this.init();
    }

    // ===== UTILIDADES DE API =====
    getAuthToken() {
        return localStorage.getItem('auth_token');
    }

    getUserData() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    }

    async makeAPIRequest(endpoint, method = 'POST', data = null) {
        const token = this.getAuthToken();

        if (!token) {
            throw new Error('No hay token de autenticación. Por favor, inicia sesión nuevamente.');
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

        const response = await fetch(`${API_CONFIG.baseURL}${endpoint}`, config);

        if (!response.ok) {
            // 🔍 LOGGING DETALLADO DE ERRORES
            console.error('❌ ===== ERROR EN LA API =====');
            console.error('🌐 URL:', `${API_CONFIG.baseURL}${endpoint}`);
            console.error('🔧 Método:', method);
            console.error('📊 Status:', response.status);
            console.error('📝 Status Text:', response.statusText);
            console.error('📋 Headers enviados:', config.headers);
            if (config.body) {
                console.error('📦 Body enviado:', config.body);
            }

            if (response.status === 401) {
                // Token expirado o inválido
                console.error('🔑 Token inválido o expirado');
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('user_type');
                window.location.href = '../pages/login.html';
                return;
            }

            // Intentar obtener más detalles del error
            let errorData = {};
            try {
                errorData = await response.json();
                console.error('📄 Respuesta de error del servidor:', JSON.stringify(errorData, null, 2));
            } catch (e) {
                console.error('⚠️ No se pudo parsear la respuesta de error como JSON');
                try {
                    const textError = await response.text();
                    console.error('📄 Respuesta de error (texto):', textError);
                } catch (e2) {
                    console.error('💥 No se pudo obtener ninguna respuesta del servidor');
                }
            }

            console.error('===============================');

            throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
        }

        return await response.json();
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

    setLoadingState(isLoading) {
        const saveBtn = document.getElementById('btn-guardar-form');
        const cancelBtn = document.getElementById('btn-cancelar-form-bottom');

        if (isLoading) {
            saveBtn.disabled = true;
            saveBtn.classList.add('opacity-75', 'cursor-not-allowed');
            saveBtn.innerHTML = `
                <div class="flex items-center justify-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Guardando...</span>
                </div>
            `;
            cancelBtn.disabled = true;
        } else {
            saveBtn.disabled = false;
            saveBtn.classList.remove('opacity-75', 'cursor-not-allowed');
            saveBtn.innerHTML = `
                <span class="material-icons">save</span>
                Guardar Paciente
            `;
            cancelBtn.disabled = false;
        }
    }

    async init() {
        console.log('🚀 Inicializando PatientManager...');

        // Verificar autenticación
        if (!this.checkAuth()) {
            console.error('❌ Falló la verificación de autenticación');
            return;
        }

        console.log('✅ Autenticación verificada, cargando pacientes...');
        await this.loadPatients();

        console.log('✅ Pacientes cargados, configurando eventos...');
        this.bindEvents();

        console.log('✅ Eventos configurados, renderizando...');
        this.renderPatients();

        console.log('✅ Mostrando vista de lista...');
        this.showView('lista');

        console.log('🎉 PatientManager inicializado completamente');
    }

    checkAuth() {
        const token = this.getAuthToken();
        const userData = this.getUserData();
        const userType = localStorage.getItem('user_type');

        console.log('🔍 Verificando autenticación...');
        console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
        console.log('👤 UserData:', userData ? 'Presente' : 'Ausente');
        console.log('🏷️ UserType:', userType);

        // Solo verificar que haya token, ser más flexible con el resto
        if (!token) {
            console.warn('⚠️ No hay token de autenticación');
            window.location.href = '../pages/login.html';
            return false;
        }

        console.log('✅ Usuario autenticado con token');
        return true;
    }

    // ===== EVENTOS =====
    bindEvents() {
        // Botones agregar paciente
        document.getElementById('btn-agregar-paciente')?.addEventListener('click', () => {
            console.log('🔘 Click en btn-agregar-paciente');
            this.showFormView();
        });

        document.getElementById('btn-agregar-primer-paciente')?.addEventListener('click', () => {
            console.log('🔘 Click en btn-agregar-primer-paciente');
            this.showFormView();
        });

        // Botones de navegación
        document.getElementById('btn-volver-lista')?.addEventListener('click', () => {
            this.showView('lista');
        });

        document.getElementById('btn-volver-detalle')?.addEventListener('click', () => {
            this.showView('lista');
        });

        // Botones del formulario
        document.getElementById('btn-cancelar-form')?.addEventListener('click', () => {
            this.showView('lista');
        });

        document.getElementById('btn-cancelar-form-bottom')?.addEventListener('click', () => {
            this.showView('lista');
        });

        document.getElementById('btn-guardar-form')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.savePatient();
        });

        // Botón agregar medicación
        document.getElementById('btn-agregar-medicacion')?.addEventListener('click', () => {
            this.addMedicacionItem();
        });

        // Botón agregar entrada de historia clínica
        document.getElementById('btn-agregar-entrada-historia')?.addEventListener('click', () => {
            this.addHistoriaClinicaEntry();
        });

        // Preview de foto
        document.getElementById('paciente-foto-perfil')?.addEventListener('change', (e) => {
            this.previewFoto(e.target.files[0]);
        });

        // Botones de detalles
        document.getElementById('btn-editar-detalle')?.addEventListener('click', () => {
            this.showFormView(this.currentPatient);
        });

        document.getElementById('btn-eliminar-detalle')?.addEventListener('click', () => {
            this.confirmDelete();
        });

        // Formulario
        document.getElementById('form-paciente')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.savePatient();
        });

        // Búsqueda
        document.getElementById('search-pacientes')?.addEventListener('input', (e) => {
            this.searchPatients(e.target.value);
        });

        // Filtro por estado
        document.getElementById('filter-estado')?.addEventListener('change', (e) => {
            this.filterByStatus(e.target.value);
        });
    }

    // ===== DATOS =====
    async loadPatients() {
        console.log('📡 Iniciando carga de pacientes...');
        try {
            // Verificar que tenemos auth_token
            const authToken = this.getAuthToken();
            if (!authToken) {
                console.error('❌ No hay token de autenticación disponible');
                throw new Error('No hay token de autenticación disponible');
            }
            console.log('✅ Token de autenticación encontrado');

            console.log('🔍 Cargando pacientes del solicitante con auth_token:', authToken);

            // Cargar pacientes asociados al solicitante desde la API
            const response = await this.makeAPIRequest(
                API_CONFIG.endpoints.patients,
                'POST',
                { token: authToken }
            );

            // 🔍 LOGGING DETALLADO DE LA RESPUESTA DE LA API
            console.log('🌐 ===== RESPUESTA COMPLETA DE LA API =====');
            console.log('📡 Endpoint:', API_CONFIG.endpoints.patients);
            console.log('🔄 Response object completo:', response);
            console.log('✅ Success:', response.success);
            console.log('📊 Status:', response.status || 'No status');
            console.log('📦 Data completa:', JSON.stringify(response.data, null, 2));
            console.log('🔍 Tipo de data:', typeof response.data);
            console.log('🏗️ Estructura de data:', response.data ? Object.keys(response.data) : 'No data');
            console.log('===============================================');

            if (response.success) {
                // Extraer pacientes según la estructura real de tu API
                let pacientesExtraidos = [];

                if (response.pacientes && Array.isArray(response.pacientes)) {
                    // Estructura: { success: true, pacientes: [...], solicitante: {...} }
                    pacientesExtraidos = response.pacientes;
                    console.log('📋 Pacientes encontrados en response.pacientes');
                    console.log('📊 Total según API:', response.total_pacientes || response.pacientes.length);
                } else if (response.data && response.data.pacientes) {
                    // Estructura alternativa: { success: true, data: { pacientes: [...] } }
                    pacientesExtraidos = response.data.pacientes;
                    console.log('📋 Pacientes encontrados en response.data.pacientes');
                } else if (Array.isArray(response.data)) {
                    // Estructura: { success: true, data: [...] }
                    pacientesExtraidos = response.data;
                    console.log('📋 Response.data es un array directo');
                } else {
                    pacientesExtraidos = [];
                    console.log('⚠️ No se encontraron pacientes en la estructura de respuesta');
                }

                // Normalizar los datos de la API a la estructura esperada por el frontend
                console.log('🔄 Normalizando datos de la API...');
                console.log('📥 Datos originales de la API:', pacientesExtraidos);
                this.patients = this.normalizePatientData(pacientesExtraidos);
                console.log('📤 Datos normalizados:', this.patients);

                // Logging detallado del primer paciente para verificar normalización
                if (this.patients.length > 0) {
                    console.log('🔍 Ejemplo de normalización (primer paciente):');
                    console.log('📥 Original:', pacientesExtraidos[0]);
                    console.log('📤 Normalizado:', this.patients[0]);
                }
                this.saveToStorage(); // Guardar en localStorage como backup
                console.log('✅ Pacientes finalmente asignados:', this.patients);
                console.log('📊 Total de pacientes encontrados:', this.patients.length);

                // También guardar info del solicitante si viene en la respuesta
                if (response.solicitante) {
                    console.log('👤 Info del solicitante:', response.solicitante);
                    // Guardar info del solicitante en localStorage para uso posterior
                    localStorage.setItem('solicitante_info', JSON.stringify(response.solicitante));
                }
            } else {
                console.warn('⚠️ Respuesta de API con success=false');
                console.warn('🔍 Response completo para debugging:', JSON.stringify(response, null, 2));
                throw new Error('No se pudieron cargar los pacientes desde la API');
            }
        } catch (error) {
            console.warn('⚠️ Error cargando desde API, usando datos locales:', error.message);

            // Fallback: cargar desde localStorage
            const savedPatients = localStorage.getItem('patients');
            if (savedPatients) {
                this.patients = JSON.parse(savedPatients);
                console.log('📦 Pacientes cargados desde localStorage:', this.patients.length);
            } else {
                // No hay datos guardados, inicializar con array vacío
                console.log('📝 Inicializando con lista vacía de pacientes');
                this.patients = [];
            }
        }

        this.filteredPatients = [...this.patients];
        console.log('✅ LoadPatients completado. Total pacientes:', this.patients.length);
        console.log('✅ Pacientes filtrados:', this.filteredPatients.length);
    }



    // ===== NORMALIZACIÓN DE DATOS =====
    normalizePatientData(apiPatients) {
        return apiPatients.map((apiPatient, index) => {
            // Separar nombre completo en nombre y apellido
            const nombreCompleto = apiPatient.paciente || '';
            const partesNombre = nombreCompleto.trim().split(' ');
            const nombre = partesNombre[0] || '';
            const apellido = partesNombre.slice(1).join(' ') || '';

            // Normalizar datos de la API a la estructura esperada
            const normalizedPatient = {
                // ID único
                id: apiPatient.paciente_id || apiPatient.id,

                // Información básica
                nombre: nombre,
                apellido: apellido,
                dni: apiPatient.documento || '',
                edad: apiPatient.edad || 0,
                fechaNacimiento: apiPatient.fecha_nacimiento || this.calculateBirthDateFromAge(apiPatient.edad),
                genero: apiPatient.genero || '',
                telefono: apiPatient.telefono || '',
                email: apiPatient.email || '',
                parentesco: apiPatient.parentesco || '',

                // Información médica
                diagnosticoPrincipal: apiPatient.diagnostico || apiPatient.diagnosticoPrincipal || '',
                diagnosticosSecundarios: apiPatient.diagnosticoSecundario
                    ? apiPatient.diagnosticoSecundario.map(d => d.diagnostico).filter(Boolean)
                    : [],
                obraSocial: apiPatient.obraSocial || '',
                numeroAfiliado: apiPatient.numeroAfiliado || '',
                alergias: apiPatient.alergias
                    ? apiPatient.alergias.map(a => a.alergia).filter(Boolean)
                    : [],
                antecedentesFamiliares: apiPatient.antecedentesFamiliares || '',
                antecedentesPersonales: apiPatient.antecedentesPersonales || '',
                historiaClinica: this.normalizeHistoriaClinica(apiPatient.historiaClinica),
                medicacionActual: apiPatient.medicacionActual
                    ? apiPatient.medicacionActual.map(med => ({
                        nombre: med.nombre || '',
                        dosis: med.dosis || '',
                        frecuencia: med.frecuencia || '',
                        prescriptor: med.prescriptor || ''
                    }))
                    : [],

                // Estado y seguimiento
                estado: apiPatient.estado || 'activo',
                observaciones: apiPatient.observaciones || '',
                fechaCreacion: apiPatient.fecha_creacion || new Date().toISOString().split('T')[0],
                ultimaConsulta: apiPatient.ultima_consulta || '',
                proximaCita: apiPatient.proxima_cita || '',

                // Dirección (extraer de la primera dirección en el array)
                calle: apiPatient.direcciones?.[0]?.calle || '',
                numero: apiPatient.direcciones?.[0]?.numero || '',
                piso: apiPatient.direcciones?.[0]?.piso || '',
                departamento: apiPatient.direcciones?.[0]?.departamento || '',
                localidad: apiPatient.direcciones?.[0]?.localidad || '',
                provincia: apiPatient.direcciones?.[0]?.provincia || '',

                // Datos adicionales
                solicitanteId: apiPatient.solicitanteId || '',

                // Datos originales de la API (para debugging)
                _originalData: apiPatient
            };

            return normalizedPatient;
        });
    }

    // Normalizar historia clínica a formato de array
    normalizeHistoriaClinica(historiaClinica) {
        if (!historiaClinica) return [];

        // Si ya es un array, devolverlo tal como está
        if (Array.isArray(historiaClinica)) {
            return historiaClinica.map(entrada => ({
                id: entrada.id || null, // ID será asignado por la base de datos
                texto: entrada.texto || entrada.descripcion || '',
                fecha: entrada.fecha || new Date().toISOString().split('T')[0],
                doctor: entrada.doctor || entrada.medico || 'No especificado'
            }));
        }

        // Si es un string, convertirlo a una entrada inicial
        if (typeof historiaClinica === 'string' && historiaClinica.trim()) {
            return [{
                id: null, // ID será asignado por la base de datos
                texto: historiaClinica.trim(),
                fecha: new Date().toISOString().split('T')[0],
                doctor: 'Migración de datos'
            }];
        }

        return [];
    }

    // Calcular fecha de nacimiento aproximada basada en la edad
    calculateBirthDateFromAge(edad) {
        if (!edad) return '';
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - edad;
        return `${birthYear}-01-01`; // Fecha aproximada
    }

    // Renderizar historia clínica como timeline
    renderHistoriaClinicaTimeline(historiaClinica) {
        if (!historiaClinica || historiaClinica.length === 0) {
            return `
                <div class="bg-gray-50 p-4 rounded-lg text-center">
                    <span class="material-icons text-gray-400 text-2xl mb-2 block">description</span>
                    <p class="text-sm text-gray-600">Sin entradas en la historia clínica</p>
                </div>
            `;
        }

        // Ordenar por fecha (más reciente primero)
        const entradasOrdenadas = [...historiaClinica].sort((a, b) =>
            new Date(b.fecha) - new Date(a.fecha)
        );

        return `
            <div class="space-y-4 max-h-96 overflow-y-auto">
                ${entradasOrdenadas.map((entrada, index) => `
                    <div class="relative pl-6 pb-4 ${index < entradasOrdenadas.length - 1 ? 'border-l-2 border-blue-200' : ''}">
                        <!-- Timeline dot -->
                        <div class="absolute left-0 top-0 w-3 h-3 bg-blue-500 rounded-full transform -translate-x-1/2"></div>
                        
                        <!-- Entrada content -->
                        <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                                <div class="flex items-center gap-2 mb-1 sm:mb-0">
                                    <span class="material-icons text-blue-600 text-sm">event</span>
                                    <span class="text-sm font-medium text-gray-900">
                                        ${new Date(entrada.fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1">
                                    <span class="material-icons text-green-600 text-sm">person</span>
                                    <span class="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full">
                                        ${entrada.doctor}
                                    </span>
                                </div>
                            </div>
                            <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                                ${entrada.texto}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===== MANEJO DE HISTORIA CLÍNICA DINÁMICA =====
    loadHistoriaClinica(entradas) {
        const container = document.getElementById('historia-clinica-container');
        const emptyState = document.getElementById('historia-clinica-empty');

        if (!container) return;

        container.innerHTML = '';

        if (entradas.length === 0) {
            emptyState?.classList.remove('hidden');
        } else {
            emptyState?.classList.add('hidden');
            entradas.forEach(entrada => this.addHistoriaClinicaEntry(entrada));
        }
    }

    addHistoriaClinicaEntry(entrada = null) {
        const container = document.getElementById('historia-clinica-container');
        const emptyState = document.getElementById('historia-clinica-empty');

        if (!container) return;

        emptyState?.classList.add('hidden');

        // Usar ID temporal para el frontend, será reemplazado por autoincrement de la DB
        const entryId = entrada?.id || `temp_${Date.now()}_${Math.random()}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'bg-gray-50 border border-gray-200 rounded-lg p-4';
        entryDiv.dataset.entryId = entryId;

        entryDiv.innerHTML = `
            <div class="flex justify-between items-start mb-3">
                <h4 class="text-sm font-medium text-gray-700">Entrada de Historia Clínica</h4>
                <button type="button" class="text-red-600 hover:text-red-800 transition-colors" 
                        onclick="patientManager.removeHistoriaClinicaEntry('${entryId}')">
                    <span class="material-icons text-sm">delete</span>
                </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
                    <input type="date" class="historia-fecha w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                           value="${entrada?.fecha || new Date().toISOString().split('T')[0]}">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Doctor/Profesional</label>
                    <input type="text" class="historia-doctor w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                           placeholder="Nombre del doctor o profesional"
                           value="${entrada?.doctor || ''}">
                </div>
            </div>
            
            <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
                <textarea class="historia-texto w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          rows="3" placeholder="Descripción detallada de la consulta, diagnóstico, tratamiento, etc.">${entrada?.texto || ''}</textarea>
            </div>
        `;

        container.appendChild(entryDiv);
    }

    removeHistoriaClinicaEntry(entryId) {
        const entry = document.querySelector(`[data-entry-id="${entryId}"]`);
        if (entry) {
            entry.remove();

            // Mostrar mensaje vacío si no hay más entradas
            const container = document.getElementById('historia-clinica-container');
            const emptyState = document.getElementById('historia-clinica-empty');

            if (container && container.children.length === 0) {
                emptyState?.classList.remove('hidden');
            }
        }
    }

    getHistoriaClinicaData() {
        const container = document.getElementById('historia-clinica-container');
        if (!container) return [];

        const entradas = [];
        const entries = container.querySelectorAll('[data-entry-id]');

        entries.forEach(entry => {
            const fecha = entry.querySelector('.historia-fecha').value;
            const doctor = entry.querySelector('.historia-doctor').value.trim();
            const texto = entry.querySelector('.historia-texto').value.trim();

            if (texto) { // Solo agregar si hay texto
                const entradaData = {
                    fecha: fecha,
                    doctor: doctor || 'No especificado',
                    texto: texto
                };

                // Solo incluir ID si no es temporal (viene de la base de datos)
                const entryId = entry.dataset.entryId;
                if (entryId && !entryId.startsWith('temp_')) {
                    entradaData.id = entryId;
                }

                entradas.push(entradaData);
            }
        });

        return entradas;
    }

    saveToStorage() {
        localStorage.setItem('patients', JSON.stringify(this.patients));
    }

    // ===== RENDERIZADO =====
    renderPatients() {
        console.log('🎨 Renderizando pacientes...');
        console.log('📊 Total de pacientes filtrados:', this.filteredPatients.length);
        console.log('📊 Total de pacientes:', this.patients.length);

        const container = document.getElementById('pacientes-container');
        const emptyState = document.getElementById('empty-state');

        if (!container) {
            console.error('❌ No se encontró el contenedor pacientes-container');
            return;
        }

        if (this.filteredPatients.length === 0) {
            console.log('📝 Mostrando estado vacío');
            container.innerHTML = '';
            emptyState?.classList.remove('hidden');
            return;
        }

        emptyState?.classList.add('hidden');

        // Calcular paginación
        const startIndex = (this.currentPage - 1) * this.patientsPerPage;
        const endIndex = startIndex + this.patientsPerPage;
        const patientsToShow = this.filteredPatients.slice(startIndex, endIndex);

        container.innerHTML = patientsToShow.map(patient => this.createPatientCard(patient)).join('');

        // Actualizar paginación
        this.updatePagination();

        // Bind eventos de las tarjetas
        this.bindCardEvents();
    }

    createPatientCard(patient) {
        // Usar la edad que viene de la API o calcularla si no está disponible
        const edad = patient.edad || this.calculateAge(patient.fechaNacimiento);
        const estadoClass = this.getStatusClass(patient.estado);
        const estadoText = this.getStatusText(patient.estado);

        return `
            <div class="patient-card border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors" data-patient-id="${patient.id}">
                <!-- Vista móvil -->
                <div class="md:hidden">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex-1">
                            <h3 class="font-semibold text-gray-900">${patient.nombre} ${patient.apellido}</h3>
                            <p class="text-sm text-gray-600">DNI: ${patient.dni} • ${edad} años</p>
                            <p class="text-sm text-gray-600">${patient.diagnosticoPrincipal || 'Sin diagnóstico'}</p>
                        </div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${estadoClass}">
                            ${estadoText}
                        </span>
                    </div>
                    <div class="flex justify-end gap-2">
                        <button class="btn-ver-paciente p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <span class="material-icons text-sm">visibility</span>
                        </button>
                        <button class="btn-editar-paciente p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button class="btn-eliminar-paciente p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>

                <!-- Vista desktop -->
                <div class="hidden md:grid md:grid-cols-6 gap-4 items-center">
                    <div>
                        <div class="font-semibold text-gray-900">${patient.nombre} ${patient.apellido}</div>
                        <div class="text-sm text-gray-600">${patient.telefono || 'Sin teléfono'}</div>
                    </div>
                    <div class="text-gray-700">${patient.dni}</div>
                    <div class="text-gray-700">${edad} años</div>
                    <div class="text-gray-700">${patient.diagnosticoPrincipal || 'Sin diagnóstico'}</div>
                    <div>
                        <span class="px-2 py-1 text-xs font-medium rounded-full ${estadoClass}">
                            ${estadoText}
                        </span>
                    </div>
                    <div class="flex justify-center gap-1">
                        <button class="btn-ver-paciente p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Ver detalles">
                            <span class="material-icons text-sm">visibility</span>
                        </button>
                        <button class="btn-editar-paciente p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Editar">
                            <span class="material-icons text-sm">edit</span>
                        </button>
                        <button class="btn-eliminar-paciente p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    bindCardEvents() {
        // Botones ver
        document.querySelectorAll('.btn-ver-paciente').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = parseInt(e.target.closest('.patient-card').dataset.patientId);
                this.viewPatient(patientId);
            });
        });

        // Botones editar
        document.querySelectorAll('.btn-editar-paciente').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = parseInt(e.target.closest('.patient-card').dataset.patientId);
                this.editPatient(patientId);
            });
        });

        // Botones eliminar
        document.querySelectorAll('.btn-eliminar-paciente').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const patientId = parseInt(e.target.closest('.patient-card').dataset.patientId);
                this.deletePatient(patientId);
            });
        });
    }

    // ===== GESTIÓN DE VISTAS =====
    showView(viewName, patient = null) {
        console.log(`🔄 Cambiando a vista: ${viewName}`);

        // Obtener elementos
        const lista = document.getElementById('pacientes-lista-view');
        const form = document.getElementById('pacientes-form-view');
        const detail = document.getElementById('pacientes-detail-view');
        const directDetail = document.getElementById('patient-detail-direct');

        // Ocultar todas las vistas
        if (lista) {
            lista.style.display = 'none';
            lista.classList.add('hidden');
        }
        if (form) {
            form.style.display = 'none';
            form.classList.add('hidden');
        }
        if (detail) {
            detail.style.display = 'none';
            detail.classList.add('hidden');
        }
        if (directDetail) directDetail.remove(); // Remover detalle directo

        // Mostrar la vista solicitada
        if (viewName === 'lista' && lista) {
            lista.style.display = 'block';
            lista.classList.remove('hidden');
            lista.classList.remove('opacity-0');
            lista.classList.add('opacity-100');
            console.log('✅ Vista lista mostrada');

        } else if (viewName === 'form' && form) {
            this.setupFormView(patient);
            form.style.display = 'block';
            form.classList.remove('hidden');
            form.classList.remove('opacity-0');
            form.classList.add('opacity-100');
            console.log('✅ Vista form mostrada');

        } else if (viewName === 'detail') {
            // Para detalle, usar el método directo que funciona
            if (patient) {
                this.createDetailDirectly(patient);
                console.log('✅ Vista detail (directa) mostrada');
            }
        }

        this.currentView = viewName;
        this.currentPatient = patient;
    }

    showFormView(patient = null) {
        console.log('📝 Mostrando formulario para:', patient ? `editar ${patient.nombre}` : 'agregar nuevo paciente');
        this.showView('form', patient);
    }

    showDetailView(patient) {
        this.showView('detail', patient);
    }

    setupFormView(patient = null) {
        const title = document.getElementById('form-title');
        const form = document.getElementById('form-paciente');

        if (patient) {
            title.textContent = 'Editar Paciente';
            this.fillForm(patient);
        } else {
            title.textContent = 'Agregar Paciente';
            form.reset();
            this.clearErrors();
            // Limpiar preview de foto
            document.getElementById('preview-foto').classList.add('hidden');
            document.getElementById('placeholder-foto').classList.remove('hidden');
            // Inicializar con una medicación vacía
            this.loadMedicaciones([]);
            // Inicializar historia clínica vacía
            this.loadHistoriaClinica([]);
        }
    }

    setupDetailView(patient) {
        console.log('🏥 Configurando vista de detalle SIMPLE para:', patient?.nombre);

        if (!patient) {
            console.error('❌ No se proporcionó paciente');
            return;
        }

        const title = document.getElementById('detail-title');
        const content = document.getElementById('patient-detail-content');

        if (!title || !content) {
            console.error('❌ Elementos no encontrados');
            return;
        }

        // Título simple
        title.textContent = `${patient.nombre} ${patient.apellido}`;

        // Contenido simple y directo
        const edad = patient.edad || 'No especificada';

        content.innerHTML = `
            <div class="space-y-6">
                <!-- Información básica -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-blue-900 mb-3">Información Personal</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><strong>Nombre:</strong> ${patient.nombre} ${patient.apellido}</div>
                        <div><strong>DNI:</strong> ${patient.dni}</div>
                        <div><strong>Edad:</strong> ${edad} años</div>
                        <div><strong>Parentesco:</strong> ${patient.parentesco || 'No especificado'}</div>
                        <div><strong>Teléfono:</strong> ${patient.telefono || 'No especificado'}</div>
                        <div><strong>Email:</strong> ${patient.email || 'No especificado'}</div>
                    </div>
                </div>

                <!-- Información médica -->
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-green-900 mb-3">Información Médica</h3>
                    <div class="space-y-2 text-sm">
                        <div><strong>Diagnóstico Principal:</strong> ${patient.diagnosticoPrincipal || 'No especificado'}</div>
                        <div><strong>Obra Social:</strong> ${patient.obraSocial || 'No especificado'}</div>
                        <div><strong>N° Afiliado:</strong> ${patient.numeroAfiliado || 'No especificado'}</div>
                    </div>
                </div>

                <!-- Observaciones -->
                ${patient.observaciones ? `
                <div class="bg-yellow-50 p-4 rounded-lg">
                    <h3 class="text-lg font-semibold text-yellow-900 mb-3">Observaciones</h3>
                    <p class="text-sm text-gray-700">${patient.observaciones}</p>
                </div>
                ` : ''}

                <!-- Botones de acción -->
                <div class="flex gap-3 pt-4 border-t">
                    <button id="btn-editar-detalle" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                        Editar
                    </button>
                    <button id="btn-eliminar-detalle" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                        Eliminar
                    </button>
                </div>
            </div>
        `;

        console.log('✅ Vista simple configurada exitosamente');
    }

    // ===== FUNCIÓN DE PRUEBA =====
    testDetailView() {
        console.log('🧪 Iniciando prueba de vista de detalle...');

        if (this.patients.length === 0) {
            console.error('❌ No hay pacientes para probar');
            return;
        }

        const testPatient = this.patients[0];
        console.log('👤 Usando paciente de prueba:', testPatient.nombre, testPatient.apellido);

        // Forzar visibilidad de la sección principal
        const mainSection = document.getElementById('pacientes-section');
        if (mainSection) {
            mainSection.classList.remove('hidden', 'opacity-0');
            mainSection.classList.add('opacity-100');
            console.log('🔧 Forzada visibilidad de pacientes-section');
        }

        // Probar directamente la vista de detalle
        this.showDetailView(testPatient);
    }

    // Función para forzar visibilidad completa
    forceVisibility() {
        console.log('🔧 Forzando visibilidad de todos los elementos...');

        // Sección principal
        const mainSection = document.getElementById('pacientes-section');
        if (mainSection) {
            mainSection.classList.remove('hidden', 'opacity-0');
            mainSection.classList.add('opacity-100');
            console.log('✅ pacientes-section visible');
        }

        // Vista de detalle
        const detailView = document.getElementById('pacientes-detail-view');
        if (detailView) {
            detailView.classList.remove('hidden', 'opacity-0');
            detailView.classList.add('opacity-100');
            console.log('✅ pacientes-detail-view visible');
        }

        // Verificar resultado
        setTimeout(() => {
            const rect = detailView?.getBoundingClientRect();
            console.log('📐 Resultado final:', {
                detailVisible: rect && rect.width > 0 && rect.height > 0,
                dimensions: rect ? `${rect.width}x${rect.height}` : 'N/A'
            });
        }, 100);
    }

    // ===== UTILIDADES =====
    formatDireccionCompleta(patient) {
        if (!patient.calle && !patient.numero && !patient.localidad) {
            // Compatibilidad con formato anterior
            return patient.direccion || 'No especificada';
        }

        let direccion = '';

        // Calle y número (obligatorios)
        if (patient.calle && patient.numero) {
            direccion = `${patient.calle} ${patient.numero}`;
        } else if (patient.calle) {
            direccion = patient.calle;
        } else {
            return 'Dirección incompleta';
        }

        // Piso y departamento (opcionales)
        if (patient.piso || patient.departamento) {
            let pisoDpto = '';
            if (patient.piso) pisoDpto += `Piso ${patient.piso}`;
            if (patient.departamento) {
                if (pisoDpto) pisoDpto += `, `;
                pisoDpto += `Dpto. ${patient.departamento}`;
            }
            direccion += `, ${pisoDpto}`;
        }

        // Localidad y provincia
        if (patient.localidad) {
            direccion += `, ${patient.localidad}`;
        }
        if (patient.provincia && patient.provincia !== patient.localidad) {
            direccion += `, ${patient.provincia}`;
        }

        return direccion || 'No especificada';
    }

    fillForm(patient) {
        // Información básica
        document.getElementById('paciente-nombre').value = patient.nombre || '';
        document.getElementById('paciente-apellido').value = patient.apellido || '';
        document.getElementById('paciente-dni').value = patient.dni || '';
        document.getElementById('paciente-fecha-nacimiento').value = patient.fechaNacimiento || '';
        document.getElementById('paciente-genero').value = patient.genero || '';
        document.getElementById('paciente-telefono').value = patient.telefono || '';
        document.getElementById('paciente-email').value = patient.email || '';
        // Dirección completa
        document.getElementById('paciente-calle').value = patient.calle || '';
        document.getElementById('paciente-numero').value = patient.numero || '';
        document.getElementById('paciente-piso').value = patient.piso || '';
        document.getElementById('paciente-departamento').value = patient.departamento || '';
        document.getElementById('paciente-localidad').value = patient.localidad || '';
        document.getElementById('paciente-provincia').value = patient.provincia || '';
        document.getElementById('paciente-parentesco').value = patient.parentesco || '';

        // Información médica
        document.getElementById('paciente-diagnostico-principal').value = patient.diagnosticoPrincipal || '';
        document.getElementById('paciente-diagnosticos-secundarios').value =
            (patient.diagnosticosSecundarios || []).join(', ');
        document.getElementById('paciente-obra-social').value = patient.obraSocial || '';
        document.getElementById('paciente-numero-afiliado').value = patient.numeroAfiliado || '';
        document.getElementById('paciente-alergias').value = (patient.alergias || []).join(', ');
        document.getElementById('paciente-antecedentes-familiares').value = patient.antecedentesFamiliares || '';
        document.getElementById('paciente-antecedentes-personales').value = patient.antecedentesPersonales || '';

        // Historia clínica (cargar entradas dinámicas)
        this.loadHistoriaClinica(patient.historiaClinica || []);
        document.getElementById('paciente-observaciones').value = patient.observaciones || '';

        // Estado
        document.getElementById('paciente-estado').value = patient.estado || 'activo';

        // Medicación
        this.loadMedicaciones(patient.medicacionActual || []);

        // Preview de foto si existe
        if (patient.fotoPerfil) {
            // Aquí se podría mostrar la foto si está guardada como URL
            // Por ahora solo limpiamos el input
            document.getElementById('paciente-foto-perfil').value = '';
        }
    }

    // ===== CRUD OPERATIONS =====
    async savePatient() {
        if (!this.validateForm()) {
            return;
        }

        this.setLoadingState(true);

        try {
            const formData = this.getFormData();
            const userData = this.getUserData();

            // Preparar datos para la API
            const patientData = {
                // Información básica
                nombre: formData.nombre,
                apellido: formData.apellido,
                dni: formData.dni,
                fechaNacimiento: formData.fechaNacimiento,
                genero: formData.genero,
                telefono: formData.telefono,
                email: formData.email,
                parentesco: formData.parentesco,

                // Dirección completa
                direccion: {
                    calle: formData.calle,
                    numero: formData.numero,
                    piso: formData.piso,
                    departamento: formData.departamento,
                    localidad: formData.localidad,
                    provincia: formData.provincia
                },

                // Información médica
                diagnosticoPrincipal: formData.diagnosticoPrincipal,
                diagnosticosSecundarios: formData.diagnosticosSecundarios,
                obraSocial: formData.obraSocial,
                numeroAfiliado: formData.numeroAfiliado,
                alergias: formData.alergias,
                antecedentesFamiliares: formData.antecedentesFamiliares,
                antecedentesPersonales: formData.antecedentesPersonales,

                // Historia clínica (ya es un array)
                historiaClinica: formData.historiaClinica,
                observaciones: formData.observaciones,

                // Medicación
                medicacionActual: formData.medicacionActual,

                // Estado
                estado: formData.estado,

                // Datos del solicitante (del token)
                solicitanteId: userData?.id,
                authToken: this.getAuthToken()
            };

            // 🔍 LOGGING DETALLADO DEL JSON A ENVIAR
            console.log('🚀 ===== ENVIANDO DATOS DEL PACIENTE A LA API =====');
            console.log('📋 JSON COMPLETO A ENVIAR:', JSON.stringify(patientData, null, 2));
            console.log('🔗 URL destino:', this.currentPatient ?
                `${API_CONFIG.baseURL}${API_CONFIG.endpoints.updatePatient}` :
                `${API_CONFIG.baseURL}${API_CONFIG.endpoints.createPatient}`);
            console.log('🔑 Auth Token:', this.getAuthToken());
            console.log('👤 Usuario solicitante ID:', userData?.id);

            // 🔍 VALIDACIONES ADICIONALES
            console.log('🔍 ===== VALIDACIONES DE DATOS =====');
            console.log('✅ Nombre válido:', !!patientData.nombre);
            console.log('✅ Apellido válido:', !!patientData.apellido);
            console.log('✅ DNI válido:', !!patientData.dni);
            console.log('✅ Auth Token válido:', !!patientData.authToken);
            console.log('✅ Solicitante ID válido:', !!patientData.solicitanteId);
            console.log('✅ Dirección válida:', !!patientData.direccion && !!patientData.direccion.calle);
            console.log('🔍 Tamaño del JSON:', JSON.stringify(patientData).length, 'caracteres');
            console.log('================================================');

            let response;
            if (this.currentPatient) {
                // Actualizar paciente existente
                console.log('🔄 ACTUALIZANDO PACIENTE EXISTENTE - ID:', this.currentPatient.id);
                // Agregar el ID al objeto de datos
                patientData.id = this.currentPatient.id;
                response = await this.makeAPIRequest(
                    API_CONFIG.endpoints.updatePatient,
                    'POST',
                    patientData
                );

                // Actualizar en la lista local
                const index = this.patients.findIndex(p => p.id === this.currentPatient.id);
                if (index !== -1) {
                    this.patients[index] = { ...this.currentPatient, ...response.data };
                }

                this.showNotification('Paciente actualizado correctamente', 'success');

                // Notificar que se actualizó un paciente
                document.dispatchEvent(new CustomEvent('pacientesActualizados'));
            } else {
                // Crear nuevo paciente
                console.log('➕ CREANDO NUEVO PACIENTE');
                response = await this.makeAPIRequest(
                    API_CONFIG.endpoints.createPatient,
                    'POST',
                    patientData
                );

                // Agregar a la lista local
                this.patients.push(response.data);

                this.showNotification('Paciente agregado correctamente', 'success');

                // Notificar que se agregó un paciente
                document.dispatchEvent(new CustomEvent('pacientesActualizados'));
            }

            console.log('✅ Respuesta de la API:', response);

            // Actualizar interfaz
            this.saveToStorage();
            this.filteredPatients = [...this.patients];
            this.renderPatients();
            this.showView('lista');

        } catch (error) {
            console.error('❌ ===== ERROR GUARDANDO PACIENTE =====');
            console.error('💥 Error completo:', error);
            console.error('📝 Mensaje de error:', error.message);
            console.error('🔍 Stack trace:', error.stack);
            console.error('🌐 Endpoint usado:', this.currentPatient ?
                API_CONFIG.endpoints.updatePatient :
                API_CONFIG.endpoints.createPatient);
            console.error('🔑 Token actual:', this.getAuthToken());
            console.error('👤 Usuario actual:', this.getUserData());
            console.error('==========================================');

            this.showNotification(
                error.message || 'Error al guardar el paciente. Por favor, inténtalo de nuevo.',
                'error'
            );
        } finally {
            this.setLoadingState(false);
        }
    }

    getFormData() {
        // Obtener medicaciones
        const medicaciones = [];
        document.querySelectorAll('.medicacion-item').forEach(item => {
            const nombre = item.querySelector('.med-nombre').value.trim();
            const dosis = item.querySelector('.med-dosis').value.trim();
            const frecuencia = item.querySelector('.med-frecuencia').value.trim();
            const prescriptor = item.querySelector('.med-prescriptor').value.trim();

            if (nombre) {
                medicaciones.push({ nombre, dosis, frecuencia, prescriptor });
            }
        });

        // Procesar arrays de texto
        const diagnosticosSecundarios = document.getElementById('paciente-diagnosticos-secundarios').value
            .split(',').map(d => d.trim()).filter(d => d);
        const alergias = document.getElementById('paciente-alergias').value
            .split(',').map(a => a.trim()).filter(a => a);

        return {
            // Información básica
            nombre: document.getElementById('paciente-nombre').value.trim(),
            apellido: document.getElementById('paciente-apellido').value.trim(),
            dni: document.getElementById('paciente-dni').value.trim(),
            fechaNacimiento: document.getElementById('paciente-fecha-nacimiento').value,
            genero: document.getElementById('paciente-genero').value,
            telefono: document.getElementById('paciente-telefono').value.trim(),
            email: document.getElementById('paciente-email').value.trim(),
            // Dirección completa
            calle: document.getElementById('paciente-calle').value.trim(),
            numero: document.getElementById('paciente-numero').value.trim(),
            piso: document.getElementById('paciente-piso').value.trim(),
            departamento: document.getElementById('paciente-departamento').value.trim(),
            localidad: document.getElementById('paciente-localidad').value.trim(),
            provincia: document.getElementById('paciente-provincia').value,
            parentesco: document.getElementById('paciente-parentesco').value,
            fotoPerfil: document.getElementById('paciente-foto-perfil').files[0] || null,

            // Información médica
            diagnosticoPrincipal: document.getElementById('paciente-diagnostico-principal').value.trim(),
            diagnosticosSecundarios: diagnosticosSecundarios,
            obraSocial: document.getElementById('paciente-obra-social').value.trim(),
            numeroAfiliado: document.getElementById('paciente-numero-afiliado').value.trim(),
            alergias: alergias,
            antecedentesFamiliares: document.getElementById('paciente-antecedentes-familiares').value.trim(),
            antecedentesPersonales: document.getElementById('paciente-antecedentes-personales').value.trim(),

            // Historia clínica (recopilar todas las entradas)
            historiaClinica: this.getHistoriaClinicaData(),
            observaciones: document.getElementById('paciente-observaciones').value.trim(),

            // Medicación
            medicacionActual: medicaciones,

            // Estado
            estado: document.getElementById('paciente-estado').value
        };
    }

    viewPatient(patientId) {
        console.log('🔍 NUEVA VERSIÓN: Ver paciente con ID:', patientId);

        const patient = this.patients.find(p => p.id == patientId);

        if (!patient) {
            console.error('❌ Paciente no encontrado');
            return;
        }

        console.log('✅ Paciente encontrado:', patient.nombre);

        // MÉTODO DIRECTO: Crear el detalle directamente en el DOM
        this.createDetailDirectly(patient);
    }

    createDetailDirectly(patient) {
        console.log('🚀 Creando detalle COMPLETO en el DOM');
        console.log('📋 Datos del paciente:', patient);

        // Obtener el contenedor principal
        const mainContainer = document.querySelector('.max-w-6xl.mx-auto.px-4');
        if (!mainContainer) {
            console.error('❌ Contenedor principal no encontrado');
            return;
        }

        // Procesar datos complejos
        const direccion = patient.direcciones && patient.direcciones.length > 0
            ? `${patient.direcciones[0].calle} ${patient.direcciones[0].numero}${patient.direcciones[0].piso ? ', Piso ' + patient.direcciones[0].piso : ''}${patient.direcciones[0].departamento ? ', Dpto. ' + patient.direcciones[0].departamento : ''}, ${patient.direcciones[0].localidad}`
            : 'No especificada';

        const alergias = patient.alergias && patient.alergias.length > 0
            ? patient.alergias.map(a => a.alergia || a).join(', ')
            : 'Sin alergias registradas';

        const diagnosticosSecundarios = patient.diagnosticoSecundario && patient.diagnosticoSecundario.length > 0
            ? patient.diagnosticoSecundario.map(d => d.diagnostico || d).join(', ')
            : 'Ninguno';

        const medicacion = patient.medicacionActual && patient.medicacionActual.length > 0
            ? patient.medicacionActual.map(med => `
                <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 10px; border-radius: 6px; margin-bottom: 8px;">
                    <div style="font-weight: 600; color: #991b1b; margin-bottom: 4px;">${med.nombre}</div>
                    <div style="font-size: 12px; color: #7f1d1d;">
                        <div><strong>Dosis:</strong> ${med.dosis}</div>
                        <div><strong>Frecuencia:</strong> ${med.frecuencia}</div>
                        <div><strong>Prescriptor:</strong> ${med.prescriptor}</div>
                    </div>
                </div>
            `).join('')
            : '<div style="text-align: center; color: #6b7280; font-style: italic;">Sin medicación registrada</div>';

        // Crear el HTML del detalle completo
        const detailHTML = `
            <div id="patient-detail-direct" style="display: block; width: 100%; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-top: 20px;">
                
                <!-- Header -->
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 3px solid #e5e7eb;">
                    <button onclick="window.patientManager.showView('lista')" style="padding: 10px 15px; background: #f3f4f6; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; color: #374151; transition: all 0.2s;">
                        ← Volver a la lista
                    </button>
                    <div style="flex: 1;">
                        <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: #1f2937;">
                            ${patient.nombre} ${patient.apellido}
                        </h1>
                        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 16px;">Información completa del paciente</p>
                    </div>
                    <div style="background: ${patient.estado === 'activo' ? '#dcfce7' : '#fef3c7'}; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; color: ${patient.estado === 'activo' ? '#166534' : '#92400e'};">
                        ${patient.estado === 'activo' ? '✅ Activo' : '⚠️ ' + (patient.estado || 'Sin estado')}
                    </div>
                </div>

                <!-- Grid principal -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
                    
                    <!-- Información Personal -->
                    <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 20px; border-radius: 12px; border: 1px solid #93c5fd;">
                        <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #1e40af; display: flex; align-items: center; gap: 8px;">
                            👤 Información Personal
                        </h3>
                        <div style="display: grid; gap: 10px; font-size: 15px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">DNI:</span>
                                <span style="color: #1f2937;">${patient.documento || patient.dni}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">Edad:</span>
                                <span style="color: #1f2937;">${patient.edad} años</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">Fecha de Nacimiento:</span>
                                <span style="color: #1f2937;">${new Date(patient.fecha_nacimiento).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">Género:</span>
                                <span style="color: #1f2937; text-transform: capitalize;">${patient.genero}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">Parentesco:</span>
                                <span style="color: #1f2937;">${patient.parentesco}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bfdbfe;">
                                <span style="font-weight: 600; color: #1e40af;">Teléfono:</span>
                                <span style="color: #1f2937;">${patient.telefono}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span style="font-weight: 600; color: #1e40af;">Email:</span>
                                <span style="color: #1f2937; word-break: break-all;">${patient.email}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Información Médica -->
                    <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 20px; border-radius: 12px; border: 1px solid #86efac;">
                        <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #166534; display: flex; align-items: center; gap: 8px;">
                            🏥 Información Médica
                        </h3>
                        <div style="display: grid; gap: 10px; font-size: 15px;">
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                                <span style="font-weight: 600; color: #166534;">Diagnóstico Principal:</span>
                                <span style="color: #1f2937;">${patient.diagnosticoPrincipal || patient.diagnostico}</span>
                            </div>
                            <div style="padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                                <span style="font-weight: 600; color: #166534; display: block; margin-bottom: 4px;">Diagnósticos Secundarios:</span>
                                <span style="color: #1f2937; font-size: 14px;">${diagnosticosSecundarios}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #bbf7d0;">
                                <span style="font-weight: 600; color: #166534;">Obra Social:</span>
                                <span style="color: #1f2937;">${patient.obraSocial}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                                <span style="font-weight: 600; color: #166534;">N° Afiliado:</span>
                                <span style="color: #1f2937;">${patient.numeroAfiliado}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Dirección -->
                <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 20px; border-radius: 12px; border: 1px solid #c4b5fd; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #7c3aed; display: flex; align-items: center; gap: 8px;">
                        📍 Dirección
                    </h3>
                    <p style="margin: 0; font-size: 16px; color: #1f2937; line-height: 1.5;">${direccion}</p>
                </div>

                <!-- Alergias -->
                <div style="background: linear-gradient(135deg, #fef2f2, #fecaca); padding: 20px; border-radius: 12px; border: 1px solid #fca5a5; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #dc2626; display: flex; align-items: center; gap: 8px;">
                        ⚠️ Alergias
                    </h3>
                    <p style="margin: 0; font-size: 16px; color: #1f2937; line-height: 1.5;">${alergias}</p>
                </div>

                <!-- Grid secundario -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
                    
                    <!-- Antecedentes Familiares -->
                    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; border: 1px solid #fcd34d;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #92400e; display: flex; align-items: center; gap: 8px;">
                            👨‍👩‍👧‍👦 Antecedentes Familiares
                        </h3>
                        <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${patient.antecedentesFamiliares || 'Sin antecedentes registrados'}</p>
                    </div>

                    <!-- Antecedentes Personales -->
                    <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); padding: 20px; border-radius: 12px; border: 1px solid #a7f3d0;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 700; color: #065f46; display: flex; align-items: center; gap: 8px;">
                            📋 Antecedentes Personales
                        </h3>
                        <p style="margin: 0; font-size: 14px; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${patient.antecedentesPersonales || 'Sin antecedentes registrados'}</p>
                    </div>
                </div>

                <!-- Medicación Actual -->
                <div style="background: linear-gradient(135deg, #fef2f2, #fee2e2); padding: 20px; border-radius: 12px; border: 1px solid #fca5a5; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #dc2626; display: flex; align-items: center; gap: 8px;">
                        💊 Medicación Actual
                    </h3>
                    <div>${medicacion}</div>
                </div>

                <!-- Observaciones -->
                ${patient.observaciones ? `
                <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); padding: 20px; border-radius: 12px; border: 1px solid #93c5fd; margin-bottom: 25px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 20px; font-weight: 700; color: #1d4ed8; display: flex; align-items: center; gap: 8px;">
                        📝 Observaciones
                    </h3>
                    <p style="margin: 0; font-size: 16px; color: #1f2937; line-height: 1.6; white-space: pre-wrap;">${patient.observaciones}</p>
                </div>
                ` : ''}

                <!-- Botones de acción -->
                <div style="display: flex; gap: 15px; padding-top: 20px; border-top: 2px solid #e5e7eb; justify-content: center;">
                    <button onclick="window.patientManager.editPatient(${patient.id})" style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);">
                        ✏️ Editar Paciente
                    </button>
                    <button onclick="window.patientManager.deletePatient(${patient.id})" style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 16px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);">
                        🗑️ Eliminar Paciente
                    </button>
                </div>
            </div>
        `;

        // Ocultar la lista de pacientes
        const listaView = document.getElementById('pacientes-lista-view');
        if (listaView) {
            listaView.style.display = 'none';
        }

        // Remover detalle anterior si existe
        const existingDetail = document.getElementById('patient-detail-direct');
        if (existingDetail) {
            existingDetail.remove();
        }

        // Insertar el nuevo detalle
        mainContainer.insertAdjacentHTML('beforeend', detailHTML);

        console.log('✅ Detalle COMPLETO creado en el DOM');

        // Verificar que se creó
        const newDetail = document.getElementById('patient-detail-direct');
        if (newDetail) {
            const rect = newDetail.getBoundingClientRect();
            console.log('📐 Detalle creado con dimensiones:', {
                width: rect.width,
                height: rect.height,
                visible: rect.width > 0 && rect.height > 0
            });
        }
    }

    editPatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        this.showFormView(patient);
    }

    deletePatient(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        this.currentPatient = patient;

        // Mostrar confirmación
        if (confirm(`¿Estás seguro de que deseas eliminar a ${patient.nombre} ${patient.apellido}?\n\nEsta acción no se puede deshacer.`)) {
            this.confirmDelete();
        }
    }

    async confirmDelete() {
        if (!this.currentPatient) return;

        try {
            // Mostrar estado de carga
            this.showNotification('Eliminando paciente...', 'info');

            // Eliminar desde la API
            await this.makeAPIRequest(
                API_CONFIG.endpoints.deletePatient,
                'POST',
                { 
                    pacienteId: this.currentPatient.id,
                    authToken: this.getAuthToken()
                }
            );

            // Eliminar de la lista local
            const index = this.patients.findIndex(p => p.id === this.currentPatient.id);
            if (index !== -1) {
                this.patients.splice(index, 1);
                this.saveToStorage();
                this.filteredPatients = [...this.patients];
                this.renderPatients();
            }

            this.showNotification('Paciente eliminado correctamente', 'success');

            // Notificar que se eliminó un paciente
            document.dispatchEvent(new CustomEvent('pacientesActualizados'));

            // Si estamos en vista de detalle, volver a la lista
            if (this.currentView === 'detail') {
                this.showView('lista');
            }

        } catch (error) {
            console.error('❌ Error eliminando paciente:', error);
            this.showNotification(
                error.message || 'Error al eliminar el paciente. Por favor, inténtalo de nuevo.',
                'error'
            );
        } finally {
            this.currentPatient = null;
        }
    }

    // ===== BÚSQUEDA Y FILTROS =====
    searchPatients(query) {
        if (!query.trim()) {
            this.filteredPatients = [...this.patients];
        } else {
            const searchTerm = query.toLowerCase();
            this.filteredPatients = this.patients.filter(patient =>
                patient.nombre.toLowerCase().includes(searchTerm) ||
                patient.apellido.toLowerCase().includes(searchTerm) ||
                patient.dni.includes(searchTerm) ||
                (patient.diagnostico && patient.diagnostico.toLowerCase().includes(searchTerm))
            );
        }
        this.currentPage = 1;
        this.renderPatients();
    }

    filterByStatus(status) {
        if (!status) {
            this.filteredPatients = [...this.patients];
        } else {
            this.filteredPatients = this.patients.filter(patient => patient.estado === status);
        }
        this.currentPage = 1;
        this.renderPatients();
    }

    // ===== VALIDACIÓN =====
    validateForm() {
        this.clearErrors();
        let isValid = true;

        const nombre = document.getElementById('paciente-nombre').value.trim();
        const apellido = document.getElementById('paciente-apellido').value.trim();
        const dni = document.getElementById('paciente-dni').value.trim();
        const fechaNacimiento = document.getElementById('paciente-fecha-nacimiento').value;
        const parentesco = document.getElementById('paciente-parentesco').value;

        // Campos de dirección
        const calle = document.getElementById('paciente-calle').value.trim();
        const numero = document.getElementById('paciente-numero').value.trim();
        const localidad = document.getElementById('paciente-localidad').value.trim();
        const provincia = document.getElementById('paciente-provincia').value;

        if (!nombre) {
            this.showError('error-nombre', 'El nombre es requerido');
            isValid = false;
        }

        if (!apellido) {
            this.showError('error-apellido', 'El apellido es requerido');
            isValid = false;
        }

        if (!dni) {
            this.showError('error-dni', 'El DNI es requerido');
            isValid = false;
        } else if (!/^\d{7,8}$/.test(dni)) {
            this.showError('error-dni', 'El DNI debe tener 7 u 8 dígitos');
            isValid = false;
        } else {
            // Verificar DNI único (excepto si estamos editando el mismo paciente)
            const existingPatient = this.patients.find(p => p.dni === dni);
            if (existingPatient && (!this.currentPatient || existingPatient.id !== this.currentPatient.id)) {
                this.showError('error-dni', 'Ya existe un paciente con este DNI');
                isValid = false;
            }
        }

        if (!fechaNacimiento) {
            this.showError('error-fecha-nacimiento', 'La fecha de nacimiento es requerida');
            isValid = false;
        }

        if (!parentesco) {
            this.showError('error-parentesco', 'El parentesco es requerido');
            isValid = false;
        }

        // Validación de dirección
        if (!calle) {
            this.showError('error-calle', 'La calle es requerida');
            isValid = false;
        }

        if (!numero) {
            this.showError('error-numero', 'El número es requerido');
            isValid = false;
        }

        if (!localidad) {
            this.showError('error-localidad', 'La localidad es requerida');
            isValid = false;
        }

        if (!provincia) {
            this.showError('error-provincia', 'La provincia es requerida');
            isValid = false;
        }

        return isValid;
    }

    showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    }

    clearErrors() {
        const errorElements = document.querySelectorAll('[id^="error-"]');
        errorElements.forEach(element => {
            element.textContent = '';
            element.classList.add('hidden');
        });
    }

    // ===== MEDICACIÓN =====
    addMedicacionItem(medicacion = null) {
        const container = document.getElementById('medicacion-container');
        if (!container) return;

        const medicacionId = Date.now() + Math.random();
        const medicacionItem = document.createElement('div');
        medicacionItem.className = 'medicacion-item bg-gray-50 p-4 rounded-lg border border-gray-200';
        medicacionItem.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Medicamento</label>
                    <input type="text" class="med-nombre w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           placeholder="Nombre del medicamento" value="${medicacion?.nombre || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Dosis</label>
                    <input type="text" class="med-dosis w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           placeholder="Ej: 50mg" value="${medicacion?.dosis || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                    <input type="text" class="med-frecuencia w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                           placeholder="Ej: 1 vez al día" value="${medicacion?.frecuencia || ''}">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Prescriptor</label>
                    <div class="flex gap-2">
                        <input type="text" class="med-prescriptor flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                               placeholder="Dr. Apellido" value="${medicacion?.prescriptor || ''}">
                        <button type="button" class="btn-remove-medicacion px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
                            <span class="material-icons text-sm">delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(medicacionItem);

        // Agregar event listener para eliminar
        medicacionItem.querySelector('.btn-remove-medicacion').addEventListener('click', () => {
            medicacionItem.remove();
        });
    }

    loadMedicaciones(medicaciones) {
        const container = document.getElementById('medicacion-container');
        if (!container) return;

        container.innerHTML = '';
        medicaciones.forEach(medicacion => {
            this.addMedicacionItem(medicacion);
        });

        // Si no hay medicaciones, agregar una vacía
        if (medicaciones.length === 0) {
            this.addMedicacionItem();
        }
    }

    previewFoto(file) {
        const preview = document.getElementById('preview-foto');
        const placeholder = document.getElementById('placeholder-foto');

        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.remove('hidden');
                placeholder.classList.add('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            preview.classList.add('hidden');
            placeholder.classList.remove('hidden');
        }
    }

    // ===== UTILIDADES =====
    calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    getStatusClass(status) {
        const classes = {
            'activo': 'bg-green-100 text-green-800',
            'inactivo': 'bg-yellow-100 text-yellow-800',
            'alta': 'bg-blue-100 text-blue-800'
        };
        return classes[status] || 'bg-gray-100 text-gray-800';
    }

    getStatusText(status) {
        const texts = {
            'activo': 'Activo',
            'inactivo': 'Inactivo',
            'alta': 'Alta médica'
        };
        return texts[status] || status;
    }

    updatePagination() {
        const totalPages = Math.ceil(this.filteredPatients.length / this.patientsPerPage);
        const paginationContainer = document.getElementById('pagination-container');

        if (!paginationContainer || totalPages <= 1) {
            paginationContainer?.classList.add('hidden');
            return;
        }

        paginationContainer.classList.remove('hidden');

        // Actualizar botones prev/next
        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');

        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.onclick = () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderPatients();
                }
            };
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
            nextBtn.onclick = () => {
                if (this.currentPage < totalPages) {
                    this.currentPage++;
                    this.renderPatients();
                }
            };
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación temporal
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transform transition-all duration-300 translate-x-full`;

        const bgClass = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.classList.add(bgClass);
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remover después de 3 segundos
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Función para inicializar el gestor de pacientes
function initPatientManager() {
    if (!window.patientManager && document.getElementById('pacientes-section')) {
        window.patientManager = new PatientManager();

        // Funciones globales para pruebas
        window.testDetailDirect = function () {
            if (window.patientManager && window.patientManager.patients.length > 0) {
                const patient = window.patientManager.patients[0];
                console.log('🧪 Probando detalle DIRECTO con:', patient.nombre);
                window.patientManager.createDetailDirectly(patient);
            } else {
                console.error('❌ No hay pacientes disponibles');
            }
        };

        window.testFormulario = function () {
            if (window.patientManager) {
                console.log('🧪 Probando formulario de agregar paciente');
                window.patientManager.showFormView();
            } else {
                console.error('❌ PatientManager no está disponible');
            }
        };
    }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar inmediatamente si la sección existe
    initPatientManager();

    // También escuchar clics en el menú de pacientes
    const pacientesMenuItem = document.querySelector('[data-section="pacientes"]');
    if (pacientesMenuItem) {
        pacientesMenuItem.addEventListener('click', () => {
            setTimeout(initPatientManager, 200);
        });
    }
});

// Inicializar cuando se muestre la sección (para sistemas de navegación SPA)
if (typeof window !== 'undefined') {
    window.initPatientManager = initPatientManager;
}