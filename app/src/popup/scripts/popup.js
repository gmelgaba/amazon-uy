/*
  File: popup.js
  Purpose: handle all logic for the popup page
  Author: Gonzalo Melgar

  Copyright (c) 2019
*/

const newTab = () => {
  BROWSER.queryTabs({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0].id;
    BROWSER.sendMessageToTab(currentTab, {
      action: 'retrieve-cart-urls'
    }, (res) => {
      if (res && res.length) {
        const URLS = res;
        URLS.forEach((url, index) => {
          const requestUrl = `${url}&amazon-uy-open=true`;
          setTimeout(() => {
            BROWSER.createTab({ active: false, selected: false, url: requestUrl }, (tab) => {
              LOGGER.log('tab', tab);
            });
          }, index * 500);
        });
      }
    })
  })
}

const reload = () => {
  LOGGER.log('extension reloaded!');
  BROWSER.queryTabs({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = tabs[0].id;
    BROWSER.sendMessageToTab(currentTab, {
      action: 'reload-extension'
    });
  })
}

$(document).ready(() => {
  $('#cart').click(newTab);
  $('#reload').click(reload);
});
