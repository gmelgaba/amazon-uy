/*
  File: content.js
  Purpose: handle all logic for the content script
  Author: Gonzalo Melgar

  Copyright (c) 2019
*/

// ---------
// Constants
// ---------

const HOST = `${window.location.protocol}//${window.location.hostname}`;
const CART_LOCALSTORAGE_KEY = STORAGE_KEYS.cart;
const PRODUCT_KEY = STORAGE_KEYS.product(PRODUCT.getProductASIN());
const supplier = {
  name: '',
  price: 0
};

// ---------------
// Boolean methods
// ---------------

const isInjectionPresent = () => {
  return !!$('.amazon-uy-data-box').length
      || !!$('.amazon-uy-cart-data').length
      || !!$('.amazon-uy-total-data-container').length;
};

const isBlackTitlePage = () => {
  return !!$('#titleBar.superleaf').length;
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

// --------------
// Helper methods
// --------------

const transformToSingleColumn = ($element) => {
  $element.removeClass('a-span2');
  $element.addClass('a-span1');
};

const saveProductData = (productData) => {
  const { asin } = productData;

  // Store the asin into the storage cart
  // Cart example:
  //    ['asin1', 'asin2', ... , 'asinN']
  BROWSER.storage.get(CART_LOCALSTORAGE_KEY, (data) => {
    const { cart = [] } = data[CART_LOCALSTORAGE_KEY] || {};
    if (!cart.includes(asin)) {
      cart.push(productData.asin);
    }
    data[CART_LOCALSTORAGE_KEY] = { cart };
    BROWSER.storage.set(data, () => {
      LOGGER.log('cart', cart);
    });
  });

  // Store the product in the browser storage
  BROWSER.storage.set({ [PRODUCT_KEY]: productData }, () => {
    LOGGER.log('cart product stored', { [PRODUCT_KEY]: productData });
  });
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

// -----------------
// Injection methods
// -----------------

const injectProductData = () => {

  const data = PRODUCT.getProductData();

  // Store product data
  saveProductData(data);

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
  $header.append(`<th>${data.shippingWeight.header}</th>`);
  $header.append('<th>Precio del producto</th>');
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

  $('.amazon-uy-data-box').remove();

  let append = true;
  let $container = $('#corePriceDisplay_desktop_feature_div');
  if (!$container.length) {
    $container = $('#productOverview_feature_div');
    append = false;
  }
  if (!$container.length) {
    $container = $('#titleSection').parent();
  }
  if (!$container.length) {
    $container = $('#title').parent();
  }
  (append) ? $container.append($content) : $container.prepend($content);
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
  LOGGER.group('>>>>> InjectCartData');
  console.log('cartItem', cartItem);
  console.log('data', data);
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
  let $cartPrice = $(domReference).find('.a-spacing-mini').first();
  $cartPrice.after($container);
  LOGGER.groupEnd();
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

  const $supplier = $('<p>', { class: 'amazon-uy-cart-data-row amazon-uy-cart-data-row-supplier' });
  const $span1 = $('<span>', { html: '(Proveedor seleccionado: ' });
  const $span2 = $('<span>', { html: `${supplier.name})` });
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
    const $container = $('.sc-subtotal');
    $container.append('<br>');
    $container.append($cartDataContainer);
  } else {
    const $container = $('h5:contains("Order Summary")').parent();
    $container.append($cartDataContainer);
  }
};

const injectExtension = () => {

  if (isInjectionPresent()) {

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
        injectExtension();
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
        const currentPrice = PRODUCT.getPrice();
        setTimeout(() => {
          const secondPrice = PRODUCT.getPrice();
          if (!isInjectionPresent() || (currentPrice.value !== secondPrice.value)) {
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

  } else if (isCartPage()) {

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
    const itemsAsins = URLS.map(url => PRODUCT.getASINFromURL(url));

    // Inject the custom header to the cart table
    injectCartHeader();

    BROWSER.storage.get(CART_LOCALSTORAGE_KEY, (data) => {
      const { cart: storedCart = [] } = data[CART_LOCALSTORAGE_KEY] || {};
      let total = {
        price: 0,
        weight: 0
      };

      // Interception
      const storedAsins = storedCart.filter(value => itemsAsins.indexOf(value) !== -1);

      // Difference
      const nonStoredAsins = storedCart.filter(value => itemsAsins.indexOf(value) < 0);

      // Inject the product data from storage
      LOGGER.group('Product data from storage');
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
      LOGGER.groupEnd();

      // Update cart with only the current items
      BROWSER.storage.get(CART_LOCALSTORAGE_KEY, (data) => {
        const { cart = [] } = data[CART_LOCALSTORAGE_KEY] || {};
        data[CART_LOCALSTORAGE_KEY] = { cart: storedAsins };
        BROWSER.storage.set(data);
      });

      // Inject the total price of the shipping after all the storage data was retrieved
      setTimeout(() => {
        injectTotal(total);
      }, 1000);
    });

  }

};

// ----------------
// Message Listener
// ----------------

BROWSER.addMessageListener((request, sender, sendResponse) => {
  LOGGER.log('message received', request.action);
  switch (request.action) {
    case 'inject-product-data':
      injectProductData();
      break;
    case 'retrieve-cart-urls':
      const items = getCartProducts();
      const urls = items.map(item => item.url);
      sendResponse(urls);
      break;
    case 'reload-extension':
      injectExtension();
      break;
    default:
      break;
  }
});

SETTINGS.loadConfiguration(() => {
  injectExtension();
});
