
# Amazon UY

Chrome extension that shows you relevant information to Amazon's consumers, adding additional information like weight in kilos per item, plus shipment cost based on a specific supplier, showing an approximate value to the  REAL cost UY people pay while making an Amazon purchase.

## Setup

```sh
npm install
```

## Build
To generate the code with all the files needed just run:

```sh
npm run-script build
```

This will generate a `/build` folder, containing the chrome extension's code to be loaded in the browser.

## Compress
To generate a zip file with the chorme extension files, just run:

```sh
npm run-script zip
```

This will re-build the code and create the `/dist` folder, containing a zipfile with the generated code.

## Install Extension

1. Clone this repo to your own computer.

2. Open Google Chrome.

3. Navigate to **chrome://extensions**

![Image of Navigate](app/images/readme1.png)

4. Enable the 'Developer mode'.

![Image of DeveloperMode](app/images/readme2.png)

5. Click “Load Unpacked Extension” button.

![Image of Load Unpacked](app/images/readme3.png)

6. Navigate to the local folder where you have this project, and point to the `/build` folder, which contains the generated extension’s code and click OK.

7. DONE! The extension is now available to use.

![Image of Done](app/images/readme4.png)

Enjoy it.