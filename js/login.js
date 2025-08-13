// Utiliza Animate.css para transiciones suaves entre paneles
function animatePanelChange(showId, tipo) {
    const panels = ['panel-selector', 'panel-login', 'panel-register'];
    let currentPanel = null;
    panels.forEach(id => {
        const panel = document.getElementById(id);
        if (panel.style.display !== 'none') currentPanel = panel;
    });
    const nextPanel = document.getElementById(showId);
    if (currentPanel === nextPanel) return;

    // Si hay panel visible, fadeOut
    if (currentPanel) {
        currentPanel.classList.remove('animate__fadeIn', 'animate__faster');
        currentPanel.classList.add('animate__animated', 'animate__fadeOut', 'animate__faster');
        currentPanel.addEventListener('animationend', function handler() {
            currentPanel.removeEventListener('animationend', handler);
            currentPanel.style.display = 'none';
            currentPanel.classList.remove('animate__animated', 'animate__fadeOut');
            // FadeIn el siguiente
            nextPanel.style.display = 'block';
            nextPanel.classList.add('animate__animated', 'animate__fadeIn', 'animate__faster');
            nextPanel.addEventListener('animationend', function handler2() {
                nextPanel.classList.remove('animate__animated', 'animate__fadeIn');
                nextPanel.removeEventListener('animationend', handler2);
            });
        });
    } else {
        // Primera carga
        nextPanel.style.display = 'block';
        nextPanel.classList.add('animate__animated', 'animate__fadeIn', 'animate__faster');
        nextPanel.addEventListener('animationend', function handler2() {
            nextPanel.classList.remove('animate__animated', 'animate__fadeIn');
            nextPanel.removeEventListener('animationend', handler2);
        });
    }

    // Actualiza títulos para login
    if (showId === 'panel-login' && tipo) {
        document.getElementById('tipoUsuario').value = tipo;
        if (tipo === 'solicitante') {
            document.getElementById('login-title').innerText = 'Iniciar Sesión como Solicitante';
            document.getElementById('login-subtitle').innerText = 'Ingresa tus datos de solicitante para continuar';
        } else {
            document.getElementById('login-title').innerText = 'Iniciar Sesión como Profesional';
            document.getElementById('login-subtitle').innerText = 'Ingresa tus datos de profesional para continuar';
        }
    }
}
function showLogin(tipo) {
    animatePanelChange('panel-login', tipo);
}

function showRegister(tipo) {
    if (tipo === 'solicitante') {
        // Redirigir al registro de solicitante
        window.location.href = '../registro/solicitante.html';
    } else if (tipo === 'profesional') {
        // Redirigir al registro de profesional
        window.location.href = '../registro/profesional.html';
    } else {
        // Mostrar panel de registro genérico (fallback)
        animatePanelChange('panel-register');
    }
}

function showSelector() {
    animatePanelChange('panel-selector');
}

// ===== FUNCIÓN PARA MANEJAR EL REGISTRO DESDE EL LOGIN =====
function handleRegisterClick() {
    const userType = document.getElementById('tipoUsuario').value;

    if (userType === 'solicitante') {
        // Redirigir al registro de solicitante
        window.location.href = '../registro/solicitante.html';
    } else if (userType === 'profesional') {
        // Redirigir al registro de profesional
        window.location.href = '../registro/profesional.html';
    } else {
        // Fallback - mostrar panel de registro genérico
        animatePanelChange('panel-register');
    }
}
// ===== CONFIGURACIÓN DE LA API =====
const API_CONFIG = {
    baseURL: 'http://190.184.224.217/renasam/api', // Cambiar por tu URL de API
    endpoints: {
        login: '/auth/login/autenticacion',
        register: '/auth/register',
        forgotPassword: '/auth/forgot-password'
    }
};

// ===== FUNCIONES DE UTILIDAD =====
function showMessage(type, message) {
    const errorMsg = document.getElementById('error-message');
    const successMsg = document.getElementById('success-message');

    // Ocultar ambos mensajes primero
    errorMsg.classList.add('hidden');
    successMsg.classList.add('hidden');

    if (type === 'error') {
        document.getElementById('error-text').textContent = message;
        errorMsg.classList.remove('hidden');
        errorMsg.classList.add('animate__animated', 'animate__fadeIn');
    } else if (type === 'success') {
        document.getElementById('success-text').textContent = message;
        successMsg.classList.remove('hidden');
        successMsg.classList.add('animate__animated', 'animate__fadeIn');
    }
}

function setLoadingState(isLoading) {
    const loginBtn = document.getElementById('login-btn');
    const loginText = document.getElementById('login-text');
    const loginSpinner = document.getElementById('login-spinner');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (isLoading) {
        loginBtn.disabled = true;
        loginBtn.classList.add('opacity-75', 'cursor-not-allowed');
        loginText.textContent = 'Ingresando...';
        loginSpinner.classList.remove('hidden');
        emailInput.disabled = true;
        passwordInput.disabled = true;
    } else {
        loginBtn.disabled = false;
        loginBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        loginText.textContent = 'Ingresar';
        loginSpinner.classList.add('hidden');
        emailInput.disabled = false;
        passwordInput.disabled = false;
    }
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// ===== PETICIÓN A LA API DE AUTENTICACIÓN =====
async function authenticateUser(email, password, userType) {
    try {
        console.log('🚀 === INICIO DEL PROCESO DE LOGIN ===');

        // Datos que se van a enviar en la URL
        const loginParams = {
            email: email,
            password: password,
            rol: userType
        };

        console.log('📋 Datos del login:', {
            email: email,
            password: '***OCULTA***',
            rol: userType,
            timestamp: new Date().toISOString()
        });

        // Construir URL con parámetros
        const baseURL = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`;
        const urlParams = new URLSearchParams(loginParams);
        const fullURL = `${baseURL}?${urlParams.toString()}`;

        console.log('🌐 URL base:', baseURL);
        console.log('📦 Parámetros URL:', urlParams.toString());
        console.log('🔗 URL completa:', fullURL);

        // También mostrar en alert para fácil copia
        alert(`URL de Login: ${fullURL}\n\nMétodo: GET\nParámetros en URL:\n- email=${email}\n- password=[OCULTA]\n- rol=${userType}\n\nRevisa la consola para más detalles.`);

        console.log('📤 Enviando petición GET a la API...');

        const response = await fetch(fullURL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log('📥 === RESPUESTA RECIBIDA ===');
        console.log('🔢 Status:', response.status);
        console.log('✅ OK:', response.ok);
        console.log('📋 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

        // Leer respuesta como texto primero
        const responseText = await response.text();
        console.log('📄 Respuesta como texto:', responseText);

        let data;
        try {
            data = JSON.parse(responseText);
            console.log('✅ JSON parseado correctamente:', data);
        } catch (jsonError) {
            console.error('❌ Error parseando JSON:', jsonError);
            console.error('📄 Respuesta que no se pudo parsear:', responseText);
            throw new Error(`Error parseando respuesta JSON: ${jsonError.message}`);
        }

        if (!response.ok) {
            console.error('❌ Error en la respuesta:', {
                status: response.status,
                statusText: response.statusText,
                error: data
            });
            throw new Error(data.message || 'Error en la autenticación');
        }

        console.log('🎉 === LOGIN EXITOSO ===');
        console.log('✅ Respuesta exitosa:', data);

        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('💥 === ERROR EN EL PROCESO DE LOGIN ===');
        console.error('❌ Tipo de error:', error.name);
        console.error('📝 Mensaje:', error.message);
        console.error('🔍 Stack trace:', error.stack);
        console.error('🌐 URL que falló:', `${API_CONFIG.baseURL}${API_CONFIG.endpoints.login}`);
        console.error('📊 Datos que se intentaron enviar:', {
            email: email,
            password: '***OCULTA***',
            rol: userType
        });

        return {
            success: false,
            error: error.message || 'Error de conexión. Inténtalo de nuevo.'
        };
    }
}

// ===== MANEJO DEL FORMULARIO DE LOGIN =====
document.addEventListener('DOMContentLoaded', function () {
    // Mostrar solo el selector al inicio
    document.getElementById('panel-selector').style.display = 'block';
    document.getElementById('panel-login').style.display = 'none';
    document.getElementById('panel-register').style.display = 'none';

    // Event listener para el formulario de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Obtener datos del formulario
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const userType = document.getElementById('tipoUsuario').value;

            // Limpiar mensajes previos
            document.getElementById('error-message').classList.add('hidden');
            document.getElementById('success-message').classList.add('hidden');

            // Validaciones del lado cliente
            let hasErrors = false;

            if (!email) {
                document.getElementById('email-error').textContent = 'El email es requerido';
                document.getElementById('email-error').classList.remove('hidden');
                document.getElementById('email').classList.add('border-red-500');
                hasErrors = true;
            } else if (!validateEmail(email)) {
                document.getElementById('email-error').textContent = 'Formato de email inválido';
                document.getElementById('email-error').classList.remove('hidden');
                document.getElementById('email').classList.add('border-red-500');
                hasErrors = true;
            } else {
                document.getElementById('email-error').classList.add('hidden');
                document.getElementById('email').classList.remove('border-red-500');
            }

            if (!password) {
                document.getElementById('password-error').textContent = 'La contraseña es requerida';
                document.getElementById('password-error').classList.remove('hidden');
                document.getElementById('password').classList.add('border-red-500');
                hasErrors = true;
            } else if (!validatePassword(password)) {
                document.getElementById('password-error').textContent = 'La contraseña debe tener al menos 8 caracteres';
                document.getElementById('password-error').classList.remove('hidden');
                document.getElementById('password').classList.add('border-red-500');
                hasErrors = true;
            } else {
                document.getElementById('password-error').classList.add('hidden');
                document.getElementById('password').classList.remove('border-red-500');
            }

            if (hasErrors) {
                // Agregar efecto de shake al formulario
                loginForm.classList.add('error-shake');
                setTimeout(() => {
                    loginForm.classList.remove('error-shake');
                }, 500);
                return;
            }

            // Mostrar estado de carga
            setLoadingState(true);

            try {
                // Realizar petición a la API
                const result = await authenticateUser(email, password, userType);
                console.log(result)
                if (result.data.success) {
                    // Login exitoso
                    showMessage('success', '¡Bienvenido! Redirigiendo...');

                    // Guardar token y datos del usuario
                    if (result.data.token) {
                        localStorage.setItem('auth_token', result.data.token);

                        // Crear objeto con los datos del usuario desde la respuesta de la API
                        const userData = {
                            id: result.data.id,
                            nombre: result.data.nombre,
                            apellido: result.data.apellido,
                            email: result.data.email,
                            rol: result.data.rol
                        };

                        localStorage.setItem('user_data', JSON.stringify(userData));
                        localStorage.setItem('user_type', userType);
                    }

                    // Redirigir según el tipo de usuario
                    setTimeout(() => {
                        if (userType === 'solicitante') {
                            window.location.href = '../pacientes/index.html'; // Dashboard de solicitante
                            console.log(result)
                        } else if (userType === 'profesional') {
                            window.location.href = '../pages/profesional.html'; // Dashboard de profesional
                        }
                    }, 1500);

                } else {
                    // Error en el login
                    showMessage('error', result.data.error);
                }

            } catch (error) {
                console.error('Error inesperado:', error);
                showMessage('error', 'Error inesperado. Por favor, inténtalo de nuevo.');
            } finally {
                // Quitar estado de carga
                setLoadingState(false);
            }
        });
    }

    // Toggle para mostrar/ocultar contraseña
    const togglePassword = document.getElementById('toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', function () {
            const passwordInput = document.getElementById('password');
            const eyeOpen = document.getElementById('eye-open');
            const eyeClosed = document.getElementById('eye-closed');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeOpen.classList.add('hidden');
                eyeClosed.classList.remove('hidden');
            } else {
                passwordInput.type = 'password';
                eyeOpen.classList.remove('hidden');
                eyeClosed.classList.add('hidden');
            }
        });
    }

    // Limpiar errores al escribir
    document.getElementById('email').addEventListener('input', function () {
        this.classList.remove('border-red-500');
        document.getElementById('email-error').classList.add('hidden');
    });

    document.getElementById('password').addEventListener('input', function () {
        this.classList.remove('border-red-500');
        document.getElementById('password-error').classList.add('hidden');
    });
});

// ===== FUNCIÓN PARA RECUPERAR CONTRASEÑA =====
function showForgotPassword() {
    const email = document.getElementById('email').value.trim();

    if (!email) {
        showMessage('error', 'Por favor, ingresa tu email primero');
        document.getElementById('email').focus();
        return;
    }

    if (!validateEmail(email)) {
        showMessage('error', 'Por favor, ingresa un email válido');
        document.getElementById('email').focus();
        return;
    }

    // Aquí puedes implementar la lógica para recuperar contraseña
    if (confirm(`¿Enviar instrucciones de recuperación a ${email}?`)) {
        // Simular envío de email de recuperación
        showMessage('success', 'Se han enviado las instrucciones a tu email');

        // Aquí harías la petición real a la API
        /*
        fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.forgotPassword}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        });
        */
    }
}

// ===== FUNCIÓN PARA LOGOUT =====
function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_type');
    window.location.href = '../pages/login.html';
}

// ===== VERIFICAR SI EL USUARIO YA ESTÁ LOGUEADO =====
function checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    const userType = localStorage.getItem('user_type');

    if (token && userType) {
        // Usuario ya está logueado, redirigir al dashboard correspondiente
        if (userType === 'solicitante') {
            window.location.href = '../pacientes/index.html';
        } else if (userType === 'profesional') {
            window.location.href = '../profesionales/index.html';
        }
    }
}

// Verificar estado de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
});