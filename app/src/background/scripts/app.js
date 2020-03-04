const storageKey = STORAGE_KEYS.settings;

// Actions

const saveSupplierData = () => {
  BROWSER.storage.get(storageKey, (data) => {
    const { currentSupplier } = data['amazon-uy-settings'].settings;
    const supplierIndex = data[storageKey].settings.suppliers.findIndex(s => s.id === currentSupplier);
    data[storageKey].settings.suppliers[supplierIndex].prices[0].value = parseFloat($('input.price-value').val());
    BROWSER.storage.set(data);
  });
}

const selectSupplier = (evt) => {
  const $clicked = $(evt.currentTarget);
  const supplierId = $clicked.data('id');

  // Save selected supplier
  BROWSER.storage.get(storageKey, (data) => {
    const { settings } = data[storageKey];
    settings.currentSupplier = supplierId;
    BROWSER.storage.set({
      [storageKey]: {
        settings
      }
    });
    const currentSupplier = settings.suppliers.find(s => s.id === supplierId);
    loadCurrentSupplier(currentSupplier);
    $('small.selected').hide();
    $clicked.find('small.selected').show();
  });
}

// Initial setup

const loadCurrentSupplier = (supplier) => {
  const $supplierData = $('#supplier-data');
  $supplierData.find('.btn').attr('data-id', supplier.id);
  $supplierData.find('.name').html(supplier.name);
  $supplierData.find('.description').html(supplier.description);
  $supplierData.find('.image').attr('src', supplier.image);
  $supplierData.find('.url').html(supplier.url);
  $supplierData.find('.url').attr('href', supplier.url);
  $supplierData.find('.price input').val(supplier.prices[0].value);
}

const loadSuppliers = () => {
  BROWSER.storage.get(storageKey, (data) => {
    const { settings } = data[storageKey];
    if (!settings || !settings.suppliers) return;
    const { currentSupplier, suppliers } = settings;
    suppliers.forEach(supplier => {
      const $supplier = $('#supplier-template').clone();
      $supplier.removeAttr('id');
      $supplier.attr('data-id', supplier.id);
      $supplier.find('.name').html(supplier.name);
      $supplier.find('.url').html(supplier.url);
      $('.suppliers').append($supplier);
      if (supplier.id === currentSupplier) {
        $supplier.find('small.selected').show();
        loadCurrentSupplier(supplier);
      }
    });
    $('.supplier').click(selectSupplier);
  });
}

$(document).ready(() => {
  loadSuppliers();
  $('#save-supplier').click(saveSupplierData);
});
