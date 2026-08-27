/* ===================== MATRIX RAIN ===================== */

(function matrixRain() {
    const canvas = document.getElementById('matrix-rain');
    const ctx = canvas.getContext('2d');
    let width, height, columns, drops;
    const chars = 'アイウエオカキクケコサシスセソ01234567890xF$#@%&ﾊﾐﾋｹﾒﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ';

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        columns = Math.floor(width / 16);
        drops = new Array(columns).fill(1);
    }

    function draw() {
        ctx.fillStyle = 'rgba(2, 4, 3, 0.08)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#00ff41';
        ctx.font = '14px monospace';
        for (let i = 0; i < drops.length; i++) {
            const char = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(char, i * 16, drops[i] * 16);
            if (drops[i] * 16 > height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    resize();
    window.addEventListener('resize', resize);
    setInterval(draw, 45);
})();

/* ===================== BOOT SEQUENCE ===================== */

(function boot() {
    const bootScreen = document.getElementById('boot-screen');
    const bootText = document.getElementById('boot-text');
    const app = document.getElementById('app');
    const lines = [
        '> INICIANDO CRYPT_LAB v1.0...',
        '> CARGANDO MÓDULOS DE CIFRADO...',
        '> ENLAZANDO TABLAS ENOQUIANAS...',
        '> SINCRONIZANDO ALFABETO HEBREO...',
        '> COMPILANDO GENERADORES DE CÓDIGO...',
        '> ACCESO CONCEDIDO.',
        '> BIENVENIDO, OPERADOR.'
    ];

    let done = false;

    function finish() {
        if (done) return;
        done = true;
        bootScreen.remove();
        app.classList.remove('hidden');
    }

    async function type() {
        for (const line of lines) {
            if (done) return;
            for (const ch of line) {
                if (done) return;
                bootText.textContent += ch;
                await new Promise(r => setTimeout(r, 12));
            }
            bootText.textContent += '\n';
            await new Promise(r => setTimeout(r, 150));
        }
        await new Promise(r => setTimeout(r, 400));
        finish();
    }

    bootScreen.addEventListener('click', finish);
    window.addEventListener('keydown', finish, { once: true });
    type();
})();

/* ===================== ENCODING ENGINE ===================== */

const enc = new TextEncoder();

function toBytes(str) {
    return Array.from(enc.encode(str));
}

function escapeForString(str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\t/g, '\\t')
        .replace(/\r/g, '\\r');
}

function hexByte(b) {
    return b.toString(16).padStart(2, '0');
}

const MODES = {
    binary: {
        label: 'BINARIO',
        run: str => toBytes(str).map(b => b.toString(2).padStart(8, '0')).join(' ')
    },
    hex: {
        label: 'HEXADECIMAL',
        run: str => toBytes(str).map(hexByte).join(' ')
    },
    octal: {
        label: 'OCTAL',
        run: str => toBytes(str).map(b => b.toString(8).padStart(3, '0')).join(' ')
    },
    base64: {
        label: 'BASE64',
        run: str => btoa(String.fromCharCode(...toBytes(str)))
    },
    ascii: {
        label: 'ASCII (DECIMAL)',
        run: str => toBytes(str).join(' ')
    },
    morse: {
        label: 'CÓDIGO MORSE',
        run: str => morse(str)
    },
    rot13: {
        label: 'ROT13',
        run: str => rot13(str)
    },
    urlenc: {
        label: 'URL ENCODE',
        run: str => encodeURIComponent(str)
    },
    unicode: {
        label: 'UNICODE ESCAPE',
        run: str => [...str].map(c => {
            const cp = c.codePointAt(0);
            return cp > 0xffff
                ? '\\u{' + cp.toString(16) + '}'
                : '\\u' + cp.toString(16).padStart(4, '0');
        }).join('')
    },

    python: {
        label: 'PYTHON',
        run: str => `mensaje = "${escapeForString(str)}"\nprint(mensaje)`
    },
    javascript: {
        label: 'JAVASCRIPT',
        run: str => `const mensaje = "${escapeForString(str)}";\nconsole.log(mensaje);`
    },
    c: {
        label: 'C',
        run: str => {
            const bytes = toBytes(str).map(b => '0x' + hexByte(b)).join(', ');
            return `#include <stdio.h>\n\nunsigned char mensaje[] = { ${bytes}, 0x00 };\n\nint main(void) {\n    printf("%s\\n", mensaje);\n    return 0;\n}`;
        }
    },
    java: {
        label: 'JAVA',
        run: str => `public class Mensaje {\n    public static void main(String[] args) {\n        String mensaje = "${escapeForString(str)}";\n        System.out.println(mensaje);\n    }\n}`
    },
    go: {
        label: 'GO',
        run: str => `package main\n\nimport "fmt"\n\nfunc main() {\n    mensaje := "${escapeForString(str)}"\n    fmt.Println(mensaje)\n}`
    },
    rust: {
        label: 'RUST',
        run: str => `fn main() {\n    let mensaje = "${escapeForString(str)}";\n    println!("{}", mensaje);\n}`
    },
    bash: {
        label: 'BASH',
        run: str => `#!/usr/bin/env bash\nmensaje="${escapeForString(str)}"\necho "$mensaje"`
    },
    sql: {
        label: 'SQL',
        run: str => `SELECT '${str.replace(/'/g, "''")}' AS mensaje;`
    },
    asm: {
        label: 'ENSAMBLADOR (NASM x86-64)',
        run: str => {
            const bytes = toBytes(str).map(b => '0x' + hexByte(b)).join(', ');
            return `section .data\n    mensaje db ${bytes}, 0x0a\n    len equ $ - mensaje\n\nsection .text\n    global _start\n_start:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, mensaje\n    mov rdx, len\n    syscall\n\n    mov rax, 60\n    xor rdi, rdi\n    syscall`;
        }
    },
    brainfuck: {
        label: 'BRAINFUCK',
        run: str => toBrainfuck(toBytes(str))
    },

    enochian: {
        label: 'ENOQUIANO',
        run: str => enochian(str)
    },
    hebrew: {
        label: 'HEBREO',
        run: str => hebrew(str)
    }
};

function rot13(str) {
    return str.replace(/[a-zA-Z]/g, c => {
        const base = c <= 'Z' ? 65 : 97;
        return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
    });
}

const MORSE_MAP = {
    A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.',
    H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.',
    O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-',
    V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
    0: '-----', 1: '.----', 2: '..---', 3: '...--', 4: '....-',
    5: '.....', 6: '-....', 7: '--...', 8: '---..', 9: '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.',
    '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
    '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
    '$': '...-..-', '@': '.--.-.'
};

function morse(str) {
    return str.toUpperCase().split('').map(c => {
        if (c === ' ') return '/';
        return MORSE_MAP[c] || '';
    }).filter(Boolean).join(' ');
}

function toBrainfuck(bytes) {
    let code = '';
    let prev = 0;
    for (const b of bytes) {
        const diff = ((b - prev) % 256 + 256) % 256;
        if (diff <= 128) {
            code += '+'.repeat(diff);
        } else {
            code += '-'.repeat(256 - diff);
        }
        code += '.';
        prev = b;
    }
    return code;
}

const ENOCHIAN_MAP = {
    A: 'UN', B: 'PA', C: 'VEH', D: 'GAL', E: 'GRAPH', F: 'OR', G: 'GED',
    H: 'NA', I: 'GON', J: 'GON', K: 'VEH', L: 'UR', M: 'TAL', N: 'DRUX',
    O: 'MED', P: 'MALS', Q: 'GER', R: 'DON', S: 'FAM', T: 'GISG',
    U: 'VAN', V: 'VAN', W: 'VAN', X: 'PAL', Y: 'GON', Z: 'CEPH'
};

function stripAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function enochian(str) {
    const clean = stripAccents(str).toUpperCase();
    return clean.split(' ').map(word => {
        return word.split('').map(c => ENOCHIAN_MAP[c] || c).filter(Boolean).join('-');
    }).join('  //  ');
}

const HEBREW_MAP = {
    A: 'א', B: 'ב', C: 'כ', D: 'ד', E: 'ה', F: 'פ', G: 'ג', H: 'ח',
    I: 'י', J: "ג'", K: 'ק', L: 'ל', M: 'מ', N: 'נ', O: 'ו', P: 'פ',
    Q: 'ק', R: 'ר', S: 'ס', T: 'ת', U: 'ו', V: 'ו', W: 'ו', X: 'קס',
    Y: 'י', Z: 'ז'
};

const GEMATRIA = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'פ': 80,
    'ק': 100, 'ר': 200, 'ת': 400
};

function hebrew(str) {
    const clean = stripAccents(str).toUpperCase();
    let hebrewText = '';
    let sum = 0;
    for (const c of clean) {
        const mapped = HEBREW_MAP[c];
        if (mapped) {
            hebrewText += mapped;
            for (const h of mapped) sum += GEMATRIA[h] || 0;
        } else if (c === ' ') {
            hebrewText += ' ';
        } else {
            hebrewText += c;
        }
    }
    return `${hebrewText}\n\n[ GUEMATRÍA TOTAL: ${sum} ]`;
}

function shannonEntropy(str) {
    if (!str.length) return 0;
    const freq = {};
    for (const c of str) freq[c] = (freq[c] || 0) + 1;
    let entropy = 0;
    for (const k in freq) {
        const p = freq[k] / str.length;
        entropy -= p * Math.log2(p);
    }
    return entropy;
}

/* ===================== UI WIRING ===================== */

const inputEl = document.getElementById('input-text');
const outputEl = document.getElementById('output-text');
const modeTagEl = document.getElementById('output-mode-tag');
const statChars = document.getElementById('stat-chars');
const statBytes = document.getElementById('stat-bytes');
const statEntropy = document.getElementById('stat-entropy');
const toastEl = document.getElementById('toast');

let currentMode = 'binary';

function updateStats() {
    const val = inputEl.value;
    statChars.textContent = val.length;
    statBytes.textContent = enc.encode(val).length;
}

function render() {
    const val = inputEl.value;
    updateStats();

    if (!val) {
        outputEl.textContent = '// el resultado aparecerá aquí_';
        statEntropy.textContent = '0.00';
        return;
    }

    const mode = MODES[currentMode];
    let result;
    try {
        result = mode.run(val);
    } catch (e) {
        result = '// ERROR AL PROCESAR: ' + e.message;
    }
    outputEl.textContent = result;
    modeTagEl.textContent = '[' + mode.label + ']';
    statEntropy.textContent = shannonEntropy(result).toFixed(2);
}

document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        render();
    });
});

inputEl.addEventListener('input', render);

document.getElementById('btn-clear').addEventListener('click', () => {
    inputEl.value = '';
    render();
    inputEl.focus();
});

document.getElementById('btn-copy').addEventListener('click', () => {
    const text = outputEl.textContent;
    if (!text || text.startsWith('//')) {
        showToast('> NADA QUE COPIAR_');
        return;
    }
    navigator.clipboard.writeText(text)
        .then(() => showToast('> RESULTADO COPIADO AL PORTAPAPELES_'))
        .catch(() => showToast('> ERROR AL COPIAR_'));
});

document.getElementById('btn-scan-all').addEventListener('click', () => {
    const val = inputEl.value;
    if (!val) {
        showToast('> ESCRIBE UN MENSAJE PRIMERO_');
        return;
    }
    updateStats();
    let report = '';
    for (const key in MODES) {
        const mode = MODES[key];
        let result;
        try {
            result = mode.run(val);
        } catch (e) {
            result = 'ERROR: ' + e.message;
        }
        report += `========================================\n [ ${mode.label} ]\n========================================\n${result}\n\n`;
    }
    outputEl.textContent = report;
    modeTagEl.textContent = '[ANÁLISIS COMPLETO]';
    statEntropy.textContent = shannonEntropy(report).toFixed(2);
});

let toastTimer;
function showToast(msg) {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
}

render();
