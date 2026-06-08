// qr.js - Core logic for the Riyo Studio Zero-Watermark QR Hub

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements
  const tabs = {
    url: document.getElementById('tab-url'),
    vcard: document.getElementById('tab-vcard'),
    wifi: document.getElementById('tab-wifi'),
    email: document.getElementById('tab-email'),
    sms: document.getElementById('tab-sms'),
    crypto: document.getElementById('tab-crypto'),
    app: document.getElementById('tab-app')
  };

  const fields = {
    url: document.getElementById('url-fields'),
    vcard: document.getElementById('vcard-fields'),
    wifi: document.getElementById('wifi-fields'),
    email: document.getElementById('email-fields'),
    sms: document.getElementById('sms-fields'),
    crypto: document.getElementById('crypto-fields'),
    app: document.getElementById('app-fields')
  };
  
  // URL Inputs
  const qrUrlInput = document.getElementById('qr-url');
  
  // vCard Inputs
  const vcFname = document.getElementById('vc-fname');
  const vcLname = document.getElementById('vc-lname');
  const vcCompany = document.getElementById('vc-company');
  const vcPhone = document.getElementById('vc-phone');
  const vcEmail = document.getElementById('vc-email');

  // WiFi Inputs
  const wifiSsid = document.getElementById('wifi-ssid');
  const wifiPass = document.getElementById('wifi-pass');
  const wifiSec = document.getElementById('wifi-sec');

  // Email Inputs
  const emTo = document.getElementById('em-to');
  const emSub = document.getElementById('em-sub');
  const emBody = document.getElementById('em-body');

  // SMS Inputs
  const smsTo = document.getElementById('sms-to');
  const smsBody = document.getElementById('sms-body');

  // Crypto Inputs
  const cryptoType = document.getElementById('crypto-type');
  const cryptoAddr = document.getElementById('crypto-addr');
  const cryptoAmount = document.getElementById('crypto-amount');

  // App Inputs
  const appStoreType = document.getElementById('app-store-type');
  const appUrl = document.getElementById('app-url');

  // Style Inputs
  const colorDots = document.getElementById('color-dots');
  const colorDotsHex = document.getElementById('color-dots-hex');
  const colorBg = document.getElementById('color-bg');
  const colorBgHex = document.getElementById('color-bg-hex');
  const styleDots = document.getElementById('style-dots');
  const styleCorners = document.getElementById('style-corners');
  const logoUpload = document.getElementById('logo-upload');

  const btnDlSvg = document.getElementById('btn-dl-svg');
  const btnDlPng = document.getElementById('btn-dl-png');

  let currentMode = 'url';
  let uploadedLogo = null;

  // LocalStorage Auto-Save System
  function loadPrefs() {
    try {
      const prefs = JSON.parse(localStorage.getItem('riyo_qr_prefs'));
      if (prefs) {
        if (prefs.qrUrl) qrUrlInput.value = prefs.qrUrl;
        if (prefs.colorDots) colorDots.value = prefs.colorDots;
        if (prefs.colorBg) colorBg.value = prefs.colorBg;
        if (prefs.styleDots) styleDots.value = prefs.styleDots;
        if (prefs.styleCorners) styleCorners.value = prefs.styleCorners;
        if (prefs.appStore) appStoreType.value = prefs.appStore;
        if (prefs.appUrl) appUrl.value = prefs.appUrl;
        if (prefs.logo) uploadedLogo = prefs.logo;
      }
    } catch (e) { console.error('Failed to load QR prefs', e); }
  }

  function savePrefs() {
    const prefs = {
      qrUrl: qrUrlInput.value,
      colorDots: colorDots.value,
      colorBg: colorBg.value,
      styleDots: styleDots.value,
      styleCorners: styleCorners.value,
      appStore: appStoreType.value,
      appUrl: appUrl.value,
      logo: uploadedLogo
    };
    localStorage.setItem('riyo_qr_prefs', JSON.stringify(prefs));
  }

  loadPrefs();

  // 2. Initialize QR Code Styling Instance
  const qrSize = window.innerWidth <= 900 ? 180 : 300;
  const qrCode = new QRCodeStyling({
    width: qrSize,
    height: qrSize,
    type: "svg",
    data: "https://riyostudio.dev",
    image: "",
    dotsOptions: {
      color: "#060B14",
      type: "square"
    },
    backgroundOptions: {
      color: "#ffffff",
    },
    cornersSquareOptions: {
      type: "square"
    },
    imageOptions: {
      crossOrigin: "anonymous",
      margin: 10
    }
  });

  // Append to DOM
  qrCode.append(document.getElementById("canvas-container"));

  // 3. Tab Switching Logic
  function switchMode(mode) {
    currentMode = mode;
    Object.keys(tabs).forEach(k => {
      tabs[k].classList.remove('active');
      fields[k].style.display = 'none';
    });
    tabs[mode].classList.add('active');
    fields[mode].style.display = mode === 'vcard' || mode === 'wifi' || mode === 'email' || mode === 'sms' || mode === 'crypto' || mode === 'app' ? 'grid' : 'block';
    updateQR();
  }

  Object.keys(tabs).forEach(mode => {
    tabs[mode].addEventListener('click', () => switchMode(mode));
  });

  // 4. Payload Builders
  function buildVCard() {
    const fn = vcFname.value.trim();
    const ln = vcLname.value.trim();
    const org = vcCompany.value.trim();
    const tel = vcPhone.value.trim();
    const email = vcEmail.value.trim();

    let vcf = "BEGIN:VCARD\nVERSION:3.0\n";
    if (fn || ln) vcf += `N:${ln};${fn};;;\nFN:${fn} ${ln}\n`;
    if (org) vcf += `ORG:${org}\n`;
    if (tel) vcf += `TEL;TYPE=CELL:${tel}\n`;
    if (email) vcf += `EMAIL;TYPE=WORK,INTERNET:${email}\n`;
    vcf += "END:VCARD";
    return vcf;
  }

  function buildWiFi() {
    const ssid = wifiSsid.value.trim();
    const pass = wifiPass.value.trim();
    const sec = wifiSec.value;
    const hidden = false;
    return `WIFI:T:${sec};S:${ssid};P:${pass};H:${hidden};;`;
  }

  function buildEmail() {
    const to = emTo.value.trim();
    const sub = encodeURIComponent(emSub.value.trim());
    const body = encodeURIComponent(emBody.value.trim());
    return `MATMSG:TO:${to};SUB:${sub};BODY:${body};;`;
  }

  function buildSMS() {
    const to = smsTo.value.trim();
    const body = encodeURIComponent(smsBody.value.trim());
    return `smsto:${to}:${body}`;
  }

  function buildCrypto() {
    const type = cryptoType.value;
    const addr = cryptoAddr.value.trim();
    const amt = cryptoAmount.value.trim();
    let uri = `${type}:${addr}`;
    if (amt) uri += `?amount=${amt}`;
    return uri;
  }

  // 5. Core Update Function
  function updateQR() {
    let dataPayload = "https://riyostudio.dev";
    
    if (currentMode === 'url') dataPayload = qrUrlInput.value.trim() || "https://riyostudio.dev";
    else if (currentMode === 'vcard') dataPayload = buildVCard();
    else if (currentMode === 'wifi') dataPayload = buildWiFi();
    else if (currentMode === 'email') dataPayload = buildEmail();
    else if (currentMode === 'sms') dataPayload = buildSMS();
    else if (currentMode === 'crypto') dataPayload = buildCrypto();
    else if (currentMode === 'app') dataPayload = appUrl.value.trim() || "https://riyostudio.dev";

    colorDotsHex.textContent = colorDots.value.toUpperCase();
    colorBgHex.textContent = colorBg.value.toUpperCase();

    let finalLogo = uploadedLogo || "";
    if (currentMode === 'app' && !uploadedLogo) {
      if (appStoreType.value === 'apple') {
        finalLogo = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="%23000000"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>';
      } else if (appStoreType.value === 'google') {
        finalLogo = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="%233DDC84"><path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.27-10h0l-48.54,84.07a301.25,301.25,0,0,0-246.56,0L116.18,64.45a10,10,0,1,0-17.27,10h0l48,83.24C53.92,208.16,0,301.36,0,416h576c0-114.64-53.92-207.84-146.85-258.55"/></svg>';
      }
    }

    // Trigger Library Update
    qrCode.update({
      data: dataPayload,
      image: finalLogo,
      dotsOptions: {
        color: colorDots.value,
        type: styleDots.value
      },
      backgroundOptions: {
        color: colorBg.value
      },
      cornersSquareOptions: {
        type: styleCorners.value
      }
    });
    savePrefs();
  }

  // 6. Listeners for live updates
  const inputsToWatch = [
    qrUrlInput, vcFname, vcLname, vcCompany, vcPhone, vcEmail,
    wifiSsid, wifiPass, wifiSec,
    emTo, emSub, emBody,
    smsTo, smsBody,
    cryptoType, cryptoAddr, cryptoAmount,
    appStoreType, appUrl,
    colorDots, colorBg, styleDots, styleCorners
  ];

  inputsToWatch.forEach(input => {
    input.addEventListener('input', updateQR);
  });

  // 7. Logo Upload Logic
  logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      uploadedLogo = null;
      updateQR();
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedLogo = event.target.result;
      updateQR();
    };
    reader.readAsDataURL(file);
  });

  // 8. Download Triggers
  btnDlSvg.addEventListener('click', () => {
    qrCode.download({ name: "RiyoStudio_QR", extension: "svg" });
  });

  btnDlPng.addEventListener('click', () => {
    qrCode.download({ name: "RiyoStudio_QR", extension: "png" });
  });
});
