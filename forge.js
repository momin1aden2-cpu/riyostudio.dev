// forge.js

document.addEventListener('DOMContentLoaded', () => {
  initUniversalConverter();
  initDataConverter();
  initJwtDecoder();
  initHeicDecoder();
  initTargetCompressor();
  initPdfSigner();
  initExpenseFlattener();
  initScreenRecorder();
  initTextExtractor();
  initGhostMaker();
});

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// ---------------------------------------------------------
// 1. UNIVERSAL MEDIA CONVERTER
// ---------------------------------------------------------
function initUniversalConverter() {
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');
  const controls = document.getElementById('forge-controls');
  const formatOptions = document.getElementById('format-options');
  const forgeBtn = document.getElementById('forge-btn');
  const terminal = document.getElementById('forge-terminal');

  let currentFile = null;
  let targetFormat = null;
  let isMedia = false;
  let ffmpegInstance = null;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#F59E0B'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(245,158,11,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(245,158,11,0.3)';
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    currentFile = file;
    dropzone.querySelector('p').innerHTML = `Loaded: <span style="color: #F59E0B;">${file.name}</span> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    
    formatOptions.innerHTML = '';
    forgeBtn.textContent = '[ SELECT A FORMAT ]';
    forgeBtn.disabled = true;
    targetFormat = null;
    terminal.style.display = 'none';

    if (file.type.startsWith('image/')) {
      isMedia = false; 
      setupOptions(['webp', 'png', 'jpeg', 'ico', 'bmp']);
    } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      isMedia = true;
      setupOptions(['mp4', 'webm', 'gif', 'mp3', 'wav']);
      loadFFmpeg();
    } else {
      showToast("Hold up mate, that's an unsupported file type.", "error");
      controls.style.display = 'none';
      return;
    }
    controls.style.display = 'block';
  }

  function setupOptions(formats) {
    formats.forEach(fmt => {
      const btn = document.createElement('button');
      btn.textContent = fmt.toUpperCase();
      btn.className = 'nav-link';
      btn.style.border = '1px solid rgba(255,255,255,0.2)';
      btn.style.borderRadius = '4px';
      btn.style.padding = '4px 12px';
      btn.style.background = 'transparent';
      btn.style.color = 'var(--text-main)';
      btn.style.cursor = 'pointer';
      
      btn.onclick = () => {
        Array.from(formatOptions.children).forEach(c => {
          c.style.borderColor = 'rgba(255,255,255,0.2)';
          c.style.color = 'var(--text-main)';
        });
        btn.style.borderColor = '#F59E0B';
        btn.style.color = '#F59E0B';
        
        targetFormat = fmt;
        forgeBtn.textContent = `[ CONVERT TO ${fmt.toUpperCase()} ]`;
        forgeBtn.disabled = false;
      };
      formatOptions.appendChild(btn);
    });
  }

  function logTerminal(msg) {
    const div = document.createElement('div');
    div.textContent = `> ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }

  async function convertImage() {
    terminal.style.display = 'block';
    terminal.innerHTML = '';
    logTerminal(`Initializing Canvas Engine...`);
    
    try {
      const bmp = await createImageBitmap(currentFile);
      const canvas = document.createElement('canvas');
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(bmp, 0, 0);

      logTerminal(`Drawing ${bmp.width}x${bmp.height} image...`);
      
      if (['webp', 'png', 'jpeg'].includes(targetFormat)) {
        const mimeType = targetFormat === 'jpg' || targetFormat === 'jpeg' ? 'image/jpeg' : `image/${targetFormat}`;
        const quality = mimeType === 'image/jpeg' || mimeType === 'image/webp' ? 0.92 : undefined;

        logTerminal(`Encoding as ${mimeType}...`);
        
        await new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (!blob) { reject(new Error("Canvas encoding failed")); return; }
            triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.${targetFormat}`);
            logTerminal(`[200 OK] Forging Complete!`);
            resolve();
          }, mimeType, quality);
        });
      } else if (targetFormat === 'ico') {
        const blob = await encodeICO(canvas);
        triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.ico`);
        logTerminal(`[200 OK] ICO Forging Complete!`);
      } else if (targetFormat === 'bmp') {
        const blob = encodeBMP(canvas);
        triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.bmp`);
        logTerminal(`[200 OK] BMP Forging Complete!`);
      }
      forgeBtn.textContent = `[ FORGE ANOTHER ]`;
      forgeBtn.disabled = false;
    } catch (err) {
      logTerminal(`[ERROR] ${err.message}`);
      forgeBtn.disabled = false;
    }
  }

  async function encodeICO(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const pngBytes = new Uint8Array(await blob.arrayBuffer());
        const buffer = new ArrayBuffer(22 + pngBytes.length);
        const view = new DataView(buffer);
        view.setUint16(0, 0, true); view.setUint16(2, 1, true); view.setUint16(4, 1, true); 
        let w = canvas.width, h = canvas.height;
        if (w > 256) w = 0; if (h > 256) h = 0;
        view.setUint8(6, w); view.setUint8(7, h); 
        view.setUint8(8, 0); view.setUint8(9, 0); 
        view.setUint16(10, 1, true); view.setUint16(12, 32, true); 
        view.setUint32(14, pngBytes.length, true); view.setUint32(18, 22, true); 
        new Uint8Array(buffer).set(pngBytes, 22); 
        resolve(new Blob([buffer], { type: 'image/x-icon' }));
      }, 'image/png');
    });
  }

  function encodeBMP(canvas) {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width, height = canvas.height;
    const rowSize = Math.floor((width * 32 + 31) / 32) * 4;
    const pixelArraySize = rowSize * height;
    const fileSize = 54 + pixelArraySize;
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    
    view.setUint8(0, 0x42); view.setUint8(1, 0x4D); view.setUint32(2, fileSize, true); 
    view.setUint32(6, 0, true); view.setUint32(10, 54, true); 
    view.setUint32(14, 40, true); view.setInt32(18, width, true); view.setInt32(22, height, true); 
    view.setUint16(26, 1, true); view.setUint16(28, 32, true); 
    view.setUint32(30, 0, true); view.setUint32(34, pixelArraySize, true); 
    view.setInt32(38, 2835, true); view.setInt32(42, 2835, true); 
    view.setUint32(46, 0, true); view.setUint32(50, 0, true); 
    
    const outArray = new Uint8Array(buffer);
    let offset = 54;
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        outArray[offset++] = data[i + 2]; outArray[offset++] = data[i + 1]; 
        outArray[offset++] = data[i + 0]; outArray[offset++] = data[i + 3]; 
      }
    }
    return new Blob([buffer], { type: 'image/bmp' });
  }

  async function loadFFmpeg() {
    if (ffmpegInstance || document.getElementById('ffmpeg-script')) return;
    const script = document.createElement('script');
    script.id = 'ffmpeg-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    document.head.appendChild(script);
  }

  async function convertMedia() {
    terminal.style.display = 'block';
    terminal.innerHTML = '';
    logTerminal(`Waking up FFmpeg...`);
    
    if (!window.FFmpeg) {
      setTimeout(convertMedia, 2000);
      return;
    }

    try {
      if (!ffmpegInstance) {
        logTerminal(`Allocating buffer...`);
        const { createFFmpeg } = FFmpeg;
        ffmpegInstance = createFFmpeg({ 
          log: false, 
          logger: ({ message }) => logTerminal(message),
          corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
        });
        await ffmpegInstance.load();
      }

      const { fetchFile } = FFmpeg;
      const inputName = `input_${Date.now()}.${currentFile.name.split('.').pop()}`;
      const outputName = `output_${Date.now()}.${targetFormat}`;

      ffmpegInstance.FS('writeFile', inputName, await fetchFile(currentFile));
      const exitCode = await ffmpegInstance.run('-i', inputName, outputName);
      if (exitCode !== 0) throw new Error(`FFmpeg failed`);

      const data = ffmpegInstance.FS('readFile', outputName);
      let mimeType = 'video/mp4';
      if (['mp3', 'wav'].includes(targetFormat)) mimeType = `audio/${targetFormat}`;
      if (targetFormat === 'gif') mimeType = 'image/gif';
      if (targetFormat === 'webm') mimeType = 'video/webm';

      const blob = new Blob([data.buffer], { type: mimeType });
      triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.${targetFormat}`);
      
      logTerminal(`[200 OK] Media Forging Complete!`);
      ffmpegInstance.FS('unlink', inputName);
      ffmpegInstance.FS('unlink', outputName);

      forgeBtn.textContent = `[ FORGE ANOTHER ]`;
      forgeBtn.disabled = false;
    } catch (err) {
      logTerminal(`[ERROR] ${err.message}`);
      forgeBtn.disabled = false;
    }
  }

  forgeBtn.addEventListener('click', () => {
    if (!currentFile || !targetFormat) return;
    forgeBtn.disabled = true;
    forgeBtn.textContent = '[ FORGING... ]';
    if (isMedia) convertMedia(); else convertImage();
  });
}

// ---------------------------------------------------------
// 2. HEIC DECODER
// ---------------------------------------------------------
function initHeicDecoder() {
  const dropzone = document.getElementById('heic-dropzone');
  const fileInput = document.getElementById('heic-input');
  const controls = document.getElementById('heic-controls');
  const formatSelect = document.getElementById('heic-format');
  const btn = document.getElementById('heic-btn');
  const status = document.getElementById('heic-status');
  let currentFile = null;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#4ADE80'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(74,222,128,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(74,222,128,0.3)';
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (!file.name.toLowerCase().endsWith('.heic')) {
      showToast("Righto, you need to upload a .heic file for this one mate.", "error");
      return;
    }
    currentFile = file;
    dropzone.querySelector('p').innerHTML = `Loaded: <span style="color: #4ADE80;">${file.name}</span>`;
    controls.style.display = 'block';
    status.textContent = '';
  }

  btn.addEventListener('click', async () => {
    if (!currentFile || !window.heic2any) return;
    btn.disabled = true;
    btn.textContent = '[ DECODING... ]';
    status.textContent = 'Processing HEIC via WASM...';
    
    try {
      const format = formatSelect.value;
      const ext = format === 'image/jpeg' ? 'jpg' : 'png';
      
      const blob = await heic2any({
        blob: currentFile,
        toType: format,
        quality: 0.92
      });
      
      // If multiple images are returned (e.g. animation sequence), take the first
      const outBlob = Array.isArray(blob) ? blob[0] : blob;
      triggerDownload(outBlob, `decoded_${currentFile.name.split('.')[0]}.${ext}`);
      
      status.textContent = 'Done! File downloaded.';
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.style.color = '#EF4444';
    } finally {
      btn.disabled = false;
      btn.textContent = '[ CONVERT ]';
    }
  });
}

// ---------------------------------------------------------
// 3. TARGET COMPRESSOR
// ---------------------------------------------------------
function initTargetCompressor() {
  const dropzone = document.getElementById('compress-dropzone');
  const fileInput = document.getElementById('compress-input');
  const controls = document.getElementById('compress-controls');
  const targetInput = document.getElementById('compress-target');
  const btn = document.getElementById('compress-btn');
  const status = document.getElementById('compress-status');
  const fileInfo = document.getElementById('compress-file-info');
  let currentFile = null;

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#5B8DEF'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(91,141,239,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(91,141,239,0.3)';
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast("Mate, please upload an image file first.", "error");
      return;
    }
    currentFile = file;
    const mbSize = (file.size / 1024 / 1024).toFixed(2);
    dropzone.querySelector('p').innerHTML = `Loaded: <span style="color: #5B8DEF;">${file.name}</span>`;
    fileInfo.textContent = `Current Size: ${mbSize} MB`;
    targetInput.value = (Math.max(0.1, mbSize * 0.5)).toFixed(2); // Default to half size
    controls.style.display = 'block';
    status.textContent = '';
  }

  btn.addEventListener('click', async () => {
    if (!currentFile || !window.imageCompression) return;
    const targetMB = parseFloat(targetInput.value);
    if (isNaN(targetMB) || targetMB <= 0) return;

    const currentMB = currentFile.size / 1024 / 1024;
    if (targetMB >= currentMB) {
      status.textContent = `Error: The image is already smaller than ${targetMB} MB!`;
      status.style.color = '#F59E0B';
      return;
    }

    btn.disabled = true;
    btn.textContent = '[ COMPRESSING... ]';
    status.textContent = 'Compressing via Web Worker...';
    status.style.color = '#5B8DEF';
    
    try {
      const options = {
        maxSizeMB: targetMB,
        useWebWorker: true,
        alwaysKeepResolution: true
      };
      
      const compressedFile = await imageCompression(currentFile, options);
      const newMbSize = (compressedFile.size / 1024 / 1024).toFixed(2);
      
      triggerDownload(compressedFile, `compressed_${currentFile.name}`);
      status.textContent = `Done! Compressed down to: ${newMbSize} MB`;
    } catch (err) {
      status.textContent = `Error: ${err.message}`;
      status.style.color = '#EF4444';
    } finally {
      btn.disabled = false;
      btn.textContent = '[ COMPRESS ]';
    }
  });
}

// ---------------------------------------------------------
// 4. PDF SIGNER
// ---------------------------------------------------------
function initPdfSigner() {
  const dropzone = document.getElementById('pdf-dropzone');
  const fileInput = document.getElementById('pdf-input');
  const workspace = document.getElementById('pdf-workspace');
  const renderCanvas = document.getElementById('pdf-render-canvas');
  const overlay = document.getElementById('pdf-signature-overlay');
  
  const prevBtn = document.getElementById('pdf-prev');
  const nextBtn = document.getElementById('pdf-next');
  const closeBtn = document.getElementById('pdf-close');
  const drawBtn = document.getElementById('pdf-draw-btn');
  const saveBtn = document.getElementById('pdf-save-btn');
  const pageNumSpan = document.getElementById('pdf-page-num');
  const pageCountSpan = document.getElementById('pdf-page-count');
  
  const sigModal = document.getElementById('signature-modal');
  const sigPad = document.getElementById('signature-pad');
  const sigClearBtn = document.getElementById('sig-clear-btn');
  const sigCancelBtn = document.getElementById('sig-cancel-btn');
  const sigApplyBtn = document.getElementById('sig-apply-btn');

  let currentFileBytes = null;
  let pdfDoc = null; // pdf.js document
  let pageNum = 1;
  let pdfRenderScale = 1.5;
  let pdfPageViewport = null;
  
  let signatureBlob = null;
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  let sigPadCtx = sigPad.getContext('2d');
  let isDrawing = false;

  // Setup pdf.js worker
  if (window['pdfjs-dist/build/pdf']) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#10B981'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(16,185,129,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(16,185,129,0.3)';
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  async function handleFile(file) {
    if (file.type !== 'application/pdf') {
      showToast("You need to upload a PDF file for this, mate.", "error");
      return;
    }
    dropzone.style.display = 'none';
    workspace.style.display = 'block';
    
    currentFileBytes = await file.arrayBuffer();
    
    // Load with pdf.js using a copy of the buffer to prevent detachment
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfDoc = await pdfjsLib.getDocument(currentFileBytes.slice(0)).promise;
    pageCountSpan.textContent = pdfDoc.numPages;
    pageNum = 1;
    renderPage(pageNum);
  }

  async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    // Use container width to calculate scale
    const containerWidth = document.getElementById('pdf-render-container').clientWidth;
    const unscaledViewport = page.getViewport({ scale: 1.0 });
    pdfRenderScale = containerWidth / unscaledViewport.width;
    pdfPageViewport = page.getViewport({ scale: pdfRenderScale });
    
    renderCanvas.width = pdfPageViewport.width;
    renderCanvas.height = pdfPageViewport.height;
    
    const ctx = renderCanvas.getContext('2d');
    const renderContext = { canvasContext: ctx, viewport: pdfPageViewport };
    await page.render(renderContext).promise;
    pageNumSpan.textContent = num;
  }

  prevBtn.addEventListener('click', () => { if (pageNum <= 1) return; pageNum--; renderPage(pageNum); });
  nextBtn.addEventListener('click', () => { if (pageNum >= pdfDoc.numPages) return; pageNum++; renderPage(pageNum); });
  
  closeBtn.addEventListener('click', () => {
    workspace.style.display = 'none';
    dropzone.style.display = 'block';
    overlay.style.display = 'none';
    saveBtn.style.display = 'none';
    drawBtn.textContent = '[ DRAW SIGNATURE ]';
    currentFileBytes = null;
    pdfDoc = null;
  });

  // Signature Pad Logic
  drawBtn.addEventListener('click', () => {
    sigModal.style.display = 'flex';
    sigPadCtx.clearRect(0, 0, sigPad.width, sigPad.height);
  });
  sigCancelBtn.addEventListener('click', () => sigModal.style.display = 'none');
  sigClearBtn.addEventListener('click', () => sigPadCtx.clearRect(0, 0, sigPad.width, sigPad.height));

  const getPos = (e) => {
    const rect = sigPad.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDraw = (e) => { isDrawing = true; const pos = getPos(e); sigPadCtx.beginPath(); sigPadCtx.moveTo(pos.x, pos.y); };
  const draw = (e) => { if(!isDrawing) return; e.preventDefault(); const pos = getPos(e); sigPadCtx.lineTo(pos.x, pos.y); sigPadCtx.strokeStyle = '#000'; sigPadCtx.lineWidth = 4; sigPadCtx.lineCap = 'round'; sigPadCtx.stroke(); };
  const stopDraw = () => { isDrawing = false; sigPadCtx.closePath(); };

  sigPad.addEventListener('mousedown', startDraw);
  sigPad.addEventListener('mousemove', draw);
  sigPad.addEventListener('mouseup', stopDraw);
  sigPad.addEventListener('mouseout', stopDraw);
  sigPad.addEventListener('touchstart', startDraw, { passive: false });
  sigPad.addEventListener('touchmove', draw, { passive: false });
  sigPad.addEventListener('touchend', stopDraw);

  sigApplyBtn.addEventListener('click', () => {
    // Trim canvas (simplification: just use entire canvas data)
    sigPad.toBlob((blob) => {
      signatureBlob = blob;
      overlay.src = URL.createObjectURL(blob);
      overlay.style.display = 'block';
      overlay.style.width = '200px'; // Initial scale
      saveBtn.style.display = 'block';
      drawBtn.textContent = '[ REDRAW SIGNATURE ]';
      sigModal.style.display = 'none';
    }, 'image/png');
  });

  // Dragging and Pinch-Zoom overlay
  let initialPinchDistance = null;
  let initialScale = 1;

  function handleDragStart(clientX, clientY) {
    isDragging = true;
    const overlayRect = overlay.getBoundingClientRect();
    dragOffset.x = clientX - overlayRect.left;
    dragOffset.y = clientY - overlayRect.top;
  }

  function handleDragMove(clientX, clientY) {
    if (!isDragging) return;
    const containerRect = document.getElementById('pdf-render-container').getBoundingClientRect();
    let newLeft = (clientX - dragOffset.x) - containerRect.left;
    let newTop = (clientY - dragOffset.y) - containerRect.top;
    overlay.style.left = `${newLeft}px`;
    overlay.style.top = `${newTop}px`;
  }

  overlay.addEventListener('mousedown', (e) => handleDragStart(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => handleDragMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', () => isDragging = false);

  // Mobile Touch Support
  overlay.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      initialPinchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      initialScale = parseFloat(getComputedStyle(overlay).width);
    } else if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  window.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      e.preventDefault(); // Prevent scrolling while dragging
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    } else if (e.touches.length === 2 && initialPinchDistance) {
      e.preventDefault();
      const currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      const scaleFactor = currentDistance / initialPinchDistance;
      overlay.style.width = `${initialScale * scaleFactor}px`;
    }
  }, { passive: false });

  window.addEventListener('touchend', () => { 
    isDragging = false; 
    initialPinchDistance = null; 
  });

  // Resize overlay with wheel
  overlay.addEventListener('wheel', (e) => {
    e.preventDefault();
    const currentWidth = parseFloat(getComputedStyle(overlay).width);
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1; // scroll down = shrink, scroll up = enlarge
    overlay.style.width = `${currentWidth * scaleFactor}px`;
  });

  // Flatten and Save
  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = '[ FLATTENING... ]';

    try {
      const { PDFDocument } = PDFLib;
      // Pass a clone of the buffer as a Uint8Array to prevent buffer exhaustion issues
      const doc = await PDFDocument.load(new Uint8Array(currentFileBytes.slice(0)), { ignoreEncryption: true });
      const pages = doc.getPages();
      const page = pages[pageNum - 1]; // 0-indexed

      const sigImage = await doc.embedPng(await signatureBlob.arrayBuffer());
      
      // Calculate coordinates relative to unscaled PDF
      const overlayRect = overlay.getBoundingClientRect();
      const canvasRect = renderCanvas.getBoundingClientRect();
      
      // Top left offset in HTML pixels
      const htmlX = overlayRect.left - canvasRect.left;
      const htmlY = overlayRect.top - canvasRect.top;
      
      // Convert HTML pixels to PDF points using the scale
      const pdfX = htmlX / pdfRenderScale;
      const htmlH = overlayRect.height;
      const pdfW = overlayRect.width / pdfRenderScale;
      const pdfH = htmlH / pdfRenderScale;
      
      // pdf-lib y-axis starts from BOTTOM left
      const pageHeight = page.getHeight();
      const pdfY = pageHeight - (htmlY / pdfRenderScale) - pdfH;

      page.drawImage(sigImage, {
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
      });

      const pdfBytes = await doc.save({ updateFieldAppearances: false });
      triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), 'signed_document.pdf');
    } catch (err) {
      if (err.message.includes('Expected instance of') || err.message.includes('encrypted')) {
        showToast("Crikey! This PDF is locked with strict restrictions. Try 'Print to PDF' first to unlock it.", "error");
      } else {
        showToast("Bugger! Error flattening the PDF: " + err.message, "error");
      }
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '[ FLATTEN & DOWNLOAD ]';
    }
  });
}

// ---------------------------------------------------------
// 5. EXPENSE FLATTENER
// ---------------------------------------------------------
function initExpenseFlattener() {
  const dropzone = document.getElementById('expense-dropzone');
  const fileInput = document.getElementById('expense-input');
  const list = document.getElementById('expense-list');
  const btn = document.getElementById('expense-btn');
  const status = document.getElementById('expense-status');
  
  let files = [];

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#F87171'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(248,113,113,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(248,113,113,0.3)';
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e) => handleFiles(e.target.files));

  function handleFiles(newFiles) {
    for (let f of newFiles) {
      if (f.type.startsWith('image/')) files.push(f);
    }
    renderList();
  }

  function renderList() {
    list.innerHTML = '';
    if (files.length > 0) btn.style.display = 'block';
    
    files.forEach((f, i) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.justifyContent = 'space-between';
      item.style.padding = '8px 12px';
      item.style.background = 'rgba(255,255,255,0.05)';
      item.style.borderRadius = '6px';
      item.style.border = '1px solid rgba(255,255,255,0.1)';
      
      const title = document.createElement('span');
      title.textContent = `${i + 1}. ${f.name}`;
      title.style.fontSize = '0.9rem';
      title.style.color = 'var(--text-main)';
      
      const controls = document.createElement('div');
      
      const upBtn = document.createElement('button');
      upBtn.textContent = '↑';
      upBtn.className = 'nav-link';
      upBtn.style.padding = '2px 8px';
      upBtn.onclick = () => { if (i > 0) { const t = files[i]; files[i] = files[i-1]; files[i-1] = t; renderList(); } };
      
      const delBtn = document.createElement('button');
      delBtn.textContent = 'X';
      delBtn.className = 'nav-link';
      delBtn.style.padding = '2px 8px';
      delBtn.style.color = '#F87171';
      delBtn.onclick = () => { files.splice(i, 1); renderList(); };
      
      controls.appendChild(upBtn);
      controls.appendChild(delBtn);
      item.appendChild(title);
      item.appendChild(controls);
      list.appendChild(item);
    });
  }

  btn.addEventListener('click', async () => {
    if (files.length === 0 || !window.PDFLib) return;
    btn.disabled = true;
    btn.textContent = '[ MERGING... ]';
    status.textContent = 'Generating PDF...';
    
    try {
      const { PDFDocument } = PDFLib;
      const pdfDoc = await PDFDocument.create();
      
      for (const f of files) {
        // Create a dedicated A4 page for each image
        const page = pdfDoc.addPage([595.28, 841.89]);
        const margin = 20;
        const usableWidth = 595.28 - (margin * 2);
        const usableHeight = 841.89 - (margin * 2);

        const bytes = await f.arrayBuffer();
        let img;
        if (f.type === 'image/jpeg') img = await pdfDoc.embedJpg(bytes);
        else if (f.type === 'image/png') img = await pdfDoc.embedPng(bytes);
        else {
          // Convert WebP/etc to PNG via Canvas first
          const bmp = await createImageBitmap(f);
          const canvas = document.createElement('canvas');
          canvas.width = bmp.width; canvas.height = bmp.height;
          canvas.getContext('2d').drawImage(bmp, 0, 0);
          const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
          img = await pdfDoc.embedPng(await blob.arrayBuffer());
        }
        
        // Scale the image to fit perfectly inside the full page margins
        const { width, height } = img.scaleToFit(usableWidth, usableHeight);
        
        // Draw perfectly centered on the page
        page.drawImage(img, {
          x: margin + (usableWidth / 2 - width / 2),
          y: margin + (usableHeight / 2 - height / 2),
          width,
          height,
        });
      }
      
      const pdfBytes = await pdfDoc.save();
      triggerDownload(new Blob([pdfBytes], { type: 'application/pdf' }), 'expenses.pdf');
      status.textContent = 'Done!';
    } catch(err) {
      status.textContent = `Error: ${err.message}`;
    } finally {
      btn.disabled = false;
      btn.textContent = '[ MERGE TO PDF ]';
    }
  });
}

// ---------------------------------------------------------
// 6. SCREEN RECORDER
// ---------------------------------------------------------
function initScreenRecorder() {
  const startBtn = document.getElementById('recorder-start-btn');
  const stopBtn = document.getElementById('recorder-stop-btn');
  const actionsDiv = document.getElementById('recorder-actions');
  const saveBtn = document.getElementById('recorder-save-btn');
  const shareBtn = document.getElementById('recorder-share-btn');
  const resetBtn = document.getElementById('recorder-reset-btn');
  const preview = document.getElementById('recorder-preview');
  const placeholder = document.getElementById('recorder-placeholder');
  const indicator = document.getElementById('recorder-indicator');
  const timeDisplay = document.getElementById('recorder-time');
  
  let mediaRecorder = null;
  let recordedChunks = [];
  let stream = null;
  let finalBlob = null;
  let timerInterval = null;
  let startTime = 0;

  function updateTimer() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(diff / 60)).padStart(2, '0');
    const secs = String(diff % 60).padStart(2, '0');
    timeDisplay.textContent = `${mins}:${secs}`;
  }

  startBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      showToast("Hold your horses mate. Screen recording is a desktop-only feature.", "error");
      return;
    }

    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      
      preview.srcObject = stream;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      indicator.style.display = 'flex';
      
      startBtn.style.display = 'none';
      stopBtn.style.display = 'block';
      actionsDiv.style.display = 'none';
      
      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) recordedChunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        clearInterval(timerInterval);
        finalBlob = new Blob(recordedChunks, { type: 'video/webm' });
        
        // Change UI to post-recording state
        stopBtn.style.display = 'none';
        actionsDiv.style.display = 'flex';
        indicator.style.display = 'none';
        
        // Unbind live stream from preview and bind recorded blob to allow playback
        preview.srcObject = null;
        preview.src = URL.createObjectURL(finalBlob);
        preview.controls = true; // allow them to play it back
      };
      
      // Listen for browser native stop button (e.g. Chrome's "Stop sharing" banner)
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      };
      
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 1000);
      mediaRecorder.start(1000); // 1-second chunks to prevent memory bloat
    } catch (err) {
      showToast("Screen recording went belly up: " + err.message, "error");
    }
  });

  stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      stream.getTracks().forEach(track => track.stop());
    }
  });
  
  saveBtn.addEventListener('click', () => {
    if (finalBlob) {
      triggerDownload(finalBlob, `recording_${Date.now()}.webm`);
      showToast("Video saved to your downloads mate!", "success");
    }
  });

  shareBtn.addEventListener('click', async () => {
    if (!finalBlob) return;
    
    if (navigator.share && navigator.canShare) {
      const file = new File([finalBlob], `recording_${Date.now()}.webm`, { type: 'video/webm' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: 'Screen Recording',
            text: 'Check out this screen recording from Riyo Studio.',
            files: [file]
          });
          showToast("Shared successfully!", "success");
        } catch (error) {
          if (error.name !== 'AbortError') {
             showToast("Failed to share: " + error.message, "error");
          }
        }
      } else {
        showToast("Your browser doesn't support sharing files directly. Just save it instead.", "error");
      }
    } else {
      showToast("Your browser doesn't support the Share API. Just hit save instead.", "error");
    }
  });
  
  resetBtn.addEventListener('click', () => {
    resetRecorder();
  });

  function resetRecorder() {
    preview.style.display = 'none';
    preview.src = '';
    preview.controls = false;
    placeholder.style.display = 'block';
    indicator.style.display = 'none';
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    actionsDiv.style.display = 'none';
    timeDisplay.textContent = '00:00';
    clearInterval(timerInterval);
    finalBlob = null;
    recordedChunks = [];

    preview.srcObject = null;
  }
}

// ---------------------------------------------------------
// 7. INSTANT TEXT EXTRACTOR (OCR)
// ---------------------------------------------------------
function initTextExtractor() {
  const dropzone = document.getElementById('ocr-dropzone');
  const fileInput = document.getElementById('ocr-input');
  const progressContainer = document.getElementById('ocr-progress-container');
  const progressBar = document.getElementById('ocr-progress-bar');
  const statusText = document.getElementById('ocr-status-text');
  const percentage = document.getElementById('ocr-percentage');
  const workspace = document.getElementById('ocr-workspace');
  const textarea = document.getElementById('ocr-textarea');
  const copyBtn = document.getElementById('ocr-copy-btn');
  
  if (!window.Tesseract) return;

  dropzone.addEventListener('click', () => fileInput.click());
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#A78BFA';
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'rgba(167,139,250,0.3)';
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(167,139,250,0.3)';
    if (e.dataTransfer.files.length > 0) {
      handleOcrFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleOcrFile(e.target.files[0]);
    }
  });

  async function handleOcrFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast("Mate, please upload a valid image file like PNG or JPG.", "error");
      return;
    }

    // Reset UI
    workspace.style.display = 'none';
    textarea.value = '';
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Initializing Engine...';
    percentage.textContent = '0%';
    
    try {
      const worker = await Tesseract.createWorker('eng', 1, {
        workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
        corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core.wasm.js',
        logger: m => {
          console.log("Tesseract Status:", m);
          if (m.status) {
            // Capitalize first letter for premium look
            const statusStr = m.status.charAt(0).toUpperCase() + m.status.slice(1);
            statusText.textContent = statusStr;
          }
          const pct = Math.floor((m.progress || 0) * 100);
          percentage.textContent = `${pct}%`;
          progressBar.style.width = `${pct}%`;
        }
      });
      
      statusText.textContent = 'Processing Image...';
      const { data: { text } } = await worker.recognize(file);
      
      await worker.terminate();
      
      // Show Results
      progressContainer.style.display = 'none';
      workspace.style.display = 'block';
      textarea.value = text;
      
    } catch (err) {
      statusText.textContent = 'Error: ' + err.message;
      statusText.style.color = '#EF4444';
      percentage.textContent = '';
    }
  }
  
  copyBtn.addEventListener('click', () => {
    if (textarea.value.trim() === '') return;
    navigator.clipboard.writeText(textarea.value).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = 'Copied!';
      copyBtn.style.background = '#10B981';
      copyBtn.style.color = '#000';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = 'rgba(0,0,0,0.8)';
        copyBtn.style.color = 'var(--text-main)';
      }, 2000);
    });
  });
}

// Dashboard Tab Switching Logic & Mobile Accordion
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.forge-tab-btn');
  const toolViews = document.querySelectorAll('.tool-view');
  const forgeStage = document.querySelector('.forge-stage');

  function handleLayout() {
    const isMobile = window.innerWidth <= 900;
    const activeBtn = document.querySelector('.forge-tab-btn.active');
    const targetId = activeBtn ? activeBtn.getAttribute('data-target') : null;
    const activeView = targetId ? document.getElementById(targetId) : null;

    if (isMobile && activeBtn && activeView) {
      // Mobile Accordion: Move active view directly under the active button in the DOM
      activeBtn.insertAdjacentElement('afterend', activeView);
    } else if (!isMobile) {
      // Desktop: Move all views back to forge-stage to preserve CSS Grid layout
      toolViews.forEach(v => forgeStage.appendChild(v));
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active state
      tabBtns.forEach(b => b.classList.remove('active'));
      toolViews.forEach(v => v.classList.remove('active'));

      // Set active state
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-target');
      const targetView = document.getElementById(targetId);
      
      if (targetView) {
        targetView.classList.add('active');
        handleLayout(); // Shuffle DOM if needed
      }
    });
  });

  // Re-calculate DOM layout on window resize
  window.addEventListener('resize', handleLayout);
  
  // Initial layout boot
  handleLayout();
});

// ==========================================
// 8. THE GHOST MAKER (EXIF SCRUBBER)
// ==========================================
function initGhostMaker() {
  const dropzone = document.getElementById('ghost-dropzone');
  const input = document.getElementById('ghost-input');
  const resultsArea = document.getElementById('ghost-results');
  const metaList = document.getElementById('ghost-metadata-list');
  const stripBtn = document.getElementById('ghost-strip-btn');
  let currentFile = null;
  let leafletMap = null;
  let mapMarker = null;

  dropzone.addEventListener('click', () => input.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#10B981';
    dropzone.style.background = 'rgba(16, 185, 129, 0.1)';
  });

  dropzone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    dropzone.style.background = 'rgba(16, 185, 129, 0.02)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(16, 185, 129, 0.3)';
    dropzone.style.background = 'rgba(16, 185, 129, 0.02)';
    
    if (e.dataTransfer.files.length > 0) {
      processGhostFile(e.dataTransfer.files[0]);
    }
  });

  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      processGhostFile(e.target.files[0]);
    }
  });

  async function processGhostFile(file) {
    if (!file.type.match('image.*')) return;
    currentFile = file;
    dropzone.style.display = 'none';
    resultsArea.style.display = 'block';
    
    metaList.innerHTML = '<div style="color: #10B981;">Analyzing raw image data...</div>';

    try {
      // Parse EXIF Data
      let output = await exifr.parse(file);
      if (!output) output = {};
      
      // Aggressively hunt for GPS data
      try {
        const gps = await exifr.gps(file);
        if (gps) {
          output.latitude = gps.latitude;
          output.longitude = gps.longitude;
        }
      } catch(e) {}
      
      metaList.innerHTML = '';
      if (Object.keys(output).length === 0) {
         metaList.innerHTML = `
           <div style="color: #10B981; margin-bottom: 1rem;">[✓] Image is pristine. Zero tracking metadata found.</div>
           <button id="ghost-reset-btn" class="nav-link" style="border: 1px solid #10B981; background: transparent; color: #10B981; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
             Check Another Photo
           </button>
         `;
         document.getElementById('ghost-map').style.display = 'none';
         document.getElementById('ghost-strip-btn').style.display = 'none';
         
         document.getElementById('ghost-reset-btn').addEventListener('click', () => {
           dropzone.style.display = 'flex';
           resultsArea.style.display = 'none';
           currentFile = null;
           document.getElementById('ghost-strip-btn').style.display = 'block'; // reset strip btn
         });
      } else {
         let html = '<ul>';
         let hasGPS = false;
         for (const [key, value] of Object.entries(output)) {
           // Skip massive raw array data buffers
           if (typeof value === 'object' && value !== null && !Array.isArray(value)) continue;
           
           if (key === 'latitude' || key === 'longitude') hasGPS = true;
           
           let displayVal = value;
           if (displayVal instanceof Date) displayVal = displayVal.toLocaleString();
           
           html += `<li style="margin-bottom: 4px;"><strong>${key}:</strong> ${displayVal}</li>`;
         }
         html += '</ul>';
         metaList.innerHTML = html;

         document.getElementById('ghost-map').style.display = 'block';

         // Init Map if GPS exists
         if (hasGPS && output.latitude && output.longitude) {
           if (!leafletMap) {
             leafletMap = L.map('ghost-map').setView([output.latitude, output.longitude], 15);
             // Use ultra-reliable OpenStreetMap tiles
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors',
                maxZoom: 19,
                className: 'dark-map-tiles',
                crossOrigin: true
             }).addTo(leafletMap);
           } else {
             leafletMap.setView([output.latitude, output.longitude], 15);
           }
           
           if (mapMarker) leafletMap.removeLayer(mapMarker);
           
           // Custom red dot marker
           const redIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#EF4444;width:15px;height:15px;border-radius:50%;border:2px solid white;box-shadow: 0 0 10px rgba(239,68,68,0.8);'></div>",
              iconSize: [15, 15],
              iconAnchor: [7.5, 7.5]
           });
           
           mapMarker = L.marker([output.latitude, output.longitude], {icon: redIcon}).addTo(leafletMap);
           
           // Force map refresh to fix container sizing bugs
           setTimeout(() => { leafletMap.invalidateSize(); }, 300);
         } else {
           document.getElementById('ghost-map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-dim);">No GPS Coordinates Found</div>';
         }
      }
    } catch (err) {
      metaList.innerHTML = '<div style="color: #EF4444;">Error parsing metadata: ' + err.message + '</div>';
    }
  }

  // Reset the UI to check another photo when metadata was found
  const resetMainBtn = document.getElementById('ghost-reset-main-btn');
  if (resetMainBtn) {
    resetMainBtn.addEventListener('click', () => {
      dropzone.style.display = 'flex';
      resultsArea.style.display = 'none';
      currentFile = null;
    });
  }

  // The Canvas Wash (Wipe Metadata)
  stripBtn.addEventListener('click', () => {
    if (!currentFile) return;
    stripBtn.innerText = '[ SCRUBBING DATA... ]';
    
    const img = new Image();
    const url = URL.createObjectURL(currentFile);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      // Physically redraw the pixels, dropping all EXIF in the process
      ctx.drawImage(img, 0, 0);
      
      // Export as a pristine blob
      canvas.toBlob((blob) => {
        const cleanUrl = URL.createObjectURL(blob);
        triggerDownload(blob, 'ghost_' + currentFile.name);
        
        stripBtn.style.background = 'rgba(16, 185, 129, 0.2)';
        stripBtn.style.color = '#10B981';
        stripBtn.innerText = '[ DATA DESTROYED - FILE DOWNLOADED ]';
        
        URL.revokeObjectURL(url);
        
        setTimeout(() => {
          stripBtn.style.background = 'rgba(16, 185, 129, 0.1)';
          stripBtn.innerText = '[ STRIP ALL TRACKING DATA ]';
          dropzone.style.display = 'flex';
          resultsArea.style.display = 'none';
          currentFile = null;
        }, 3000);
      }, currentFile.type, 1.0);
    };
    img.src = url;
  });
}

// ---------------------------------------------------------
// 9. DATA UN-BREAKER (JSON / CSV / EXCEL)
// ---------------------------------------------------------
function initDataConverter() {
  const dropzone = document.getElementById('data-dropzone');
  const fileInput = document.getElementById('data-input');
  const textarea = document.getElementById('data-textarea');
  const parseBtn = document.getElementById('data-parse-btn');
  const controls = document.getElementById('data-controls');
  const statusEl = document.getElementById('data-status');
  const resetBtn = document.getElementById('data-reset-btn');
  
  const exportJsonBtn = document.getElementById('data-export-json');
  const exportCsvBtn = document.getElementById('data-export-csv');
  const exportXlsxBtn = document.getElementById('data-export-xlsx');

  let parsedData = null; // Will hold Array of Objects

  function reset() {
    parsedData = null;
    dropzone.style.display = 'flex';
    textarea.style.display = 'block';
    parseBtn.style.display = 'block';
    textarea.value = '';
    controls.style.display = 'none';
    statusEl.textContent = '';
  }
  resetBtn.addEventListener('click', reset);

  function handleSuccess(dataArray, filenameHint = 'data') {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      showToast("Couldn't find any valid data rows in there, mate.", "error");
      return;
    }
    parsedData = dataArray;
    dropzone.style.display = 'none';
    textarea.style.display = 'none';
    parseBtn.style.display = 'none';
    controls.style.display = 'block';
    statusEl.textContent = `✅ Successfully parsed ${dataArray.length} rows. Ready for export.`;
    statusEl.dataset.filenameHint = filenameHint;
  }

  // --- File Drop Logic ---
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = '#5B8DEF'; });
  dropzone.addEventListener('dragleave', () => dropzone.style.borderColor = 'rgba(91,141,239,0.3)');
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(91,141,239,0.3)';
    if (e.dataTransfer.files.length > 0) processFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processFile(e.target.files[0]);
  });

  async function processFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    const baseName = file.name.replace(/\.[^/.]+$/, "");

    try {
      if (ext === 'json') {
        const text = await file.text();
        const json = JSON.parse(text);
        handleSuccess(Array.isArray(json) ? json : [json], baseName);
      } else if (ext === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: function(results) {
            handleSuccess(results.data, baseName);
          },
          error: function(err) { showToast("CSV Parse Error: " + err.message, "error"); }
        });
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        handleSuccess(data, baseName);
      } else {
        showToast("Unsupported file mate. Toss us a JSON, CSV, or Excel file.", "error");
      }
    } catch (err) {
      showToast("Error parsing the file mate: " + err.message, "error");
    }
  }

  // --- Raw Text Logic ---
  parseBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) { showToast("Mate, you gotta paste some data in first.", "error"); return; }

    try {
      const json = JSON.parse(text);
      handleSuccess(Array.isArray(json) ? json : [json], 'pasted_data');
      return;
    } catch (e) {
      // Fall back to CSV
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          if (results.data && results.data.length > 0 && Object.keys(results.data[0]).length > 1) {
            handleSuccess(results.data, 'pasted_data');
          } else {
            showToast("Crikey, I couldn't detect a valid JSON or CSV format in that.", "error");
          }
        }
      });
    }
  });

  // --- Export Logic ---
  exportJsonBtn.addEventListener('click', () => {
    if (!parsedData) return;
    const jsonStr = JSON.stringify(parsedData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    triggerDownload(blob, `${statusEl.dataset.filenameHint}_converted.json`);
  });

  exportCsvBtn.addEventListener('click', () => {
    if (!parsedData) return;
    const csvStr = Papa.unparse(parsedData);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `${statusEl.dataset.filenameHint}_converted.csv`);
  });

  exportXlsxBtn.addEventListener('click', () => {
    if (!parsedData) return;
    const worksheet = XLSX.utils.json_to_sheet(parsedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${statusEl.dataset.filenameHint}_converted.xlsx`);
  });
}

// ---------------------------------------------------------
// 10. SECURE JWT DECODER
// ---------------------------------------------------------
function initJwtDecoder() {
  const input = document.getElementById('jwt-input');
  const errorEl = document.getElementById('jwt-error');
  const outputEl = document.getElementById('jwt-output');
  const headerEl = document.getElementById('jwt-header');
  const payloadEl = document.getElementById('jwt-payload');

  function decodeBase64Url(str) {
    // Standardize Base64-URL to Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) throw new Error('InvalidBase64');
      base64 += new Array(5 - pad).join('=');
    }
    // Decode and URI-decode to support UTF-8 payloads
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(bytes);
  }

  input.addEventListener('input', () => {
    const token = input.value.trim();
    if (!token) {
      errorEl.style.display = 'none';
      outputEl.style.display = 'none';
      return;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      errorEl.textContent = 'Invalid JWT format. A valid token must contain 3 parts separated by dots (header.payload.signature).';
      errorEl.style.display = 'block';
      outputEl.style.display = 'none';
      return;
    }

    try {
      const headerRaw = decodeBase64Url(parts[0]);
      const payloadRaw = decodeBase64Url(parts[1]);

      const headerObj = JSON.parse(headerRaw);
      const payloadObj = JSON.parse(payloadRaw);

      headerEl.textContent = JSON.stringify(headerObj, null, 2);
      payloadEl.textContent = JSON.stringify(payloadObj, null, 2);

      errorEl.style.display = 'none';
      outputEl.style.display = 'flex';
    } catch (err) {
      errorEl.textContent = 'Failed to decode token. Ensure it is a valid Base64-encoded JWT.';
      errorEl.style.display = 'block';
      outputEl.style.display = 'none';
    }
  });
}
