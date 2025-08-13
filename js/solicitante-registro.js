/* // ===== VARIABLES GLOBALES ===== */
let currentStep = 0;
const totalSteps = 3;

// Elementos del DOM
const steps = document.querySelectorAll('.step');
const sections = document.querySelectorAll('.form-section');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Botones de navegación (ahora múltiples, uno por paso)
const prevBtns = [
    document.getElementById('prevBtn-0'),
    document.getElementById('prevBtn-1'),
    document.getElementById('prevBtn-3')
];
const nextBtns = [
    document.getElementById('nextBtn-0'),
    document.getElementById('nextBtn-1'),
    document.getElementById('nextBtn-3')
];

// Datos del formulario
const formData = {
    // Datos personales
    nombre: '',
    apellido: '',
    fechaNacimiento: '',
    sexo: '',
    documento: '',
    tipoSolicitante: '',

    // Contacto
    correo: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    provincia: '',
    ciudad: '',
    calle: '',
    numero: '',
    piso: '',
    departamento: '',





    // Notificaciones
    notificacionesProfesionales: false,
    notificacionesCapacitaciones: false,

    // Términos
    terminos: false
};

// Errores de validación
const errors = {};

// ===== FUNCIONES DE NAVEGACIÓN =====
function updateStep() {
    // Actualizar indicadores visuales
    steps.forEach(s => {
        s.classList.remove('bg-green-600', 'text-white');
        s.removeAttribute('aria-current');
    });
    sections.forEach(s => s.classList.add('hidden'));

    steps[currentStep].classList.add('bg-green-600', 'text-white');
    steps[currentStep].setAttribute('aria-current', 'step');
    sections[currentStep].classList.remove('hidden');
    sections[currentStep].classList.add('active');

    // Actualizar botones de navegación
    updateNavigationButtons();

    // Actualizar barra de progreso
    const progress = ((currentStep + 1) / totalSteps) * 100;
    progressBar.style.width = progress + '%';
    progressText.textContent = `Paso ${currentStep + 1} de ${totalSteps}`;

    // Actualizar revisión si estamos en el último paso
    if (currentStep === 2) {
        updateReviewSummary();
    }

    validateStep(currentStep);
}

function updateNavigationButtons() {
    // Actualizar visibilidad y texto de botones
    prevBtns.forEach((btn, index) => {
        if (btn) {
            // Mostrar botón "Anterior" solo si no es el primer paso
            btn.classList.toggle('hidden', currentStep === 0);
        }
    });

    nextBtns.forEach((btn, index) => {
        if (btn) {
            // Actualizar texto del último botón (paso 2 es el último)
            if (currentStep === 2) {
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = 'Finalizar Registro';
                }
            } else {
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = 'Siguiente';
                }
            }
        }
    });
}

function goToStep(step) {
    if (step >= 0 && step < totalSteps) {
        // Solo permitir avanzar si el paso actual es válido
        if (step > currentStep) {
            updateFormData();
            if (!validateStep(currentStep)) {
                showValidationAlert();
                return;
            }
        }
        currentStep = step;
        updateStep();
    }
}

// ===== VALIDACIÓN MEJORADA =====
function validateStep(step) {
    const newErrors = {};

    if (step === 0) {
        // Validar datos personales
        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        } else if (formData.nombre.trim().length < 2) {
            newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
        }

        if (!formData.apellido.trim()) {
            newErrors.apellido = 'El apellido es requerido';
        } else if (formData.apellido.trim().length < 2) {
            newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
        }

        if (!formData.fechaNacimiento) {
            newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        } else {
            const birthDate = new Date(formData.fechaNacimiento);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            if (age < 18 || age > 120) {
                newErrors.fechaNacimiento = 'Debes ser mayor de 18 años';
            }
        }

        if (!formData.sexo) {
            newErrors.sexo = 'El sexo es requerido';
        }

        if (!formData.documento.trim()) {
            newErrors.documento = 'El documento es requerido';
        } else if (formData.documento.trim().length < 7) {
            newErrors.documento = 'El documento debe tener al menos 7 caracteres';
        }

        if (!formData.tipoSolicitante) {
            newErrors.tipoSolicitante = 'El tipo de solicitante es requerido';
        }

    } else if (step === 1) {
        // Validar contacto
        if (!formData.correo.trim()) {
            newErrors.correo = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
            newErrors.correo = 'Formato de correo inválido';
        }

        if (!formData.telefono.trim()) {
            newErrors.telefono = 'El teléfono es requerido';
        } else if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(formData.telefono.trim())) {
            newErrors.telefono = 'Formato de teléfono inválido';
        }

        if (!formData.password.trim()) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 8) {
            newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'La contraseña debe contener al menos una mayúscula, una minúscula y un número';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        if (!formData.provincia) {
            newErrors.provincia = 'La provincia es requerida';
        }

        if (!formData.ciudad.trim()) {
            newErrors.ciudad = 'La ciudad es requerida';
        } else if (formData.ciudad.trim().length < 2) {
            newErrors.ciudad = 'La ciudad debe tener al menos 2 caracteres';
        }

        if (!formData.calle.trim()) {
            newErrors.calle = 'La calle es requerida';
        } else if (formData.calle.trim().length < 3) {
            newErrors.calle = 'La calle debe tener al menos 3 caracteres';
        }

        if (!formData.numero.trim()) {
            newErrors.numero = 'El número es requerido';
        } else if (!/^[0-9]+[a-zA-Z]?$/.test(formData.numero.trim())) {
            newErrors.numero = 'Formato de número inválido (ej: 123, 456A)';
        }

    } else if (step === 2) {
        // Validar términos y notificaciones (ahora es el último paso)
        if (!formData.terminos) {
            newErrors.terminos = 'Debes aceptar los términos y condiciones';
        }
    }

    // Actualizar errores en el DOM
    Object.keys(newErrors).forEach(key => {
        errors[key] = newErrors[key];
        const errorElement = document.getElementById(`error-${key}`);
        const inputElement = document.getElementById(key);

        if (errorElement) {
            errorElement.textContent = newErrors[key];
            errorElement.classList.add('text-red-500');
        }

        if (inputElement) {
            inputElement.classList.add('input-error');
            inputElement.classList.remove('border-gray-200');
        }
    });

    // Limpiar errores que ya no existen
    Object.keys(errors).forEach(key => {
        if (!newErrors[key]) {
            delete errors[key];
            const errorElement = document.getElementById(`error-${key}`);
            const inputElement = document.getElementById(key);

            if (errorElement) {
                errorElement.textContent = '';
                errorElement.classList.remove('text-red-500');
            }

            if (inputElement) {
                inputElement.classList.remove('input-error');
                inputElement.classList.add('border-gray-200');
            }
        }
    });

    // Highlight campos con errores
    highlightRequiredFields(step);

    return Object.keys(newErrors).length === 0;
}

// ===== FUNCIONES DE FEEDBACK =====
function showValidationAlert() {
    const errorCount = Object.keys(errors).length;
    const message = errorCount === 1
        ? 'Por favor, completa el campo requerido antes de continuar.'
        : `Por favor, completa los ${errorCount} campos requeridos antes de continuar.`;

    // Crear alerta temporal
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    alert.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(alert);

    // Remover después de 4 segundos
    setTimeout(() => {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(alert);
        }, 300);
    }, 4000);

    // Hacer scroll al primer error
    scrollToFirstError();
}

function scrollToFirstError() {
    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
        const errorElement = document.getElementById(`error-${firstErrorKey}`);
        const inputElement = document.getElementById(firstErrorKey);

        if (inputElement) {
            inputElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            inputElement.focus();

            // Agregar efecto visual de shake
            inputElement.classList.add('animate-shake');
            setTimeout(() => {
                inputElement.classList.remove('animate-shake');
            }, 600);
        }
    }
}

function highlightRequiredFields(step) {
    // Remover highlights previos
    document.querySelectorAll('.border-red-500').forEach(el => {
        el.classList.remove('border-red-500');
        el.classList.add('border-gray-200');
    });

    // Highlight campos con errores
    Object.keys(errors).forEach(key => {
        const inputElement = document.getElementById(key);
        if (inputElement) {
            inputElement.classList.remove('border-gray-200');
            inputElement.classList.add('border-red-500');
        }
    });
}

// ===== MANEJO DE DATOS =====
function updateFormData() {
    // Datos personales
    formData.nombre = document.getElementById('nombre')?.value || '';
    formData.apellido = document.getElementById('apellido')?.value || '';
    formData.fechaNacimiento = document.getElementById('fechaNacimiento')?.value || '';
    formData.sexo = document.getElementById('sexo')?.value || '';
    formData.documento = document.getElementById('documento')?.value || '';
    formData.tipoSolicitante = document.getElementById('tipoSolicitante')?.value || '';

    // Contacto
    formData.correo = document.getElementById('correo')?.value || '';
    formData.telefono = document.getElementById('telefono')?.value || '';
    formData.password = document.getElementById('password')?.value || '';
    formData.confirmPassword = document.getElementById('confirmPassword')?.value || '';
    formData.provincia = document.getElementById('provincia')?.value || '';
    formData.ciudad = document.getElementById('ciudad')?.value || '';
    formData.calle = document.getElementById('calle')?.value || '';
    formData.numero = document.getElementById('numero')?.value || '';
    formData.piso = document.getElementById('piso')?.value || '';
    formData.departamento = document.getElementById('departamento')?.value || '';



    // Notificaciones
    formData.notificacionesProfesionales = document.getElementById('notificacionesProfesionales')?.checked || false;
    formData.notificacionesCapacitaciones = document.getElementById('notificacionesCapacitaciones')?.checked || false;

    // Términos
    formData.terminos = document.getElementById('terminos')?.checked || false;
}





// ===== ACTUALIZAR RESUMEN =====
function updateReviewSummary() {
    updateFormData();

    // Datos personales
    document.getElementById('review-nombre-completo').textContent = `${formData.nombre} ${formData.apellido}`;
    document.getElementById('review-fecha-nacimiento').textContent = formData.fechaNacimiento;
    document.getElementById('review-sexo').textContent = formData.sexo;

    // Nuevos campos de datos personales
    const documentoElement = document.getElementById('review-documento');
    if (documentoElement) {
        documentoElement.textContent = formData.documento;
    }

    const tipoSolicitanteElement = document.getElementById('review-tipo-solicitante');
    if (tipoSolicitanteElement) {
        tipoSolicitanteElement.textContent = formData.tipoSolicitante;
    }

    // Contacto
    document.getElementById('review-correo').textContent = formData.correo;
    document.getElementById('review-telefono').textContent = formData.telefono;

    // Construir dirección completa para mostrar
    let direccionCompleta = `${formData.calle} ${formData.numero}`;
    if (formData.piso) {
        direccionCompleta += `, Piso ${formData.piso}`;
    }
    if (formData.departamento) {
        direccionCompleta += `, Depto ${formData.departamento}`;
    }
    direccionCompleta += `, ${formData.ciudad}, ${formData.provincia}`;

    document.getElementById('review-ubicacion').textContent = direccionCompleta;



    // Las preferencias ya no están en el HTML, por lo que no intentamos actualizarlas
}

// ===== CONFIGURACIÓN DE LA API =====
const API_CONFIG = {
    baseURL: 'http://190.184.224.217/renasam/api', // Cambiar por tu URL de API
    endpoints: {
        registerSolicitante: '/auth/registro/solicitante'
    }
};

// ===== ENVÍO DEL FORMULARIO =====
async function submitForm() {
    try {
        updateFormData();

        // Mostrar estado de carga
        showLoadingState(true);

        // Preparar datos para envío
        const dataToSend = prepareFormDataForAPI();

        // Preparar FormData con el parámetro 'solicitante'
        const formData = new FormData();
        formData.append('solicitante', JSON.stringify(dataToSend));

        // Realizar petición a la API
        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.registerSolicitante}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json'
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
        }

        // Mostrar modal de confirmación
        document.getElementById('confirmModal').classList.remove('hidden');
        document.getElementById('confirmModal').classList.add('flex');

        // Opcional: Guardar token si la API lo devuelve
        if (result.token) {
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user_data', JSON.stringify(result.user));
            localStorage.setItem('user_type', 'solicitante');
        }

    } catch (error) {
        // Mostrar error específico al usuario
        showErrorMessage(error.message || 'Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');

    } finally {
        // Quitar estado de carga
        showLoadingState(false);
    }
}

// ===== PREPARAR DATOS PARA LA API =====
function prepareFormDataForAPI() {
    return {
        // Datos personales
        personal_data: {
            nombre: formData.nombre,
            apellido: formData.apellido,
            fecha_nacimiento: formData.fechaNacimiento,
            sexo: formData.sexo,
            documento: formData.documento,
            tipo_solicitante: formData.tipoSolicitante
        },

        // Datos de contacto
        contact_data: {
            email: formData.correo,
            telefono: formData.telefono,
            password: formData.password,
            direccion: {
                provincia: formData.provincia,
                ciudad: formData.ciudad,
                calle: formData.calle,
                numero: formData.numero,
                piso: formData.piso || null,
                departamento: formData.departamento || null,
                direccion_completa: `${formData.calle} ${formData.numero}${formData.piso ? `, Piso ${formData.piso}` : ''}${formData.departamento ? `, Depto ${formData.departamento}` : ''}, ${formData.ciudad}, ${formData.provincia}`
            }
        },





        // Configuración de notificaciones
        notifications: {
            profesionales: formData.notificacionesProfesionales,
            capacitaciones: formData.notificacionesCapacitaciones
        },

        // Términos y condiciones
        terms_accepted: formData.terminos,

        // Metadatos
        metadata: {
            registration_date: new Date().toISOString(),
            user_agent: navigator.userAgent,
            source: 'web_form'
        }
    };
}

// ===== FUNCIONES DE FEEDBACK VISUAL =====
function showLoadingState(isLoading) {
    const submitButtons = document.querySelectorAll('[id^="nextBtn-"]');

    submitButtons.forEach(btn => {
        if (btn) {
            if (isLoading) {
                btn.disabled = true;
                btn.classList.add('opacity-75', 'cursor-not-allowed');
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = 'Enviando...';
                }

                // Agregar spinner si no existe
                if (!btn.querySelector('.spinner')) {
                    const spinner = document.createElement('div');
                    spinner.className = 'spinner ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin';
                    btn.appendChild(spinner);
                }
            } else {
                btn.disabled = false;
                btn.classList.remove('opacity-75', 'cursor-not-allowed');
                const span = btn.querySelector('span');
                if (span) {
                    span.textContent = 'Finalizar Registro';
                }

                // Remover spinner
                const spinner = btn.querySelector('.spinner');
                if (spinner) {
                    spinner.remove();
                }
            }
        }
    });
}

function showErrorMessage(message) {
    // Crear alerta de error temporal
    const alert = document.createElement('div');
    alert.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    alert.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(alert);

    // Remover después de 5 segundos
    setTimeout(() => {
        alert.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(alert)) {
                document.body.removeChild(alert);
            }
        }, 300);
    }, 5000);
}

// ===== FUNCIONALIDAD DE ACORDEONES =====
function initializeReviewStep() {
    // Manejar toggles de secciones expandibles
    document.querySelectorAll('.review-toggle').forEach(toggle => {
        toggle.addEventListener('click', function () {
            const content = this.nextElementSibling;
            const chevron = this.querySelector('.review-chevron');

            content.classList.toggle('hidden');
            chevron.classList.toggle('rotate-180');
        });
    });

    // Manejar botones de editar secciones
    document.querySelectorAll('.edit-section-btn').forEach(editBtn => {
        editBtn.addEventListener('click', function () {
            const targetStep = parseInt(this.getAttribute('data-step'));

            if (targetStep >= 0 && targetStep < totalSteps) {
                goToStep(targetStep);
            }
        });
    });
}

// ===== OBTENER EMAIL DE LA URL =====
function getEmailFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');

    if (email) {
        const emailInput = document.getElementById('correo');
        if (emailInput) {
            emailInput.value = email;
            formData.correo = email;
        }
    }

    return email;
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function () {

    // Obtener email de la URL al cargar la página
    getEmailFromURL();

    // Inicializar funcionalidades
    initializeReviewStep();

    // Navegación con botones (ahora múltiples)
    prevBtns.forEach((btn, index) => {
        if (btn) {
            btn.addEventListener('click', () => {
                if (currentStep > 0) {
                    currentStep--;
                    updateStep();
                }
            });
        }
    });

    nextBtns.forEach((btn, index) => {
        if (btn) {
            btn.addEventListener('click', () => {
                updateFormData();

                if (validateStep(currentStep)) {
                    if (currentStep < 2) {
                        currentStep++;
                        updateStep();
                    } else {
                        submitForm();
                    }
                } else {
                    // Mostrar alerta y hacer scroll al primer error
                    showValidationAlert();
                }
            });
        }
    });

    // Navegación con indicadores de paso
    steps.forEach((step, index) => {
        step.addEventListener('click', () => {
            goToStep(index);
        });
    });

    // Event listeners para inputs
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            updateFormData();
            validateStep(currentStep);
        });

        input.addEventListener('change', () => {
            updateFormData();
            validateStep(currentStep);
        });
    });

    // Modal de confirmación
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('confirmModal').classList.add('hidden');
        document.getElementById('confirmModal').classList.remove('flex');
        // Redirigir o resetear formulario
        window.location.href = '../pages/login.html'; // Cambiar por la URL deseada
    });

    // Inicializar
    updateStep();
});