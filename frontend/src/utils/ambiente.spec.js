import { crearAmbiente } from './ambiente';

function crearContextoFalso() {
  const nodo = () => ({ connect: jasmine.createSpy('connect'), start: jasmine.createSpy('start') });
  const parametro = () => ({ value: 0, setTargetAtTime: jasmine.createSpy('setTargetAtTime') });
  const instancias = [];
  class ContextoFalso {
    constructor() {
      this.sampleRate = 8000;
      this.currentTime = 0;
      this.destination = {};
      this.resume = jasmine.createSpy('resume').and.resolveTo();
      this.suspend = jasmine.createSpy('suspend').and.resolveTo();
      instancias.push(this);
    }
    createGain() { return { ...nodo(), gain: parametro() }; }
    createBiquadFilter() { return { ...nodo(), frequency: parametro(), type: '' }; }
    createOscillator() { return { ...nodo(), frequency: parametro(), type: '' }; }
    createBufferSource() { return { ...nodo(), buffer: null, loop: false }; }
    createBuffer(canales, largo) { const datos = new Float32Array(largo); return { getChannelData: () => datos }; }
  }
  return { ContextoFalso, instancias };
}

describe('Sonido ambiente', () => {
  it('sin Web Audio no falla y avisa que no está disponible', async () => {
    const ambiente = crearAmbiente(null);
    expect(ambiente.disponible).toBeFalse();
    expect(await ambiente.iniciar()).toBeFalse();
    await ambiente.detener();
  });

  it('crea el contexto una sola vez, lo reanuda y sube el volumen de a poco', async () => {
    const { ContextoFalso, instancias } = crearContextoFalso();
    const ambiente = crearAmbiente(ContextoFalso);

    expect(await ambiente.iniciar(0.2)).toBeTrue();
    await ambiente.iniciar(0.2);

    expect(instancias.length).toBe(1);
    expect(instancias[0].resume).toHaveBeenCalledTimes(2);
  });

  it('al detener baja el volumen y suspende el contexto', async () => {
    jasmine.clock().install();
    const { ContextoFalso, instancias } = crearContextoFalso();
    const ambiente = crearAmbiente(ContextoFalso);
    await ambiente.iniciar();

    const detenido = ambiente.detener();
    jasmine.clock().tick(600);
    await detenido;
    jasmine.clock().uninstall();

    expect(instancias[0].suspend).toHaveBeenCalled();
  });
});
