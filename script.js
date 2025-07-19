// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
const textoContainer = document.getElementById("texto-a-escribir");
const entradaUsuario = document.getElementById("entrada-usuario");
const reiniciarBtn = document.getElementById("reiniciar-btn");
const tiempoEl = document.getElementById("tiempo");
const ppmEl = document.getElementById("ppm");
const precisionEl = document.getElementById("precision");
const erroresEl = document.getElementById("errores");

// --- TEXTOS DE PRÁCTICA (AMPLIADO) ---
const textos = [
  "La tecnología es la aplicación de la ciencia a la resolución de problemas concretos.",
  "El rápido zorro marrón salta sobre el perro perezoso. Esta frase contiene todas las letras del alfabeto.",
  "Programar puede ser un desafío, pero también es una de las habilidades más gratificantes que puedes aprender.",
  "La práctica constante es la clave para mejorar la velocidad y la precisión en la mecanografía.",
  "Un buen programador mira hacia ambos lados antes de cruzar una calle de un solo sentido.",
  "El arte de la vida consiste en hacer de la vida una obra de arte. (Mahatma Gandhi)",
  "La imaginación es más importante que el conocimiento. El conocimiento es limitado, la imaginación rodea el mundo. (Albert Einstein)",
  "El éxito es la suma de pequeños esfuerzos repetidos día tras día. (Robert Collier)",
  "No cuentes los días, haz que los días cuenten. (Muhammad Ali)",
  "El único modo de hacer un gran trabajo es amar lo que haces. (Steve Jobs)",
  "En boca cerrada no entran moscas, pero tampoco salen grandes ideas.",
  "El que madruga, encuentra todo cerrado. ¡Es una broma! O quizás no.",
  "La vida es como una bicicleta: para mantener el equilibrio, debes seguir moviéndote.",
  "Pregúntate si lo que estás haciendo hoy te acerca al lugar en el que quieres estar mañana.",
  "La mejor forma de predecir el futuro es crearlo. (Peter Drucker)",
  "El usuario deberá teclear este texto con una velocidad de 120 PPM y una precisión del 98%.",
  "El archivo se guardó en C:\\Usuarios\\Documentos\\Proyecto_Final_2024.docx",
  "¿Podrías, por favor, enviarme el reporte antes de las 17:00? ¡Gracias!",
  "La reunión será el próximo jueves a las 10:30 a.m. en la sala de juntas (piso 3).",
  "El código de acceso es: #A8B-4C/2D. No lo compartas con nadie.",
];

// --- VARIABLES DE ESTADO DE LA APLICACIÓN ---
let textoActual = "";
let indiceActual = 0;
let errores = 0;
let tiempoInicio;
let intervaloTiempo;
let pruebaActiva = false;

// --- FUNCIONES PRINCIPALES ---

/**
 * Inicia una nueva prueba de mecanografía.
 * Selecciona un texto al azar, lo muestra en pantalla y resetea las estadísticas.
 */
function iniciarNuevaPrueba() {
  // Detener cualquier prueba anterior
  clearInterval(intervaloTiempo);
  pruebaActiva = false;

  // Seleccionar un texto aleatorio y limpiar el contenedor
  textoActual = textos[Math.floor(Math.random() * textos.length)];
  textoContainer.innerHTML = "";

  // Convertir el texto en spans individuales para cada caracter
  textoActual.split("").forEach((caracter) => {
    const span = document.createElement("span");
    span.innerText = caracter;
    textoContainer.appendChild(span);
  });

  // Resetear variables y estadísticas
  indiceActual = 0;
  errores = 0;
  tiempoInicio = null;
  entradaUsuario.value = "";
  actualizarEstadisticas();
  tiempoEl.innerText = `0s`; // Resetear visualmente el tiempo

  // Poner el cursor en la primera letra
  if (textoContainer.children.length > 0) {
    textoContainer.children[0].classList.add("cursor");
  }

  // Asegurarse de que el área de texto esté enfocada
  entradaUsuario.focus();
}

/**
 * Maneja el evento de presionar una tecla.
 * Compara la tecla presionada con el caracter esperado y actualiza la UI.
 */
function manejarEntrada(e) {
  // En el código original, se usaba e.preventDefault() que podía interferir con
  // la entrada normal de texto en algunos navegadores. Lo eliminamos para
  // un comportamiento más estándar y nos centramos en el evento 'keydown'.
  const teclaPresionada = e.key;

  // Iniciar el cronómetro con la primera tecla válida
  if (!pruebaActiva && teclaPresionada.length === 1) {
    pruebaActiva = true;
    tiempoInicio = new Date();
    intervaloTiempo = setInterval(actualizarTiempo, 1000);
  }

  // Salir si la prueba no está activa
  if (!pruebaActiva) return;

  const spans = textoContainer.children;
  const caracterEsperado = textoActual[indiceActual];

  // --- Lógica de Borrado (Backspace) ---
  if (teclaPresionada === "Backspace") {
    e.preventDefault(); // Prevenir navegación
    if (indiceActual > 0) {
      // Quitar cursor de la posición actual
      if (spans[indiceActual]) {
        spans[indiceActual].classList.remove("cursor");
      } else if (spans[indiceActual - 1]) {
        // Caso borde: al final del texto
        spans[indiceActual - 1].classList.remove("cursor");
      }

      // Mover el índice hacia atrás
      indiceActual--;

      // Si la letra anterior fue incorrecta y se borró, descontar el error
      if (spans[indiceActual].classList.contains("incorrecto")) {
        // No es necesario descontar errores, la precisión se recalcula
      }

      // Limpiar el formato de la letra anterior
      spans[indiceActual].classList.remove("correcto", "incorrecto");

      // Poner el cursor en la nueva posición
      spans[indiceActual].classList.add("cursor");
    }
    actualizarEstadisticas();
    return;
  }

  // Ignorar teclas de control que no sean letras o símbolos comunes (ej. Shift, Ctrl)
  if (teclaPresionada.length > 1) {
    return;
  }

  // Evitar que el usuario siga escribiendo si ya terminó el texto
  if (indiceActual >= textoActual.length) {
    return;
  }

  // --- Lógica de Escritura ---
  if (teclaPresionada === caracterEsperado) {
    spans[indiceActual].classList.add("correcto");
    spans[indiceActual].classList.remove("incorrecto");
  } else {
    spans[indiceActual].classList.add("incorrecto");
    spans[indiceActual].classList.remove("correcto");
    errores++;
  }

  // Mover el cursor
  spans[indiceActual].classList.remove("cursor");
  indiceActual++;

  // Actualizar estadísticas en cada pulsación
  actualizarEstadisticas();

  // Comprobar si la prueba ha terminado
  if (indiceActual === textoActual.length) {
    clearInterval(intervaloTiempo); // Detener el cronómetro
    pruebaActiva = false;
  } else {
    spans[indiceActual].classList.add("cursor"); // Mover cursor al siguiente
  }
}

/**
 * Actualiza el cronómetro en la pantalla.
 */
function actualizarTiempo() {
  if (!tiempoInicio) return;
  const segundos = Math.floor((new Date() - tiempoInicio) / 1000);
  tiempoEl.innerText = `${segundos}s`;
  actualizarEstadisticas(); // Actualizar PPM con el tiempo
}

/**
 * Calcula y muestra las palabras por minuto, la precisión y los errores.
 */
function actualizarEstadisticas() {
  const segundosTranscurridos = tiempoInicio
    ? (new Date() - tiempoInicio) / 1000
    : 0;
  const minutosTranscurridos = segundosTranscurridos / 60;

  // Calcular Palabras por Minuto (PPM)
  // Se considera una palabra como 5 caracteres (incluyendo espacios)
  const caracteresCorrectos = indiceActual - errores;
  const ppm =
    minutosTranscurridos > 0
      ? Math.round(
          (caracteresCorrectos > 0 ? caracteresCorrectos : 0) /
            5 /
            minutosTranscurridos
        )
      : 0;
  ppmEl.innerText = ppm;

  // Calcular Precisión
  const precision =
    indiceActual > 0
      ? Math.round(
          ((caracteresCorrectos > 0 ? caracteresCorrectos : 0) / indiceActual) *
            100
        )
      : 100;
  precisionEl.innerText = `${precision}%`;

  // Actualizar Errores
  erroresEl.innerText = errores;
}

// --- EVENT LISTENERS ---
// Cambiamos a 'keydown' para un mejor control de teclas como Backspace
entradaUsuario.addEventListener("keydown", manejarEntrada);
reiniciarBtn.addEventListener("click", iniciarNuevaPrueba);

// --- INICIO DE LA APLICACIÓN ---
// Cargar la primera prueba cuando la página esté lista
document.addEventListener("DOMContentLoaded", iniciarNuevaPrueba);
