/* --- SISTEMA DE SOM 8-BIT (Web Audio API) --- */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = false;

function toggleMute() {
    isMuted = !isMuted;
    document.querySelector('.mute-control').textContent = isMuted ? "[SOM: OFF]" : "[SOM: ON]";
}

function resumeAudio() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, type, duration, startTime = 0) {
    if (isMuted) return;
    resumeAudio();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type; 
    oscillator.frequency.value = freq;

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime + startTime;
    
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
}

function sfxHit() {
    playTone(150, 'sawtooth', 0.1);
    playTone(100, 'square', 0.1, 0.05);
}

function sfxLevelUp() {
    playTone(440, 'square', 0.1, 0);    
    playTone(554, 'square', 0.1, 0.1);  
    playTone(659, 'square', 0.1, 0.2);  
    playTone(880, 'square', 0.4, 0.3);  
}

function sfxError() {
    playTone(150, 'sawtooth', 0.3);
    setTimeout(() => playTone(100, 'sawtooth', 0.3), 150);
}

/* --- LÓGICA DO JOGO --- */
function animarPersonagem(tipo) {
    const hero = document.getElementById('heroSvg');
    hero.classList.remove('attack-anim', 'levelup-anim');
    void hero.offsetWidth;

    if (tipo === 'attack') hero.classList.add('attack-anim');
    else if (tipo === 'levelup') hero.classList.add('levelup-anim');
}

/**
 * Recebe vitórias e derrotas e retorna o saldo e o nível.
 * Regras de nível baseadas na quantidade de vitórias.
 */
function calcularSaldoENivel(vitorias, derrotas) {
    // Garantir inteiros e valores não-negativos
    vitorias = parseInt(vitorias, 10);
    derrotas = parseInt(derrotas, 10);

    const campos = { vitorias, derrotas };
    for (const chave in campos) {
        if (isNaN(campos[chave]) || campos[chave] < 0) {
            throw new Error('Valores inválidos: vitórias/derrotas devem ser números inteiros >= 0');
        }
    }

    const saldo = vitorias - derrotas;
    let nivel = '';

    if (vitorias <= 10) nivel = 'Ferro';
    else if (vitorias <= 20) nivel = 'Bronze';
    else if (vitorias <= 50) nivel = 'Prata';
    else if (vitorias <= 80) nivel = 'Ouro';
    else if (vitorias <= 90) nivel = 'Diamante';
    else if (vitorias <= 100) nivel = 'Lendário';
    else nivel = 'Imortal';

    return { saldo, nivel };
}

function classificarPartidas() {
    resumeAudio();
    const nome = document.getElementById('nomeHeroi').value.trim() || 'Herói Anônimo';
    const vitorias = document.getElementById('vitorias').value;
    const derrotas = document.getElementById('derrotas').value;

    try {
        const { saldo, nivel } = calcularSaldoENivel(vitorias, derrotas);

        sfxLevelUp();
        animarPersonagem('levelup');

        // Construir saída usando loop (exemplo de uso de laço para montar linhas)
        const linhas = [];
        linhas.push(`<div>Jogador: <span class="highlight">${nome}</span></div>`);
        linhas.push(`<div>Vitórias: <strong>${parseInt(vitorias, 10)}</strong> — Derrotas: <strong>${parseInt(derrotas, 10)}</strong></div>`);
        linhas.push(`<div style="margin-top:8px;">O Herói tem de saldo de <strong>${saldo}</strong> e está no nível de <strong>${nivel}</strong>.</div>`);

        // Exemplo de uso adicional de laço: mostrar histórico sintetizado (aqui apenas 1 linha, demonstrando laço)
        let html = '';
        for (let i = 0; i < linhas.length; i++) {
            html += linhas[i];
        }

        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.innerHTML = html + `<div class="hero-badge">${nivel.toUpperCase()}</div>`;
    } catch (err) {
        sfxError();
        document.getElementById('resultado').innerHTML = `<span style='color: var(--color-error);'>Erro: ${err.message}</span>`;
    }
}

function limparFormulario() {
    document.getElementById('nomeHeroi').value = '';
    document.getElementById('vitorias').value = '';
    document.getElementById('derrotas').value = '';
    document.getElementById('resultado').innerHTML = 'Insira as vitórias e derrotas para calcular o saldo e nível.';
}
