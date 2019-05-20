'use strict';

window.STORAGE_KEYS = (() => {

	return {

    // Stores the current settings of the whole extension.
    settings: 'amazon-uy-settings',

    // Used to store asin cart numbers
    cart: 'amazon-uy-cart',

    product: (asin) => {
      return `amazon-uy-product-${asin}`;
    }

  }

})();
