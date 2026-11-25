import {
  contrasenaValida, correoValido, esFormularioValido, validarContacto,
  validarLogin, validarPerfil, validarRegistro,
} from './validaciones';

const registroValido = {
  run: '12.345.678-5', nombre: 'Camila', apellidos: 'Reyes Pinto',
  correo: 'camila@casasembrujadas.cl', confirmarCorreo: 'camila@casasembrujadas.cl',
  contrasena: 'Fantasma1', confirmarContrasena: 'Fantasma1', direccion: '', idRegion: '7', idComuna: '11',
};

describe('Validaciones de formularios', () => {
  it('correoValido acepta cualquier dominio con formato correcto', () => {
    expect(correoValido('admin@casasembrujadas.cl')).toBeTrue();
    expect(correoValido('alguien@duoc.cl')).toBeTrue();
  });

  it('correoValido rechaza formatos incorrectos y correos de más de 120 caracteres', () => {
    expect(correoValido('sin-arroba.cl')).toBeFalse();
    expect(correoValido('a@b')).toBeFalse();
    expect(correoValido(`${'a'.repeat(115)}@duoc.cl`)).toBeFalse();
  });

  it('contrasenaValida exige entre 8 y 72 caracteres con letra y número', () => {
    expect(contrasenaValida('Cliente123!')).toBeTrue();
    expect(contrasenaValida('corta1')).toBeFalse();
    expect(contrasenaValida('sinnumeros')).toBeFalse();
    expect(contrasenaValida('12345678')).toBeFalse();
    expect(contrasenaValida(`a1${'x'.repeat(71)}`)).toBeFalse();
  });

  it('validarRegistro no devuelve errores con datos válidos', () => {
    expect(validarRegistro(registroValido)).toEqual({});
  });

  it('validarRegistro marca los campos obligatorios de un formulario vacío', () => {
    const vacio = Object.fromEntries(Object.keys(registroValido).map((campo) => [campo, '']));
    expect(Object.keys(validarRegistro(vacio)).sort())
      .toEqual(['apellidos', 'contrasena', 'correo', 'idComuna', 'idRegion', 'nombre', 'run']);
  });

  it('validarRegistro detecta el RUN inválido y las confirmaciones distintas', () => {
    const errores = validarRegistro({ ...registroValido, run: '12.345.678-9', confirmarCorreo: 'otra@x.cl', confirmarContrasena: 'Otra1234' });
    expect(Object.keys(errores).sort()).toEqual(['confirmarContrasena', 'confirmarCorreo', 'run']);
  });

  it('validarLogin solo exige correo válido y contraseña', () => {
    expect(validarLogin({ correo: 'admin@casasembrujadas.cl', contrasena: 'x' })).toEqual({});
    expect(Object.keys(validarLogin({ correo: 'malo', contrasena: '' })).sort()).toEqual(['contrasena', 'correo']);
  });

  it('validarPerfil exige nombre y apellidos', () => {
    expect(validarPerfil({ nombre: 'Camila', apellidos: 'Reyes', direccion: '' })).toEqual({});
    expect(Object.keys(validarPerfil({ nombre: ' ', apellidos: '', direccion: 'x'.repeat(151) })).sort())
      .toEqual(['apellidos', 'direccion', 'nombre']);
  });

  it('validarContacto marca campos vacíos y acepta un mensaje válido', () => {
    expect(Object.keys(validarContacto({ nombre: '', correo: '', mensaje: '' })).length).toBe(3);
    expect(validarContacto({ nombre: 'Ana', correo: 'ana@duoc.cl', mensaje: 'Hola' })).toEqual({});
  });

  it('validarContacto rechaza nombre y mensaje demasiado largos', () => {
    const errores = validarContacto({ nombre: 'x'.repeat(101), correo: 'ana@duoc.cl', mensaje: 'x'.repeat(501) });
    expect(Object.keys(errores).sort()).toEqual(['mensaje', 'nombre']);
  });

  it('esFormularioValido es true sin errores y false con errores', () => {
    expect(esFormularioValido({})).toBeTrue();
    expect(esFormularioValido({ correo: 'malo' })).toBeFalse();
  });
});
