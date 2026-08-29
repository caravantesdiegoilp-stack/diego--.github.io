const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const voiceToggle = document.getElementById('voice-toggle');
const resetBtn = document.getElementById('reset-btn');
const micBtn = document.getElementById('mic-btn');

const STORAGE_KEY = 'jarvis_user_name';

function addMessage(text, sender) {
    const msg = document.createElement('div');
    msg.className = `msg ${sender}`;
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.textContent = text;
    msg.appendChild(bubble);
    chatWindow.appendChild(msg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function speak(text) {
    if (!voiceToggle.checked || !('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function respond(text) {
    addMessage(text, 'jarvis');
    speak(text);
}

function getUserName() {
    return localStorage.getItem(STORAGE_KEY);
}

function setUserName(name) {
    localStorage.setItem(STORAGE_KEY, name);
}

// Evaluador seguro de expresiones aritméticas básicas (+, -, *, /, paréntesis)
function evaluarExpresion(expr) {
    const tokens = expr.match(/\d+(\.\d+)?|[+\-*/()]/g);
    if (!tokens) return null;

    let pos = 0;

    function parseExpresion() {
        let valor = parseTermino();
        while (tokens[pos] === '+' || tokens[pos] === '-') {
            const op = tokens[pos++];
            const siguiente = parseTermino();
            valor = op === '+' ? valor + siguiente : valor - siguiente;
        }
        return valor;
    }

    function parseTermino() {
        let valor = parseFactor();
        while (tokens[pos] === '*' || tokens[pos] === '/') {
            const op = tokens[pos++];
            const siguiente = parseFactor();
            valor = op === '*' ? valor * siguiente : valor / siguiente;
        }
        return valor;
    }

    function parseFactor() {
        if (tokens[pos] === '(') {
            pos++;
            const valor = parseExpresion();
            pos++; // saltar ')'
            return valor;
        }
        return parseFloat(tokens[pos++]);
    }

    try {
        const resultado = parseExpresion();
        return pos === tokens.length && !isNaN(resultado) ? resultado : null;
    } catch (e) {
        return null;
    }
}

const CHISTES = [
    '¿Por qué los programadores prefieren el frío? Porque odian los bugs.',
    '¿Cómo se despiden los químicos? Ácido un placer.',
    'Un byte le dice a otro: "no te preocupes, todo va a estar bit".',
    '¿Qué le dijo un cable a otro? Nada, se quedaron sin conexión.'
];

function procesarMensaje(texto) {
    const t = texto.toLowerCase().trim();

    if (t === 'ayuda' || t === 'help') {
        return 'Puedo: saludar, decir la hora ("qué hora es"), decir la fecha ("qué día es hoy"), resolver operaciones simples ("cuanto es 8*7"), contar un chiste ("cuéntame un chiste") y recordar tu nombre.';
    }

    const saludo = t.match(/^(hola|buenas|hey|qué tal|que tal)\b/);
    if (saludo) {
        const nombre = getUserName();
        return nombre ? `¡Hola de nuevo, ${nombre}!` : '¡Hola! ¿Cómo te llamas?';
    }

    const presentacion = t.match(/(?:me llamo|mi nombre es|soy)\s+([a-záéíóúñ]+)/i);
    if (presentacion) {
        const nombre = presentacion[1];
        setUserName(nombre.charAt(0).toUpperCase() + nombre.slice(1));
        return `Encantado, ${getUserName()}. A partir de ahora te reconoceré.`;
    }

    if (t.includes('cómo te llamas') || t.includes('como te llamas') || t.includes('quién eres') || t.includes('quien eres')) {
        return 'Soy Jarvis, un modelo básico de asistente que iremos mejorando poco a poco.';
    }

    if (t.includes('hora')) {
        const ahora = new Date();
        return `Son las ${ahora.toLocaleTimeString('es-ES')}.`;
    }

    if (t.includes('fecha') || t.includes('qué día es') || t.includes('que dia es')) {
        const ahora = new Date();
        return `Hoy es ${ahora.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }

    if (t.includes('chiste')) {
        return CHISTES[Math.floor(Math.random() * CHISTES.length)];
    }

    if (t.includes('gracias')) {
        return 'De nada, para eso estoy.';
    }

    const operacion = t.match(/[\d.()+\-*/\s]{3,}/);
    if ((t.includes('cuanto es') || t.includes('cuánto es') || t.includes('calcula')) && operacion) {
        const resultado = evaluarExpresion(operacion[0]);
        if (resultado !== null) {
            return `El resultado es ${resultado}.`;
        }
    }

    const nombreGuardado = getUserName();
    return nombreGuardado
        ? `Todavía no sé responder eso, ${nombreGuardado}. Escribe "ayuda" para ver lo que sí puedo hacer.`
        : 'Todavía no sé responder eso. Escribe "ayuda" para ver lo que sí puedo hacer.';
}

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = chatInput.value.trim();
    if (!texto) return;

    addMessage(texto, 'user');
    chatInput.value = '';

    setTimeout(() => {
        respond(procesarMensaje(texto));
    }, 300);
});

resetBtn.addEventListener('click', () => {
    chatWindow.innerHTML = '';
    addMessage('Conversación reiniciada. ¿En qué puedo ayudarte?', 'jarvis');
});

// Reconocimiento de voz (opcional, si el navegador lo soporta)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = false;

    recognition.addEventListener('result', (event) => {
        const texto = event.results[0][0].transcript;
        chatInput.value = texto;
        chatForm.requestSubmit();
    });

    recognition.addEventListener('end', () => {
        micBtn.classList.remove('listening');
    });

    micBtn.addEventListener('click', () => {
        micBtn.classList.add('listening');
        recognition.start();
    });
} else {
    micBtn.disabled = true;
    micBtn.title = 'Reconocimiento de voz no soportado en este navegador';
}
