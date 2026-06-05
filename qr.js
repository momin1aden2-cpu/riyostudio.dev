// qr.js - Core logic for the Riyo Studio Zero-Watermark QR Hub

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements
  const tabs = {
    url: document.getElementById('tab-url'),
    vcard: document.getElementById('tab-vcard'),
    wifi: document.getElementById('tab-wifi'),
    email: document.getElementById('tab-email'),
    sms: document.getElementById('tab-sms'),
    crypto: document.getElementById('tab-crypto')
  };

  const fields = {
    url: document.getElementById('url-fields'),
    vcard: document.getElementById('vcard-fields'),
    wifi: document.getElementById('wifi-fields'),
    email: document.getElementById('email-fields'),
    sms: document.getElementById('sms-fields'),
    crypto: document.getElementById('crypto-fields')
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
    fields[mode].style.display = mode === 'vcard' || mode === 'wifi' || mode === 'email' || mode === 'sms' || mode === 'crypto' ? 'grid' : 'block';
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

    colorDotsHex.textContent = colorDots.value.toUpperCase();
    colorBgHex.textContent = colorBg.value.toUpperCase();

    // Trigger Library Update
    qrCode.update({
      data: dataPayload,
      image: uploadedLogo || "",
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
  }

  // 6. Listeners for live updates
  const inputsToWatch = [
    qrUrlInput, vcFname, vcLname, vcCompany, vcPhone, vcEmail,
    wifiSsid, wifiPass, wifiSec,
    emTo, emSub, emBody,
    smsTo, smsBody,
    cryptoType, cryptoAddr, cryptoAmount,
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
