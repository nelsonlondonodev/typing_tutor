// --- SELECCIÓN DE ELEMENTOS DEL DOM ---
const textoContainer = document.getElementById("texto-a-escribir");
const entradaUsuario = document.getElementById("entrada-usuario");
const reiniciarBtn = document.getElementById("reiniciar-btn");
const tiempoEl = document.getElementById("tiempo");
const ppmEl = document.getElementById("ppm");
const precisionEl = document.getElementById("precision");
const erroresEl = document.getElementById("errores");
const ultimoResultadoContainer = document.getElementById(
  "ultimo-resultado-container"
);
const ultimoResultadoTexto = document.getElementById("ultimo-resultado-texto");

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
  const teclaPresionada = e.key;

  if (
    !pruebaActiva &&
    teclaPresionada.length === 1 &&
    teclaPresionada !== "Backspace"
  ) {
    pruebaActiva = true;
    tiempoInicio = new Date();
    intervaloTiempo = setInterval(actualizarTiempo, 1000);
  }

  if (!pruebaActiva) return;

  const spans = textoContainer.children;

  // Lógica de Borrado (Backspace)
  if (teclaPresionada === "Backspace") {
    e.preventDefault();
    if (indiceActual > 0) {
      if (spans[indiceActual]) spans[indiceActual].classList.remove("cursor");
      indiceActual--;
      spans[indiceActual].classList.remove("correcto", "incorrecto");
      spans[indiceActual].classList.add("cursor");
      actualizarEstadisticas();
    }
    return;
  }

  if (teclaPresionada.length > 1) return;
  if (indiceActual >= textoActual.length) return;

  const caracterEsperado = textoActual[indiceActual];

  // Lógica de Escritura
  if (teclaPresionada === caracterEsperado) {
    spans[indiceActual].classList.add("correcto");
  } else {
    spans[indiceActual].classList.add("incorrecto");
    errores++;
  }

  spans[indiceActual].classList.remove("cursor");
  indiceActual++;
  actualizarEstadisticas();

  // Comprobar si la prueba ha terminado
  if (indiceActual === textoActual.length) {
    clearInterval(intervaloTiempo);
    pruebaActiva = false;
    guardarResultado(); // Guardar el resultado al finalizar
  } else {
    spans[indiceActual].classList.add("cursor");
  }
}

/**
 * Actualiza el cronómetro y las estadísticas en pantalla.
 */
function actualizarTiempo() {
  if (!tiempoInicio) return;
  const segundos = Math.floor((new Date() - tiempoInicio) / 1000);
  tiempoEl.innerText = `${segundos}s`;
  actualizarEstadisticas();
}

/**
 * Calcula y muestra las palabras por minuto, la precisión y los errores.
 */
function actualizarEstadisticas() {
  const segundosTranscurridos = tiempoInicio
    ? (new Date() - tiempoInicio) / 1000
    : 0;
  const minutosTranscurridos = segundosTranscurridos / 60;

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

  const precision =
    indiceActual > 0
      ? Math.round(
          ((caracteresCorrectos > 0 ? caracteresCorrectos : 0) / indiceActual) *
            100
        )
      : 100;
  precisionEl.innerText = `${precision}%`;

  erroresEl.innerText = errores;
}

/**
 * Guarda el resultado final en localStorage.
 */
function guardarResultado() {
  const resultado = {
    ppm: ppmEl.innerText,
    precision: precisionEl.innerText,
    errores: erroresEl.innerText,
    tiempo: tiempoEl.innerText,
  };
  // Convertimos el objeto a un string JSON para guardarlo
  localStorage.setItem("ultimoResultadoTypingTutor", JSON.stringify(resultado));
}

/**
 * Carga y muestra el último resultado desde localStorage al iniciar.
 */
function cargarUltimoResultado() {
  const resultadoGuardado = localStorage.getItem("ultimoResultadoTypingTutor");
  if (resultadoGuardado) {
    const resultado = JSON.parse(resultadoGuardado);
    ultimoResultadoTexto.innerHTML = `
            <span class="font-semibold text-white">${resultado.ppm}</span> PPM, 
            <span class="font-semibold text-white">${resultado.precision}</span> de precisión, 
            <span class="font-semibold text-white">${resultado.errores}</span> errores en 
            <span class="font-semibold text-white">${resultado.tiempo}</span>.
        `;
    ultimoResultadoContainer.classList.remove("hidden");
  }
}

// --- EVENT LISTENERS ---
entradaUsuario.addEventListener("keydown", manejarEntrada);
reiniciarBtn.addEventListener("click", iniciarNuevaPrueba);

// --- INICIO DE LA APLICACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
  cargarUltimoResultado(); // Cargar el último resultado al iniciar
  iniciarNuevaPrueba(); // Iniciar la primera prueba
});
