// invoice.js - Core logic for the Riyo Studio Frictionless Invoice Generator

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const inputs = {
    compName: document.getElementById('in-comp-name'),
    compTax: document.getElementById('in-comp-tax'),
    compAddr: document.getElementById('in-comp-addr'),
    compEmail: document.getElementById('in-comp-email'),
    compPhone: document.getElementById('in-comp-phone'),
    compWeb: document.getElementById('in-comp-web'),
    compLogo: document.getElementById('in-comp-logo'),
    payDetails: document.getElementById('in-pay-details'),
    
    invNum: document.getElementById('in-inv-num'),
    invDate: document.getElementById('in-inv-date'),
    invTerms: document.getElementById('in-inv-terms'),
    invStatus: document.getElementById('in-inv-status'),
    invTaxRate: document.getElementById('in-inv-taxrate'),
    invCur: document.getElementById('in-inv-cur'),
    invColor: document.getElementById('in-inv-color'),
    invDark: document.getElementById('in-inv-dark'),
    invStyle: document.getElementById('in-inv-style'),
    
    clientName: document.getElementById('in-client-name'),
    clientAddr: document.getElementById('in-client-addr'),
    clientEmail: document.getElementById('in-client-email'),
    clientPhone: document.getElementById('in-client-phone'),
  };

  const outputs = {
    compName: document.getElementById('out-comp-name'),
    compTax: document.getElementById('out-comp-tax'),
    compAddr: document.getElementById('out-comp-addr'),
    wrapCompEmail: document.getElementById('wrap-comp-email'),
    compEmail: document.getElementById('out-comp-email'),
    wrapCompPhone: document.getElementById('wrap-comp-phone'),
    compPhone: document.getElementById('out-comp-phone'),
    wrapCompWeb: document.getElementById('wrap-comp-web'),
    compWeb: document.getElementById('out-comp-web'),
    logo: document.getElementById('out-logo'),
    payDetails: document.getElementById('out-pay-details'),
    
    invNum: document.getElementById('out-inv-num'),
    invDate: document.getElementById('out-inv-date'),
    invTitle: document.getElementById('out-inv-title'),
    invDue: document.getElementById('out-inv-due'),
    wrapInvDue: document.getElementById('wrap-inv-due'),
    stamp: document.getElementById('inv-stamp'),
    
    clientName: document.getElementById('out-client-name'),
    clientAddr: document.getElementById('out-client-addr'),
    wrapClientEmail: document.getElementById('wrap-client-email'),
    clientEmail: document.getElementById('out-client-email'),
    wrapClientPhone: document.getElementById('wrap-client-phone'),
    clientPhone: document.getElementById('out-client-phone'),
    
    tableBody: document.getElementById('out-table-body'),
    subtotal: document.getElementById('out-subtotal'),
    taxLabel: document.getElementById('out-tax-label'),
    tax: document.getElementById('out-tax'),
    total: document.getElementById('out-total')
  };

  const btnAddItem = document.getElementById('btn-add-item');
  const itemsContainer = document.getElementById('line-items-container');
  const btnExport = document.getElementById('btn-export-pdf');

  let lineItems = [];
  let logoDataUrl = null;

  // 2. LocalStorage Auto-Save System
  // INV-0007 → INV-0008 (preserves prefix + zero-padding width).
  function nextInvNum(prev) {
    if (!prev) return 'INV-0001';
    const m = String(prev).match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return prev;
    return m[1] + String(parseInt(m[2], 10) + 1).padStart(m[2].length, '0') + m[3];
  }

  function loadPrefs() {
    try {
      const prefs = JSON.parse(localStorage.getItem('riyo_inv_prefs'));
      if (prefs) {
        if (prefs.compName) inputs.compName.value = prefs.compName;
        if (prefs.compTax) inputs.compTax.value = prefs.compTax;
        if (prefs.compAddr) inputs.compAddr.value = prefs.compAddr;
        if (prefs.compEmail) inputs.compEmail.value = prefs.compEmail;
        if (prefs.compPhone) inputs.compPhone.value = prefs.compPhone;
        if (prefs.compWeb) inputs.compWeb.value = prefs.compWeb;
        if (prefs.invColor) inputs.invColor.value = prefs.invColor;
        if (prefs.invStyle) inputs.invStyle.value = prefs.invStyle;
        if (prefs.invTerms && inputs.invTerms) inputs.invTerms.value = prefs.invTerms;
        if (prefs.invStatus && inputs.invStatus) inputs.invStatus.value = prefs.invStatus;
        if (prefs.payDetails) inputs.payDetails.value = prefs.payDetails;
        if (prefs.logo) {
          logoDataUrl = prefs.logo;
          outputs.logo.src = logoDataUrl;
          outputs.logo.style.display = 'block';
        }
      }
    } catch (e) { console.error('Failed to load prefs', e); }

    // Set default date
    const today = new Date().toISOString().split('T')[0];
    inputs.invDate.value = today;

    // Auto-fill the next invoice number, continuing from the last one exported.
    if (!inputs.invNum.value) inputs.invNum.value = nextInvNum(localStorage.getItem('riyo_inv_lastnum'));
  }

  function savePrefs() {
    const prefs = {
      compName: inputs.compName.value,
      compTax: inputs.compTax.value,
      compAddr: inputs.compAddr.value,
      compEmail: inputs.compEmail.value,
      compPhone: inputs.compPhone.value,
      compWeb: inputs.compWeb.value,
      invColor: inputs.invColor.value,
      invStyle: inputs.invStyle.value,
      invTerms: inputs.invTerms ? inputs.invTerms.value : '14',
      invStatus: inputs.invStatus ? inputs.invStatus.value : 'auto',
      payDetails: inputs.payDetails.value,
      logo: logoDataUrl
    };
    try {
      localStorage.setItem('riyo_inv_prefs', JSON.stringify(prefs));
    } catch (e) {
      // savePrefs runs on every keystroke; a large logo dataURL can blow the ~5MB
      // quota and would otherwise throw on every edit. Retry without the logo.
      try { delete prefs.logo; localStorage.setItem('riyo_inv_prefs', JSON.stringify(prefs)); } catch (e2) { /* ignore */ }
    }
  }

  // 3. Logo Upload
  inputs.compLogo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      logoDataUrl = event.target.result;
      outputs.logo.src = logoDataUrl;
      outputs.logo.style.display = 'block';
      savePrefs();
    };
    reader.readAsDataURL(file);
  });

  // 4. Line Items Logic
  function createLineItemUI(id) {
    const row = document.createElement('div');
    row.className = 'line-item-row';
    row.innerHTML = `
      <input type="text" class="cyber-input desc" placeholder="Item description...">
      <input type="number" class="cyber-input qty" value="1" min="1">
      <input type="number" class="cyber-input price" value="0.00" min="0" step="0.01">
      <button class="btn-small btn-del">X</button>
    `;

    const descInput = row.querySelector('.desc');
    const qtyInput = row.querySelector('.qty');
    const priceInput = row.querySelector('.price');
    const delBtn = row.querySelector('.btn-del');

    descInput.addEventListener('input', () => { updateItem(id, 'desc', descInput.value); updatePreview(); });
    qtyInput.addEventListener('input', () => { updateItem(id, 'qty', qtyInput.value); updatePreview(); });
    priceInput.addEventListener('input', () => { updateItem(id, 'price', priceInput.value); updatePreview(); });
    delBtn.addEventListener('click', () => { removeItem(id); row.remove(); updatePreview(); });

    itemsContainer.appendChild(row);
  }

  function addLineItem() {
    const id = Date.now().toString();
    lineItems.push({ id, desc: '', qty: 1, price: 0 });
    createLineItemUI(id);
    updatePreview();
  }

  function updateItem(id, field, val) {
    const item = lineItems.find(i => i.id === id);
    if (item) {
      if (field === 'desc') item.desc = val;
      else if (field === 'qty') item.qty = Math.max(0, parseFloat(val) || 0);
      else if (field === 'price') item.price = Math.max(0, parseFloat(val) || 0);
    }
  }

  function removeItem(id) {
    lineItems = lineItems.filter(i => i.id !== id);
  }

  btnAddItem.addEventListener('click', addLineItem);

  function parseMD(text) {
    if (!text) return '';
    return text
      .replace(/</g, '&lt;').replace(/>/g, '&gt;') // escape html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/\[\[(.*?)\]\]/g, '<span class="box">$1</span>')
      .replace(/\n/g, '<br>');
  }

  // 5. Core Math & Preview Update
  function updatePreview() {
    const curRaw = inputs.invCur.value || '$';
    const curHtml = curRaw.replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c])); // table rows use innerHTML
    // Thousands separators + 2 decimals → "$1,250.00" instead of "$1250.00".
    const grp = (n) => new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    const moneyHtml = (n) => curHtml + grp(n);   // for innerHTML sinks
    const moneyText = (n) => curRaw + grp(n);     // for textContent sinks
    const paper = document.getElementById('a4-paper');
    paper.style.setProperty('--inv-primary', inputs.invColor.value);
    
    const hex = inputs.invColor.value.replace('#', '');
    const r = parseInt(hex.substring(0,2), 16) || 17;
    const g = parseInt(hex.substring(2,4), 16) || 17;
    const b = parseInt(hex.substring(4,6), 16) || 17;
    paper.style.setProperty('--inv-primary-light', `rgba(${r}, ${g}, ${b}, 0.05)`);

    // Dark mode toggle
    if (inputs.invDark.checked) {
      paper.classList.add('dark-invoice');
    } else {
      paper.classList.remove('dark-invoice');
    }

    // Invoice style skin
    paper.classList.remove('style-modern', 'style-classic', 'style-minimal', 'style-bold');
    paper.classList.add('style-' + (inputs.invStyle.value || 'modern'));
    
    // Header & Meta
    outputs.compName.textContent = inputs.compName.value || 'Your Company LLC';
    outputs.compTax.textContent = inputs.compTax.value || 'Tax ID / ABN';
    outputs.compAddr.textContent = inputs.compAddr.value || 'Company Address';
    outputs.clientName.textContent = inputs.clientName.value || 'Client Name';
    outputs.clientAddr.textContent = inputs.clientAddr.value || 'Client Address';
    outputs.invNum.textContent = inputs.invNum.value || 'INV-0001';
    
    outputs.compEmail.textContent = inputs.compEmail.value;
    outputs.wrapCompEmail.style.display = inputs.compEmail.value ? 'inline-flex' : 'none';
    outputs.compPhone.textContent = inputs.compPhone.value;
    outputs.wrapCompPhone.style.display = inputs.compPhone.value ? 'inline-flex' : 'none';
    outputs.compWeb.textContent = inputs.compWeb.value;
    outputs.wrapCompWeb.style.display = inputs.compWeb.value ? 'inline-flex' : 'none';

    outputs.clientEmail.textContent = inputs.clientEmail.value;
    outputs.wrapClientEmail.style.display = inputs.clientEmail.value ? 'inline-flex' : 'none';
    outputs.clientPhone.textContent = inputs.clientPhone.value;
    outputs.wrapClientPhone.style.display = inputs.clientPhone.value ? 'inline-flex' : 'none';
    
    // Date formatting
    const fmtDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    let issueDate = null, dueDate = null;
    if (inputs.invDate.value) {
      // Parse as LOCAL date — `new Date('YYYY-MM-DD')` is UTC midnight and prints
      // a day early for users west of UTC.
      const p = inputs.invDate.value.split('-');
      issueDate = new Date(+p[0], (+p[1] || 1) - 1, +p[2] || 1);
      outputs.invDate.textContent = fmtDate(issueDate);
    }

    // Due date from payment terms (Net N days; 0 = due on receipt).
    const termDays = inputs.invTerms ? parseInt(inputs.invTerms.value, 10) : NaN;
    if (outputs.wrapInvDue && outputs.invDue) {
      if (issueDate && !isNaN(termDays)) {
        if (termDays === 0) {
          outputs.invDue.textContent = 'Due on receipt';
        } else {
          dueDate = new Date(issueDate.getTime());
          dueDate.setDate(dueDate.getDate() + termDays);
          outputs.invDue.textContent = fmtDate(dueDate);
        }
        outputs.wrapInvDue.style.display = '';
      } else {
        outputs.wrapInvDue.style.display = 'none';
      }
    }
    
    outputs.payDetails.innerHTML = parseMD(inputs.payDetails.value || 'Payment Instructions here...');

    // Math
    let subtotal = 0;
    outputs.tableBody.innerHTML = '';
    
    lineItems.forEach(item => {
      // Round each line to cents so the printed rows sum exactly to the subtotal.
      const amount = Math.round(item.qty * item.price * 100) / 100;
      subtotal += amount;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rich-text">${parseMD(item.desc) || 'Item'}</td>
        <td class="right">${item.qty}</td>
        <td class="right">${moneyHtml(item.price)}</td>
        <td class="right">${moneyHtml(amount)}</td>
      `;
      outputs.tableBody.appendChild(tr);
    });

    subtotal = Math.round(subtotal * 100) / 100;
    const taxRate = Math.min(100, Math.max(0, parseFloat(inputs.invTaxRate.value) || 0));
    const taxAmount = Math.round(subtotal * taxRate) / 100; // = round(subtotal * rate/100, 2c)
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    outputs.subtotal.textContent = moneyText(subtotal);
    outputs.taxLabel.textContent = `${taxRate > 0 ? 'GST' : 'Tax'} (${taxRate}%)`;
    outputs.tax.textContent = moneyText(taxAmount);
    outputs.total.textContent = moneyText(total);

    // AU compliance: a GST invoice must be titled "TAX INVOICE".
    if (outputs.invTitle) outputs.invTitle.textContent = taxRate > 0 ? 'TAX INVOICE' : 'INVOICE';

    // PAID / OVERDUE stamp. "auto" → overdue once the due date has passed.
    if (outputs.stamp) {
      let st = inputs.invStatus ? inputs.invStatus.value : 'auto';
      if (st === 'auto') {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        st = (dueDate && dueDate < today) ? 'overdue' : 'none';
      }
      outputs.stamp.className = 'inv-stamp' + (st === 'paid' ? ' paid' : st === 'overdue' ? ' overdue' : '');
      outputs.stamp.textContent = st === 'paid' ? 'PAID' : st === 'overdue' ? 'OVERDUE' : '';
    }

    savePrefs();
    // Re-scale after content changes
    requestAnimationFrame(() => { if (typeof resizePreview === 'function') resizePreview(); });
  }

  // 6. Bind Listeners to standard inputs
  const standardInputs = [
    inputs.compName, inputs.compTax, inputs.compAddr, inputs.compEmail, inputs.compPhone, inputs.compWeb,
    inputs.payDetails, inputs.invNum, inputs.invDate, inputs.invTaxRate, inputs.invCur, inputs.invColor,
    inputs.clientName, inputs.clientAddr, inputs.clientEmail, inputs.clientPhone
  ];

  standardInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // Dark mode toggle uses 'change' event
  inputs.invDark.addEventListener('change', updatePreview);
  inputs.invStyle.addEventListener('change', updatePreview);
  if (inputs.invTerms) inputs.invTerms.addEventListener('change', updatePreview);
  if (inputs.invStatus) inputs.invStatus.addEventListener('change', updatePreview);

  // Dynamic scaling: fit the 210mm A4 paper into the available column width
  function resizePreview() {
    const wrapper = document.querySelector('.canvas-wrapper');
    const paper = document.getElementById('a4-paper');
    if (!wrapper || !paper) return;

    const availableWidth = wrapper.clientWidth - 64; // 2rem padding each side
    const paperNaturalWidth = 794; // 210mm ≈ 794px at 96dpi
    const scale = Math.min(availableWidth / paperNaturalWidth, 1);

    paper.style.transform = `scale(${scale})`;
    // Collapse the dead vertical space left below the scaled paper
    const naturalHeight = paper.scrollHeight;
    paper.style.marginBottom = `-${naturalHeight * (1 - scale)}px`;
  }

  window.addEventListener('resize', resizePreview);
  const ro = new ResizeObserver(resizePreview);
  const cw = document.querySelector('.canvas-wrapper');
  if (cw) ro.observe(cw);
  
  // Initial scale after DOM settles
  setTimeout(resizePreview, 50);  // 7. PDF Export
  btnExport.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-pdf');
    const paper = document.getElementById('a4-paper');
    const wrapper = document.querySelector('.canvas-wrapper');

    btn.disabled = true;
    btn.textContent = 'Generating PDF…';

    // Save live state
    const savedPaper = {
      transform: paper.style.transform,
      marginBottom: paper.style.marginBottom,
      transition: paper.style.transition
    };
    
    const savedWrapper = {
      position: wrapper.style.position,
      top: wrapper.style.top,
      left: wrapper.style.left,
      zIndex: wrapper.style.zIndex,
      display: wrapper.style.display,
      overflow: wrapper.style.overflow,
      padding: wrapper.style.padding,
      maxHeight: wrapper.style.maxHeight
    };

    const originalScroll = window.scrollY;

    // PREPARE LIVE DOM FOR PERFECT CAPTURE
    window.scrollTo(0, 0);

    // Physically remove the scale transform so html2canvas doesn't get confused on mobile
    paper.style.transform = 'none';
    paper.style.marginBottom = '0px';
    paper.style.transition = 'none';

    // Flatten the preview frame so its sticky positioning / overflow:hidden
    // can't clip the full-height paper during capture (otherwise only the
    // visible portion is rendered — the "half page" bug)
    wrapper.style.position = 'static';
    wrapper.style.overflow = 'visible';
    wrapper.style.maxHeight = 'none';
    wrapper.style.height = 'auto';

    // INJECT OVERRIDE STYLES (html2canvas clones style tags reliably, but fails on inline !important)
    const printStyle = document.createElement('style');
    printStyle.id = 'pdf-export-overrides';
    printStyle.innerHTML = `
      #a4-paper {
        transition: none !important;
        transform: none !important;
        margin: 0 !important;
        left: 0 !important;
        top: 0 !important;
        width: 794px !important;
        min-height: 1122px !important; /* Prevents 2-page bug for short invoices */
        height: auto !important; /* Allows multiple pages if content grows */
        max-height: none !important;
        overflow: visible !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        zoom: 1 !important;
      }
    `;
    document.head.appendChild(printStyle);

    // Give browser a moment to paint the absolute layout
    await new Promise(r => setTimeout(r, 150));

    // Remember this number so the next invoice auto-increments from it.
    try { if (inputs.invNum.value) localStorage.setItem('riyo_inv_lastnum', inputs.invNum.value); } catch (e) { /* ignore */ }

    const filename = `${inputs.invNum.value || 'Invoice'}_${inputs.clientName.value || 'Client'}.pdf`;
    const opt = {
      margin:      0,
      filename:    filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase(),
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: paper.classList.contains('dark-invoice') ? '#0f1219' : '#ffffff',
        scrollY: 0 // explicit fail-safe against the scroll offset bug
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const worker = html2pdf().set(opt).from(paper);
      const pdfBlob = await worker.output('blob');
      
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = opt.filename;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      // RESTORE EVERYTHING
      const injectedStyle = document.getElementById('pdf-export-overrides');
      if (injectedStyle) {
        injectedStyle.remove();
      }

      // Restore inline styles
      paper.style.transform = savedPaper.transform;
      paper.style.marginBottom = savedPaper.marginBottom;
      paper.style.transition = savedPaper.transition;

      // Restore the preview frame
      wrapper.style.position = savedWrapper.position;
      wrapper.style.overflow = savedWrapper.overflow;
      wrapper.style.maxHeight = savedWrapper.maxHeight;
      wrapper.style.height = '';

      window.scrollTo(0, originalScroll);

      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD PDF`;
    }
  });

  // Init
  loadPrefs();
  addLineItem(); // Start with one empty row
  updatePreview();
});
