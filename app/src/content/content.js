// TODO: support
// ----------
// weird product page: https://www.amazon.com/gp/product/B07BNXPG3X/ref_%3Dcpl_SL_sunspryhqp/ref=amb_link_7?pf_rd_m=ATVPDKIKX0DER&pf_rd_s=hero-quick-promo&pf_rd_r=J2DDE5AQ0Z821GTQ0HQC&pf_rd_r=J2DDE5AQ0Z821GTQ0HQC&pf_rd_t=201&pf_rd_p=fd59865d-9202-4c96-8dd7-9e06650c0263&pf_rd_p=fd59865d-9202-4c96-8dd7-9e06650c0263&pf_rd_i=B075MDJ87H

// wrong prices pages:
//   https://www.amazon.com/dp/B00E7D3V4S/ref=sxbs_sxwds-stppvp_2?pf_rd_m=ATVPDKIKX0DER&pf_rd_p=d45777d6-4c64-4117-8332-1659db52e64f&pd_rd_wg=oWXQW&pf_rd_r=3AF693C19W8QHK9FXDCR&pf_rd_s=desktop-sx-bottom-slot&pf_rd_t=301&pd_rd_i=B00E7D3V4S&pd_rd_w=ih85p&pf_rd_i=Compact+Router&pd_rd_r=ef67019d-62c5-4e69-b9c4-77c4c8072481&ie=UTF8&qid=1538596545&sr=2
//   https://www.amazon.com/Kreg-KMA2600-Square-Cut/dp/B003ARSYQM/ref=pd_bxgy_469_3?_encoding=UTF8&pd_rd_i=B003ARSYQM&pd_rd_r=5dcf9f7a-c732-11e8-8c11-7fd735fac2a8&pd_rd_w=htydI&pd_rd_wg=MG4Z5&pf_rd_i=desktop-dp-sims&pf_rd_m=ATVPDKIKX0DER&pf_rd_p=3f9889ac-6c45-46e8-b515-3af650557207&pf_rd_r=M23HNYRK92A488GJWKS0&pf_rd_s=desktop-dp-sims&pf_rd_t=40701&psc=1&refRID=M23HNYRK92A488GJWKS0

// NOT WORKING!
//   https://www.amazon.com/What-Do-You-Meme-Expansion/dp/B077S5SB6L/ref=pd_rhf_sc_s_cp_0_4?_encoding=UTF8&pd_rd_i=B077S5SB6L&pd_rd_r=2ae1393b-93cd-456f-84eb-039065447f39&pd_rd_w=5O6sd&pd_rd_wg=qj2u0&psc=1&refRID=3MZQSFJQXYN54VE5FRVC

const HOST = `${window.location.protocol}//${window.location.hostname}`;

const supplier = {
  name: '',
  price: 0
};

const regexps = {
  shippingWeight: /.*?(\d*\.*\d*\s*(ounce(s)*|pound(s)*|onza(s)*)).*/g, // 11 ounces (View policies) > 11 ounces
  shippingWeightValue: /(\d*\.*\d*)\s*(ounce(s)*|pound(s)*|onza(s)*)/, // 3 pounds > 3
  shippingWeightUYValue: /(\d*\.*\d*).*/,  // 0.78 kg > 0.78
  priceValue: /\$\s*(\d*\,*\d*\.*\d*)/, // $11.23 > 11.23
  asinFromURL: /\/product\/(.*?)(\/|\?)/ // https://www.amazon.com/gp/product/B075Z3BM3N/ref=ox_sc_saved_title_2?smid=AA6OXOM7IEXHP&psc=1 >> B075Z3BM3N
};

const isBlackTitlePage = () => {
  return !!$('#titleBar.superleaf').length;
};

const injectionPresent = () => {
  return !!$('.amazon-uy-data-box').length
      || !!$('.amazon-uy-cart-data').length
      || !!$('.amazon-uy-total-data-container').length;
};

const isOpenedByTheExtension = () => {
  return window.location.href.indexOf('amazon-uy-open=true') > -1;
};

const isProductPage = () => {
  return window.location.href.indexOf('/product/') > -1
  || window.location.href.indexOf('/gp/product/') > -1
  || window.location.href.indexOf('/dp/') > -1;
};

const isCartPage = () => {
  return window.location.href.indexOf('/cart/') > -1;
};

const isOrderDetailsPage = () => {
  return window.location.href.indexOf('/order-details/') > -1;
};

const {
  needsHomologation,
  getASINFromURL,
  getProductASIN,
  getPrice,
  getProductData
} = PRODUCT;

const CART_KEY = STORAGE_KEYS.cart;
const PRODUCT_KEY = STORAGE_KEYS.product(getProductASIN());

// ----------------
// Message handlers
// ----------------

const injectProductData = () => {

  const data = getProductData();

  // Store product data
  storeProductData(data);

  // App Label
  const $title = $('<div>', { class: 'amazon-uy-title-box' })
  const $span1 = $('<span>', { class: 'white-text', html: 'Amazon\'s UY' });
  const $span2 = $('<span>', { class: 'skyblue-text', html: 'Convertidor de datos' });
  const triangleClasses = isBlackTitlePage() ? 'triangle-absolute' : 'triangle';
  const $span3 = $('<span>', { class: triangleClasses });
  $title.append($span1);
  $title.append($span2);
  $title.append($span3);

  // Supplier Label
  const $supplier = $('<div>', { class: 'amazon-uy-supplier' })
  const $span4 = $('<span>', { class: 'name', html: supplier.name });
  $supplier.append($span4);

  // Table header row
  const $header = $('<tr>', { class: 'header' });
  $header.append('<th>Peso del envío</th>');
  $header.append('<th>Precio</th>');
  $header.append('<th>Costo del envío</th>');
  $header.append('<th class="total">Total</th>');

  // Table data row
  const $data = $('<tr>');
  if (data.shippingWeight.present) {
    $data.append(`<td><span>${data.shippingWeightUY.string}</span><span class="us-weight">(${data.shippingWeight.string})</span></td>`);
  } else {
    $data.append(`<td>${data.shippingWeightUY.string}</td>`);
  }
  $data.append(`<td class="price">${data.price.string}</td>`);
  $data.append(`<td class="price">${data.shippingPriceUY.string}</td>`);
  $data.append(`<td class="total">${data.total.string}</th>`);

  // Custom Table
  const $table = $('<table>', { class: 'amazon-uy-data-table' });
  $table.append($header);
  $table.append($data);

  // Content box
  const $content = $('<div>', { class: 'amazon-uy-data-box' });
  $content.append($title);
  $content.append($supplier);
  $content.append($table);

  if (needsHomologation(data.title)) {
    const $separator = $('<p>', { html: '--' });
    const $note = $('<p>', { html: '<i>Atención:</i> pareceria que este producto tiene señales radioeléctricas. Para enviarlo a Uruguay, deberá seguir una serie de pasos, abonar un costo adicional, y ponerse en contacto con su proveedor.', class: 'homologation-note' });
    const $vucelink = $('<a>', {
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
};

const getCartProducts = () => {
  const urls = [];
  const $rows = $('#sc-active-cart .sc-list-item');
  if ($rows && $rows.length) {
    for (let i = 0; i < $rows.length; i++) {
      const row = $rows[i];
      const url = HOST + $(row).find('.a-list-item a.sc-product-link').first().attr('href');
      urls.push({
        domReference: row,
        url
      });
    }
  }
  return urls;
};

const getOrderProducts = () => {
  const urls = [];
  const $rows = $('.shipment .a-fixed-left-grid');
  if ($rows && $rows.length) {
    for (let i = 0; i < $rows.length; i++) {
      const row = $rows[i];
      const url = HOST + $(row).find('a.a-link-normal').first().attr('href');
      urls.push({
        domReference: row,
        url
      });
    }
  }
  return urls;
};

const storeProductData = (productData) => {
  const { asin } = productData;

  // Store the asin into the storage cart
  // Cart example:
  //    ['asin1', 'asin2', ... , 'asinN']
  BROWSER.storage.get(CART_KEY, (data) => {
    const { cart = [] } = data[CART_KEY] || {};
    if (!cart.includes(asin)) {
      cart.push(productData.asin);
    }
    data[CART_KEY] = { cart };
    BROWSER.storage.set(data, () => {
      LOGGER.log('cart', cart);
    });
  });

  // Store the product in the browser storage
  BROWSER.storage.set({ [PRODUCT_KEY]: productData }, () => {
    LOGGER.log('cart product stored', { [PRODUCT_KEY]: productData });
  });
};

const transformToSingleColumn = ($element) => {
  $element.removeClass('a-span2');
  $element.addClass('a-span1');
};

const injectCartHeader = () => {
  const $headerSpan = $('<span>', { class: 'amazon-uy-cart-shipping-header', html: 'Costo del envío' });
  const $priceHeader = $('.sc-list-head').find('.a-span2').first();
  const $quantityHeader = $('.sc-list-head').find('.a-span2').last();

  $priceHeader.after($headerSpan);
  transformToSingleColumn($priceHeader);
  transformToSingleColumn($quantityHeader);
};

const injectCartData = (cartItem, data) => {
  const { domReference } = cartItem;

  const $container = $('<div>', { class: 'amazon-uy-cart-data' });

  // Shipping price
  const $price = $('<span>', { html: data.shippingPriceUY.string });
  if (data.shippingPriceUY.present) {
    $price.addClass('amazon-uy-cart-shipping-price');
    // Shipping details
    const $details = $('<span>', { html: `(${data.shippingWeightUY.string})` });
    $container.append($price);
    $container.append('<br>');
    $container.append($details);
  } else {
    $container.append($price);
  }
  let $cartPrice = $(domReference).find('.a-span2').first();
  $cartPrice.after($container);
  LOGGER.log('message received', $cartPrice);
};

const injectTotal = (total) => {
  total = {
    price: total.price.toFixed(2),
    weight: total.weight.toFixed(2)
  };
  const $cartDataContainer = $('<div>', { class: 'amazon-uy-total-data-container'})

  const $weight = $('<p>', { class: 'amazon-uy-cart-data-row amazon-uy-data-shipping-total-weight' });
  let $text = $('<span>', { html: 'Peso total del envio:' });
  let $cost = $('<span>', { class: 'amazon-uy-data-shipping-total-weight-amount', html: `${total.weight} kg` });
  $weight.append($text);
  $weight.append($cost);

  const $supplier = $('<p>', { class: 'amazon-uy-cart-data-row' });
  $span1 = $('<span>', { html: 'Proveedor seleccionado: ' });
  $span2 = $('<span>', { html: supplier.name });
  $supplier.append($span1);
  $supplier.append($span2);

  const $price = $('<p>', { class: 'amazon-uy-cart-data-row amazon-uy-data-shipping-total-price' });
  $text = $('<span>', { html: 'Costo de envio a Uruguay:' });
  $cost = $('<span>', { class: 'amazon-uy-data-shipping-total-amount', html: `$${total.price}` });
  $price.append($text);
  $price.append($cost);

  $cartDataContainer.append($weight);
  $cartDataContainer.append($supplier);
  $cartDataContainer.append($price);

  if (isCartPage()) {
    const $container = $('.sc-subtotal').find('p');
    $container.after($cartDataContainer);
  } else {
    const $container = $('h5:contains("Order Summary")').parent();
    $container.append($cartDataContainer);
  }
};

// ----------------
// Message Listener
// ----------------

BROWSER.addMessageListener((request, sender, sendResponse) => {
  LOGGER.log('message received', request.action);
  switch (request.action) {
    case 'inject-single-product-data':
      injectProductData();
      break;
    case 'get-cart-urls':
      const items = getCartProducts();
      const urls = items.map(item => item.url);
      sendResponse(urls);
      break;
    case 'reload':
      run();
      break;
    default:
      break;
  }
});

const run = () => {

  if (injectionPresent()) {

    $('.amazon-uy-data-box').remove();
    $('.amazon-uy-cart-data').remove();
    $('.amazon-uy-total-data-container').remove();

  } else {

    // Listen to 'add to cart' button click
    $('#add-to-cart-button').click(() => {
      LOGGER.log('add to cart button clicked');
    });

    // Listen to 'delete' from cart link click
    $('.sc-action-delete, .sc-action-save-for-later, .sc-action-move-to-cart').click(() => {
      LOGGER.log('Action cart link clicked!');
      setTimeout(() => {
        run();
      }, 1700);
    });

  }

  if (isProductPage()) {

    // Load selected supplier data
    const storageKey = STORAGE_KEYS.settings;
    BROWSER.storage.get(storageKey, (data) => {
      const { settings } = data[storageKey];
      const storedSupplier = settings.suppliers.find(s => s.id === settings.currentSupplier);
      supplier.name = storedSupplier.name;
      supplier.price = storedSupplier.prices[0].value;
      injectProductData();
    });

    // TODO: if there's variants that change the DOM
    if (true) {
      $('.a-button, .a-section').click(() => {
        const currentPrice = getPrice();
        setTimeout(() => {
          const secondPrice = getPrice();
          if (!injectionPresent() || (currentPrice.value !== secondPrice.value)) {
            injectProductData();
          }
        }, 3000);
      });
    }

    if (isOpenedByTheExtension()) {
      setTimeout(() => {
        window.close();
      }, 1000);
    }

  } else if (isCartPage() || isOrderDetailsPage()) {

    // Load selected supplier data
    const storageKey = STORAGE_KEYS.settings;
    BROWSER.storage.get(storageKey, (data) => {
      const { settings } = data[storageKey];
      const storedSupplier = settings.suppliers.find(s => s.id === settings.currentSupplier);
      supplier.name = storedSupplier.name;
      supplier.price = storedSupplier.prices[0].value;
    });

    // Load each product information from storage
    const items = (isCartPage()) ? getCartProducts() : getOrderProducts();
    const URLS = items.map(item => item.url);
    const itemsAsins = URLS.map(url => getASINFromURL(url));

    // Inject the custom header to the cart table
    injectCartHeader();

    BROWSER.storage.get(CART_KEY, (data) => {
      const { cart: storedCart = [] } = data[CART_KEY];
      let total = {
        price: 0,
        weight: 0
      };

      // Interception
      const storedAsins = storedCart.filter(value => itemsAsins.indexOf(value) !== -1);

      // Difference
      const nonStoredAsins = storedCart.filter(value => itemsAsins.indexOf(value) < 0);

      // Inject the product data from storage
      itemsAsins.forEach((asin, index) => {
        if (storedAsins.includes(asin)) {
          const asinKey = STORAGE_KEYS.product(asin);
          BROWSER.storage.get(asinKey, (data) => {
            const info = data[asinKey];
            if (info) {
              injectCartData(items[index], info);
              if (info.shippingPriceUY.present) {
                total.price += info.shippingPriceUY.value;
              }
              if (info.shippingWeightUY.present) {
                total.weight += info.shippingWeightUY.value;
              }
            }
          });
          LOGGER.log('Product FOUND in storage', asin);
        } else {
          LOGGER.log('Product NOT FOUND in storage', asin);
        }
      });

      // Remove stored products that aren't in the current cart
      nonStoredAsins.forEach(asin => {
        const asinKey = STORAGE_KEYS.product(asin);
        BROWSER.storage.clear(asinKey, (data) => {
          LOGGER.log('Product REMOVED from storage', asin);
        });
      });

      // Update cart with only the current items
      BROWSER.storage.get(CART_KEY, (data) => {
        const { cart = [] } = data[CART_KEY] || {};
        data[CART_KEY] = { cart: storedAsins };
        BROWSER.storage.set(data);
      });

      // Inject the total price of the shipping after all the storage data was retrieved
      setTimeout(() => {
        injectTotal(total);
      }, 1000);
    });

  }

};

run();
