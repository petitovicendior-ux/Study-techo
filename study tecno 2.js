import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

import { professions } from "./professions.js";


/* =========================================================
   STUDYTECH - LEARNING
   Sistema de aprendizaje
========================================================= */

const params = new URLSearchParams(
    window.location.search
);

const professionId =
    params.get("profession") || "desarrollo-web";

const profession = professions.find(
    item => item.id === professionId
);


/* =========================================================
   ELEMENTOS HTML
========================================================= */

const professionName =
    document.getElementById("professionName");

const professionDescription =
    document.getElementById("professionDescription");

const professionCategory =
    document.getElementById("professionCategory");

const lessonList =
    document.getElementById("lessonList");

const lessonTitle =
    document.getElementById("lessonTitle");

const lessonText =
    document.getElementById("lessonText");

const lessonStatus =
    document.getElementById("lessonStatus");

const conceptGrid =
    document.getElementById("conceptGrid");

const lessonExample =
    document.getElementById("lessonExample");

const lessonImportant =
    document.getElementById("lessonImportant");

const exerciseQuestion =
    document.getElementById("exerciseQuestion");

const exerciseOptions =
    document.getElementById("exerciseOptions");

const exerciseResult =
    document.getElementById("exerciseResult");

const previousLesson =
    document.getElementById("previousLesson");

const nextLesson =
    document.getElementById("nextLesson");

const completeLesson =
    document.getElementById("completeLesson");

const progressText =
    document.getElementById("progressText");

const progressFill =
    document.getElementById("progressFill");


/* =========================================================
   SONIDOS
========================================================= */

let audioContext = null;

function getAudioContext() {

    if (!audioContext) {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) {
            return null;
        }

        audioContext = new AudioContext();
    }

    if (audioContext.state === "suspended") {
        audioContext.resume();
    }

    return audioContext;
}


function playCorrectSound() {

    const context = getAudioContext();

    if (!context) return;

    const now = context.currentTime;

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
        523.25,
        now
    );

    oscillator.frequency.setValueAtTime(
        659.25,
        now + 0.10
    );

    oscillator.frequency.setValueAtTime(
        783.99,
        now + 0.20
    );

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.25,
        now + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.45
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.5);
}


function playIncorrectSound() {

    const context = getAudioContext();

    if (!context) return;

    const now = context.currentTime;

    const oscillator =
        context.createOscillator();

    const gain =
        context.createGain();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(
        220,
        now
    );

    oscillator.frequency.exponentialRampToValueAtTime(
        110,
        now + 0.35
    );

    gain.gain.setValueAtTime(
        0.0001,
        now
    );

    gain.gain.exponentialRampToValueAtTime(
        0.18,
        now + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + 0.4
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.45);
}


function playCompleteSound() {

    const context = getAudioContext();

    if (!context) return;

    const notes = [
        392,
        523.25,
        659.25,
        783.99
    ];

    notes.forEach((frequency, index) => {

        const start =
            context.currentTime +
            index * 0.12;

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.type = "sine";

        oscillator.frequency.value =
            frequency;

        gain.gain.setValueAtTime(
            0.0001,
            start
        );

        gain.gain.exponentialRampToValueAtTime(
            0.22,
            start + 0.03
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            start + 0.25
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start(start);
        oscillator.stop(start + 0.28);
    });
}


/* =========================================================
   CONTENIDO
========================================================= */

const professionTopics = {

    "desarrollo-web": [
        ["HTML", "Estructura de una página web", "HTML organiza títulos, textos, imágenes, enlaces y otros elementos de una página."],
        ["CSS", "Diseño y presentación", "CSS permite controlar colores, tamaños, espacios, posiciones y diseño responsive."],
        ["JavaScript", "Interactividad web", "JavaScript permite crear botones, formularios, eventos y funciones dinámicas."],
        ["DOM", "Manipulación de páginas", "El DOM representa la estructura HTML y permite modificarla mediante JavaScript."],
        ["APIs", "Comunicación entre aplicaciones", "Una API permite que diferentes sistemas intercambien información."],
        ["Proyecto web", "Construcción de una aplicación", "Un proyecto web combina estructura, diseño y programación para resolver una necesidad."]
    ],

    "programacion": [
        ["Algoritmos", "Resolución paso a paso", "Un algoritmo es una secuencia ordenada de instrucciones para resolver un problema."],
        ["Variables", "Almacenamiento de información", "Una variable permite guardar un valor que puede utilizar un programa."],
        ["Condicionales", "Tomar decisiones", "Las estructuras condicionales permiten ejecutar instrucciones dependiendo de una condición."],
        ["Bucles", "Repetición de instrucciones", "Los bucles permiten repetir una parte del programa varias veces."],
        ["Funciones", "Organización del código", "Una función agrupa instrucciones que realizan una tarea determinada."],
        ["Proyecto", "Crear un programa", "Un programa combina algoritmos, datos y estructuras para resolver un problema."]
    ],

    "redes-informaticas": [
        ["Redes", "Comunicación entre dispositivos", "Una red informática permite conectar dispositivos para compartir información y recursos."],
        ["LAN", "Red de área local", "Una LAN conecta dispositivos dentro de un espacio limitado como una casa, aula o empresa."],
        ["Switch", "Conexión de dispositivos", "Un switch conecta varios dispositivos dentro de una red local."],
        ["Router", "Comunicación entre redes", "Un router dirige paquetes de datos entre diferentes redes."],
        ["IP", "Identificación de dispositivos", "Una dirección IP identifica una interfaz dentro de una red."],
        ["Proyecto de red", "Diseño de una red", "Un diseño de red combina dispositivos, medios, direccionamiento y protocolos."]
    ],

    "ciberseguridad": [
        ["Amenazas", "Riesgos informáticos", "Las amenazas pueden intentar robar información, alterar sistemas o interrumpir servicios."],
        ["Contraseñas", "Protección de cuentas", "Las contraseñas fuertes ayudan a proteger cuentas y sistemas."],
        ["Malware", "Software malicioso", "El malware es software diseñado para realizar acciones perjudiciales o no autorizadas."],
        ["Phishing", "Engaños digitales", "El phishing intenta engañar a una persona para obtener información o acceso."],
        ["Firewall", "Control del tráfico", "Un firewall controla determinadas conexiones de red según reglas establecidas."],
        ["Seguridad", "Protección integral", "La ciberseguridad combina personas, procesos y tecnología para reducir riesgos."]
    ],

    "administracion-sistemas": [
        ["Sistemas operativos", "Gestión del computador", "Un sistema operativo administra hardware, software, archivos y recursos."],
        ["Usuarios", "Control de acceso", "Los usuarios permiten separar identidades y permisos dentro de un sistema."],
        ["Archivos", "Organización de información", "Los sistemas de archivos permiten almacenar y organizar información."],
        ["Procesos", "Programas en ejecución", "Un proceso representa un programa que está siendo ejecutado por el sistema."],
        ["Servidores", "Servicios de red", "Un servidor proporciona recursos o servicios a otros dispositivos."],
        ["Administración", "Mantenimiento de sistemas", "Administrar sistemas implica configurar, supervisar, actualizar y proteger recursos."]
    ],

    "analisis-datos": [
        ["Datos", "Información sin procesar", "Los datos son valores que pueden analizarse para obtener información."],
        ["Tablas", "Organización de datos", "Las tablas organizan información mediante filas y columnas."],
        ["Limpieza", "Preparación de datos", "La limpieza elimina errores, duplicados o inconsistencias de un conjunto de datos."],
        ["Gráficos", "Representación visual", "Los gráficos ayudan a identificar patrones y tendencias."],
        ["Estadística", "Interpretación de datos", "La estadística utiliza métodos para describir y analizar datos."],
        ["Proyecto", "Análisis completo", "Un análisis combina recopilación, limpieza, exploración e interpretación."]
    ],

    "diseno-grafico": [
        ["Composición", "Organización visual", "La composición organiza elementos para crear una estructura visual equilibrada."],
        ["Color", "Comunicación visual", "El color puede ayudar a transmitir información, jerarquía y emociones."],
        ["Tipografía", "Diseño del texto", "La tipografía estudia la selección y organización visual de las letras."],
        ["Imágenes", "Comunicación visual", "Las imágenes pueden comunicar conceptos de forma rápida y visual."],
        ["Identidad", "Representación de una marca", "Una identidad visual reúne elementos que permiten reconocer una marca."],
        ["Proyecto", "Diseño completo", "Un proyecto gráfico integra composición, color, tipografía e imágenes."]
    ],

    "fotografia": [
        ["Cámara", "Funcionamiento básico", "La cámara captura luz para producir una imagen."],
        ["Exposición", "Cantidad de luz", "La exposición depende principalmente de apertura, velocidad e ISO."],
        ["Enfoque", "Nitidez", "El enfoque determina qué zona de una imagen aparece con mayor nitidez."],
        ["Composición", "Organización de la escena", "La composición organiza los elementos que aparecen dentro de una fotografía."],
        ["Iluminación", "Control de la luz", "La iluminación influye en la apariencia, profundidad y ambiente de una fotografía."],
        ["Proyecto", "Sesión fotográfica", "Una sesión combina planificación, composición, iluminación y captura."]
    ],

    "marketing-digital": [
        ["Marketing", "Comunicación con el público", "El marketing estudia necesidades y desarrolla estrategias para comunicar ofertas."],
        ["Público", "Personas objetivo", "Identificar un público ayuda a adaptar los mensajes y canales de comunicación."],
        ["Contenido", "Comunicación digital", "El contenido puede utilizarse para informar, educar o comunicar una propuesta."],
        ["Redes sociales", "Comunicación en plataformas", "Las redes sociales permiten distribuir contenido e interactuar con comunidades."],
        ["Métricas", "Medición de resultados", "Las métricas permiten analizar el comportamiento de una campaña."],
        ["Proyecto", "Campaña digital", "Una campaña combina objetivos, público, contenido, canales y medición."]
    ],

    "emprendimiento": [
        ["Idea", "Identificación de oportunidades", "Una idea empresarial parte de una necesidad, problema u oportunidad."],
        ["Cliente", "Persona a quien se dirige", "Conocer al cliente ayuda a diseñar una solución relevante."],
        ["Propuesta", "Valor ofrecido", "La propuesta de valor explica qué problema se resuelve y qué beneficio se ofrece."],
        ["Modelo", "Funcionamiento del proyecto", "Un modelo de negocio describe cómo funciona y genera valor un proyecto."],
        ["Finanzas", "Control económico", "Las finanzas permiten controlar ingresos, gastos, costos y recursos."],
        ["Proyecto", "Planificación", "Un proyecto de emprendimiento reúne problema, solución, cliente y planificación."]
    ],

    "administracion": [
        ["Organización", "Orden de recursos", "Organizar consiste en distribuir recursos y responsabilidades para alcanzar objetivos."],
        ["Planificación", "Definición de objetivos", "Planificar implica establecer objetivos y determinar acciones para alcanzarlos."],
        ["Dirección", "Coordinación", "La dirección coordina personas y recursos para ejecutar planes."],
        ["Control", "Seguimiento", "El control compara resultados con objetivos para detectar desviaciones."],
        ["Recursos", "Gestión de recursos", "Los recursos pueden incluir personas, dinero, materiales, información y tiempo."],
        ["Proyecto", "Gestión administrativa", "Una buena gestión combina planificación, organización, dirección y control."]
    ],

    "ingles": [
        ["Vocabulary", "Vocabulario", "El vocabulario permite comprender y expresar ideas mediante palabras y expresiones."],
        ["Grammar", "Gramática", "La gramática establece reglas para construir oraciones correctamente."],
        ["Listening", "Comprensión auditiva", "La comprensión auditiva consiste en entender mensajes hablados."],
        ["Reading", "Comprensión escrita", "La lectura permite comprender información escrita."],
        ["Writing", "Expresión escrita", "La escritura permite comunicar ideas mediante textos."],
        ["Communication", "Comunicación", "La comunicación integra vocabulario, gramática, comprensión y expresión."]
    ],

    "enfermeria": [
        ["Fundamentos", "Bases de enfermería", "La enfermería utiliza conocimientos científicos y habilidades de cuidado para atender necesidades de salud."],
        ["Higiene", "Prevención de infecciones", "La higiene y las medidas de prevención ayudan a reducir la transmisión de microorganismos."],
        ["Signos vitales", "Valoración básica", "Los signos vitales proporcionan información básica sobre el estado de una persona."],
        ["Seguridad", "Cuidado seguro", "La seguridad del paciente busca reducir riesgos durante la atención."],
        ["Comunicación", "Relación con el paciente", "Una comunicación clara ayuda a comprender necesidades y proporcionar información adecuada."],
        ["Proyecto", "Plan de cuidados", "Un plan de cuidados organiza necesidades, objetivos e intervenciones de enfermería."]
    ],

    "electricidad": [
        ["Electricidad", "Conceptos básicos", "La electricidad está relacionada con el movimiento y comportamiento de cargas eléctricas."],
        ["Voltaje", "Diferencia de potencial", "El voltaje representa una diferencia de potencial eléctrico."],
        ["Corriente", "Flujo de carga", "La corriente eléctrica representa el movimiento de carga eléctrica."],
        ["Resistencia", "Oposición al flujo", "La resistencia representa la oposición al paso de corriente."],
        ["Circuitos", "Conexión eléctrica", "Un circuito proporciona un camino para que circule corriente."],
        ["Proyecto", "Circuito básico", "Un proyecto eléctrico combina componentes, conexiones y medidas de seguridad."]
    ],

    "mecanica": [
        ["Fuerza", "Interacción mecánica", "Una fuerza puede modificar el movimiento o producir una deformación."],
        ["Movimiento", "Cambio de posición", "El movimiento describe cómo cambia la posición de un objeto con el tiempo."],
        ["Energía", "Capacidad para producir cambios", "La energía puede transferirse y transformarse entre diferentes formas."],
        ["Máquinas", "Sistemas mecánicos", "Las máquinas utilizan componentes para transmitir o transformar fuerzas y movimiento."],
        ["Mantenimiento", "Conservación de equipos", "El mantenimiento busca conservar los equipos en condiciones adecuadas de funcionamiento."],
        ["Proyecto", "Sistema mecánico", "Un proyecto mecánico integra componentes, movimiento, fuerzas y mantenimiento."]
    ]
};


/* =========================================================
   CREAR LECCIONES
========================================================= */

function createLessons(id) {

    const topics =
        professionTopics[id] ||
        professionTopics["desarrollo-web"];

    return topics.map((topic, index) => {

        const conceptName = topic[0];
        const title = topic[1];
        const definition = topic[2];

        let example = "";

        if (id === "desarrollo-web") {

            const examples = [
                "<h1>Mi página</h1>",
                "body { background: #08080d; color: white; }",
                "button.addEventListener('click', () => { alert('Hola'); });",
                "document.getElementById('titulo').textContent = 'StudyTech';",
                "fetch('/api/datos').then(respuesta => respuesta.json());",
                "HTML + CSS + JavaScript = aplicación web"
            ];

            example = examples[index];

        } else if (id === "programacion") {

            const examples = [
                "Inicio → recibir datos → procesar → mostrar resultado",
                "let nombre = 'Juan';",
                "if (edad >= 18) { console.log('Adulto'); }",
                "for (let i = 0; i < 5; i++) { console.log(i); }",
                "function sumar(a, b) { return a + b; }",
                "Programa = datos + lógica + salida"
            ];

            example = examples[index];

        } else {

            example =
                `${conceptName}: aplicar este concepto en una situación práctica relacionada con ${profession.nombre}.`;
        }

        const options = [
            definition,
            `Es un concepto que no tiene relación con ${profession.nombre}.`,
            "Es únicamente un elemento decorativo.",
            "Es una función exclusiva de los videojuegos."
        ];

        return {
            id: index + 1,
            title,
            concept: conceptName,
            text: definition,
            important: definition,
            example,

            concepts: [
                {
                    title: conceptName,
                    text: definition
                },
                {
                    title: "Aplicación",
                    text: `Este concepto puede utilizarse dentro del campo de ${profession.nombre}.`
                },
                {
                    title: "Objetivo",
                    text: `Comprender ${conceptName.toLowerCase()} permite avanzar en el aprendizaje de esta profesión.`
                }
            ],

            question:
                `¿Cuál de las siguientes afirmaciones describe mejor ${conceptName}?`,

            options,

            answer: 0
        };
    });
}


/* =========================================================
   DATOS
========================================================= */

const lessons =
    createLessons(professionId);

let currentLesson = 0;

let completedLessons = [];

let selectedAnswers = [];

let currentUser = null;


/* =========================================================
   VALIDAR PROFESIÓN
========================================================= */

if (!profession) {

    window.location.href =
        "dashboard.html";
}


/* =========================================================
   INFORMACIÓN
========================================================= */

function renderProfessionInfo() {

    if (!profession) return;

    if (professionName) {
        professionName.textContent =
            profession.nombre;
    }

    if (professionDescription) {
        professionDescription.textContent =
            profession.descripcion;
    }

    if (professionCategory) {
        professionCategory.textContent =
            profession.categoria;
    }

    document.title =
        `${profession.nombre} | StudyTech`;
}


/* =========================================================
   PROGRESO
========================================================= */

function updateProgress() {

    const total =
        lessons.length;

    const completed =
        completedLessons.length;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    if (progressText) {
        progressText.textContent =
            `${percentage}%`;
    }

    if (progressFill) {
        progressFill.style.width =
            `${percentage}%`;
    }
}


/* =========================================================
   LISTA DE LECCIONES
========================================================= */

function renderLessonList() {

    if (!lessonList) return;

    lessonList.innerHTML = "";

    lessons.forEach((lesson, index) => {

        const button =
            document.createElement("button");

        button.type = "button";

        button.className =
            "lesson-item";

        if (index === currentLesson) {
            button.classList.add("active");
        }

        if (completedLessons.includes(index)) {
            button.classList.add("completed");
        }

        button.innerHTML = `
            <span class="lesson-item-number">
                ${index + 1}
            </span>

            <span class="lesson-item-info">
                <strong>
                    ${lesson.title}
                </strong>

                <small>
                    ${
                        completedLessons.includes(index)
                            ? "Completada"
                            : "Lección"
                    }
                </small>
            </span>
        `;

        button.addEventListener(
            "click",
            () => {

                currentLesson = index;

                renderLesson();
                renderLessonList();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );

        lessonList.appendChild(button);
    });
}


/* =========================================================
   CONCEPTOS
========================================================= */

function renderConcepts(lesson) {

    if (!conceptGrid) return;

    conceptGrid.innerHTML = "";

    lesson.concepts.forEach(
        concept => {

            const card =
                document.createElement("div");

            card.className =
                "concept-card";

            card.innerHTML = `
                <h4>
                    ${concept.title}
                </h4>

                <p>
                    ${concept.text}
                </p>
            `;

            conceptGrid.appendChild(card);
        }
    );
}


/* =========================================================
   EJERCICIO
========================================================= */

function renderExercise(lesson) {

    if (exerciseQuestion) {
        exerciseQuestion.textContent =
            lesson.question;
    }

    if (!exerciseOptions) return;

    exerciseOptions.innerHTML = "";

    lesson.options.forEach(
        (option, index) => {

            const button =
                document.createElement("button");

            button.type = "button";

            button.className =
                "exercise-option";

            button.textContent =
                option;

            button.addEventListener(
                "click",
                () => {

                    checkAnswer(index);
                }
            );

            exerciseOptions.appendChild(button);
        }
    );

    if (exerciseResult) {

        exerciseResult.innerHTML = "";

        exerciseResult.className =
            "exercise-result";
    }

    if (
        selectedAnswers[currentLesson] !==
        undefined
    ) {

        showAnswerResult(
            selectedAnswers[currentLesson]
        );
    }
}


/* =========================================================
   MOSTRAR LECCIÓN
========================================================= */

function renderLesson() {

    const lesson =
        lessons[currentLesson];

    if (!lesson) return;

    if (lessonStatus) {

        lessonStatus.textContent =
            `LECCIÓN ${currentLesson + 1} DE ${lessons.length}`;
    }

    if (lessonTitle) {
        lessonTitle.textContent =
            lesson.title;
    }

    if (lessonText) {
        lessonText.textContent =
            lesson.text;
    }

    if (lessonExample) {
        lessonExample.textContent =
            lesson.example;
    }

    if (lessonImportant) {
        lessonImportant.textContent =
            lesson.important;
    }

    renderConcepts(lesson);

    renderExercise(lesson);

    updateProgress();

    if (previousLesson) {

        previousLesson.disabled =
            currentLesson === 0;
    }

    if (nextLesson) {

        /*
         * En la última lección permitimos utilizar
         * Siguiente si toda la ruta está completada.
         */
        nextLesson.disabled =
            currentLesson === lessons.length - 1 &&
            completedLessons.length < lessons.length;
    }

    if (completeLesson) {

        if (
            completedLessons.includes(
                currentLesson
            )
        ) {

            completeLesson.textContent =
                "✓ Lección completada";

            completeLesson.classList.add(
                "completed"
            );

        } else {

            completeLesson.textContent =
                "✓ Marcar como completada";

            completeLesson.classList.remove(
                "completed"
            );
        }
    }
}


/* =========================================================
   RESPUESTA
========================================================= */

function checkAnswer(answer) {

    const lesson =
        lessons[currentLesson];

    if (!lesson) return;

    selectedAnswers[currentLesson] =
        answer;

    if (answer === lesson.answer) {
        playCorrectSound();
    } else {
        playIncorrectSound();
    }

    showAnswerResult(answer);

    saveProgress();
}


/* =========================================================
   RESULTADO
========================================================= */

function showAnswerResult(answer) {

    if (!exerciseResult) return;

    const lesson =
        lessons[currentLesson];

    const buttons =
        exerciseOptions
            ? exerciseOptions.querySelectorAll(
                ".exercise-option"
            )
            : [];

    buttons.forEach(
        (button, index) => {

            button.classList.remove(
                "correct",
                "incorrect"
            );

            if (index === lesson.answer) {

                button.classList.add(
                    "correct"
                );
            }

            if (
                index === answer &&
                answer !== lesson.answer
            ) {

                button.classList.add(
                    "incorrect"
                );
            }
        }
    );

    if (answer === lesson.answer) {

        exerciseResult.className =
            "exercise-result success";

        exerciseResult.textContent =
            "✓ ¡Respuesta correcta! Muy bien.";

    } else {

        exerciseResult.className =
            "exercise-result error";

        exerciseResult.textContent =
            "✗ Respuesta incorrecta. Revisa el concepto e inténtalo de nuevo.";
    }
}


/* =========================================================
   GUARDAR PROGRESO
========================================================= */

async function saveProgress() {

    if (!currentUser) return;

    try {

        const progress =
            lessons.length === 0
                ? 0
                : Math.round(
                    (
                        completedLessons.length /
                        lessons.length
                    ) * 100
                );

        const progressRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "learningProgress",
                professionId
            );

        await setDoc(
            progressRef,
            {
                professionId,

                professionName:
                    profession.nombre,

                completedLessons,

                selectedAnswers,

                currentLesson,

                progress,

                updatedAt:
                    new Date().toISOString()
            },
            {
                merge: true
            }
        );

    } catch (error) {

        console.error(
            "StudyTech: error guardando progreso.",
            error
        );
    }
}


/* =========================================================
   IR AL EXAMEN FINAL
========================================================= */

function goToFinalExam() {

    window.location.href =
        `final.html?profession=${encodeURIComponent(
            professionId
        )}`;
}


/* =========================================================
   CARGAR PROGRESO
========================================================= */

async function loadProgress() {

    if (!currentUser) return;

    try {

        const progressRef =
            doc(
                db,
                "users",
                currentUser.uid,
                "learningProgress",
                professionId
            );

        const snapshot =
            await getDoc(progressRef);

        if (snapshot.exists()) {

            const data =
                snapshot.data();

            if (
                Array.isArray(
                    data.completedLessons
                )
            ) {

                completedLessons =
                    data.completedLessons
                        .filter(
                            value =>
                                Number.isInteger(value)
                        )
                        .filter(
                            value =>
                                value >= 0 &&
                                value < lessons.length
                        );

                /*
                 * Elimina duplicados.
                 */
                completedLessons =
                    [...new Set(completedLessons)];

                completedLessons.sort(
                    (a, b) => a - b
                );
            }

            if (
                Array.isArray(
                    data.selectedAnswers
                )
            ) {

                selectedAnswers =
                    data.selectedAnswers;
            }

            if (
                Number.isInteger(
                    data.currentLesson
                )
            ) {

                currentLesson =
                    Math.max(
                        0,
                        Math.min(
                            lessons.length - 1,
                            data.currentLesson
                        )
                    );
            }
        }

    } catch (error) {

        console.error(
            "StudyTech: error cargando progreso.",
            error
        );
    }
}


/* =========================================================
   COMPLETAR LECCIÓN
========================================================= */

async function completeCurrentLesson() {

    /*
     * Si ya completó todas las lecciones,
     * ir directamente al examen.
     */
    if (
        completedLessons.length >=
        lessons.length
    ) {

        goToFinalExam();

        return;
    }


    /*
     * Marcar la lección actual.
     */

    if (
        !completedLessons.includes(
            currentLesson
        )
    ) {

        completedLessons.push(
            currentLesson
        );

        completedLessons =
            [...new Set(completedLessons)];

        completedLessons.sort(
            (a, b) => a - b
        );

        playCompleteSound();

        await saveProgress();
    }


    /*
     * Actualizar pantalla.
     */

    renderLesson();
    renderLessonList();


    /*
     * SI TODAS LAS LECCIONES ESTÁN COMPLETADAS
     * → EXAMEN FINAL
     */

    if (
        completedLessons.length >=
        lessons.length
    ) {

        if (completeLesson) {

            completeLesson.textContent =
                "✓ Ruta completada — entrando al examen...";
        }

        if (nextLesson) {
            nextLesson.disabled = false;
        }

        await saveProgress();

        setTimeout(
            () => {

                goToFinalExam();

            },
            900
        );

        return;
    }


    /*
     * Pasar automáticamente
     * a la siguiente lección.
     */

    if (
        currentLesson <
        lessons.length - 1
    ) {

        setTimeout(
            () => {

                currentLesson++;

                renderLesson();
                renderLessonList();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            },
            500
        );
    }
}


/* =========================================================
   BOTÓN ANTERIOR
========================================================= */

if (previousLesson) {

    previousLesson.addEventListener(
        "click",
        () => {

            if (
                currentLesson > 0
            ) {

                currentLesson--;

                renderLesson();
                renderLessonList();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }
    );
}


/* =========================================================
   BOTÓN SIGUIENTE
========================================================= */

if (nextLesson) {

    nextLesson.addEventListener(
        "click",
        async () => {

            /*
             * Si ya terminó toda la ruta,
             * Siguiente abre el examen.
             */

            if (
                completedLessons.length >=
                lessons.length
            ) {

                await saveProgress();

                goToFinalExam();

                return;
            }


            /*
             * Si estamos en la última lección
             * pero todavía no está completada,
             * primero la completamos.
             */

            if (
                currentLesson ===
                lessons.length - 1
            ) {

                await completeCurrentLesson();

                return;
            }


            /*
             * Avanzar normalmente.
             */

            if (
                currentLesson <
                lessons.length - 1
            ) {

                currentLesson++;

                renderLesson();
                renderLessonList();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        }
    );
}


/* =========================================================
   BOTÓN COMPLETAR
========================================================= */

if (completeLesson) {

    completeLesson.addEventListener(
        "click",
        async () => {

            await completeCurrentLesson();

        }
    );
}


/* =========================================================
   INICIALIZACIÓN
========================================================= */

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            window.location.href =
                "login.html";

            return;
        }

        currentUser = user;

        renderProfessionInfo();

        await loadProgress();

        /*
         * IMPORTANTE:
         * Si la ruta ya estaba completa,
         * entrar nuevamente lleva al examen.
         */

        if (
            completedLessons.length >=
            lessons.length
        ) {

            updateProgress();

            console.log(
                "StudyTech: ruta completada."
            );

            setTimeout(
                () => {

                    goToFinalExam();

                },
                400
            );

            return;
        }

        renderLessonList();

        renderLesson();

        console.log(
            "StudyTech Learning cargado:",
            profession.nombre
        );

    }
);