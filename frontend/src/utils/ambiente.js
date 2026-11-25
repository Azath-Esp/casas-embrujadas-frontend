
export const VOLUMEN_AMBIENTE = 0.15;

function crearRuidoMarron(contexto) {
  const largo = contexto.sampleRate * 2;
  const buffer = contexto.createBuffer(1, largo, contexto.sampleRate);
  const datos = buffer.getChannelData(0);
  let anterior = 0;
  for (let i = 0; i < largo; i++) {
    const blanco = Math.random() * 2 - 1;
    anterior = (anterior + 0.02 * blanco) / 1.02;
    datos[i] = anterior * 3.5;
  }
  return buffer;
}

function armarSonido(contexto) {
  const salida = contexto.createGain();
  salida.gain.value = 0;
  salida.connect(contexto.destination);

  const viento = contexto.createBufferSource();
  viento.buffer = crearRuidoMarron(contexto);
  viento.loop = true;
  const filtro = contexto.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 420;
  const rafagas = contexto.createOscillator();
  rafagas.frequency.value = 0.07;
  const intensidad = contexto.createGain();
  intensidad.gain.value = 260;
  rafagas.connect(intensidad);
  intensidad.connect(filtro.frequency);
  viento.connect(filtro);
  filtro.connect(salida);

  const zumbido = contexto.createOscillator();
  zumbido.type = 'sine';
  zumbido.frequency.value = 55;
  const volumenZumbido = contexto.createGain();
  volumenZumbido.gain.value = 0.08;
  zumbido.connect(volumenZumbido);
  volumenZumbido.connect(salida);

  viento.start();
  rafagas.start();
  zumbido.start();
  return salida;
}

export function crearAmbiente(Contexto = globalThis.AudioContext ?? globalThis.webkitAudioContext) {
  let contexto = null;
  let salida = null;

  return {
    disponible: Boolean(Contexto),
    async iniciar(volumen = VOLUMEN_AMBIENTE) {
      if (!Contexto) return false;
      if (!contexto) {
        contexto = new Contexto();
        salida = armarSonido(contexto);
      }
      await contexto.resume();
      salida.gain.setTargetAtTime(volumen, contexto.currentTime, 1.2);
      return true;
    },
    async detener() {
      if (!contexto) return;
      salida.gain.setTargetAtTime(0, contexto.currentTime, 0.2);
      await new Promise((resolver) => setTimeout(resolver, 600));
      await contexto.suspend();
    },
  };
}
