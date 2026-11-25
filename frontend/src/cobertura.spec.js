const modulos = import.meta.webpackContext('./', {
  recursive: true,
  regExp: /^\.\/(?!main\.jsx$)(?!test-utils\/)(?!.*\.spec\.jsx?$).*\.jsx?$/,
});

describe('Cobertura de todo el código', () => {
  it('carga cada archivo de src para que el informe incluya también lo que no tiene pruebas', () => {
    const rutas = modulos.keys();
    rutas.forEach((ruta) => modulos(ruta));
    expect(rutas.length).toBeGreaterThan(50);
  });
});
