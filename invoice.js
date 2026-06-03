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
    invTaxRate: document.getElementById('in-inv-taxrate'),
    invCur: document.getElementById('in-inv-cur'),
    invColor: document.getElementById('in-inv-color'),
    invDark: document.getElementById('in-inv-dark'),
    
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
      payDetails: inputs.payDetails.value,
      logo: logoDataUrl
    };
    localStorage.setItem('riyo_inv_prefs', JSON.stringify(prefs));
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
      <input type="number" class="cyber-input price" value="0.00" step="0.01">
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
      else if (field === 'qty') item.qty = parseFloat(val) || 0;
      else if (field === 'price') item.price = parseFloat(val) || 0;
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
    const cur = inputs.invCur.value || '$';
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
    if (inputs.invDate.value) {
      const d = new Date(inputs.invDate.value);
      outputs.invDate.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    outputs.payDetails.innerHTML = parseMD(inputs.payDetails.value || 'Payment Instructions here...');

    // Math
    let subtotal = 0;
    outputs.tableBody.innerHTML = '';
    
    lineItems.forEach(item => {
      const amount = item.qty * item.price;
      subtotal += amount;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="rich-text">${parseMD(item.desc) || 'Item'}</td>
        <td class="right">${item.qty}</td>
        <td class="right">${cur}${item.price.toFixed(2)}</td>
        <td class="right">${cur}${amount.toFixed(2)}</td>
      `;
      outputs.tableBody.appendChild(tr);
    });

    const taxRate = parseFloat(inputs.invTaxRate.value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    outputs.subtotal.textContent = `${cur}${subtotal.toFixed(2)}`;
    outputs.taxLabel.textContent = `Tax (${taxRate}%)`;
    outputs.tax.textContent = `${cur}${taxAmount.toFixed(2)}`;
    outputs.total.textContent = `${cur}${total.toFixed(2)}`;

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
  setTimeout(resizePreview, 50);

  // 7. PDF Export
  btnExport.addEventListener('click', async () => {
    const btn = document.getElementById('btn-export-pdf');
    const paper = document.getElementById('a4-paper');

    btn.disabled = true;
    btn.textContent = 'Generating PDF…';

    const filename = `${inputs.invNum.value || 'Invoice'}_${inputs.clientName.value || 'Client'}.pdf`;

    const opt = {
      margin:      0,
      filename:    filename.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase(),
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2, // 2 is enough for A4 print, 3 can sometimes cause memory issues on large canvases
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: paper.classList.contains('dark-invoice') ? '#0f1219' : '#ffffff',
        // onclone lets us modify the cloned DOM before capture without affecting the live page
        onclone: (clonedDoc) => {
          const clonedPaper = clonedDoc.getElementById('a4-paper');
          if (clonedPaper) {
            // Remove the scale transform
            clonedPaper.style.transform = 'none';
            clonedPaper.style.marginBottom = '0';
            clonedPaper.style.boxShadow = 'none';
            clonedPaper.style.width = '210mm';
            clonedPaper.style.minHeight = '297mm';
            
            // Fix any parent containers that might clip the full size paper
            let parent = clonedPaper.parentElement;
            while (parent && parent !== clonedDoc.body) {
              parent.style.overflow = 'visible';
              parent.style.maxHeight = 'none';
              parent.style.transform = 'none';
              parent = parent.parentElement;
            }
          }
        }
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      await html2pdf().set(opt).from(paper).save();
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF generation failed. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> DOWNLOAD PDF`;
    }
  });

  // Init
  loadPrefs();
  addLineItem(); // Start with one empty row
  updatePreview();
});
