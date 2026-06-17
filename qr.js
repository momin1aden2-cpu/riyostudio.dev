// qr.js - Core logic for the Riyo Studio Zero-Watermark QR Hub

document.addEventListener('DOMContentLoaded', () => {
  // 1. DOM Elements
  // Visible tabs (top row)
  const tabs = {
    url: document.getElementById('tab-url'),
    wifi: document.getElementById('tab-wifi'),
    vcard: document.getElementById('tab-vcard'),
    menu: document.getElementById('tab-menu'),
    email: document.getElementById('tab-email')
  };

  // "More" dropdown
  const moreBtn = document.getElementById('tab-more');
  const moreMenu = document.getElementById('mode-more-menu');
  const moreLabels = {
    sms: '💬 SMS', phone: '📞 Phone', whatsapp: '🟢 WhatsApp', location: '📍 Location',
    event: '📅 Event', paypal: '💵 PayPal', crypto: '₿ Crypto', app: '📱 App', text: '📝 Text'
  };

  // All field panels (visible + dropdown)
  const fields = {
    url: document.getElementById('url-fields'),
    vcard: document.getElementById('vcard-fields'),
    wifi: document.getElementById('wifi-fields'),
    menu: document.getElementById('menu-fields'),
    email: document.getElementById('email-fields'),
    sms: document.getElementById('sms-fields'),
    phone: document.getElementById('phone-fields'),
    whatsapp: document.getElementById('whatsapp-fields'),
    location: document.getElementById('location-fields'),
    event: document.getElementById('event-fields'),
    paypal: document.getElementById('paypal-fields'),
    crypto: document.getElementById('crypto-fields'),
    app: document.getElementById('app-fields'),
    text: document.getElementById('text-fields')
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

  // New type inputs
  const qrMenu = document.getElementById('qr-menu');
  const qrText = document.getElementById('qr-text');
  const qrPhone = document.getElementById('qr-phone');
  const waNumber = document.getElementById('wa-number');
  const waMsg = document.getElementById('wa-msg');
  const qrLocation = document.getElementById('qr-location');
  const evTitle = document.getElementById('ev-title');
  const evLoc = document.getElementById('ev-loc');
  const evStart = document.getElementById('ev-start');
  const evEnd = document.getElementById('ev-end');
  const ppUser = document.getElementById('pp-user');
  const ppAmount = document.getElementById('pp-amount');

  // Style Inputs
  const colorDots = document.getElementById('color-dots');
  const colorDotsHex = document.getElementById('color-dots-hex');
  const colorBg = document.getElementById('color-bg');
  const colorBgHex = document.getElementById('color-bg-hex');
  const styleDots = document.getElementById('style-dots');
  const styleCorners = document.getElementById('style-corners');
  const styleCornerDot = document.getElementById('style-corner-dot');
  const gradToggle = document.getElementById('grad-toggle');
  const colorDots2 = document.getElementById('color-dots-2');
  const logoUpload = document.getElementById('logo-upload');

  const btnDlSvg = document.getElementById('btn-dl-svg');
  const btnDlPng = document.getElementById('btn-dl-png');
  const btnCopy = document.getElementById('btn-copy');
  const btnVerify = document.getElementById('btn-verify');
  const verifyResult = document.getElementById('verify-result');
  const pngSize = document.getElementById('png-size');
  const bgTransparent = document.getElementById('bg-transparent');

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
        if (prefs.styleCornerDot) styleCornerDot.value = prefs.styleCornerDot;
        if (prefs.colorDots2) colorDots2.value = prefs.colorDots2;
        if (typeof prefs.grad === 'boolean') gradToggle.checked = prefs.grad;
        if (prefs.appStore) appStoreType.value = prefs.appStore;
        if (prefs.appUrl) appUrl.value = prefs.appUrl;
        if (typeof prefs.transparent === 'boolean' && bgTransparent) bgTransparent.checked = prefs.transparent;
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
      styleCornerDot: styleCornerDot.value,
      colorDots2: colorDots2.value,
      grad: gradToggle.checked,
      appStore: appStoreType.value,
      appUrl: appUrl.value,
      transparent: bgTransparent ? bgTransparent.checked : false,
      logo: uploadedLogo
    };
    try {
      localStorage.setItem('riyo_qr_prefs', JSON.stringify(prefs));
    } catch (e) {
      // A large embedded-logo dataURL can blow the ~5MB quota — and savePrefs runs
      // on every keystroke, so an unguarded throw would freeze live updates. Retry
      // without the logo so the rest of the prefs still persist.
      try { delete prefs.logo; localStorage.setItem('riyo_qr_prefs', JSON.stringify(prefs)); } catch (e2) { /* ignore */ }
    }
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

  // 3. Mode Switching Logic
  const gridModes = ['vcard', 'wifi', 'email', 'sms', 'crypto', 'app', 'whatsapp', 'event', 'paypal'];

  function switchMode(mode) {
    currentMode = mode;
    Object.values(fields).forEach(f => { if (f) f.style.display = 'none'; });
    Object.values(tabs).forEach(t => t.classList.remove('active'));
    moreBtn.classList.remove('active');

    if (fields[mode]) fields[mode].style.display = gridModes.includes(mode) ? 'grid' : 'block';

    if (tabs[mode]) {
      tabs[mode].classList.add('active');
      moreBtn.textContent = 'More ▾';
    } else {
      moreBtn.classList.add('active');
      moreBtn.textContent = (moreLabels[mode] || 'More') + ' ▾';
    }
    moreMenu.classList.remove('open');
    updateQR();
  }

  Object.keys(tabs).forEach(mode => {
    tabs[mode].addEventListener('click', () => switchMode(mode));
  });

  // "More" dropdown
  moreBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    moreMenu.classList.toggle('open');
  });
  document.querySelectorAll('.mode-more-item').forEach(item => {
    item.addEventListener('click', () => switchMode(item.dataset.mode));
  });
  document.addEventListener('click', (e) => {
    if (!moreMenu.contains(e.target) && e.target !== moreBtn) moreMenu.classList.remove('open');
  });

  // 4. Payload Builders
  function buildVCard() {
    // vCard 3.0 text values must escape backslash, newline, comma and semicolon
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    const fn = esc(vcFname.value.trim());
    const ln = esc(vcLname.value.trim());
    const org = esc(vcCompany.value.trim());
    const tel = esc(vcPhone.value.trim());
    const email = esc(vcEmail.value.trim());

    let vcf = "BEGIN:VCARD\nVERSION:3.0\n";
    if (fn || ln) {
      const full = [fn, ln].filter(Boolean).join(' ');
      vcf += `N:${ln};${fn};;;\nFN:${full}\n`;
    }
    if (org) vcf += `ORG:${org}\n`;
    if (tel) vcf += `TEL;TYPE=CELL:${tel}\n`;
    if (email) vcf += `EMAIL;TYPE=WORK,INTERNET:${email}\n`;
    vcf += "END:VCARD";
    return vcf;
  }

  function buildWiFi() {
    // WiFi QR spec: escape \ ; , : and " with a backslash
    const esc = (s) => s.replace(/([\\;,:"])/g, '\\$1');
    const ssid = esc(wifiSsid.value.trim());
    const pass = esc(wifiPass.value.trim());
    const sec = wifiSec.value;
    if (!ssid) return '';
    // Open network (no security or no password) omits the password field entirely
    if (sec === 'nopass' || !pass) {
      return `WIFI:T:nopass;S:${ssid};;`;
    }
    return `WIFI:T:${sec};S:${ssid};P:${pass};;`;
  }

  function buildEmail() {
    // mailto: is what modern phone cameras actually open; MATMSG is a dead legacy format.
    const to = emTo.value.trim();
    const params = [];
    if (emSub.value.trim()) params.push('subject=' + encodeURIComponent(emSub.value.trim()));
    if (emBody.value.trim()) params.push('body=' + encodeURIComponent(emBody.value.trim()));
    return 'mailto:' + to + (params.length ? '?' + params.join('&') : '');
  }

  function buildSMS() {
    // smsto:NUMBER:BODY — body is raw text (don't URL-encode), and omit the
    // separator entirely when there's no message so clients don't choke.
    const to = smsTo.value.trim();
    const body = smsBody.value.trim();
    return body ? `smsto:${to}:${body}` : `smsto:${to}`;
  }

  function buildCrypto() {
    const type = cryptoType.value;
    const addr = cryptoAddr.value.trim();
    const amt = cryptoAmount.value.trim();
    if (!amt) return `${type}:${addr}`;
    if (type === 'ethereum') {
      // EIP-681: ETH amount lives in `value`, denominated in wei.
      const [whole, frac = ''] = amt.split('.');
      const fracPadded = (frac + '0'.repeat(18)).slice(0, 18);
      try {
        const wei = (BigInt(whole || '0') * (10n ** 18n) + BigInt(fracPadded || '0')).toString();
        return `ethereum:${addr}?value=${wei}`;
      } catch (e) { return `ethereum:${addr}`; }
    }
    // BIP-21 family (bitcoin/litecoin/…): amount in the main unit.
    return `${type}:${addr}?amount=${encodeURIComponent(amt)}`;
  }

  function buildWhatsApp() {
    const num = waNumber.value.replace(/[^0-9]/g, '');
    if (!num) return 'https://wa.me/';
    const msg = waMsg.value.trim();
    return msg ? `https://wa.me/${num}?text=${encodeURIComponent(msg)}` : `https://wa.me/${num}`;
  }

  function buildLocation() {
    const q = qrLocation.value.trim();
    if (!q) return 'https://maps.google.com';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }

  function buildPayPal() {
    const user = ppUser.value.trim().replace(/^@/, '');
    if (!user) return 'https://paypal.me';
    const amt = ppAmount.value.trim();
    return amt ? `https://www.paypal.com/paypalme/${user}/${amt}` : `https://www.paypal.com/paypalme/${user}`;
  }

  function buildEvent() {
    const fmt = (v) => v ? v.replace(/[-:]/g, '') + '00' : '';
    const esc = (s) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
    let v = 'BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\n';
    if (evTitle.value.trim()) v += `SUMMARY:${esc(evTitle.value.trim())}\n`;
    if (evLoc.value.trim()) v += `LOCATION:${esc(evLoc.value.trim())}\n`;
    if (evStart.value) v += `DTSTART:${fmt(evStart.value)}\n`;
    if (evEnd.value) v += `DTEND:${fmt(evEnd.value)}\n`;
    v += 'END:VEVENT\nEND:VCALENDAR';
    return v;
  }

  // 5. Core Update Function
  function updateQR() {
    let dataPayload = "https://riyostudio.dev";
    
    if (currentMode === 'url') dataPayload = qrUrlInput.value.trim() || "https://riyostudio.dev";
    else if (currentMode === 'vcard') dataPayload = buildVCard();
    else if (currentMode === 'wifi') dataPayload = buildWiFi();
    else if (currentMode === 'menu') dataPayload = qrMenu.value.trim() || "https://riyostudio.dev";
    else if (currentMode === 'email') dataPayload = buildEmail();
    else if (currentMode === 'sms') dataPayload = buildSMS();
    else if (currentMode === 'phone') dataPayload = 'tel:' + (qrPhone.value.trim() || '+61400000000');
    else if (currentMode === 'whatsapp') dataPayload = buildWhatsApp();
    else if (currentMode === 'location') dataPayload = buildLocation();
    else if (currentMode === 'event') dataPayload = buildEvent();
    else if (currentMode === 'paypal') dataPayload = buildPayPal();
    else if (currentMode === 'crypto') dataPayload = buildCrypto();
    else if (currentMode === 'app') dataPayload = appUrl.value.trim() || "https://riyostudio.dev";
    else if (currentMode === 'text') dataPayload = qrText.value || "Hello from Riyo Studio";

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

    // Solid colour or 2-colour gradient fill
    const fill = gradToggle.checked
      ? { gradient: { type: 'linear', rotation: 0.79, colorStops: [{ offset: 0, color: colorDots.value }, { offset: 1, color: colorDots2.value }] } }
      : { color: colorDots.value };

    // Trigger Library Update
    qrCode.update({
      data: dataPayload,
      image: finalLogo,
      // A logo punches a hole in the code — raise error correction to H (30%) so it
      // still scans; plain codes use Q for a tighter, denser result.
      qrOptions: { errorCorrectionLevel: finalLogo ? 'H' : 'Q' },
      dotsOptions: Object.assign({ type: styleDots.value }, fill),
      backgroundOptions: {
        color: (bgTransparent && bgTransparent.checked) ? 'rgba(0,0,0,0)' : colorBg.value
      },
      cornersSquareOptions: Object.assign({ type: styleCorners.value }, fill),
      cornersDotOptions: Object.assign({ type: styleCornerDot.value }, fill)
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
    qrMenu, qrText, qrPhone, waNumber, waMsg, qrLocation,
    evTitle, evLoc, evStart, evEnd, ppUser, ppAmount,
    colorDots, colorBg, colorDots2, styleDots, styleCorners, styleCornerDot
  ];

  inputsToWatch.forEach(input => {
    input.addEventListener('input', updateQR);
  });
  gradToggle.addEventListener('change', updateQR);

  // 7. Logo Upload Logic
  logoUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) {
      uploadedLogo = null;
      updateQR();
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file (PNG, JPG, or SVG) for the logo.');
      e.target.value = '';
      return;
    }
    if (file.size > 1024 * 1024) {
      alert('That logo is over 1 MB — please use a smaller image so the code stays sharp and scannable.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedLogo = event.target.result;
      updateQR();
    };
    reader.readAsDataURL(file);
  });

  if (bgTransparent) bgTransparent.addEventListener('change', updateQR);

  // 8. Download Triggers
  btnDlSvg.addEventListener('click', () => {
    qrCode.download({ name: "RiyoStudio_QR", extension: "svg" });
  });

  // PNG export at a chosen resolution — render big, save, then restore the
  // on-screen size so print output is crisp instead of the ~300px preview.
  btnDlPng.addEventListener('click', async () => {
    const size = parseInt(pngSize && pngSize.value, 10) || 1024;
    qrCode.update({ width: size, height: size });
    await new Promise((r) => setTimeout(r, 60)); // let the high-res redraw settle
    try { await qrCode.download({ name: "RiyoStudio_QR", extension: "png" }); }
    catch (e) { /* ignore */ }
    finally { qrCode.update({ width: qrSize, height: qrSize }); }
  });

  // Copy the QR straight to the clipboard as a PNG — paste into Figma/Slack/docs.
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      if (!navigator.clipboard || !window.ClipboardItem) {
        alert("Your browser can't copy images to the clipboard — use Download instead.");
        return;
      }
      const original = btnCopy.innerHTML;
      try {
        const blob = await qrCode.getRawData('png');
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        btnCopy.textContent = 'Copied ✓';
        setTimeout(() => { btnCopy.innerHTML = original; }, 1500);
      } catch (e) {
        alert('Could not copy to the clipboard — use Download instead.');
      }
    });
  }

  // Verify the rendered code actually decodes (catch low-contrast / oversized-logo
  // failures BEFORE printing). Decodes the canvas locally with jsQR — no upload.
  let _jsqrP = null;
  function ensureJsQR() {
    if (window.jsQR) return Promise.resolve();
    if (_jsqrP) return _jsqrP;
    _jsqrP = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
      s.onload = resolve;
      s.onerror = () => { _jsqrP = null; reject(new Error('jsQR load failed')); };
      document.head.appendChild(s);
    });
    return _jsqrP;
  }
  if (btnVerify && verifyResult) {
    btnVerify.addEventListener('click', async () => {
      verifyResult.textContent = 'Checking…';
      verifyResult.style.color = 'var(--text-faint)';
      try {
        await ensureJsQR();
        const blob = await qrCode.getRawData('png');
        const bmp = await createImageBitmap(blob);
        const cv = document.createElement('canvas');
        cv.width = bmp.width; cv.height = bmp.height;
        const cx = cv.getContext('2d');
        cx.fillStyle = '#ffffff'; cx.fillRect(0, 0, cv.width, cv.height); // composite transparent codes on white, like a real scan
        cx.drawImage(bmp, 0, 0);
        const data = cx.getImageData(0, 0, cv.width, cv.height);
        const found = window.jsQR(data.data, cv.width, cv.height);
        if (found && found.data) {
          verifyResult.textContent = '✓ Verified — this code scans correctly';
          verifyResult.style.color = '#10B981';
          verifyResult.title = found.data;
        } else {
          verifyResult.textContent = '⚠ Hard to read — try higher contrast, a smaller logo, or a shorter payload';
          verifyResult.style.color = '#F59E0B';
        }
      } catch (e) {
        verifyResult.textContent = 'Could not run the check (scanner failed to load).';
        verifyResult.style.color = 'var(--text-dim)';
      }
    });
  }
});
