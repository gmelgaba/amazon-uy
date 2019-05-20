'use strict';

window.BROWSER = (() => {

	return {

    // +-------------------------+
    // | Browser action Handlers |
    // +-------------------------+

    addClickListener: (cb) => {
      chrome.browserAction.onClicked.addListener(cb);
    },

    addMessageListener: (cb) => {
      chrome.runtime.onMessage.addListener(cb);
    },

		reloadExtension: () => {
      return chrome.runtime.reload();
    },

		onInstalled: (cb) => {
      return chrome.runtime.onInstalled.addListener(cb);
    },

    // +-----------------+
    // | Window Handlers |
    // +-----------------+

		createWindow: (opts, cb) => {
      return chrome.windows.create(opts, cb);
    },

		focusWindow: (id) => {
      return chrome.windows.update(id, { focused: true });
		},

    // +--------------+
    // | TAB Handlers |
    // +--------------+

		createTab: (data, cb) => {
      return chrome.tabs.create(data, cb);
    },

		getTab: (id, cb) => {
      return chrome.tabs.get(id, cb);
		},

		getCurrentTab: (cb) => {
      return chrome.tabs.getSelected(cb);
    },

		updateTab: (id, data, cb) => {
      return chrome.tabs.update(id, data, cb);
    },

    removeCurrentTab: () => {
      chrome.tabs.getCurrent((tab) => {
        chrome.tabs.remove(tab.id);
      });
    },

		removeTab: (id) => {
      return chrome.tabs.remove(id);
    },

    sendMessageToTab: (id, data, cb = null) => {
      chrome.tabs.sendMessage(id, data, cb);
    },

		queryTabs: (query, cb) => {
      return chrome.tabs.query(query, cb);
    },

		onTabUpdated: (cb) => {
      return chrome.tabs.onUpdated.addListener(cb);
    },

		onTabRemoved: (cb) => {
      return chrome.tabs.onRemoved.addListener(cb);
    },

		runScriptsInTab: (id, opts) => {
      return chrome.tabs.executeScript(id, opts);
    },

		injectCSSInTab: (id, opts) => {
      return chrome.tabs.insertCSS(id, opts);
    },

    // +---------------+
    // | Menu Handlers |
    // +---------------+

    createContextMenu: (opts) => {
      chrome.contextMenus.create(opts);
    },

    removeAllContextMenus: () => {
      chrome.contextMenus.removeAll();
    },

    // +------------------+
    // | Storage Handlers |
    // +------------------+

    storage: {

      get: (key, cb) => {
        chrome.storage.sync.get(key, cb);
      },

      set: (data, cb) => {
        chrome.storage.sync.set(data, cb);
      },

      clear: (key, cb) => {
        chrome.storage.sync.remove(key, cb);
      }

    }

	}

})();
