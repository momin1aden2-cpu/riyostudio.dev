// invoice.js - Core logic for the Riyo Studio Frictionless Invoice Generator

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements
  const inputs = {
    compName: document.getElementById('in-comp-name'),
    compTax: document.getElementById('in-comp-tax'),
    compAddr: document.getElementById('in-comp-addr'),
    compLogo: document.getElementById('in-comp-logo'),
    payDetails: document.getElementById('in-pay-details'),
    
    invNum: document.getElementById('in-inv-num'),
    invDate: document.getElementById('in-inv-date'),
    invTaxRate: document.getElementById('in-inv-taxrate'),
    invCur: document.getElementById('in-inv-cur'),
    
    clientName: document.getElementById('in-client-name'),
    clientAddr: document.getElementById('in-client-addr'),
  };

  const outputs = {
    compName: document.getElementById('out-comp-name'),
    compTax: document.getElementById('out-comp-tax'),
    compAddr: document.getElementById('out-comp-addr'),
    logo: document.getElementById('out-logo'),
    payDetails: document.getElementById('out-pay-details'),
    
    invNum: document.getElementById('out-inv-num'),
    invDate: document.getElementById('out-inv-date'),
    
    clientName: document.getElementById('out-client-name'),
    clientAddr: document.getElementById('out-client-addr'),
    
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

  // 5. Core Math & Preview Update
  function updatePreview() {
    const cur = inputs.invCur.value || '$';
    
    // Header & Meta
    outputs.compName.textContent = inputs.compName.value || 'Your Company LLC';
    outputs.compTax.textContent = inputs.compTax.value || 'Tax ID / ABN';
    outputs.compAddr.textContent = inputs.compAddr.value || 'Company Address';
    outputs.clientName.textContent = inputs.clientName.value || 'Client Name';
    outputs.clientAddr.textContent = inputs.clientAddr.value || 'Client Address';
    outputs.invNum.textContent = inputs.invNum.value || 'INV-0001';
    
    // Date formatting
    if (inputs.invDate.value) {
      const d = new Date(inputs.invDate.value);
      outputs.invDate.textContent = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
    
    outputs.payDetails.textContent = inputs.payDetails.value || 'Payment Instructions here...';

    // Math
    let subtotal = 0;
    outputs.tableBody.innerHTML = '';
    
    lineItems.forEach(item => {
      const amount = item.qty * item.price;
      subtotal += amount;
      
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.desc || 'Item'}</td>
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
  }

  // 6. Bind Listeners to standard inputs
  const standardInputs = [
    inputs.compName, inputs.compTax, inputs.compAddr, inputs.payDetails,
    inputs.invNum, inputs.invDate, inputs.invTaxRate, inputs.invCur,
    inputs.clientName, inputs.clientAddr
  ];

  standardInputs.forEach(input => {
    input.addEventListener('input', updatePreview);
  });

  // 7. PDF Export
  btnExport.addEventListener('click', () => {
    const element = document.getElementById('a4-paper');
    
    // Temporarily reset CSS scale transform to ensure native resolution capture
    const oldTransform = element.style.transform;
    element.style.transform = 'none';
    
    const filename = `${inputs.invNum.value || 'Invoice'}_${inputs.clientName.value || 'Client'}.pdf`;

    const opt = {
      margin:       0,
      filename:     filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() + '.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      // Restore CSS transform
      element.style.transform = oldTransform;
    });
  });

  // Init
  loadPrefs();
  addLineItem(); // Start with one empty row
  updatePreview();
});
