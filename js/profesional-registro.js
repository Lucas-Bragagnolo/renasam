const formData = {
    tipoProfesional: "",
    nombre: "", apellido: "", fechaNacimiento: "", fotoPerfil: null, sexo: "",
    correo: "", contraseña: "", confirmarContraseña: "", provincia: "", ciudad: "",
    profesionPrincipal: "", matricula: "", obrasSociales: [], atiendePrivado: false,
    certificaciones: [], cv: null,
    disponibilidad: {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
    },
    atencionPresencial: false,
    atencionVirtual: false, direccionPresencial: "", plataformasVirtuales: "",
    transporteDomicilio: false
};
const errors = {};
let currentStep = 0;

const provinces = [
    "Buenos Aires", "Catamarca", "Chaco", "Chubut", "Córdoba", "Corrientes",
    "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza",
    "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis",
    "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"
];
const citiesByProvince = {
    "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
    "Córdoba": ["Córdoba", "Villa María", "Río Cuarto"],
    "Catamarca": ["San Fernando del Valle", "Valle Viejo"],
    "Chaco": ["Resistencia", "Barranqueras"],
    "Chubut": ["Comodoro Rivadavia", "Trelew"],
    "Corrientes": ["Corrientes", "Goya"],
    "Entre Ríos": ["Paraná", "Concordia"],
    "Formosa": ["Formosa", "Clorinda"],
    "Jujuy": ["San Salvador de Jujuy", "Palpalá"],
    "La Pampa": ["Santa Rosa", "General Pico"],
    "La Rioja": ["La Rioja", "Chilecito"],
    "Mendoza": ["Mendoza", "San Rafael"],
    "Misiones": ["Posadas", "Oberá"],
    "Neuquén": ["Neuquén", "Cipolletti"],
    "Río Negro": ["Viedma", "San Carlos de Bariloche"],
    "Salta": ["Salta", "Tartagal"],
    "San Juan": ["San Juan", "Rawson"],
    "San Luis": ["San Luis", "Villa Mercedes"],
    "Santa Cruz": ["Río Gallegos", "Caleta Olivia"],
    "Santa Fe": ["Santa Fe", "Rosario"],
    "Santiago del Estero": ["Santiago del Estero", "La Banda"],
    "Tierra del Fuego": ["Ushuaia", "Río Grande"],
    "Tucumán": ["San Miguel de Tucumán", "Tafí Viejo"]
};

const steps = document.querySelectorAll('.step');
const sections = document.querySelectorAll('.form-section');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const provinciaSelect = document.getElementById('provincia');
const ciudadSelect = document.getElementById('ciudad');
const addCertificacionBtn = document.getElementById('add-certificacion');
const certificacionesContainer = document.getElementById('certificaciones-container');
const atencionPresencialCheckbox = document.getElementById('atencionPresencial');
const atencionVirtualCheckbox = document.getElementById('atencionVirtual');
const direccionPresencialGroup = document.getElementById('direccionPresencial-group');
const plataformasVirtualesGroup = document.getElementById('plataformasVirtuales-group');
// Panel de depuración eliminado

// Manejar clics en los pasos
steps.forEach(step => {
    step.addEventListener('click', () => {
        const targetStep = parseInt(step.dataset.step);
        if (targetStep <= currentStep || validateStep(currentStep)) {
            currentStep = targetStep;
            updateStep();
        }
    });
    step.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            step.click();
        }
    });
});

// Manejar botones de tipo de profesional
document.querySelectorAll('.tipo-profesional-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        formData.tipoProfesional = btn.dataset.value;
        document.querySelectorAll('.tipo-profesional-btn').forEach(b => {
            b.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
            b.classList.add('bg-gray-100', 'border-gray-300', 'text-gray-700');
            b.setAttribute('aria-checked', 'false');
        });
        btn.classList.remove('bg-gray-100', 'border-gray-300', 'text-gray-700');
        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-600');
        btn.setAttribute('aria-checked', 'true');
        validateStep(0); // Validar en tiempo real
    });
    btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            btn.click();
        }
    });
});

// Inicializar provincias
provinces.forEach(prov => {
    const option = document.createElement('option');
    option.value = prov;
    option.textContent = prov;
    provinciaSelect.appendChild(option);
});

// Manejar cambio de provincia
provinciaSelect.addEventListener('change', (e) => {
    const province = e.target.value;
    formData.provincia = province;
    formData.ciudad = '';
    ciudadSelect.innerHTML = '<option value="">Selecciona una ciudad</option>';
    ciudadSelect.disabled = !province;
    if (province && citiesByProvince[province]) {
        citiesByProvince[province].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            ciudadSelect.appendChild(option);
        });
        ciudadSelect.disabled = false;
    }
    validateStep(1); // Validar en tiempo real
});

// ❌ CÓDIGO VIEJO ELIMINADO - Ahora se usa event delegation en initializeAvailabilityGrid()

// Manejar certificaciones
// Usar la función nueva de certificaciones
addCertificacionBtn.addEventListener('click', () => {
    const certCard = createCertificationCard();
    certificacionesContainer.appendChild(certCard);

    // Agregar event listeners para la nueva certificación
    const certId = certCard.querySelector('.cert-nombre').dataset.certId;

    certCard.querySelector('.remove-cert').addEventListener('click', function () {
        certCard.remove();
        // Remover de formData
        formData.certificaciones = formData.certificaciones.filter(cert => cert.id !== certId);
        validateStep(2);
    });

    // Event listeners para inputs de certificación
    certCard.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', function () {
            updateCertificationData(certId);
            validateStep(2);
        });
    });
});

// Manejar checkboxes de atención
atencionPresencialCheckbox.addEventListener('change', (e) => {
    formData.atencionPresencial = e.target.checked;
    direccionPresencialGroup.classList.toggle('hidden', !e.target.checked);
    
    // Limpiar el campo de dirección cuando se desmarca el checkbox
    if (!e.target.checked) {
        const direccionInput = document.getElementById('direccionPresencial');
        if (direccionInput) {
            direccionInput.value = '';
            formData.direccionPresencial = '';
            
            // Limpiar errores relacionados
            const errorElement = document.getElementById('error-direccionPresencial');
            if (errorElement) {
                errorElement.textContent = '';
            }
            direccionInput.classList.remove('border-red-500');
            direccionInput.setAttribute('aria-invalid', 'false');
            
            // Remover error del objeto errors
            delete errors.direccionPresencial;
        }
    }
    
    validateStep(3); // Validar en tiempo real
});
atencionVirtualCheckbox.addEventListener('change', (e) => {
    formData.atencionVirtual = e.target.checked;
    plataformasVirtualesGroup.classList.toggle('hidden', !e.target.checked);
    
    // Limpiar el campo de plataformas cuando se desmarca el checkbox
    if (!e.target.checked) {
        const plataformasInput = document.getElementById('plataformasVirtuales');
        if (plataformasInput) {
            plataformasInput.value = '';
            formData.plataformasVirtuales = '';
            
            // Limpiar errores relacionados
            const errorElement = document.getElementById('error-plataformasVirtuales');
            if (errorElement) {
                errorElement.textContent = '';
            }
            plataformasInput.classList.remove('border-red-500');
            plataformasInput.setAttribute('aria-invalid', 'false');
            
            // Remover error del objeto errors
            delete errors.plataformasVirtuales;
        }
    }
    
    validateStep(3); // Validar en tiempo real
});

// Manejar inputs del formulario
document.querySelectorAll('input, select').forEach(input => {
    if (!input.classList.contains('cert-nombre') && !input.classList.contains('cert-institucion') && !input.classList.contains('cert-fecha') && !input.classList.contains('cert-archivo')) {
        if (input.type === 'file') {
            input.addEventListener('change', (e) => {
                formData[input.name] = e.target.files[0] || null;
                validateStep(currentStep); // Validar en tiempo real
            });
        } else if (input.type === 'checkbox') {
            input.addEventListener('change', (e) => {
                formData[input.name] = e.target.checked;
                validateStep(currentStep); // Validar en tiempo real
            });
        } else if (input.multiple) {
            input.addEventListener('change', (e) => {
                formData[input.name] = Array.from(e.target.selectedOptions, option => option.value);
                validateStep(currentStep); // Validar en tiempo real
            });
        } else {
            input.addEventListener('input', (e) => {
                formData[input.name] = e.target.value.trim();
                validateStep(currentStep); // Validar en tiempo real
            });
        }
    }
});

// Validación por paso
function validateStep(step) {
    const newErrors = {};
    if (step === 0) {
        if (!formData.tipoProfesional) newErrors.tipoProfesional = 'El tipo de profesional es requerido';
    } else if (step === 1) {
        if (!formData.nombre || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.nombre)) {
            newErrors.nombre = formData.nombre ? 'El nombre solo debe contener letras y espacios' : 'El nombre es requerido';
        }
        if (!formData.apellido || !/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.apellido)) {
            newErrors.apellido = formData.apellido ? 'El apellido solo debe contener letras y espacios' : 'El apellido es requerido';
        }
        if (!formData.fechaNacimiento) newErrors.fechaNacimiento = 'La fecha de nacimiento es requerida';
        if (!formData.fotoPerfil) {
            newErrors.fotoPerfil = 'La foto de perfil es requerida';
        } else if (formData.fotoPerfil.size > 2 * 1024 * 1024) {
            newErrors.fotoPerfil = 'La foto debe ser menor a 2MB';
        } else if (!['image/jpeg', 'image/png'].includes(formData.fotoPerfil.type)) {
            newErrors.fotoPerfil = 'La foto debe ser JPG o PNG';
        }
        if (!formData.sexo) newErrors.sexo = 'El sexo es requerido';
        if (!formData.correo || !/\S+@\S+\.\S+/.test(formData.correo)) newErrors.correo = 'Correo inválido';
        if (!formData.contraseña || formData.contraseña.length < 8 || !/[A-Z]/.test(formData.contraseña) || !/[0-9]/.test(formData.contraseña) || !/[!@#$%^&*]/.test(formData.contraseña)) newErrors.contraseña = 'Mínimo 8 caracteres, 1 mayúscula, 1 número, 1 símbolo';
        if (formData.contraseña !== formData.confirmarContraseña) newErrors.confirmarContraseña = 'Las contraseñas no coinciden';
        if (!formData.provincia) newErrors.provincia = 'La provincia es requerida';
        if (!formData.ciudad) newErrors.ciudad = 'La ciudad es requerida';
    } else if (step === 2) {
        if (!formData.profesionPrincipal) newErrors.profesionPrincipal = 'La profesión es requerida';
        if (!formData.matricula) newErrors.matricula = 'El número de matrícula es requerido';
        if (formData.cv && formData.cv.size > 5 * 1024 * 1024) newErrors.cv = 'El CV debe ser menor a 5MB';
        if (formData.certificaciones.length > 0) {
            formData.certificaciones.forEach((cert, index) => {
                if (!cert.nombre.trim()) newErrors[`${cert.id}-nombre`] = 'El nombre de la certificación no puede estar vacío';
                if (!cert.institucion.trim()) newErrors[`${cert.id}-institucion`] = 'La institución no puede estar vacía';
                if (!cert.fecha) newErrors[`${cert.id}-fecha`] = 'La fecha de emisión es requerida';
                if (cert.archivo) {
                    if (cert.archivo.size > 2 * 1024 * 1024) newErrors[`${cert.id}-archivo`] = 'El archivo debe ser menor a 2MB';
                    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(cert.archivo.type)) {
                        newErrors[`${cert.id}-archivo`] = 'El archivo debe ser PDF, JPG o PNG';
                    }
                }
            });
        }
    } else if (step === 3) {
        // Limpiar datos antes de validar
        cleanAvailabilityData();

        // Contar horarios disponibles después de la limpieza
        const totalHours = Object.values(formData.disponibilidad).reduce((total, hours) => total + hours.length, 0);
        if (totalHours === 0) newErrors.disponibilidad = 'Seleccione al menos un horario';
        if (!formData.atencionPresencial && !formData.atencionVirtual) newErrors.atencion = 'Seleccione al menos un tipo de atención';
        
        // Solo validar dirección presencial si la atención presencial está marcada
        if (formData.atencionPresencial && !formData.direccionPresencial?.trim()) {
            newErrors.direccionPresencial = 'La dirección es requerida si seleccionas atención presencial';
        }
        
        // Solo validar plataformas virtuales si la atención virtual está marcada
        if (formData.atencionVirtual && !formData.plataformasVirtuales?.trim()) {
            newErrors.plataformasVirtuales = 'Las plataformas son requeridas si seleccionas atención virtual';
        }
        
        // Log para debugging
        console.log('🔍 Validación paso 3:');
        console.log('- Atención presencial:', formData.atencionPresencial);
        console.log('- Dirección presencial:', formData.direccionPresencial);
        console.log('- Atención virtual:', formData.atencionVirtual);
        console.log('- Plataformas virtuales:', formData.plataformasVirtuales);
        console.log('- Errores encontrados:', newErrors);
    }

    // Actualizar errores en el DOM
    Object.keys(newErrors).forEach(key => {
        errors[key] = newErrors[key];
        const errorElement = document.getElementById(`error-${key}`);
        if (errorElement) {
            errorElement.textContent = newErrors[key];
            const input = document.getElementById(key);
            if (input) {
                input.setAttribute('aria-invalid', 'true');
                input.classList.add('border-red-500');
            }
        }
    });

    // Limpiar errores que ya no son válidos
    Object.keys(errors).forEach(key => {
        if (!newErrors[key]) {
            delete errors[key];
            const errorElement = document.getElementById(`error-${key}`);
            if (errorElement) errorElement.textContent = '';
            const input = document.getElementById(key);
            if (input) {
                input.setAttribute('aria-invalid', 'false');
                input.classList.remove('border-red-500');
            }
        }
    });

    // Actualizar validación visual para certificaciones
    formData.certificaciones.forEach(cert => {
        ['nombre', 'institucion', 'fecha', 'archivo'].forEach(field => {
            const input = document.getElementById(`${cert.id}-${field}`);
            const errorKey = `${cert.id}-${field}`;
            if (input) {
                if (errors[errorKey]) {
                    input.classList.add('border-red-500');
                    input.setAttribute('aria-invalid', 'true');
                } else {
                    input.classList.remove('border-red-500');
                    input.setAttribute('aria-invalid', 'false');
                }
            }
        });
    });

    return Object.keys(newErrors).length === 0;
}

// Panel de depuración eliminado

// Navegación entre pasos
function updateStep() {
    steps.forEach(s => {
        s.classList.remove('bg-blue-600', 'text-white');
        s.removeAttribute('aria-current');
    });
    sections.forEach(s => s.classList.add('hidden'));
    steps[currentStep].classList.add('bg-blue-600', 'text-white');
    steps[currentStep].setAttribute('aria-current', 'step');
    sections[currentStep].classList.remove('hidden');
    sections[currentStep].classList.add('active');
    prevBtn.classList.toggle('hidden', currentStep === 0);
    nextBtn.textContent = currentStep === 4 ? 'Confirmar y Finalizar' : 'Siguiente';
    nextBtn.setAttribute('aria-label', currentStep === 4 ? 'Confirmar y finalizar registro' : 'Avanzar al siguiente paso');
    if (currentStep === 3) {
        // Limpiar datos de disponibilidad al entrar al paso de horarios
        cleanAvailabilityData();
    } else if (currentStep === 4) {
        // Limpiar datos antes de mostrar la revisión
        cleanAvailabilityData();
        // Usar la nueva función de actualización del paso 5
        if (typeof updateReviewSummary === 'function') {
            updateReviewSummary();
        }
    }
    validateStep(currentStep); // Validar al cambiar de paso
}

prevBtn.addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        updateStep();
    }
});

nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        if (currentStep < 4) {
            currentStep++;
            updateStep();
        } else {
            submitForm();
        }
    }
});

// ===== CONFIGURACIÓN DE LA API =====
const API_CONFIG = {
    baseURL: 'https://api.renasam.com', // Cambiar por tu URL de API
    endpoints: {
        registerProfesional: '/auth/register/profesional'
    }
};

// ===== ENVÍO DEL FORMULARIO =====
async function submitForm() {
    try {
        console.log('🚀 === INICIO DEL PROCESO DE ENVÍO PROFESIONAL ===');

        // Limpiar datos antes del envío
        cleanAvailabilityData();

        console.log('📋 Datos del formulario actualizados:', {
            formData: formData,
            timestamp: new Date().toISOString()
        });

        // Mostrar estado de carga
        showLoadingState(true);
        console.log('⏳ Estado de carga activado');

        // Preparar FormData para archivos
        const formDataToSend = prepareFormDataForAPI();

        console.log('📦 === DATOS PREPARADOS PARA API ===');
        console.log('🔍 FormData preparado con archivos');
        console.log('📄 Archivos incluidos:', {
            fotoPerfil: formData.fotoPerfil ? `${formData.fotoPerfil.name} (${formData.fotoPerfil.size} bytes)` : 'No incluido',
            cv: formData.cv ? `${formData.cv.name} (${formData.cv.size} bytes)` : 'No incluido',
            certificaciones: formData.certificaciones.map(cert =>
                cert.archivo ? `${cert.archivo.name} (${cert.archivo.size} bytes)` : 'Sin archivo'
            )
        });

        // Información de la petición
        const requestInfo = {
            url: `${API_CONFIG.baseURL}${API_CONFIG.endpoints.registerProfesional}`,
            method: 'POST',
            headers: {
                'Accept': 'application/json'
                // No incluir Content-Type para FormData, el browser lo maneja automáticamente
            },
            bodySize: 'FormData con archivos'
        };

        console.log('🌐 === INFORMACIÓN DE LA PETICIÓN ===');
        console.log('🔗 URL completa:', requestInfo.url);
        console.log('📝 Método:', requestInfo.method);
        console.log('📋 Headers:', requestInfo.headers);
        console.log('📏 Tipo de body:', requestInfo.bodySize);

        console.log('📤 Enviando petición a la API...');

        // Realizar petición a la API
        const response = await fetch(requestInfo.url, {
            method: requestInfo.method,
            headers: requestInfo.headers,
            body: formDataToSend
        });

        console.log('📥 === RESPUESTA RECIBIDA ===');
        console.log('🔢 Status:', response.status);
        console.log('✅ OK:', response.ok);
        console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

        const result = await response.json();

        console.log('📄 Contenido de la respuesta:', result);

        if (!response.ok) {
            console.error('❌ Error en la respuesta:', {
                status: response.status,
                statusText: response.statusText,
                error: result
            });
            throw new Error(result.message || `Error ${response.status}: ${response.statusText}`);
        }

        console.log('🎉 === REGISTRO EXITOSO ===');
        console.log('✅ Respuesta exitosa:', result);

        // Mostrar mensaje de éxito
        showSuccessMessage();

        // Opcional: Guardar token si la API lo devuelve
        if (result.token) {
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user_data', JSON.stringify(result.user));
            localStorage.setItem('user_type', 'profesional');
            console.log('💾 Token y datos de usuario guardados en localStorage');
        }

    } catch (error) {
        console.error('💥 === ERROR EN EL PROCESO ===');
        console.error('❌ Tipo de error:', error.name);
        console.error('📝 Mensaje:', error.message);
        console.error('🔍 Stack trace:', error.stack);

        // Mostrar error específico al usuario
        showErrorMessage(error.message || 'Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');

    } finally {
        // Quitar estado de carga
        showLoadingState(false);
        console.log('🔄 Estado de carga desactivado');
        console.log('🏁 === FIN DEL PROCESO DE ENVÍO ===');
    }
}

// ===== PREPARAR FORMDATA PARA LA API =====
function prepareFormDataForAPI() {
    const formDataToSend = new FormData();

    // Datos básicos del profesional
    const professionalData = {
        tipoProfesional: formData.tipoProfesional,
        nombre: formData.nombre,
        apellido: formData.apellido,
        fechaNacimiento: formData.fechaNacimiento,
        sexo: formData.sexo,
        correo: formData.correo,
        contraseña: formData.contraseña,
        provincia: formData.provincia,
        ciudad: formData.ciudad,
        profesionPrincipal: formData.profesionPrincipal,
        matricula: formData.matricula,
        atiendePrivado: formData.atiendePrivado,
        atencionPresencial: formData.atencionPresencial,
        atencionVirtual: formData.atencionVirtual,
        direccionPresencial: formData.direccionPresencial,
        plataformasVirtuales: formData.plataformasVirtuales,
        transporteDomicilio: formData.transporteDomicilio
    };

    // Agregar datos básicos como JSON
    formDataToSend.append('professional_data', JSON.stringify(professionalData));

    // Agregar arrays como JSON
    formDataToSend.append('obrasSociales', JSON.stringify(formData.obrasSociales));

    // Usar datos limpios para disponibilidad
    const cleanAvailability = getCleanAvailabilityData();
    formDataToSend.append('disponibilidad', JSON.stringify(cleanAvailability));

    // Agregar archivos principales
    if (formData.fotoPerfil) {
        formDataToSend.append('fotoPerfil', formData.fotoPerfil);
    }

    if (formData.cv) {
        formDataToSend.append('cv', formData.cv);
    }

    // Agregar certificaciones
    formData.certificaciones.forEach((cert, index) => {
        formDataToSend.append(`certificaciones[${index}][nombre]`, cert.nombre);
        formDataToSend.append(`certificaciones[${index}][institucion]`, cert.institucion);
        formDataToSend.append(`certificaciones[${index}][fecha]`, cert.fecha);
        if (cert.archivo) {
            formDataToSend.append(`certificaciones[${index}][archivo]`, cert.archivo);
        }
    });

    // Metadatos
    const metadata = {
        registration_date: new Date().toISOString(),
        user_agent: navigator.userAgent,
        source: 'web_form'
    };
    formDataToSend.append('metadata', JSON.stringify(metadata));

    return formDataToSend;
}

// ===== FUNCIONES DE FEEDBACK VISUAL =====
function showLoadingState(isLoading) {
    if (isLoading) {
        nextBtn.disabled = true;
        nextBtn.classList.add('opacity-75', 'cursor-not-allowed');
        nextBtn.textContent = 'Enviando...';

        // Agregar spinner si no existe
        if (!nextBtn.querySelector('.spinner')) {
            const spinner = document.createElement('div');
            spinner.className = 'spinner ml-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block';
            nextBtn.appendChild(spinner);
        }
    } else {
        nextBtn.disabled = false;
        nextBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        nextBtn.textContent = 'Confirmar y Finalizar';

        // Remover spinner
        const spinner = nextBtn.querySelector('.spinner');
        if (spinner) {
            spinner.remove();
        }
    }
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

// Resetear formulario
function resetForm() {
    Object.keys(formData).forEach(key => {
        if (key === 'disponibilidad') formData[key] = {};
        else if (key === 'obrasSociales' || key === 'certificaciones') formData[key] = [];
        else formData[key] = key.includes('file') ? null : '';
    });
    document.querySelectorAll('input, select').forEach(input => {
        if (input.type === 'checkbox') input.checked = false;
        else if (input.type !== 'file') input.value = '';
        else input.value = null;
        input.classList.remove('border-red-500');
        input.setAttribute('aria-invalid', 'false');
    });
    document.querySelectorAll('.hour-block').forEach(block => block.classList.remove('bg-blue-600', 'text-white', 'border-blue-600'));
    document.querySelectorAll('.tipo-profesional-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-600');
        btn.classList.add('bg-gray-100', 'border-gray-300', 'text-gray-700');
        btn.setAttribute('aria-checked', 'false');
    });
    certificacionesContainer.innerHTML = '';
    ciudadSelect.innerHTML = '<option value="">Selecciona provincia primero</option>';
    ciudadSelect.disabled = true;
    Object.keys(errors).forEach(key => {
        const errorElement = document.getElementById(`error-${key}`);
        if (errorElement) errorElement.textContent = '';
    });
    errors = {};
    currentStep = 0;
    updateStep();
}

// Inicializar
updateStep();

// ===== FUNCIONES PARA EL PASO 5 MEJORADO =====

// Inicializar funcionalidad del paso 5
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

    // Manejar botones de edición
    document.querySelectorAll('.edit-section-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const targetStep = parseInt(this.dataset.step);
            goToStep(targetStep);
        });
    });

    // Manejar checkboxes de términos y condiciones
    const acceptTerms = document.getElementById('acceptTerms');
    const acceptDataProcessing = document.getElementById('acceptDataProcessing');
    const completeBtn = document.getElementById('complete-registration');

    function updateCompleteButton() {
        const canComplete = acceptTerms.checked && acceptDataProcessing.checked;
        completeBtn.disabled = !canComplete;
    }

    acceptTerms.addEventListener('change', updateCompleteButton);
    acceptDataProcessing.addEventListener('change', updateCompleteButton);

    // Manejar finalización del registro
    completeBtn.addEventListener('click', function () {
        if (this.disabled) return;

        // Mostrar loading
        this.innerHTML = `
            <svg class="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
        `;
        this.disabled = true;

        // Simular envío (aquí iría la lógica real de envío)
        setTimeout(() => {
            showSuccessMessage();
        }, 2000);
    });
}

// Actualizar el resumen del paso 5
function updateReviewSummary() {
    // Resumen ejecutivo
    const nombreCompleto = `${formData.nombre} ${formData.apellido}`;
    const profesionTipo = `${formData.profesionPrincipal} - ${formData.tipoProfesional}`;
    const ubicacion = `${formData.ciudad}, ${formData.provincia}`;

    // Contar disponibilidad correctamente
    const totalHours = Object.values(formData.disponibilidad).reduce((total, dayHours) => {
        return total + (Array.isArray(dayHours) ? dayHours.length : 0);
    }, 0);
    
    const daysWithHours = Object.entries(formData.disponibilidad).filter(([day, hours]) =>
        Array.isArray(hours) && hours.length > 0
    ).length;
    
    const disponibilidadText = totalHours > 0 ?
        `${totalHours} horarios en ${daysWithHours} días` : 'Sin horarios definidos';

    document.getElementById('review-nombre-completo').textContent = nombreCompleto;
    document.getElementById('review-profesion-tipo').textContent = profesionTipo;
    document.getElementById('review-ubicacion-resumen').textContent = ubicacion;
    document.getElementById('review-disponibilidad-resumen').textContent = disponibilidadText;

    // Datos personales
    document.getElementById('review-nombre').textContent = formData.nombre;
    document.getElementById('review-apellido').textContent = formData.apellido;
    document.getElementById('review-fechaNacimiento').textContent = formatDate(formData.fechaNacimiento);
    document.getElementById('review-sexo').textContent = formData.sexo;
    document.getElementById('review-correo').textContent = formData.correo;
    document.getElementById('review-provincia').textContent = formData.provincia;
    document.getElementById('review-ciudad').textContent = formData.ciudad;

    // Información profesional
    document.getElementById('review-tipoProfesional').textContent = formData.tipoProfesional;
    document.getElementById('review-profesionPrincipal').textContent = formData.profesionPrincipal;
    document.getElementById('review-matricula').textContent = formData.matricula;
    document.getElementById('review-atiendePrivado').textContent = formData.atiendePrivado ? 'Sí' : 'No';

    // Obras sociales como badges
    const obrasSocialesContainer = document.getElementById('review-obrasSociales-list');
    obrasSocialesContainer.innerHTML = '';
    if (formData.obrasSociales && formData.obrasSociales.length > 0) {
        formData.obrasSociales.forEach(obra => {
            const badge = document.createElement('span');
            badge.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
            badge.textContent = obra;
            obrasSocialesContainer.appendChild(badge);
        });
    } else {
        obrasSocialesContainer.innerHTML = '<span class="text-gray-500 text-sm">No especificadas</span>';
    }

    // Certificaciones
    const certificacionesContainer = document.getElementById('review-certificaciones');
    certificacionesContainer.innerHTML = '';
    if (formData.certificaciones && formData.certificaciones.length > 0) {
        formData.certificaciones.forEach(cert => {
            const certDiv = document.createElement('div');
            certDiv.className = 'bg-gray-50 rounded-lg p-3 mb-2';
            certDiv.innerHTML = `
                <p class="font-medium text-gray-900">${cert.nombre}</p>
                <p class="text-sm text-gray-600">${cert.institucion} - ${cert.fecha}</p>
            `;
            certificacionesContainer.appendChild(certDiv);
        });
    } else {
        certificacionesContainer.innerHTML = '<span class="text-gray-500 text-sm">No especificadas</span>';
    }

    // Disponibilidad visual
    updateAvailabilityVisual();

    // Modalidades de atención
    document.getElementById('review-atencionPresencial').textContent = formData.atencionPresencial ? 'Sí' : 'No';
    document.getElementById('review-direccionPresencial').textContent =
        formData.atencionPresencial ? formData.direccionPresencial : '';

    document.getElementById('review-atencionVirtual').textContent = formData.atencionVirtual ? 'Sí' : 'No';
    document.getElementById('review-plataformasVirtuales').textContent =
        formData.atencionVirtual ? formData.plataformasVirtuales : '';

    document.getElementById('review-transporteDomicilio').textContent = formData.transporteDomicilio ? 'Sí' : 'No';
}

// Crear visualización de disponibilidad
function updateAvailabilityVisual() {
    const container = document.getElementById('review-disponibilidad-visual');
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const dayKeys = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    console.log('🔄 Actualizando visualización de disponibilidad...');
    console.log('Datos de disponibilidad:', formData.disponibilidad);

    container.innerHTML = '';

    days.forEach((day, index) => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'text-center';

        const dayHeader = document.createElement('div');
        dayHeader.className = 'font-semibold text-gray-700 mb-1';
        dayHeader.textContent = day;
        dayColumn.appendChild(dayHeader);

        // Obtener horarios disponibles para este día usando la clave correcta
        const dayKey = dayKeys[index];
        const dayHours = formData.disponibilidad[dayKey] || [];
        const availableHours = Array.isArray(dayHours) ? dayHours.length : 0;

        const hoursDiv = document.createElement('div');
        hoursDiv.className = `h-8 rounded flex items-center justify-center text-xs font-medium ${availableHours > 0
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-500'
            }`;
        
        if (availableHours > 0) {
            // Mostrar rango de horarios si hay disponibilidad
            const sortedHours = [...dayHours].sort();
            const firstHour = sortedHours[0];
            const lastHour = sortedHours[sortedHours.length - 1];
            
            if (availableHours === 1) {
                hoursDiv.textContent = firstHour;
            } else if (availableHours <= 3) {
                hoursDiv.textContent = `${availableHours}h`;
            } else {
                hoursDiv.textContent = `${firstHour}-${lastHour}`;
            }
            
            // Agregar tooltip con todos los horarios
            hoursDiv.title = `${dayHours.join(', ')}`;
        } else {
            hoursDiv.textContent = '-';
        }
        
        dayColumn.appendChild(hoursDiv);
        container.appendChild(dayColumn);
    });
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Mostrar mensaje de éxito
function showSuccessMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="text-center py-16">
            <div class="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-8">
                <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">¡Registro Completado!</h2>
            <p class="text-xl text-gray-600 mb-8">Tu perfil profesional ha sido enviado para revisión</p>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                <h3 class="text-lg font-semibold text-blue-900 mb-2">¿Qué sigue ahora?</h3>
                <ul class="text-left text-blue-800 space-y-2">
                    <li class="flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Nuestro equipo revisará tu información en 24-48 horas
                    </li>
                    <li class="flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Te enviaremos un correo con el estado de tu solicitud
                    </li>
                    <li class="flex items-center">
                        <svg class="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                        </svg>
                        Una vez aprobado, podrás acceder a tu panel profesional
                    </li>
                </ul>
            </div>
            <div class="space-x-4">
                <a href="../pages/login.html" class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    Ir al Login
                </a>
                <a href="../pages/index.html" class="inline-flex items-center px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                    Volver al Inicio
                </a>
            </div>
        </div>
    `;
}

// Inicializar el paso 5 cuando se muestre
function initializeStep5IfNeeded() {
    if (currentStep === 4) { // Paso 5 (índice 4)
        setTimeout(() => {
            updateReviewSummary();
            if (document.querySelector('.review-toggle') && !document.querySelector('.review-toggle').hasAttribute('data-initialized')) {
                initializeReviewStep();
                document.querySelectorAll('.review-toggle').forEach(toggle => {
                    toggle.setAttribute('data-initialized', 'true');
                });
            }
        }, 100);
    }
}

// ===== FUNCIONES DE PROGRESO MEJORADAS =====
function updateProgressIndicator() {
    const percentage = ((currentStep + 1) / 5) * 100;
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `Paso ${currentStep + 1} de 5`;

    // Actualizar pasos visuales con animaciones
    steps.forEach((step, index) => {
        step.classList.remove('bg-blue-600', 'text-white', 'bg-green-600');
        step.classList.add('bg-gray-200', 'text-gray-600');

        if (index < currentStep) {
            step.classList.remove('bg-gray-200', 'text-gray-600');
            step.classList.add('bg-green-600', 'text-white');
        } else if (index === currentStep) {
            step.classList.remove('bg-gray-200', 'text-gray-600');
            step.classList.add('bg-blue-600', 'text-white');
            step.setAttribute('aria-current', 'step');
        } else {
            step.removeAttribute('aria-current');
        }
    });
}

// ===== FUNCIONES MEJORADAS DE SELECCIÓN =====
function initializeTipoProfesionalButtons() {
    document.querySelectorAll('.tipo-profesional-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            // Remover selección anterior
            document.querySelectorAll('.tipo-profesional-btn').forEach(b => {
                b.classList.remove('border-blue-500', 'bg-blue-50');
                b.classList.add('border-gray-200');
                const indicator = b.querySelector('.absolute div');
                if (indicator) indicator.classList.add('hidden');
                b.setAttribute('aria-checked', 'false');
            });

            // Agregar selección actual
            this.classList.remove('border-gray-200');
            this.classList.add('border-blue-500', 'bg-blue-50');
            const indicator = this.querySelector('.absolute div');
            if (indicator) indicator.classList.remove('hidden');
            this.setAttribute('aria-checked', 'true');

            // Actualizar datos
            formData.tipoProfesional = this.dataset.value;
            validateStep(0);
        });
    });
}

// ===== MAPEO DE DÍAS CENTRALIZADO =====
const DAY_MAP = {
    'Lun': 'lunes',
    'Mar': 'martes',
    'Mié': 'miercoles',
    'Jue': 'jueves',
    'Vie': 'viernes',
    'Sáb': 'sabado',
    'Dom': 'domingo'
};

// ===== FUNCIÓN DE LIMPIEZA DE DISPONIBILIDAD MEJORADA =====
function cleanAvailabilityData() {
    console.log('🧹 Limpiando datos de disponibilidad...');
    console.log('Antes:', JSON.stringify(formData.disponibilidad, null, 2));

    // Estructura limpia base
    const cleanData = {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
    };

    // Migrar datos de todas las claves posibles
    const allPossibleKeys = {
        // Claves correctas (español completo)
        'lunes': 'lunes',
        'martes': 'martes',
        'miercoles': 'miercoles',
        'jueves': 'jueves',
        'viernes': 'viernes',
        'sabado': 'sabado',
        'domingo': 'domingo',
        // Claves incorrectas (abreviadas)
        'Lun': 'lunes',
        'Mar': 'martes',
        'Mié': 'miercoles',
        'Jue': 'jueves',
        'Vie': 'viernes',
        'Sáb': 'sabado',
        'Dom': 'domingo'
    };

    // Migrar todos los datos a las claves correctas
    Object.keys(allPossibleKeys).forEach(key => {
        const correctKey = allPossibleKeys[key];
        if (formData.disponibilidad[key] && Array.isArray(formData.disponibilidad[key])) {
            // Combinar sin duplicados
            const combined = [...new Set([...cleanData[correctKey], ...formData.disponibilidad[key]])];
            cleanData[correctKey] = combined.sort();
        }
    });

    // Reemplazar completamente la estructura
    formData.disponibilidad = cleanData;

    console.log('Después:', JSON.stringify(formData.disponibilidad, null, 2));
    console.log('✅ Limpieza completada');
}

// ===== FUNCIÓN PARA OBTENER DATOS LIMPIOS DE DISPONIBILIDAD =====
function getCleanAvailabilityData() {
    console.log('🔄 Obteniendo datos limpios de disponibilidad...');
    // Limpiar los datos primero
    cleanAvailabilityData();
    // Retornar una copia limpia para evitar referencias a datos viejos
    return JSON.parse(JSON.stringify(formData.disponibilidad));
}

// ===== FUNCIÓN CENTRALIZADA PARA MANEJAR DISPONIBILIDAD =====
function toggleHourAvailability(dayAbbr, hour) {
    const dayKey = DAY_MAP[dayAbbr];
    if (!dayKey) {
        console.warn(`Día no válido: ${dayAbbr}`);
        return false;
    }

    // Asegurar que el array existe
    if (!Array.isArray(formData.disponibilidad[dayKey])) {
        formData.disponibilidad[dayKey] = [];
    }

    const hourIndex = formData.disponibilidad[dayKey].indexOf(hour);
    let isSelected = false;

    if (hourIndex === -1) {
        // Agregar hora
        formData.disponibilidad[dayKey].push(hour);
        formData.disponibilidad[dayKey].sort(); // Mantener ordenado
        isSelected = true;
    } else {
        // Remover hora
        formData.disponibilidad[dayKey].splice(hourIndex, 1);
        isSelected = false;
    }

    console.log(`Toggled ${dayAbbr} ${hour}: ${isSelected ? 'selected' : 'deselected'}`);

    // Limpiar datos después de cualquier cambio para prevenir duplicados
    cleanAvailabilityData();

    console.log('Current availability:', formData.disponibilidad);

    return isSelected;
}

// ===== FUNCIONES DE DISPONIBILIDAD MEJORADAS =====
function initializeAvailabilityGrid() {
    console.log('🔄 Inicializando grid de disponibilidad...');

    // Usar event delegation para manejar clics en horarios
    // Esto funciona incluso si los elementos se agregan dinámicamente
    document.addEventListener('click', function (event) {
        // Verificar si el elemento clickeado es un hour-block
        if (event.target.classList.contains('hour-block')) {
            console.log('✅ Click detectado en hour-block:', event.target.dataset.day, event.target.dataset.hour);

            const day = event.target.dataset.day;
            const hour = event.target.dataset.hour;

            if (!day || !hour) {
                console.warn('⚠️ Datos faltantes:', { day, hour });
                return;
            }

            // Usar función centralizada
            const isSelected = toggleHourAvailability(day, hour);
            console.log(`🎯 Resultado: ${isSelected ? 'seleccionado' : 'deseleccionado'}`);

            // Actualizar UI
            if (isSelected) {
                event.target.classList.remove('bg-gray-50', 'border-gray-200');
                event.target.classList.add('bg-indigo-500', 'text-white', 'border-indigo-500');
            } else {
                event.target.classList.remove('bg-indigo-500', 'text-white', 'border-indigo-500');
                event.target.classList.add('bg-gray-50', 'border-gray-200');
            }

            updateSelectionSummary();
            validateStep(3);
        }
    });

    // Verificar si existen los elementos
    const hourBlocks = document.querySelectorAll('.hour-block');
    console.log(`📊 Encontrados ${hourBlocks.length} elementos .hour-block`);

    if (hourBlocks.length === 0) {
        console.warn('⚠️ No se encontraron elementos .hour-block al inicializar');
    } else {
        console.log('✅ Event delegation configurado correctamente');
    }

    // Event listeners para patrones predefinidos
    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const pattern = this.dataset.pattern;
            applyPattern(pattern);

            // Feedback visual
            document.querySelectorAll('.pattern-btn').forEach(b => {
                b.classList.remove('border-blue-400', 'bg-blue-100');
                b.classList.add('border-blue-200', 'bg-white');
            });
            this.classList.remove('border-blue-200', 'bg-white');
            this.classList.add('border-blue-400', 'bg-blue-100');
        });
    });

    // Event listeners para selección por bloques
    document.querySelectorAll('.block-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const block = this.dataset.block;
            const selectedDay = document.querySelector('.day-column.selected');

            if (selectedDay) {
                applyBlockToDay(selectedDay, block);
            } else {
                // Si no hay día seleccionado, aplicar a todos los días
                document.querySelectorAll('.day-column').forEach(dayColumn => {
                    applyBlockToDay(dayColumn, block);
                });
            }
        });
    });

    // Event listeners para seleccionar días
    document.querySelectorAll('.day-column p').forEach(dayHeader => {
        dayHeader.addEventListener('click', function () {
            const dayColumn = this.parentElement;

            // Toggle selección
            document.querySelectorAll('.day-column').forEach(col => {
                col.classList.remove('selected', 'ring-2', 'ring-blue-500');
            });

            if (!dayColumn.classList.contains('selected')) {
                dayColumn.classList.add('selected', 'ring-2', 'ring-blue-500');
                this.style.cursor = 'pointer';
            }
        });
    });

    // Botón limpiar todo
    document.getElementById('clear-all')?.addEventListener('click', function () {
        clearAllSchedule();
    });

    // Inicializar resumen
    updateSelectionSummary();
}

// Aplicar patrones predefinidos
function applyPattern(pattern) {
    clearAllSchedule();

    const patterns = {
        'weekdays-full': {
            days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie'],
            hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        },
        'mornings-only': {
            days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            hours: ['09:00', '10:00', '11:00', '12:00']
        },
        'afternoons-only': {
            days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            hours: ['13:00', '14:00', '15:00', '16:00', '17:00']
        },
        'weekends': {
            days: ['Sáb', 'Dom'],
            hours: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
        }
    };

    const selectedPattern = patterns[pattern];
    if (selectedPattern) {
        selectedPattern.days.forEach(day => {
            const dayKey = DAY_MAP[day];
            if (dayKey) {
                // Usar función centralizada para evitar duplicados
                formData.disponibilidad[dayKey] = [...selectedPattern.hours].sort();

                // Actualizar UI
                selectedPattern.hours.forEach(hour => {
                    const block = document.querySelector(`[data-day="${day}"][data-hour="${hour}"]`);
                    if (block) {
                        block.classList.remove('bg-gray-50', 'border-gray-200');
                        block.classList.add('bg-indigo-500', 'text-white', 'border-indigo-500');
                    }
                });
            }
        });
    }

    updateSelectionSummary();
    validateStep(3);
}

// Aplicar bloque a día específico
function applyBlockToDay(dayColumn, block) {
    const dayName = dayColumn.querySelector('p').textContent.trim();

    const dayMap = {
        'Lun': 'lunes',
        'Mar': 'martes',
        'Mié': 'miercoles',
        'Jue': 'jueves',
        'Vie': 'viernes',
        'Sáb': 'sabado',
        'Dom': 'domingo'
    };

    const blocks = {
        'morning': ['09:00', '10:00', '11:00', '12:00'],
        'afternoon': ['13:00', '14:00', '15:00', '16:00', '17:00'],
        'fullday': ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']
    };

    const dayKey = dayMap[dayName];
    const hours = blocks[block];

    if (dayKey && hours) {
        // Agregar horas al array del día (sin duplicados)
        hours.forEach(hour => {
            if (!formData.disponibilidad[dayKey].includes(hour)) {
                formData.disponibilidad[dayKey].push(hour);
            }
        });

        // Mantener ordenado
        formData.disponibilidad[dayKey].sort();

        // Actualizar UI
        hours.forEach(hour => {
            const hourBlock = document.querySelector(`[data-day="${dayName}"][data-hour="${hour}"]`);
            if (hourBlock) {
                hourBlock.classList.remove('bg-gray-50', 'border-gray-200');
                hourBlock.classList.add('bg-indigo-500', 'text-white', 'border-indigo-500');
            }
        });
    }

    updateSelectionSummary();
    validateStep(3);
}

// Limpiar toda la selección
function clearAllSchedule() {
    // Resetear estructura de disponibilidad
    formData.disponibilidad = {
        lunes: [],
        martes: [],
        miercoles: [],
        jueves: [],
        viernes: [],
        sabado: [],
        domingo: []
    };

    // Limpiar UI
    document.querySelectorAll('.hour-block').forEach(block => {
        block.classList.remove('bg-indigo-500', 'text-white', 'border-indigo-500');
        block.classList.add('bg-gray-50', 'border-gray-200');
    });

    document.querySelectorAll('.pattern-btn').forEach(btn => {
        btn.classList.remove('border-blue-400', 'bg-blue-100');
        btn.classList.add('border-blue-200', 'bg-white');
    });

    updateSelectionSummary();
    validateStep(3);
}

// Actualizar resumen de selección
function updateSelectionSummary() {
    // Contar total de horas seleccionadas
    const totalHours = Object.values(formData.disponibilidad).reduce((total, dayHours) => {
        return total + (Array.isArray(dayHours) ? dayHours.length : 0);
    }, 0);

    const summaryElement = document.getElementById('selection-summary');

    if (summaryElement) {
        if (totalHours === 0) {
            summaryElement.textContent = '0 horarios seleccionados';
            summaryElement.className = 'text-sm text-gray-500 font-medium';
        } else {
            summaryElement.textContent = `${totalHours} horarios seleccionados`;
            summaryElement.className = 'text-sm text-blue-700 font-medium';
        }
    }
}

// Función para validar disponibilidad optimizada
function validateAvailability() {
    const totalHours = Object.values(formData.disponibilidad).reduce((total, dayHours) => {
        return total + (Array.isArray(dayHours) ? dayHours.length : 0);
    }, 0);

    return totalHours > 0;
}

// Función para obtener resumen de disponibilidad para el paso 5
function getAvailabilitySummary() {
    const totalHours = Object.values(formData.disponibilidad).reduce((total, dayHours) => {
        return total + (Array.isArray(dayHours) ? dayHours.length : 0);
    }, 0);

    if (totalHours === 0) return 'Sin horarios definidos';

    const daysWithHours = Object.entries(formData.disponibilidad).filter(([day, hours]) =>
        Array.isArray(hours) && hours.length > 0
    ).length;

    return `${totalHours} horarios en ${daysWithHours} días`;
}

// ===== FUNCIONES DE CERTIFICACIONES MEJORADAS =====
function createCertificationCard() {
    const certId = `cert-${Date.now()}`;
    const certDiv = document.createElement('div');
    certDiv.className = 'bg-white rounded-lg p-4 border border-gray-200 shadow-sm';
    certDiv.innerHTML = `
        <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg font-semibold text-gray-900">Nueva Certificación</h4>
            <button type="button" class="remove-cert text-red-500 hover:text-red-700 p-1" data-cert-id="${certId}">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Nombre de la certificación *</label>
                <input type="text" class="cert-nombre input-enhanced w-full p-3 border-2 border-gray-200 rounded-lg" data-cert-id="${certId}" placeholder="Ej: Especialización en Terapia Cognitiva">
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Institución *</label>
                <input type="text" class="cert-institucion input-enhanced w-full p-3 border-2 border-gray-200 rounded-lg" data-cert-id="${certId}" placeholder="Ej: Universidad de Buenos Aires">
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Fecha de obtención</label>
                <input type="date" class="cert-fecha input-enhanced w-full p-3 border-2 border-gray-200 rounded-lg" data-cert-id="${certId}">
            </div>
            <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Certificado (PDF)</label>
                <input type="file" class="cert-archivo w-full p-3 border-2 border-dashed border-gray-200 rounded-lg" data-cert-id="${certId}" accept=".pdf">
            </div>
        </div>
    `;

    return certDiv;
}

function updateCertificationData(certId) {
    const nombre = document.querySelector(`.cert-nombre[data-cert-id="${certId}"]`)?.value || '';
    const institucion = document.querySelector(`.cert-institucion[data-cert-id="${certId}"]`)?.value || '';
    const fecha = document.querySelector(`.cert-fecha[data-cert-id="${certId}"]`)?.value || '';
    const archivo = document.querySelector(`.cert-archivo[data-cert-id="${certId}"]`)?.files[0] || null;

    // Actualizar o agregar certificación
    const existingIndex = formData.certificaciones.findIndex(cert => cert.id === certId);
    const certData = { id: certId, nombre, institucion, fecha, archivo };

    if (existingIndex >= 0) {
        formData.certificaciones[existingIndex] = certData;
    } else {
        formData.certificaciones.push(certData);
    }
}

// Función para scroll suave al top
function scrollToTop() {
    // Scroll suave al top de la página
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Fallback para navegadores que no soportan smooth scroll
    if (window.scrollY > 0) {
        setTimeout(() => {
            if (window.scrollY > 0) {
                window.scrollTo(0, 0);
            }
        }, 100);
    }
}

// Llamar a la inicialización cuando se cambie de paso
const originalUpdateStep = updateStep;
updateStep = function () {
    originalUpdateStep();
    updateProgressIndicator();
    initializeStep5IfNeeded();

    // Scroll al top cuando se cambie de paso
    scrollToTop();

    // Inicializar funcionalidades específicas por paso
    if (currentStep === 0) {
        setTimeout(initializeTipoProfesionalButtons, 100);
    } else if (currentStep === 3) {
        // Limpiar datos antes de inicializar
        cleanAvailabilityData();
        // Intentar múltiples veces hasta que los elementos estén disponibles
        let attempts = 0;
        const maxAttempts = 10;

        const tryInitialize = () => {
            attempts++;
            console.log(`Intento ${attempts} de inicializar grid de disponibilidad...`);

            const hourBlocks = document.querySelectorAll('.hour-block');
            console.log(`Encontrados ${hourBlocks.length} elementos .hour-block`);

            if (hourBlocks.length > 0) {
                console.log('Elementos encontrados, inicializando...');
                initializeAvailabilityGrid();
            } else if (attempts < maxAttempts) {
                console.log(`No se encontraron elementos, reintentando en 200ms...`);
                setTimeout(tryInitialize, 200);
            } else {
                console.error('No se pudieron encontrar los elementos .hour-block después de múltiples intentos');
            }
        };

        setTimeout(tryInitialize, 100);
    }
};

// Función auxiliar para ir a un paso específico
function goToStep(stepIndex) {
    currentStep = stepIndex;
    updateStep();
}

// ===== INICIALIZACIÓN MEJORADA =====
document.addEventListener('DOMContentLoaded', function () {
    // Limpiar datos de disponibilidad al inicializar
    console.log('🚀 Inicializando formulario...');
    cleanAvailabilityData();

    // Inicializar funcionalidades básicas
    setTimeout(() => {
        initializeTipoProfesionalButtons();
        updateProgressIndicator();
    }, 100);

    // Event listeners para certificaciones ya están configurados arriba
});