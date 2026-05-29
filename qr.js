// qr.js - Core logic for the Riyo Studio Zero-Watermark QR Hub

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements
  const tabUrl = document.getElementById('tab-url');
  const tabVcard = document.getElementById('tab-vcard');
  const urlFields = document.getElementById('url-fields');
  const vcardFields = document.getElementById('vcard-fields');
  
  const qrUrlInput = document.getElementById('qr-url');
  const vcFname = document.getElementById('vc-fname');
  const vcLname = document.getElementById('vc-lname');
  const vcCompany = document.getElementById('vc-company');
  const vcPhone = document.getElementById('vc-phone');
  const vcEmail = document.getElementById('vc-email');

  const colorDots = document.getElementById('color-dots');
  const colorDotsHex = document.getElementById('color-dots-hex');
  const colorBg = document.getElementById('color-bg');
  const colorBgHex = document.getElementById('color-bg-hex');
  
  const styleDots = document.getElementById('style-dots');
  const styleCorners = document.getElementById('style-corners');
  const logoUpload = document.getElementById('logo-upload');

  const btnDlSvg = document.getElementById('btn-dl-svg');
  const btnDlPng = document.getElementById('btn-dl-png');

  let currentMode = 'url'; // 'url' or 'vcard'
  let uploadedLogo = null;

  // 2. Initialize QR Code Styling Instance
  const qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
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
    if (mode === 'url') {
      tabUrl.classList.add('active');
      tabVcard.classList.remove('active');
      urlFields.style.display = 'block';
      vcardFields.style.display = 'none';
    } else {
      tabVcard.classList.add('active');
      tabUrl.classList.remove('active');
      urlFields.style.display = 'none';
      vcardFields.style.display = 'grid';
    }
    updateQR();
  }

  tabUrl.addEventListener('click', () => switchMode('url'));
  tabVcard.addEventListener('click', () => switchMode('vcard'));

  // 4. vCard Builder
  function buildVCard() {
    const fn = vcFname.value.trim();
    const ln = vcLname.value.trim();
    const org = vcCompany.value.trim();
    const tel = vcPhone.value.trim();
    const email = vcEmail.value.trim();

    // Standard RFC 6350 vCard formatting
    let vcf = "BEGIN:VCARD\nVERSION:3.0\n";
    if (fn || ln) vcf += `N:${ln};${fn};;;\nFN:${fn} ${ln}\n`;
    if (org) vcf += `ORG:${org}\n`;
    if (tel) vcf += `TEL;TYPE=CELL:${tel}\n`;
    if (email) vcf += `EMAIL;TYPE=WORK,INTERNET:${email}\n`;
    vcf += "END:VCARD";

    return vcf;
  }

  // 5. Core Update Function
  function updateQR() {
    // Determine data payload
    let dataPayload = "https://riyostudio.dev"; // fallback
    
    if (currentMode === 'url') {
      dataPayload = qrUrlInput.value.trim() || "https://riyostudio.dev";
    } else {
      dataPayload = buildVCard();
    }

    // Update Hex labels visually
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
