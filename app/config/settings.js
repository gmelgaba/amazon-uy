'use strict';

window.SETTINGS = (() => {

  const _loadConfiguration = async (cb) => {
    const storageKey = STORAGE_KEYS.settings;
    BROWSER.storage.get(storageKey, (data) => {
      const settings = data[storageKey] && data[storageKey].settings;
      if (!settings || !settings.suppliers) {
        LOGGER.log('Settings not found. Adding default settings.');
        BROWSER.storage.set({
          [storageKey]: {
            settings: SETTINGS // default settings
          }
        }, cb);
      } else {
        cb();
      }
    });
  }

  return {

    loadConfiguration: _loadConfiguration,

    currentSupplier: 'enviamicompra',

    suppliers: [{
      id: 'entregamiami',
      name: 'Entrega Miami',
      description: 'EntregaMiami te brinda una dirección postal en Miami para que puedas comprar en cualquier tienda de Estados Unidos. Además, nos encargamos de recibir, gestionar y entregar tu paquete en la dirección que prefieras.',
      image: 'http://www.entregamiami.com.uy/images/frontend/logo.jpg',
      url: 'http://www.entregamiami.com.uy/',
      prices: [{
        min: 0,
        max: 5,
        value: 22
      }]
    },
    {
      id: 'enviamicompra',
      name: 'Envia Mi Compra',
      description: 'Envia Mi Compra te ofrece una forma fácil, económica y segura de comprar en cualquier parte del mundo y recibir tus paquetes en la comodidad de tu casa u oficina.',
      image: 'https://media.licdn.com/dms/image/C560BAQEWamBtnLvfjA/company-logo_200_200/0?e=1544659200&v=beta&t=2bJ-4FDLJonOMFc5QiyTGDeJQehGZlBtC-5ZZLpZawg',
      url: 'https://www.enviamicompra.com.uy',
      prices: [{
        min: 0,
        max: 5,
        value: 21.9
      }]
    },
    {
      id: 'gripper',
      name: 'Gripper',
      description: 'Gripper S.R.L. Uruguay forma parte del grupo Gripper Group, compañía de logística que ofrece soluciones para el transporte de importaciones y exportaciones. Mantiene desde sus inicios como giro principal el transporte de envíos express internacionales por vía aérea, se destaca por ofrecer a sus clientes calidad de servicio y conocimiento local.',
      image: 'https://www.gripper.com.uy/images/logo.svg',
      url: 'https://www.gripper.com.uy',
      prices: [{
        min: 0,
        max: 5,
        value: 21.9
      }]
    },
    {
      id: 'miamebox',
      name: 'Miame Box',
      description: 'Fundada en el Uruguay en el 2001, desarrollando estos servicios de modo que la población pudiese acceder a comprar en el exterior de forma rápida y sencilla. Nuestra experiencia y nuestros más de 50 mil clientes registrados al día de hoy avalan nuestro servicio.',
      image: 'https://www.miami-box.com/img/common/logo.png',
      url: 'https://www.miami-box.com.uy',
      prices: [{
        min: 0,
        max: 5,
        value: 25
      }]
    },
    {
      id: 'puntomio',
      name: 'PuntoMio',
      description: 'PuntoMio te otorga esa dirección sin costos de creación ni de mantenimiento. Además, las oficinas PuntoMio están ubicadas en dirección libre de impuestos, esto significa que ahorras el 7% del impuesto a la venta en USA.',
      image: 'https://www.puntomio.com/sites/default/files/images/100/logos/logo-main.png',
      url: 'https://www.puntomio.com/',
      prices: [{
        min: 0,
        max: 5,
        value: 15.5
      }]
    },
    {
      id: 'urubox',
      name: 'Urubox',
      description: 'Urubox surge en el 2012, luego de la reglamentación de la Ley de importación de productos extranjeros al Uruguay, con el objetivo de dar respuesta a la creciente demanda del público por consumir dichos productos.',
      image: 'http://www.urubox.com.uy/images/logo.png',
      url: 'http://www.urubox.com.uy',
      prices: [{
        min: 0,
        max: 5,
        value: 18.8
      }]
    }]

  }

})();
