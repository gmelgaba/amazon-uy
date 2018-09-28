// TODO: support
// ----------
// weird product page: https://www.amazon.com/gp/product/B07BNXPG3X/ref_%3Dcpl_SL_sunspryhqp/ref=amb_link_7?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=hero-quick-promo&pf_rd_r=J2DDE5AQ0Z821GTQ0HQC&pf_rd_r=J2DDE5AQ0Z821GTQ0HQC&pf_rd_t=201&pf_rd_p=fd59865d-9202-4c96-8dd7-9e06650c0263&pf_rd_p=fd59865d-9202-4c96-8dd7-9e06650c0263&pf_rd_i=B075MDJ87H
// support auto refresh in pages like: https://www.amazon.com/gp/product/B0714LD6VN/ref=s9u_qpp_gw_i2?ie=UTF8&fpl=fresh&pd_rd_i=B0714LD6VN&th=1
// black title: https://www.amazon.com/dp/B01H1GJ7IQ/ref=pd_luc_rh_crh_rh_mrairec_01_01_t_img_lh?_encoding=UTF8&psc=1

let supplier = {
  name: '',
  price: 0
}

const regexps = {
  shippingWeight: /.*?(\d*\.*\d*\s*(ounce(s)*|pound(s)*|onza(s)*)).*/g, // 11 ounces (View policies) > 11 ounces
  shippingWeightValue: /(\d*\.*\d*)\s*(ounce(s)*|pound(s)*|onza(s)*)/, // 3 pounds > 3
  shippingWeightUYValue: /(\d*\.*\d*).*/,  // 0.78 kg > 0.78
  priceValue: /\$\s*(\d*\,*\d*\.*\d*)/ // $11.23 > 11.23
}

const needsHomologation = (title) => {
  return title.toLowerCase().indexOf('bluetooth') !== -1 || title.toLowerCase().indexOf('wifi') !== -1;
}

const dataObject = (string, regexp) => {
  let present = !!string;
  let value, match;
  if (present && (match = string.match(regexp))) {
    value = parseFloat(match[1]);
  }
  if (!present) string = 'No disponible.';
  return {
    present,
    string,
    value
  };
}

const getProductTitle = () => {
  return $('#productTitle').text().trim();
}

const getPrice = () => {
  let price = $('#price .a-color-price').first().text().trim();
  if (!price) {
    price = $('span.a-color-price').first().text().trim();
  }
  return dataObject(price, regexps.priceValue);
}

const getShippingWeight = () => {
  let weight = $('th:contains("Shipping Weight"), th:contains("Peso del envío")').parent().find('td').text().trim();
  if (!weight) {
    weight = $('span:contains("Shipping Weight"), span:contains("Peso del envío")').find(':contains("ounces"),:contains("pounds"),:contains("onzas")').text();
  }
  if (!weight) {
    weight = $('b:contains("Shipping Weight")').parent().text();
  }
  weight = weight.replace(regexps.shippingWeight, '$1');
  return dataObject(weight, regexps.shippingWeightValue);
}

const getShippingWeightUY = (weightData) => {
  const { present, string: usWeightString, value: usWeightValue } = weightData;
  if (!present) return dataObject();
  let uyWeight = '';
  if (usWeightString.toLowerCase().indexOf('ounce') !== -1
  || usWeightString.toLowerCase().indexOf('onza') !== -1) {
    // 1 ounce / 35.274 = 1 kg
    uyWeight = (usWeightValue / 35.274).toFixed(2);
  } else if (usWeightString.indexOf('pound') !== -1) {
    // 1 pound / 2.2046 = 1 kg
    uyWeight = (usWeightValue / 2.2046).toFixed(2);
  }
  uyWeight = `${uyWeight} kg`;
  return dataObject(uyWeight, regexps.shippingWeightUYValue);
}

const getShippingPriceUY = (weightData) => {
  const { present, value: uyWeightValue } = weightData;
  if (!present) return dataObject();
  const shippingPriceUY = (supplier.price * uyWeightValue).toFixed(2);
  return dataObject(`$${shippingPriceUY}`, regexps.priceValue);
}

const getTotalPrice = (productPriceData, shippingPriceData) => {
  if (!productPriceData.present || !shippingPriceData.present) return { string: '—' };
  const { value: productPrice } = productPriceData;
  const { value: shippingPrice } = shippingPriceData;
  const total = (productPrice + shippingPrice).toFixed(2);
  return dataObject(`$${total}`, regexps.priceValue);;
}

const getProductData = () => {
  const price = getPrice();
  const shippingWeight = getShippingWeight();
  const shippingWeightUY = getShippingWeightUY(shippingWeight);
  const shippingPriceUY = getShippingPriceUY(shippingWeightUY);
  const total = getTotalPrice(price, shippingPriceUY);
  const title = getProductTitle();
  return {
    price,
    shippingWeight,
    shippingWeightUY,
    shippingPriceUY,
    total,
    title
  }
}

const injectProductData = () => {
  const data = getProductData();

  // App Label
  let $title = $('<div>', { class: 'amazon-uy-title-box' })
  let $span1 = $('<span>', { class: 'white-text', html: 'Amazon\'s UY' });
  let $span2 = $('<span>', { class: 'skyblue-text', html: 'Convertidor de datos' });
  let $span3 = $('<span>', { class: 'triangle' });
  $title.append($span1);
  $title.append($span2);
  $title.append($span3);

  // Supplier Label
  let $supplier = $('<div>', { class: 'amazon-uy-supplier' })
  let $span4 = $('<span>', { class: 'name', html: supplier.name });
  $supplier.append($span4);

  // Table header row
  let $header = $('<tr>', { class: 'header' });
  $header.append('<th>Peso del envío</th>');
  $header.append('<th>Precio</th>');
  $header.append('<th>Costo del envío</th>');
  $header.append('<th class="total">Total</th>');

  // Table data row
  let $data = $('<tr>');
  if (data.shippingWeight.present) {
    $data.append(`<td><span>${data.shippingWeightUY.string}</span><span class="us-weight">(${data.shippingWeight.string})</span></td>`);
  } else {
    $data.append(`<td>${data.shippingWeightUY.string}</td>`);
  }
  $data.append(`<td class="price">${data.price.string}</td>`);
  $data.append(`<td class="price">${data.shippingPriceUY.string}</td>`);
  $data.append(`<td class="total">${data.total.string}</th>`);

  // Custom Table
  let $table = $('<table>', { class: 'amazon-uy-data-table' });
  $table.append($header);
  $table.append($data);

  // Content box
  let $content = $('<div>', { class: 'amazon-uy-data-box' });
  $content.append($title);
  $content.append($supplier);
  $content.append($table);

  if (needsHomologation(data.title)) {
    let $separator = $('<p>', { html: '--' });
    let $note = $('<p>', { html: '<i>Atención:</i> pareceria que este producto tiene señales radioeléctricas. Para enviarlo a Uruguay, deberá seguir una serie de pasos, abonar un costo adicional, y ponerse en contacto con su proveedor.', class: 'homologation-note' });
    let $vucelink = $('<a>', {
      href: 'http://vuce.gub.uy/wp-content/uploads/2016/03/Manual-U002-persona-fisica-c_flujo-v11.pdf',
      html: 'Procedimiento VUCE para la homologación de equipos radioeléctricos de la URSEC para personas físicas.',
      target: '_blank'
    });
    $content.append($separator);
    $content.append($note);
    $content.append($vucelink);
  }

  $('.amazon-uy-data-box').remove();

  let $container = $('#titleSection');
  if (!$container.length) {
    $container = $('#title').parent();
  }
  $container.append($content);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'inject-single-product-data':
      injectProductData();
      break;
    case 'inject-all-products-data':
      break;
    default:
      break;
  }
});

// Load selected supplier data
chrome.storage.sync.get('amazon-uy-settings', (data) => {
  const settings = data['amazon-uy-settings'];
  const storedSupplier = settings.suppliers.find(s => s.id === settings.currentSupplier);
  supplier.name = storedSupplier.name;
  supplier.price = storedSupplier.prices[0].value;
  injectProductData();
});