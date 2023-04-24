'use strict';

window.PRODUCT = (() => {

  const _regexps = {
    shippingWeight: /.*?(\d*\.*\d*\s*(ounce(s)*|pound(s)*|onza(s)*)).*/g, // 11 ounces (View policies) > 11 ounces
    shippingWeightValue: /(\d*\.*\d*)\s*(ounce(s)*|pound(s)*|onza(s)*)/, // 3 pounds > 3
    shippingWeightUYValue: /(\d*\.*\d*).*/,  // 0.78 kg > 0.78
    priceValue: /\$\s*(\d*\,*\d*\.*\d*)/, // $11.23 > 11.23
    asinFromURL: /\/product\/(.*?)(\/|\?)/ // https://www.amazon.com/gp/product/B075Z3BM3N/ref=ox_sc_saved_title_2?smid=AA6OXOM7IEXHP&psc=1 >> B075Z3BM3N
  };

  const dataObject = (string, regexp, extraParameters) => {
    let present = !!string;
    let value, match;
    if (present && (match = string.match(regexp))) {
      value = parseFloat(match[1]);
    }
    if (!present) string = 'No disponible.';
    return {
      present,
      string,
      value,
      ...extraParameters
    };
  };

  const _getASIN = () => {
    let asin = $('th:contains("ASIN")').parent().find('td').text().trim();
    if (!asin) {
      asin = $('span.a-text-bold:contains("ASIN")').parent().children('span').last().text().trim();
    }
    return asin;
  };

  const _getASINFromURL = (url = window.location.href) => {
    let match;
    if (match = url.match(_regexps.asinFromURL)) {
      return match[1];
    }
  };

  const _getProductASIN = () => {
    const asin1 = _getASIN(); // real product asin
    const asin2 = _getASINFromURL(); // cart product asin

    // If the asin numbers are different, grab the one from the URL to match the cart
    return (asin1 !== asin2 && asin2) ? asin2 : asin1;
  };

  const _getProductTitle = () => {
    return $('#productTitle').text().trim();
  };

  const _getPrice = () => {
    let price = $('span.a-price .a-offscreen').first().text().trim();
    if (!price) {
      price = $('#price .a-color-price').first().text().trim();
    }
    if (!price) {
      price = $('span.a-color-price').first().text().trim();
    }
    if (!price) {
      price = $('.priceToPayPadding').first().text().trim();
    }
    return dataObject(price, _regexps.priceValue);
  };

  const _getShippingWeight = () => {
    let header = 'Peso del envío';
    let weight = $('th:contains("Shipping Weight"), th:contains("Peso del envío")').parent().find('td').text().trim();
    if (!weight) {
      weight = $('span:contains("Shipping Weight"), span:contains("Peso del envío")').find(':contains("ounces"),:contains("pounds"),:contains("onzas")').text();
    }
    if (!weight) {
      weight = $('b:contains("Shipping Weight")').parent().text();
    }
    if (!weight) {
      header = 'Peso del producto';
      weight = $('th:contains("Item Weight"), th:contains("Peso del producto")').parent().find('td').text().trim();
    }
    weight = weight.replace(_regexps.shippingWeight, '$1');
    return dataObject(weight, _regexps.shippingWeightValue, { header });
  };

  const _getShippingWeightUY = (weightData) => {
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
    return dataObject(uyWeight, _regexps.shippingWeightUYValue);
  };

  const _getShippingPriceUY = (weightData) => {
    const { present, value: uyWeightValue } = weightData;
    if (!present) return dataObject();
    const shippingPriceUY = (supplier.price * uyWeightValue).toFixed(2);
    return dataObject(`$${shippingPriceUY}`, _regexps.priceValue);
  };

  const _getTotalPrice = (productPriceData, shippingPriceData) => {
    if (!productPriceData.present || !shippingPriceData.present) return { string: '—' };
    const { value: productPrice } = productPriceData;
    const { value: shippingPrice } = shippingPriceData;
    const total = (productPrice + shippingPrice).toFixed(2);
    return dataObject(`$${total}`, _regexps.priceValue);
  };

  const _getProductData = () => {
    const price = _getPrice();
    LOGGER.log('!', price);
    const shippingWeight = _getShippingWeight();
    const shippingWeightUY = _getShippingWeightUY(shippingWeight);
    const shippingPriceUY = _getShippingPriceUY(shippingWeightUY);
    const total = _getTotalPrice(price, shippingPriceUY);
    const title = _getProductTitle();
    const asin = _getProductASIN();
    return {
      price,
      shippingWeight,
      shippingWeightUY,
      shippingPriceUY,
      total,
      title,
      asin
    }
  };

  return {

    getASIN: _getASIN,
    getASINFromURL: _getASINFromURL,
    getProductASIN: _getProductASIN,
    getProductTitle: _getProductTitle,
    getPrice: _getPrice,
    getShippingWeight: _getShippingWeight,
    getShippingWeightUY: _getShippingWeightUY,
    getShippingPriceUY: _getShippingPriceUY,
    getTotalPrice: _getTotalPrice,
    getProductData: _getProductData

  }

})();
