const storageKey = STORAGE_KEYS.settings;

BROWSER.addClickListener((tab) => {
  BROWSER.queryTabs({
    active: true,
    currentWindow: true
  }, (tab) => {
    var activeTab = tabs[0];
    BROWSER.sendMessageToTab(activeTab.id, {
      action: 'inject-single-product-data'
    });
  })
});

BROWSER.removeAllContextMenus();

BROWSER.createContextMenu({
  title: 'Configuración',
  contexts: [
    'browser_action'
  ],
  onclick: () => {
    window.open('src/background/index.html');
  }
});

BROWSER.storage.get(storageKey, (data) => {
  if (!data[storageKey] || true) {
    BROWSER.storage.set({
      [storageKey]: {
        settings: SETTINGS // default settings
      }
    });
  }
});
