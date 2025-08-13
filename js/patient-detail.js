/**
 * Gestor de Detalle del Paciente
 * Maneja la visualización y funcionalidad de la página de detalle del paciente
 */

class PatientDetailManager {
    constructor() {
        this.currentPatient = null;
        this.currentTab = 'personal';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('🚀 Inicializando PatientDetailManager...');
        
        // Verificar autenticación
        if (!this.checkAuth()) {
            return;
        }
        
        // Obtener ID del paciente desde URL
        const patientId = this.getPatientIdFromURL();
        if (!patientId) {
            this.showError('No se especificó un paciente válido');
            return;
        }
        
        // Configurar eventos
        this.bindEvents();
        
        // Cargar datos del paciente
        await this.loadPatientData(patientId);
        
        // Ocultar loading
        this.hideLoading();
        
        console.log('✅ PatientDetailManager inicializado');
    }

    checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '../pages/login.html';
            return false;
        }
        return true;
    }

    getPatientIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    bindEvents() {
        // Botón volver
        document.getElementById('btn-volver')?.addEventListener('click', () => {
            window.history.back();
        });

        // Botón editar
        document.getElementById('btn-editar')?.addEventListener('click', () => {
            this.editPatient();
        });

        // Navegación por tabs
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabId = e.currentTarget.dataset.tab;
                this.switchTab(tabId);
            });
        });

        // Botón agregar entrada de historia clínica
        document.getElementById('btn-add-entry')?.addEventListener('click', () => {
            this.showAddHistoryEntryModal();
        });

        // Navegación con teclado para accesibilidad
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    async loadPatientData(patientId) {
        this.showLoading();
        
        try {
            // Intentar cargar desde API
            const patient = await this.fetchPatientFromAPI(patientId);
            
            if (patient) {
                this.currentPatient = patient;
                this.renderPatientData();
            } else {
                // Fallback: buscar en localStorage
                const localPatient = this.findPatientInLocalStorage(patientId);
                if (localPatient) {
                    this.currentPatient = localPatient;
                    this.renderPatientData();
                } else {
                    throw new Error('Paciente no encontrado');
                }
            }
        } catch (error) {
            console.error('Error cargando datos del paciente:', error);
            this.showError('Error al cargar los datos del paciente');
        }
    }

    async fetchPatientFromAPI(patientId) {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`http://190.184.224.217/renasam/api/pacientes/${patientId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.success ? data.paciente : null;
            }
        } catch (error) {
            console.warn('Error fetching from API:', error);
        }
        return null;
    }

    findPatientInLocalStorage(patientId) {
        const patients = JSON.parse(localStorage.getItem('patients') || '[]');
        return patients.find(p => p.id == patientId);
    }

    renderPatientData() {
        if (!this.currentPatient) return;

        const patient = this.currentPatient;

        // Header del paciente
        this.renderPatientHeader(patient);
        
        // Datos personales
        this.renderPersonalData(patient);
        
        // Información médica
        this.renderMedicalData(patient);
        
        // Historia clínica
        this.renderClinicalHistory(patient);
    }

    renderPatientHeader(patient) {
        // Iniciales para el avatar
        const initials = this.getPatientInitials(patient);
        document.getElementById('patient-initials').textContent = initials;
        
        // Nombre completo
        const fullName = `${patient.nombre || ''} ${patient.apellido || ''}`.trim();
        document.getElementById('patient-name').textContent = fullName || 'Sin nombre';
        
        // Información básica
        document.getElementById('patient-dni').textContent = patient.dni || '--';
        document.getElementById('patient-age').textContent = patient.edad || '--';
        document.getElementById('patient-gender').textContent = this.formatGender(patient.genero);
        
        // Estado
        this.renderPatientStatus(patient.estado);
    }

    renderPersonalData(patient) {
        // Información de contacto
        document.getElementById('patient-phone').textContent = patient.telefono || '--';
        document.getElementById('patient-email').textContent = patient.email || '--';
        document.getElementById('patient-relationship').textContent = patient.parentesco || '--';
        
        // Dirección
        const address = this.formatAddress(patient);
        document.getElementById('patient-address-street').textContent = address.street;
        document.getElementById('patient-address-floor').textContent = address.floor;
        document.getElementById('patient-address-apt').textContent = address.apartment;
        document.getElementById('patient-address-city').textContent = address.city;
        document.getElementById('patient-address-province').textContent = address.province;
    }

    renderMedicalData(patient) {
        // Diagnóstico principal
        document.getElementById('patient-main-diagnosis').textContent = 
            patient.diagnosticoPrincipal || 'Sin diagnóstico principal';
        
        // Diagnósticos secundarios
        this.renderSecondaryDiagnoses(patient.diagnosticosSecundarios || []);
        
        // Obra social
        document.getElementById('patient-insurance').textContent = patient.obraSocial || '--';
        document.getElementById('patient-insurance-number').textContent = patient.numeroAfiliado || '--';
        
        // Alergias
        this.renderAllergies(patient.alergias || []);
        
        // Medicación actual
        this.renderCurrentMedications(patient.medicacionActual || []);
        
        // Antecedentes
        document.getElementById('patient-family-history').textContent = 
            patient.antecedentesFamiliares || 'Sin antecedentes familiares registrados';
        document.getElementById('patient-personal-history').textContent = 
            patient.antecedentesPersonales || 'Sin antecedentes personales registrados';
    }

    renderClinicalHistory(patient) {
        const timeline = document.getElementById('clinical-history-timeline');
        const emptyState = document.getElementById('history-empty-state');
        
        const history = patient.historiaClinica || [];
        
        if (history.length === 0) {
            timeline.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        timeline.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        // Ordenar por fecha (más reciente primero)
        const sortedHistory = [...history].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        
        timeline.innerHTML = sortedHistory.map((entry, index) => this.createHistoryEntryHTML(entry, index)).join('');
    }

    createHistoryEntryHTML(entry, index) {
        const date = new Date(entry.fecha);
        const formattedDate = date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        return `
            <div class="relative">
                <!-- Timeline line -->
                ${index < this.currentPatient.historiaClinica.length - 1 ? 
                    '<div class="absolute left-4 top-12 w-0.5 h-full bg-gray-200"></div>' : ''}
                
                <!-- Timeline dot -->
                <div class="absolute left-2 top-4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                
                <!-- Content -->
                <div class="ml-10 pb-8">
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <!-- Header -->
                        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                            <div class="flex items-center gap-2 mb-2 sm:mb-0">
                                <span class="material-icons text-blue-600 text-sm">event</span>
                                <span class="text-sm font-medium text-gray-900">${formattedDate}</span>
                            </div>
                            <div class="flex items-center gap-1">
                                <span class="material-icons text-green-600 text-sm">person</span>
                                <span class="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-full">
                                    ${entry.doctor || 'No especificado'}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Content -->
                        <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            ${entry.texto || 'Sin descripción'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSecondaryDiagnoses(diagnoses) {
        const container = document.getElementById('patient-secondary-diagnoses');
        
        if (diagnoses.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 italic">Sin diagnósticos secundarios</p>';
            return;
        }
        
        container.innerHTML = diagnoses.map(diagnosis => `
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-2">
                <p class="text-sm text-orange-900">${diagnosis}</p>
            </div>
        `).join('');
    }

    renderAllergies(allergies) {
        const container = document.getElementById('patient-allergies');
        
        if (allergies.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 italic">Sin alergias registradas</p>';
            return;
        }
        
        container.innerHTML = allergies.map(allergy => `
            <div class="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-2">
                <span class="material-icons text-red-600 text-sm">warning</span>
                <span class="text-sm text-red-900 font-medium">${allergy}</span>
            </div>
        `).join('');
    }

    renderCurrentMedications(medications) {
        const container = document.getElementById('patient-medications');
        
        if (medications.length === 0) {
            container.innerHTML = '<p class="text-sm text-gray-500 italic">Sin medicación actual registrada</p>';
            return;
        }
        
        container.innerHTML = medications.map(med => `
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <h4 class="text-sm font-medium text-purple-900">${med.nombre || 'Medicamento'}</h4>
                        <p class="text-xs text-purple-700 mt-1">
                            <span class="font-medium">Dosis:</span> ${med.dosis || 'No especificada'} • 
                            <span class="font-medium">Frecuencia:</span> ${med.frecuencia || 'No especificada'}
                        </p>
                        ${med.prescriptor ? `
                            <p class="text-xs text-purple-600 mt-1">
                                <span class="font-medium">Prescriptor:</span> ${med.prescriptor}
                            </p>
                        ` : ''}
                    </div>
                    <span class="material-icons text-purple-600 text-lg">medication</span>
                </div>
            </div>
        `).join('');
    }

    switchTab(tabId) {
        // Actualizar botones de tab
        document.querySelectorAll('.tab-button').forEach(button => {
            const isActive = button.dataset.tab === tabId;
            button.classList.toggle('tab-active', isActive);
            button.setAttribute('aria-selected', isActive);
        });
        
        // Mostrar/ocultar paneles
        document.querySelectorAll('[role="tabpanel"]').forEach(panel => {
            const isActive = panel.id === `${tabId}-panel`;
            panel.classList.toggle('hidden', !isActive);
            panel.setAttribute('aria-hidden', !isActive);
        });
        
        this.currentTab = tabId;
    }

    editPatient() {
        if (!this.currentPatient) return;
        
        // Redirigir a la página de edición con el ID del paciente
        window.location.href = `index.html?edit=${this.currentPatient.id}`;
    }

    showAddHistoryEntryModal() {
        // Implementar modal para agregar nueva entrada
        // Por ahora, redirigir a edición
        this.editPatient();
    }

    closeModals() {
        // Cerrar cualquier modal abierto
        // Implementar según sea necesario
    }

    // Utilidades
    getPatientInitials(patient) {
        const firstName = patient.nombre || '';
        const lastName = patient.apellido || '';
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??';
    }

    formatGender(gender) {
        const genderMap = {
            'M': 'Masculino',
            'F': 'Femenino',
            'masculino': 'Masculino',
            'femenino': 'Femenino',
            'male': 'Masculino',
            'female': 'Femenino'
        };
        return genderMap[gender] || gender || '--';
    }

    formatAddress(patient) {
        return {
            street: patient.calle && patient.numero ? `${patient.calle} ${patient.numero}` : '--',
            floor: patient.piso || '--',
            apartment: patient.departamento || '--',
            city: patient.localidad || '--',
            province: patient.provincia || '--'
        };
    }

    renderPatientStatus(status) {
        const statusElement = document.getElementById('patient-status');
        const statusMap = {
            'activo': { class: 'bg-green-100 text-green-800', text: 'Activo' },
            'inactivo': { class: 'bg-gray-100 text-gray-800', text: 'Inactivo' },
            'alta': { class: 'bg-blue-100 text-blue-800', text: 'Alta Médica' }
        };
        
        const statusInfo = statusMap[status] || statusMap['activo'];
        statusElement.className = `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`;
        statusElement.textContent = statusInfo.text;
    }

    showLoading() {
        this.isLoading = true;
        document.getElementById('loading-overlay')?.classList.remove('hidden');
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loading-overlay')?.classList.add('hidden');
    }

    showError(message) {
        this.hideLoading();
        
        // Crear notificación de error
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg';
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="material-icons text-red-600">error</span>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 5 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PatientDetailManager();
});