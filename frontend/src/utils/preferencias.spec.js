import { guardarPreferencias, leerPreferencias } from './preferencias';
import { simularAlmacenamiento } from '../test-utils/renderizar';

describe('Preferencias visuales', () => {
  it('parte con la linterna apagada si no hay nada guardado o está corrupto', () => {
    simularAlmacenamiento();
    expect(leerPreferencias()).toEqual({ linterna: false });
    Storage.prototype.getItem.and.returnValue('{roto');
    expect(leerPreferencias()).toEqual({ linterna: false });
  });

  it('recuerda la linterna encendida y solo acepta true', () => {
    simularAlmacenamiento({ preferencias: '{"linterna":true}' });
    expect(leerPreferencias().linterna).toBeTrue();
    Storage.prototype.getItem.and.returnValue('{"linterna":"si"}');
    expect(leerPreferencias().linterna).toBeFalse();
  });

  it('guarda solo la linterna, nunca el sonido', () => {
    simularAlmacenamiento();
    guardarPreferencias({ linterna: true, sonido: true });
    expect(Storage.prototype.setItem).toHaveBeenCalledWith('preferencias', '{"linterna":true}');
  });
});
