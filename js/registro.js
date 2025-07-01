document.addEventListener('DOMContentLoaded', function () {
    const steps = document.querySelectorAll('.step');
    let currentStep = 0;
  
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const form = document.getElementById('registrationForm');
  
    showStep(currentStep);
  
    nextBtn.addEventListener('click', function () {
      if (validateStep(currentStep)) {
        currentStep++;
        showStep(currentStep);
      }
    });
  
    prevBtn.addEventListener('click', function () {
      currentStep--;
      showStep(currentStep);
    });
  
    function showStep(step) {
      steps.forEach((s, index) => {
        s.classList.toggle('hidden', index !== step);
        if (index === step) {
          s.classList.add('animate__animated', 'animate__fadeIn');
        }
      });
  
      prevBtn.classList.toggle('hidden', step === 0);
      nextBtn.textContent = (step === steps.length - 1) ? 'Enviar' : 'Siguiente';
    }
  
    function validateStep(step) {
      const currentFields = steps[step].querySelectorAll('input, select, textarea');
      for (let field of currentFields) {
        if (field.required && !field.value) {
          field.classList.add('border-red-500');
          field.focus();
          return false;
        } else {
          field.classList.remove('border-red-500');
        }
      }
      return true;
    }
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
    });
  
    nextBtn.addEventListener('click', function () {
      if (currentStep === steps.length - 1) {
        submitForm();
      }
    });
  
    function submitForm() {
      const formData = new FormData(form);
  
      fetch('https://tu-api.com/registro', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        alert('Registro enviado correctamente. ¡Será revisado por nuestro staff!');
        form.reset();
        currentStep = 0;
        showStep(currentStep);
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Ocurrió un error al enviar el formulario. Por favor, intentalo de nuevo.');
      });
    }
  });
  

  // Función para agregar un título
  const titulosContainer = document.getElementById('titulosContainer');
  const agregarTituloBtn = document.getElementById('agregarTituloBtn');
  
  let contadorTitulos = 0;
  
  // Función para crear un nuevo bloque de título
  function crearTitulo() {
    contadorTitulos++;
  
    const div = document.createElement('div');
    div.classList.add('bg-gray-100', 'p-4', 'rounded-md', 'space-y-4');
    div.setAttribute('id', `titulo-${contadorTitulos}`);
  
    div.innerHTML = `
      <div class="flex flex-col gap-2">
        <label class="font-semibold text-sm">Nombre del título</label>
        <input type="text" name="tituloNombre-${contadorTitulos}" class="input-titulo block w-full p-2 border rounded-md" required>
  
        <label class="font-semibold text-sm">Número de matrícula (opcional)</label>
        <input type="text" name="tituloMatricula-${contadorTitulos}" class="input-titulo block w-full p-2 border rounded-md">
  
        <label class="font-semibold text-sm">Año de egreso</label>
        <input type="number" name="tituloAnio-${contadorTitulos}" class="input-titulo block w-full p-2 border rounded-md" required>
  
        <label class="font-semibold text-sm">Institución</label>
        <input type="text" name="tituloInstitucion-${contadorTitulos}" class="input-titulo block w-full p-2 border rounded-md" required>
      </div>
  
      <!-- Drag and Drop para cargar archivo -->
      <div class="mt-4">
        <label class="font-semibold text-sm">Subir archivo del título (PDF/JPG/PNG)</label>
        <div id="dropZone-${contadorTitulos}" class="dropzone border-2 border-dashed border-gray-400 rounded-md p-6 text-center cursor-pointer hover:bg-gray-200">
          Arrastrá el archivo acá o hacé click
          <input type="file" name="archivoTitulo-${contadorTitulos}" class="hidden file-titulo" accept=".pdf,.jpg,.jpeg,.png">
        </div>
        <p id="nombreArchivo-${contadorTitulos}" class="text-xs text-gray-500 mt-2"></p>
      </div>
  
      <button type="button" onclick="eliminarTitulo(${contadorTitulos})" class="mt-4 text-red-600 text-sm hover:underline">
        Eliminar este título
      </button>
    `;
  
    titulosContainer.insertBefore(div, agregarTituloBtn);
  
    configurarDragAndDrop(contadorTitulos);
  }
  
  // Eliminar un título cargado
  function eliminarTitulo(id) {
    const div = document.getElementById(`titulo-${id}`);
    if (div) {
      div.remove();
    }
  }
  
  // Configurar drag and drop
  function configurarDragAndDrop(id) {
    const dropZone = document.getElementById(`dropZone-${id}`);
    const inputFile = dropZone.querySelector('input[type="file"]');
    const nombreArchivo = document.getElementById(`nombreArchivo-${id}`);
  
    dropZone.addEventListener('click', () => inputFile.click());
  
    inputFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        nombreArchivo.textContent = `Archivo seleccionado: ${file.name}`;
      }
    });
  
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('bg-gray-300');
    });
  
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-300');
    });
  
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('bg-gray-300');
      const file = e.dataTransfer.files[0];
      if (file) {
        inputFile.files = e.dataTransfer.files;
        nombreArchivo.textContent = `Archivo seleccionado: ${file.name}`;
      }
    });
  }
  
  // Evento para agregar nuevo título
  agregarTituloBtn.addEventListener('click', crearTitulo);
  

// Función para agregar una especialización
function agregarEspecializacion() {
  const container = document.getElementById('especializacionesContainer');
  const div = document.createElement('div');
  div.className = 'flex items-center gap-2';

  div.innerHTML = `
    <input type="text" name="especializaciones[]" placeholder="Especialización (ej: Estimulación Temprana)" required class="flex-1 rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500">
    <button type="button" onclick="eliminarElemento(this)" class="text-red-500 hover:text-red-700 text-sm">Eliminar</button>
  `;

  container.appendChild(div);
}

// Función para eliminar un título o especialización
function eliminarElemento(button) {
  button.parentElement.remove();
}


// Provincias y localidades (demo)
const provincias = {
  "Argentina": ["Buenos Aires", "Córdoba", "Santa Fe"]
};

const localidades = {
  "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
  "Córdoba": ["Córdoba Capital", "Villa María", "Río Cuarto"],
  "Santa Fe": ["Rosario", "Santa Fe Capital", "Rafaela"]
};

function cargarProvincias() {
  const paisSelect = document.getElementById('pais');
  const provinciaSelect = document.getElementById('provincia');
  const localidadSelect = document.getElementById('localidad');

  provinciaSelect.innerHTML = '<option value="">Seleccione una provincia</option>';
  localidadSelect.innerHTML = '<option value="">Seleccione una localidad</option>';

  const pais = paisSelect.value;
  if (provincias[pais]) {
    provincias[pais].forEach(prov => {
      const option = document.createElement('option');
      option.value = prov;
      option.textContent = prov;
      provinciaSelect.appendChild(option);
    });
  }
}

function cargarLocalidades() {
  const provinciaSelect = document.getElementById('provincia');
  const localidadSelect = document.getElementById('localidad');

  localidadSelect.innerHTML = '<option value="">Seleccione una localidad</option>';

  const provincia = provinciaSelect.value;
  if (localidades[provincia]) {
    localidades[provincia].forEach(loc => {
      const option = document.createElement('option');
      option.value = loc;
      option.textContent = loc;
      localidadSelect.appendChild(option);
    });
  }
}

function toggleDistanciaInput() {
  const trasladoCheckbox = document.getElementById('traslado');
  const distanciaContainer = document.getElementById('distanciaContainer');

  if (trasladoCheckbox.checked) {
    distanciaContainer.classList.remove('hidden');
  } else {
    distanciaContainer.classList.add('hidden');
  }
}


// Suponiendo que tus datos del formulario están en un objeto 'formData'
const resumenDatosDiv = document.getElementById('resumenDatos');
const enviarBtn = document.getElementById('enviarFormularioBtn');
const spinner = document.getElementById('spinner');
const textoBoton = document.getElementById('textoBoton');
const editarBtn = document.getElementById('editarBtn');

// Cargar los datos en el resumen
function mostrarResumen(formData) {
  resumenDatosDiv.innerHTML = `
    <p><strong>Nombre:</strong> ${formData.nombre} ${formData.apellido}</p>
    <p><strong>DNI:</strong> ${formData.dni}</p>
    <p><strong>Edad:</strong> ${formData.edad}</p>
    <p><strong>Fecha de Nacimiento:</strong> ${formData.fechaNacimiento}</p>
    <p><strong>Sexo:</strong> ${formData.sexo}</p>
    <p><strong>Títulos:</strong> ${formData.titulos.join(', ')}</p>
    <p><strong>Especializaciones:</strong> ${formData.especializaciones.join(', ')}</p>
    <p><strong>N° Matrícula:</strong> ${formData.matricula || 'No tiene'}</p>
    <p><strong>Ubicación:</strong> ${formData.pais}, ${formData.provincia}, ${formData.localidad}</p>
    <p><strong>Disponibilidad:</strong> ${formData.disponibilidadTexto}</p>
    <p><strong>Traslado:</strong> ${formData.traslado}</p>
    <p><strong>Medio de traslado:</strong> ${formData.medioTraslado || 'No especificado'}</p>
    <p><strong>Obras sociales que atiende:</strong> ${formData.obrasSociales || 'No especificado'}</p>
    <p><strong>Obras que NO atiende:</strong> ${formData.obrasNoAtiende || 'No especificado'}</p>
    <p><strong>Observaciones:</strong> ${formData.otrasObservaciones || 'Sin observaciones'}</p>
    <p><strong>Desea recibir notificaciones:</strong> ${formData.aceptaNotificaciones ? 'Sí' : 'No'}</p>
  `;
}

// Evento para botón 'Volver a editar'
editarBtn.addEventListener('click', () => {
  // Volver al paso anterior, depende cómo estés manejando los pasos
  mostrarPaso(5); // o el paso donde quieras volver
});

// Evento para botón 'Enviar registro'
enviarBtn.addEventListener('click', async () => {
  spinner.classList.remove('hidden');
  textoBoton.textContent = 'Enviando...';

  try {
    const response = await fetch('https://tuapi.com/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // Asegurate que formData esté armado
    });

    if (response.ok) {
      textoBoton.textContent = 'Enviado ✅';
      spinner.classList.add('hidden');
      // Redirigir, mostrar mensaje bonito, limpiar formulario, etc.
      alert('Registro enviado con éxito');
      location.reload(); // O mandarlo a un "Gracias por registrarte"
    } else {
      throw new Error('Error al enviar');
    }
  } catch (error) {
    console.error(error);
    textoBoton.textContent = 'Enviar registro';
    spinner.classList.add('hidden');
    alert('Ocurrió un error. Intentalo de nuevo.');
  }
});
