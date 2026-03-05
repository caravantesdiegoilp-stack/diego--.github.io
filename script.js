function cifrar() {
    const mensaje = document.getElementById('mensaje').value;
    const desplazamiento = parseInt(document.getElementById('desplazamiento').value);

    if (!mensaje) {
        alert('Por favor, escribe un mensaje');
        return;
    }

    const resultado = procesarMensaje(mensaje, desplazamiento);
    document.getElementById('resultado').value = resultado;
}

function descifrar() {
    const mensaje = document.getElementById('mensaje').value;
    const desplazamiento = parseInt(document.getElementById('desplazamiento').value);

    if (!mensaje) {
        alert('Por favor, escribe un mensaje');
        return;
    }

    // Para descifrar, usamos el desplazamiento negativo
    const resultado = procesarMensaje(mensaje, 26 - desplazamiento);
    document.getElementById('resultado').value = resultado;
}

function procesarMensaje(mensaje, desplazamiento) {
    let resultado = '';

    for (let i = 0; i < mensaje.length; i++) {
        const char = mensaje[i];
        const codigo = char.charCodeAt(0);

        // Letras mayúsculas
        if (codigo >= 65 && codigo <= 90) {
            const desplazado = ((codigo - 65 + desplazamiento) % 26) + 65;
            resultado += String.fromCharCode(desplazado);
        }
        // Letras minúsculas
        else if (codigo >= 97 && codigo <= 122) {
            const desplazado = ((codigo - 97 + desplazamiento) % 26) + 97;
            resultado += String.fromCharCode(desplazado);
        }
        // Otros caracteres (números, espacios, puntuación)
        else {
            resultado += char;
        }
    }

    return resultado;
}

function limpiar() {
    document.getElementById('mensaje').value = '';
    document.getElementById('resultado').value = '';
    document.getElementById('desplazamiento').value = '3';
}

function copiarResultado() {
    const resultado = document.getElementById('resultado').value;

    if (!resultado) {
        alert('No hay resultado para copiar');
        return;
    }

    // Copiar al portapapeles
    navigator.clipboard.writeText(resultado).then(() => {
        alert('✅ Resultado copiado al portapapeles');
    }).catch(() => {
        alert('❌ No se pudo copiar');
    });
}