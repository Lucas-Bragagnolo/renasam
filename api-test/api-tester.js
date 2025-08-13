// ===== CONFIGURACIÓN DE LA API =====
const API_CONFIG = {
    baseURL: 'http://190.184.224.217/renasam/api',
    endpoints: {
        // Solicitantes
        login: '/solicitantes/login',
        consultaSolicitante: '/solicitantes/consulta_solicitante',
        registroSolicitante: '/solicitantes/registro',
        
        // Pacientes
        crearPaciente: '/pacientes/agregar',
        modificarPaciente: '/pacientes/modificar',
        eliminarPaciente: '/pacientes/borrar'
    }
};

// ===== UTILIDADES =====
function logToResponse(message, type = 'info') {
    const responseArea = document.getElementById('responseArea');
    const timestamp = new Date().toLocaleTimeString();
    const colors = {
        info: '#d4d4d4',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
    };
    
    responseArea.innerHTML += `<div style="color: ${colors[type]}; margin-bottom: 10px;">
        [${timestamp}] ${message}
    </div>`;
    responseArea.scrollTop = responseArea.scrollHeight;
}

function clearResponse() {
    document.getElementById('responseArea').innerHTML = 'Aquí aparecerán las respuestas de las APIs...';
}

function getAuthToken() {
    return document.getElementById('authToken').value.trim();
}

function loadTokenFromStorage() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token) {
        document.getElementById('authToken').value = token;
        logToResponse('✅ Token cargado desde storage: ' + token, 'success');
    } else {
        logToResponse('⚠️ No se encontró token en storage', 'warning');
    }
}

// ===== FUNCIÓN GENÉRICA PARA HACER PETICIONES =====
async function makeAPIRequest(endpoint, method = 'GET', data = null, useAuth = false) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    logToResponse(`🚀 ${method} ${url}`, 'info');
    
    const config = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    };

    // Agregar autenticación si es necesario
    if (useAuth) {
        const token = getAuthToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // Agregar datos si es necesario
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
        logToResponse(`📦 Datos enviados: ${JSON.stringify(data, null, 2)}`, 'info');
    }

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();
        
        if (response.ok) {
            logToResponse(`✅ Respuesta exitosa (${response.status}):`, 'success');
            logToResponse(JSON.stringify(responseData, null, 2), 'success');
        } else {
            logToResponse(`❌ Error (${response.status}):`, 'error');
            logToResponse(JSON.stringify(responseData, null, 2), 'error');
        }
        
        return { success: response.ok, data: responseData, status: response.status };
    } catch (error) {
        logToResponse(`💥 Error de conexión: ${error.message}`, 'error');
        return { success: false, error: error.message };
    }
}

// ===== TESTS DE SOLICITANTES =====
async function testLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        logToResponse('⚠️ Email y password son requeridos', 'warning');
        return;
    }
    
    logToResponse('🔐 Probando login...', 'info');
    
    const result = await makeAPIRequest(API_CONFIG.endpoints.login, 'POST', {
        email: email,
        password: password
    });
    
    // Si el login es exitoso, guardar el token
    if (result.success && result.data.auth_token) {
        document.getElementById('authToken').value = result.data.auth_token;
        localStorage.setItem('authToken', result.data.auth_token);
        logToResponse('🔑 Token guardado automáticamente', 'success');
    }
}

async function testConsultaSolicitante() {
    const token = getAuthToken();
    
    if (!token) {
        logToResponse('⚠️ Auth token es requerido', 'warning');
        return;
    }
    
    logToResponse('👤 Probando consulta de solicitante...', 'info');
    
    await makeAPIRequest(API_CONFIG.endpoints.consultaSolicitante, 'POST', {
        token: token
    });
}

async function testRegistroSolicitante() {
    logToResponse('📝 Probando registro de solicitante...', 'info');
    
    const datosEjemplo = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@test.com',
        password: '123456',
        telefono: '+54 9 11 1234-5678',
        direccion: {
            calle: 'Av. Corrientes',
            numero: '1234',
            localidad: 'CABA',
            provincia: 'CABA'
        }
    };
    
    await makeAPIRequest(API_CONFIG.endpoints.registroSolicitante, 'POST', datosEjemplo);
}

// ===== TESTS DE PACIENTES =====
async function testCrearPaciente() {
    const token = getAuthToken();
    
    if (!token) {
        logToResponse('⚠️ Auth token es requerido', 'warning');
        return;
    }
    
    logToResponse('➕ Probando crear paciente...', 'info');
    
    const datosEjemplo = {
        nombre: 'María',
        apellido: 'González',
        dni: '87654321',
        fechaNacimiento: '1990-05-15',
        genero: 'femenino',
        telefono: '+54 9 11 8765-4321',
        email: 'maria.gonzalez@test.com',
        direccion: {
            calle: 'San Martín',
            numero: '567',
            localidad: 'San Isidro',
            provincia: 'Buenos Aires'
        },
        authToken: token
    };
    
    await makeAPIRequest(API_CONFIG.endpoints.crearPaciente, 'POST', datosEjemplo, true);
}

async function testModificarPaciente() {
    const token = getAuthToken();
    const pacienteId = document.getElementById('pacienteId').value;
    
    if (!token) {
        logToResponse('⚠️ Auth token es requerido', 'warning');
        return;
    }
    
    if (!pacienteId) {
        logToResponse('⚠️ ID del paciente es requerido', 'warning');
        return;
    }
    
    logToResponse('✏️ Probando modificar paciente...', 'info');
    
    const datosEjemplo = {
        nombre: 'María Actualizada',
        apellido: 'González',
        dni: '87654321',
        telefono: '+54 9 11 8765-9999',
        authToken: token
    };
    
    await makeAPIRequest(`${API_CONFIG.endpoints.modificarPaciente}/${pacienteId}`, 'PUT', datosEjemplo, true);
}

async function testEliminarPaciente() {
    const token = getAuthToken();
    const pacienteId = document.getElementById('deleteId').value;
    
    if (!token) {
        logToResponse('⚠️ Auth token es requerido', 'warning');
        return;
    }
    
    if (!pacienteId) {
        logToResponse('⚠️ ID del paciente es requerido', 'warning');
        return;
    }
    
    logToResponse('🗑️ Probando eliminar paciente...', 'info');
    
    await makeAPIRequest(`${API_CONFIG.endpoints.eliminarPaciente}/${pacienteId}`, 'DELETE', null, true);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    logToResponse('🚀 Panel de prueba de APIs iniciado', 'success');
    logToResponse('💡 Tip: Primero haz login para obtener un auth_token', 'info');
    
    // Intentar cargar token automáticamente
    loadTokenFromStorage();
});

// ===== FUNCIONES ADICIONALES DE UTILIDAD =====
function copyResponse() {
    const responseArea = document.getElementById('responseArea');
    navigator.clipboard.writeText(responseArea.textContent);
    logToResponse('📋 Respuesta copiada al portapapeles', 'success');
}

function exportResponse() {
    const responseArea = document.getElementById('responseArea');
    const blob = new Blob([responseArea.textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-test-${new Date().toISOString().slice(0, 19)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}