# Panel de Prueba de APIs - RENASAM

Este panel te permite probar todas las APIs del sistema RENASAM de forma visual e interactiva.

## 🚀 Cómo usar

### 1. Abrir el panel
```
Abre: api-test/index.html en tu navegador
```

### 2. Configurar autenticación
1. **Opción A:** Haz login primero para obtener un token automáticamente
2. **Opción B:** Ingresa manualmente un auth_token válido
3. **Opción C:** Usa el botón "Cargar desde Storage" si ya tienes uno guardado

### 3. Probar APIs

#### 🔐 APIs de Solicitantes
- **Login:** Autentica un usuario y obtiene el auth_token
- **Consulta Solicitante:** Obtiene datos del solicitante y sus pacientes
- **Registro:** Registra un nuevo solicitante

#### 👥 APIs de Pacientes
- **Crear Paciente:** Agrega un nuevo paciente
- **Modificar Paciente:** Actualiza datos de un paciente existente
- **Eliminar Paciente:** Borra un paciente

## 📋 Características

### ✅ Lo que incluye:
- **Interfaz visual** para todas las APIs
- **Logging detallado** de peticiones y respuestas
- **Manejo automático** de auth_tokens
- **Datos de ejemplo** pre-configurados
- **Códigos de estado** HTTP claros
- **Timestamps** en todas las operaciones

### 🎯 Información mostrada:
- URL completa de la petición
- Método HTTP (GET, POST, PUT, DELETE)
- Headers enviados
- Body/payload de la petición
- Respuesta completa de la API
- Códigos de estado y errores

## 🔧 Configuración

### Endpoints configurados:
```javascript
baseURL: 'http://190.184.224.217/renasam/api'

Solicitantes:
- POST /solicitantes/login
- POST /solicitantes/consulta_solicitante  
- POST /solicitantes/registro

Pacientes:
- POST /pacientes/agregar
- PUT /pacientes/modificar/:id
- DELETE /pacientes/borrar/:id
```

## 💡 Tips de uso

1. **Siempre empieza con Login** para obtener un auth_token válido
2. **El token se guarda automáticamente** después del login exitoso
3. **Usa la consola del navegador** para ver logs adicionales
4. **Limpia la respuesta** entre pruebas para mayor claridad
5. **Los datos de ejemplo** están pre-configurados pero puedes modificarlos

## 🐛 Troubleshooting

### Si no funciona el login:
- Verifica que el email y password sean correctos
- Revisa la consola del navegador para errores CORS
- Confirma que la API esté funcionando

### Si fallan las APIs de pacientes:
- Asegúrate de tener un auth_token válido
- Verifica que el token no haya expirado
- Confirma que el ID del paciente existe (para modificar/eliminar)

### Errores comunes:
- **401 Unauthorized:** Token inválido o expirado
- **404 Not Found:** Endpoint incorrecto o ID no existe
- **500 Internal Server Error:** Error en el servidor
- **CORS Error:** Problema de configuración del servidor

## 🔍 Ejemplo de uso típico

1. Abre `api-test/index.html`
2. Haz clic en "Probar Login" con credenciales válidas
3. El auth_token se carga automáticamente
4. Prueba "Consulta Solicitante" para ver tus pacientes
5. Prueba "Crear Paciente" para agregar uno nuevo
6. Usa los IDs obtenidos para probar modificar/eliminar

¡Listo para probar todas tus APIs! 🎉