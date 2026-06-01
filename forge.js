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
  initBulkOptimizer();
  initBackgroundRemover();
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

  const formatDescriptions = {
    'mp4': 'Universal Video format. Compatible with all devices including Apple.',
    'webm': 'Web Video format. Highly compressed for browser playback.',
    'gif': 'Animated Image format. No audio track, looping animation.',
    'mp3': 'Audio-Only format. Extracts the audio track for music or podcasts.',
    'wav': 'Uncompressed Audio-Only format. High quality audio extraction.',
    'webp': 'Modern Web Image. highly compressed and fast loading.',
    'png': 'Lossless Image format. Supports transparency.',
    'jpeg': 'Standard Photo format. Good compression for photos.',
    'ico': 'Windows Icon format. Scales down to 256x256.',
    'bmp': 'Uncompressed Image format. Raw pixel data.'
  };

  function setupOptions(formats) {
    formats.forEach(fmt => {
      const btn = document.createElement('button');
      btn.textContent = fmt.toUpperCase();
      btn.title = formatDescriptions[fmt] || `Convert to ${fmt.toUpperCase()}`;
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
        // ICO files must be small (typically max 256x256)
        let icoCanvas = canvas;
        if (canvas.width > 256 || canvas.height > 256) {
          logTerminal(`Scaling down to 256x256 for ICO format...`);
          icoCanvas = document.createElement('canvas');
          const scale = Math.min(256 / canvas.width, 256 / canvas.height);
          icoCanvas.width = Math.floor(canvas.width * scale);
          icoCanvas.height = Math.floor(canvas.height * scale);
          const icoCtx = icoCanvas.getContext('2d');
          icoCtx.drawImage(canvas, 0, 0, icoCanvas.width, icoCanvas.height);
        }
        
        const blob = await encodeICO(icoCanvas);
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
          log: true,
          corePath: new URL('/assets/ffmpeg/ffmpeg-core.js', window.location.href).href
        });
        
        ffmpegInstance.setLogger(({ type, message }) => {
          logTerminal(`[${type}] ${message}`);
          if (message.includes('time=')) {
            const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
            if (timeMatch && timeMatch[1]) {
              const btn = document.getElementById('forge-btn');
              if (btn) btn.textContent = `[ FORGING... ${timeMatch[1]} ]`;
            }
          }
        });
        
        ffmpegInstance.setProgress(({ ratio }) => {
          if (ratio > 0 && ratio <= 1) {
            const btn = document.getElementById('forge-btn');
            if (btn) btn.textContent = `[ FORGING... ${Math.round(ratio * 100)}% ]`;
          }
        });
        
        await ffmpegInstance.load();
      }

      const { fetchFile } = FFmpeg;
      const inputName = `input_${Date.now()}.${currentFile.name.split('.').pop()}`;
      const outputName = `output_${Date.now()}.${targetFormat}`;

      ffmpegInstance.FS('writeFile', inputName, await fetchFile(currentFile));
      
      let runArgs = ['-i', inputName];
      if (targetFormat === 'mp4') {
        runArgs.push('-vcodec', 'libx264', '-preset', 'ultrafast');
      } else if (targetFormat === 'webm') {
        runArgs.push('-c:v', 'libvpx-vp9', '-deadline', 'realtime', '-cpu-used', '8');
      }
      runArgs.push(outputName);

      await ffmpegInstance.run(...runArgs);

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
      
      const containerRect = document.getElementById('pdf-render-container').getBoundingClientRect();
      const viewportMiddleY = window.innerHeight / 2;
      let relativeTop = (viewportMiddleY - containerRect.top) - 50;
      
      if (relativeTop < 0) relativeTop = 50;
      if (relativeTop > containerRect.height - 100) relativeTop = containerRect.height - 100;
      
      overlay.style.top = `${relativeTop}px`;
      overlay.style.left = '50px';

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
      upBtn.textContent = 'â†‘';
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
      
      // A4 size: 595.28 x 841.89
      const page = pdfDoc.addPage([595.28, 841.89]);
      const margin = 20;
      const usableWidth = 595.28 - (margin * 2);
      const usableHeight = 841.89 - (margin * 2);

      // Smart Grid Calculation to fit all on one page
      const cols = Math.ceil(Math.sqrt(files.length));
      const rows = Math.ceil(files.length / cols);
      
      const cellWidth = usableWidth / cols;
      const cellHeight = usableHeight / rows;
      
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const bytes = await f.arrayBuffer();
        let img;
        if (f.type === 'image/jpeg') img = await pdfDoc.embedJpg(bytes);
        else if (f.type === 'image/png') img = await pdfDoc.embedPng(bytes);
        else {
          const bmp = await createImageBitmap(f);
          const canvas = document.createElement('canvas');
          canvas.width = bmp.width; canvas.height = bmp.height;
          canvas.getContext('2d').drawImage(bmp, 0, 0);
          const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
          img = await pdfDoc.embedPng(await blob.arrayBuffer());
        }
        
        // Calculate grid position
        const colIndex = i % cols;
        const rowIndex = Math.floor(i / cols);
        
        // Scale to fit inside the grid cell perfectly without distortion
        const { width, height } = img.scaleToFit(cellWidth - 10, cellHeight - 10);
        
        // Calculate X and Y to center the image within its specific cell
        // pdf-lib Y axis starts from the bottom!
        const cellX = margin + (colIndex * cellWidth);
        const cellY = 841.89 - margin - (rowIndex * cellHeight) - cellHeight; // Bottom of the cell
        
        page.drawImage(img, {
          x: cellX + (cellWidth / 2 - width / 2),
          y: cellY + (cellHeight / 2 - height / 2),
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
  let rawDisplayStream = null;
  let rawMicStream = null;
  let finalBlob = null;
  let timerInterval = null;
  let startTime = 0;

  function updateTimer() {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const mins = String(Math.floor(diff / 60)).padStart(2, '0');
    const secs = String(diff % 60).padStart(2, '0');
    timeDisplay.textContent = `${mins}:${secs}`;
  }
  
  function stopAllTracks() {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (rawDisplayStream) rawDisplayStream.getTracks().forEach(t => t.stop());
    if (rawMicStream) rawMicStream.getTracks().forEach(t => t.stop());
  }

  startBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      showToast("Hold your horses mate. Screen recording is a desktop-only feature.", "error");
      return;
    }

    try {
      const wantMic = document.getElementById('recorder-mic-toggle').checked;
      const wantSysAudio = document.getElementById('recorder-sys-toggle').checked;

      // Get screen video/audio based on toggle
      rawDisplayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: wantSysAudio });
      
      // Try to get microphone audio if requested
      rawMicStream = null;
      if (wantMic) {
        try {
          rawMicStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        } catch (err) {
          console.warn("Microphone access denied or unavailable.", err);
        }
      }

      // Mix the audio tracks together if both exist using Web Audio API
      let mixedStream = rawDisplayStream;
      let isMicActive = false;
      if (rawMicStream && rawMicStream.getAudioTracks().length > 0) {
        isMicActive = true;
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const dest = audioCtx.createMediaStreamDestination();
        
        if (rawDisplayStream.getAudioTracks().length > 0) {
          const systemSource = audioCtx.createMediaStreamSource(new MediaStream(rawDisplayStream.getAudioTracks()));
          systemSource.connect(dest);
        }
        
        const micSource = audioCtx.createMediaStreamSource(rawMicStream);
        micSource.connect(dest);
        
        mixedStream = new MediaStream([
          ...rawDisplayStream.getVideoTracks(),
          ...dest.stream.getAudioTracks()
        ]);
      }
      
      stream = mixedStream;
      preview.srcObject = stream;
      preview.style.display = 'block';
      placeholder.style.display = 'none';
      
      indicator.innerHTML = `<div class="recording-dot"></div><span id="recorder-time" style="color: #EF4444; font-family: 'JetBrains Mono'; font-size: 0.8rem; font-weight: bold;">00:00</span>` + 
                            (isMicActive ? `<span style="color:#10B981; font-size: 0.7rem; margin-left: 5px;">ðŸŽ¤ ON</span>` : `<span style="color:#6B7280; font-size: 0.7rem; margin-left: 5px;">ðŸŽ¤ OFF</span>`);
      // re-fetch timeDisplay reference because we replaced innerHTML
      const newTimeDisplay = indicator.querySelector('#recorder-time');
      
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
        
        stopAllTracks();
      };
      
      // Listen for browser native stop button (e.g. Chrome's "Stop sharing" banner)
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== 'inactive') mediaRecorder.stop();
      };
      
      startTime = Date.now();
      timerInterval = setInterval(() => {
        const diff = Math.floor((Date.now() - startTime) / 1000);
        const mins = String(Math.floor(diff / 60)).padStart(2, '0');
        const secs = String(diff % 60).padStart(2, '0');
        if (newTimeDisplay) newTimeDisplay.textContent = `${mins}:${secs}`;
      }, 1000);
      mediaRecorder.start(1000); // 1-second chunks to prevent memory bloat
    } catch (err) {
      showToast("Screen recording went belly up: " + err.message, "error");
    }
  });

  stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      stopAllTracks();
    }
  });
  
  // Prevent accidentally navigating away from the page while recording
  window.addEventListener('beforeunload', (e) => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      e.preventDefault();
      e.returnValue = 'You are currently recording. If you leave this page, your recording will be lost.';
    }
  });
  
  saveBtn.addEventListener('click', async () => {
    if (!finalBlob) return;
    
    try {
      // Try to use the modern File System Access API so user can choose destination
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `recording_${Date.now()}.webm`,
          types: [{
            description: 'WebM Video',
            accept: { 'video/webm': ['.webm'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(finalBlob);
        await writable.close();
        showToast("Video saved exactly where you wanted it mate!", "success");
      } else {
        // Fallback to standard download folder
        triggerDownload(finalBlob, `recording_${Date.now()}.webm`);
        showToast("Video saved to your downloads mate!", "success");
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        showToast("Error saving file: " + err.message, "error");
      }
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
  const threatBadge = document.getElementById('ghost-threat-badge');
  const fileCount = document.getElementById('ghost-file-count');
  const spoofSelect = document.getElementById('ghost-spoof-select');
  
  let currentFiles = []; // Array of processed blobs/files
  let leafletMap = null;
  let mapMarker = null;

  dropzone.addEventListener('click', (e) => {
    if (e.target !== input) input.click();
  });
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
    if (e.dataTransfer.files.length > 0) processGhostFiles(e.dataTransfer.files);
  });
  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processGhostFiles(e.target.files);
  });

  async function processGhostFiles(fileList) {
    currentFiles = Array.from(fileList);
    if (currentFiles.length === 0) return;
    
    dropzone.style.display = 'none';
    resultsArea.style.display = 'block';
    fileCount.textContent = `${currentFiles.length} file(s) selected`;
    metaList.innerHTML = '<div style="color: #10B981;">Analyzing raw file data...</div>';
    threatBadge.style.display = 'none';
    stripBtn.style.display = 'block';
    
    // We only show preview/threat for the FIRST file to keep UI clean
    const firstFile = currentFiles[0];
    
    try {
      let output = {};
      let hasGPS = false;
      let hasHardwareInfo = false;
      let ext = firstFile.name.split('.').pop().toLowerCase();
      
      if (ext === 'pdf') {
        // Parse PDF Metadata
        const arrayBuffer = await firstFile.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer, { updateMetadata: false });
        
        output = {
          Title: pdfDoc.getTitle() || '',
          Author: pdfDoc.getAuthor() || '',
          Subject: pdfDoc.getSubject() || '',
          Creator: pdfDoc.getCreator() || '',
          Producer: pdfDoc.getProducer() || '',
          CreationDate: pdfDoc.getCreationDate() ? pdfDoc.getCreationDate().toLocaleString() : '',
          ModificationDate: pdfDoc.getModificationDate() ? pdfDoc.getModificationDate().toLocaleString() : ''
        };
        
        // Clean empty fields
        for (let k in output) {
          if (!output[k]) delete output[k];
        }
        
        if (Object.keys(output).length > 0) hasHardwareInfo = true; // PDF software info
      } else {
        // Image Processing (JPG, PNG, WEBP, HEIC)
        let parseFile = firstFile;
        
        if (ext === 'heic' && window.heic2any) {
           metaList.innerHTML = '<div style="color: #10B981;">Decoding HEIC container...</div>';
           try {
              parseFile = await heic2any({ blob: firstFile, toType: "image/jpeg", quality: 0.9 });
              parseFile.name = firstFile.name.replace(/\.heic$/i, '.jpg');
           } catch(e) {
              console.warn("Failed to decode HEIC to JPG for parsing", e);
           }
        }
        
        try {
          let parsedExif = await exifr.parse(parseFile);
          if (parsedExif) output = parsedExif;
          const gps = await exifr.gps(parseFile);
          if (gps) {
            output.latitude = gps.latitude;
            output.longitude = gps.longitude;
            hasGPS = true;
          }
          if (output.Make || output.Model || output.Software) hasHardwareInfo = true;
        } catch(e) {
           console.warn("EXIF parsing error", e);
        }
      }
      
      // Calculate Threat Score
      threatBadge.style.display = 'block';
      if (hasGPS) {
        threatBadge.style.color = '#EF4444'; // Red
        threatBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        threatBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
        threatBadge.textContent = 'ðŸ”´ CRITICAL RISK: Exact GPS Coordinates Found';
      } else if (hasHardwareInfo || Object.keys(output).length > 0) {
        threatBadge.style.color = '#F59E0B'; // Yellow
        threatBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
        threatBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        threatBadge.textContent = 'ðŸŸ¡ MODERATE RISK: Tracking Metadata Found';
      } else {
        threatBadge.style.color = '#10B981'; // Green
        threatBadge.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        threatBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
        threatBadge.textContent = 'ðŸŸ¢ SAFE: No Tracking Data Found';
      }

      metaList.innerHTML = '';
      if (Object.keys(output).length === 0) {
         metaList.innerHTML = `<div style="color: #10B981; margin-bottom: 1rem;">[âœ“] File is pristine. Zero tracking metadata found.</div>`;
         document.getElementById('ghost-map-parent').style.display = 'none';
      } else {
         let html = '<ul>';
         for (const [key, value] of Object.entries(output)) {
           if (typeof value === 'object' && value !== null && !Array.isArray(value)) continue;
           let displayVal = value;
           if (displayVal instanceof Date) displayVal = displayVal.toLocaleString();
           html += `<li style="margin-bottom: 4px;"><strong>${key}:</strong> ${displayVal}</li>`;
         }
         html += '</ul>';
         metaList.innerHTML = html;

         document.getElementById('ghost-map-parent').style.display = 'block';
         document.getElementById('ghost-map').style.visibility = 'visible';
         document.getElementById('ghost-map-overlay').style.display = 'none';

         // Init Map if GPS exists
         if (hasGPS && output.latitude && output.longitude) {
           if (leafletMap) {
             leafletMap.remove();
             leafletMap = null;
           }
           
           // Completely destroy and recreate the DOM element to prevent Leaflet from caching 0x0 dimensions
           const parent = document.getElementById('ghost-map-parent');
           parent.innerHTML = '<div id="ghost-map" style="width: 100%; height: 100%;"></div><div id="ghost-map-overlay" style="display: none; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-surface); align-items: center; justify-content: center; color: var(--text-dim); z-index: 1000;">No GPS Coordinates Found</div>';
           
           leafletMap = L.map('ghost-map').setView([output.latitude, output.longitude], 15);
           L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; OpenStreetMap contributors',
              maxZoom: 19,
              className: 'dark-map-tiles',
              crossOrigin: true
           }).addTo(leafletMap);
           
           const redIcon = L.divIcon({
              className: 'custom-div-icon',
              html: "<div style='background-color:#EF4444;width:15px;height:15px;border-radius:50%;border:2px solid white;box-shadow: 0 0 10px rgba(239,68,68,0.8);'></div>",
              iconSize: [15, 15],
              iconAnchor: [7.5, 7.5]
           });
           mapMarker = L.marker([output.latitude, output.longitude], {icon: redIcon}).addTo(leafletMap);
           
           setTimeout(() => { if(leafletMap) leafletMap.invalidateSize(); }, 100);
           setTimeout(() => { if(leafletMap) leafletMap.invalidateSize(); }, 500);
           setTimeout(() => { if(leafletMap) leafletMap.invalidateSize(); }, 1500);
         } else {
           document.getElementById('ghost-map').style.visibility = 'hidden';
           document.getElementById('ghost-map-overlay').style.display = 'flex';
         }
      }
    } catch (err) {
      metaList.innerHTML = '<div style="color: #EF4444;">Error parsing metadata: ' + err.message + '</div>';
    }
  }

  const resetMainBtn = document.getElementById('ghost-reset-main-btn');
  if (resetMainBtn) {
    resetMainBtn.addEventListener('click', () => {
      dropzone.style.display = 'flex';
      resultsArea.style.display = 'none';
      currentFiles = [];
    });
  }

  // The Ghost Process (Scrubbing / Spoofing)
  stripBtn.addEventListener('click', async () => {
    if (currentFiles.length === 0) return;
    stripBtn.innerText = '[ PROCESSING... ]';
    stripBtn.disabled = true;
    
    const action = spoofSelect ? spoofSelect.value : 'strip';
    let processedBlobs = [];
    
    // Spoofing Data coordinates [Lat, Lng]
    const spoofer = {
      'spoof-area51': [37.2343, -115.8066],
      'spoof-bermuda': [25.0000, -71.0000],
      'spoof-northpole': [90.0000, 0.0000],
      'spoof-null': [0.0000, 0.0000]
    };

    for (let i = 0; i < currentFiles.length; i++) {
      let file = currentFiles[i];
      let ext = file.name.split('.').pop().toLowerCase();
      let originalName = file.name;
      
      if (ext === 'pdf') {
         // PDF Scrubbing
         const arrayBuffer = await file.arrayBuffer();
         const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
         pdfDoc.setTitle('');
         pdfDoc.setAuthor('');
         pdfDoc.setSubject('');
         pdfDoc.setCreator('');
         pdfDoc.setProducer('');
         pdfDoc.setKeywords([]);
         const pdfBytes = await pdfDoc.save();
         processedBlobs.push({ name: 'ghost_' + originalName, blob: new Blob([pdfBytes], { type: 'application/pdf' }) });
      } else {
         // Image Scrubbing / Spoofing
         let imgBlob = file;
         if (ext === 'heic' && window.heic2any) {
            try {
              // Extract preview from HEIC to speed it up or convert full
              let hBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
              imgBlob = Array.isArray(hBlob) ? hBlob[0] : hBlob;
              ext = 'jpg';
              originalName = originalName.replace(/\.heic$/i, '.jpg');
            } catch (e) {
              console.warn("Failed HEIC to JPG conversion during scrubbing", e);
              continue;
            }
         }
         
         // Canvas wash to strip EXIF
         const cleanBlob = await new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(imgBlob);
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                 URL.revokeObjectURL(url);
                 resolve(blob);
              }, ext === 'png' ? 'image/png' : 'image/jpeg', 1.0);
            };
            img.src = url;
         });

         // Inject EXIF if Spoofing
         if (action.startsWith('spoof-') && window.piexif && (ext === 'jpg' || ext === 'jpeg')) {
            const coords = spoofer[action];
            if (coords) {
               try {
                 const lat = Math.abs(coords[0]);
                 const lng = Math.abs(coords[1]);
                 const latRef = coords[0] < 0 ? 'S' : 'N';
                 const lngRef = coords[1] < 0 ? 'W' : 'E';
                 
                 const degToExif = (deg) => {
                    const d = Math.floor(deg);
                    const minFloat = (deg - d) * 60;
                    const m = Math.floor(minFloat);
                    const sFloat = (minFloat - m) * 60;
                    const s = Math.round(sFloat * 100);
                    return [[d, 1], [m, 1], [s, 100]];
                 };
                 
                 const zeroth = {};
                 const exif = {};
                 const gps = {};
                 
                 gps[piexif.GPSIFD.GPSLatitudeRef] = latRef;
                 gps[piexif.GPSIFD.GPSLatitude] = degToExif(lat);
                 gps[piexif.GPSIFD.GPSLongitudeRef] = lngRef;
                 gps[piexif.GPSIFD.GPSLongitude] = degToExif(lng);
                 
                 // Add fake camera make
                 zeroth[piexif.ImageIFD.Make] = "Spoofed Camera";
                 zeroth[piexif.ImageIFD.Model] = "Ghost Maker v1.0";
                 
                 const exifObj = {"0th": zeroth, "Exif": exif, "GPS": gps};
                 const exifBytes = piexif.dump(exifObj);
                 
                 // Read blob as dataURL to insert EXIF
                 const reader = new FileReader();
                 const spoofedBlob = await new Promise((resolve) => {
                    reader.onload = (e) => {
                        const inserted = piexif.insert(exifBytes, e.target.result);
                        // Manually convert dataURL to blob to bypass CSP fetch restrictions on data: URIs
                        const byteString = atob(inserted.split(',')[1]);
                        const mimeString = inserted.split(',')[0].split(':')[1].split(';')[0];
                        const ab = new ArrayBuffer(byteString.length);
                        const ia = new Uint8Array(ab);
                        for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                        }
                        resolve(new Blob([ab], {type: mimeString}));
                    };
                    reader.readAsDataURL(cleanBlob);
                 });
                 processedBlobs.push({ name: 'ghost_' + originalName, blob: spoofedBlob });
               } catch(e) {
                 console.warn("EXIF spoofing failed, using clean blob", e);
                 processedBlobs.push({ name: 'ghost_' + originalName, blob: cleanBlob });
               }
            } else {
               processedBlobs.push({ name: 'ghost_' + originalName, blob: cleanBlob });
            }
         } else {
            processedBlobs.push({ name: 'ghost_' + originalName, blob: cleanBlob });
         }
      }
    }
    
    // Download logic
    if (processedBlobs.length === 1) {
       triggerDownload(processedBlobs[0].blob, processedBlobs[0].name);
    } else if (processedBlobs.length > 1 && window.JSZip) {
       stripBtn.innerText = '[ ZIPPING FILES... ]';
       const zip = new JSZip();
       processedBlobs.forEach(pb => {
          zip.file(pb.name, pb.blob);
       });
       const zipBlob = await zip.generateAsync({type:"blob"});
       triggerDownload(zipBlob, 'ghost_scrubbed_files.zip');
    }

    stripBtn.style.background = 'rgba(16, 185, 129, 0.2)';
    stripBtn.style.color = '#10B981';
    stripBtn.innerText = '[ JOB COMPLETE ]';
    
    setTimeout(() => {
      stripBtn.style.background = 'rgba(16, 185, 129, 0.1)';
      stripBtn.innerText = '[ EXECUTE & DOWNLOAD ]';
      stripBtn.disabled = false;
      dropzone.style.display = 'flex';
      resultsArea.style.display = 'none';
      currentFiles = [];
    }, 3000);
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
    statusEl.textContent = `âœ… Successfully parsed ${dataArray.length} rows. Ready for export.`;
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
        const json = window.JSON5 ? JSON5.parse(text) : JSON.parse(text);
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
      const json = window.JSON5 ? JSON5.parse(text) : JSON.parse(text);
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

// 9. BULK IMAGE OPTIMIZER
function initBulkOptimizer() {
  const dropzone = document.getElementById('bulk-dropzone');
  const input = document.getElementById('bulk-file-input');
  const controls = document.getElementById('bulk-controls');
  const fileCountEl = document.getElementById('bulk-file-count');
  const formatSelect = document.getElementById('bulk-format-select');
  const qualitySlider = document.getElementById('bulk-quality-slider');
  const qualityDisplay = document.getElementById('bulk-quality-display');
  const executeBtn = document.getElementById('bulk-execute-btn');
  const resetBtn = document.getElementById('bulk-reset-btn');
  const statusArea = document.getElementById('bulk-status');
  const progressEl = document.getElementById('bulk-progress');

  let bulkFiles = [];

  dropzone.addEventListener('click', (e) => {
    if (e.target !== input) input.click();
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#6366F1';
    dropzone.style.background = 'rgba(99, 102, 241, 0.1)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    dropzone.style.background = 'rgba(99, 102, 241, 0.02)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(99, 102, 241, 0.3)';
    dropzone.style.background = 'rgba(99, 102, 241, 0.02)';
    if (e.dataTransfer.files.length > 0) handleBulkFiles(e.dataTransfer.files);
  });

  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleBulkFiles(e.target.files);
  });

  qualitySlider.addEventListener('input', (e) => {
    qualityDisplay.textContent = `${e.target.value}%`;
  });

  function handleBulkFiles(files) {
    // Only accept up to 100 images
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/svg+xml'];
    let added = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let t = file.type;
      
      // Fallback for .heic on Windows/Chrome which might lack type
      if (!t && file.name.toLowerCase().endsWith('.heic')) {
        t = 'image/heic';
      }

      if (validTypes.includes(t)) {
        if (bulkFiles.length < 100) {
          bulkFiles.push(file);
          added++;
        }
      }
    }

    if (bulkFiles.length > 0) {
      dropzone.style.display = 'none';
      controls.style.display = 'block';
      fileCountEl.textContent = bulkFiles.length;
    }
    input.value = ''; // reset
  }

  resetBtn.addEventListener('click', () => {
    bulkFiles = [];
    dropzone.style.display = 'flex';
    controls.style.display = 'none';
    statusArea.style.display = 'none';
    executeBtn.disabled = false;
    executeBtn.textContent = '[ OPTIMIZE & DOWNLOAD ZIP ]';
  });

  executeBtn.addEventListener('click', async () => {
    if (bulkFiles.length === 0) return;
    
    executeBtn.disabled = true;
    executeBtn.textContent = '[ PROCESSING... ]';
    statusArea.style.display = 'block';
    
    const zip = new JSZip();
    const folder = zip.folder("optimized_images");
    
    const targetFormat = formatSelect.value;
    const quality = parseInt(qualitySlider.value, 10) / 100;
    
    // Canvas context for drawing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    for (let i = 0; i < bulkFiles.length; i++) {
      let file = bulkFiles[i];
      let t = file.type;
      if (!t && file.name.toLowerCase().endsWith('.heic')) t = 'image/heic';

      progressEl.textContent = Math.round((i / bulkFiles.length) * 100);

      try {
        let blobToDraw = file;
        
        if (t === 'image/heic') {
          // Convert HEIC first via heic2any
          const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 1.0 });
          blobToDraw = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
        }

        // Draw onto canvas
        const bmp = await createImageBitmap(blobToDraw);
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bmp, 0, 0);

        // Convert canvas to target format blob
        const optimizedBlob = await new Promise(resolve => canvas.toBlob(resolve, targetFormat, targetFormat === 'image/png' ? undefined : quality));
        
        let ext = targetFormat.split('/')[1];
        if (ext === 'jpeg') ext = 'jpg';
        
        const originalNameBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        folder.file(`${originalNameBase}_optimized.${ext}`, optimizedBlob);

        bmp.close(); // free memory
      } catch (err) {
        console.error("Failed to process", file.name, err);
      }
    }

    progressEl.textContent = 100;
    executeBtn.textContent = '[ PACKAGING ZIP... ]';

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, 'bulk_optimized_images.zip');

    executeBtn.textContent = '[ DONE! ]';
    setTimeout(() => {
      resetBtn.click();
    }, 2000);
  });
}
// 10. AI BACKGROUND REMOVER
function initBackgroundRemover() {
  const dropzone = document.getElementById('bg-dropzone');
  const input = document.getElementById('bg-file-input');
  const workspace = document.getElementById('bg-workspace');
  const loadingArea = document.getElementById('bg-loading');
  const statusText = document.getElementById('bg-status-text');
  const progressText = document.getElementById('bg-progress-text');
  
  // Editor Elements
  const editorWrapper = document.getElementById('bg-editor-wrapper');
  const previewContainer = document.getElementById('bg-preview-container');
  const bgLayer = document.getElementById('bg-layer');
  const cutoutContainer = document.getElementById('cutout-container');
  const resultImg = document.getElementById('bg-result-img');
  
  const resetBtn = document.getElementById('bg-reset-btn');
  const downloadBtn = document.getElementById('bg-download-btn');

  // UI Controls
  const btnTransparent = document.getElementById('bg-preset-transparent');
  const btnColor = document.getElementById('bg-preset-color');
  const colorPicker = document.getElementById('bg-color-picker');
  const btnOffice = document.getElementById('bg-preset-office');
  const btnNature = document.getElementById('bg-preset-nature');
  const btnStudio = document.getElementById('bg-preset-studio');
  const customUpload = document.getElementById('bg-custom-upload');
  
  const scaleSlider = document.getElementById('cutout-scale');
  const rotateSlider = document.getElementById('cutout-rotate');
  const flipBtn = document.getElementById('cutout-flip-btn');
  const centerBtn = document.getElementById('cutout-center-btn');

  let currentBlobUrl = null;
  let rawTransparentBlob = null;

  // Editor State
  let currentBgType = 'transparent';
  let currentBgColor = '#10B981';
  let currentBgImageSrc = null;
  let cutoutScale = 1;
  let cutoutRotate = 0;
  let cutoutFlip = 1;
  let currentX = 0;
  let currentY = 0;
  let isDragging = false;
  let startX = 0; let startY = 0;

  // --- Dragging Logic ---
  const startDrag = (clientX, clientY) => {
    isDragging = true;
    startX = clientX - currentX;
    startY = clientY - currentY;
    cutoutContainer.style.cursor = 'grabbing';
  };
  const moveDrag = (clientX, clientY) => {
    if (!isDragging) return;
    currentX = clientX - startX;
    currentY = clientY - startY;
    updateCutoutTransform();
  };
  const endDrag = () => {
    isDragging = false;
    cutoutContainer.style.cursor = 'grab';
  };

  cutoutContainer.addEventListener('mousedown', (e) => startDrag(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => moveDrag(e.clientX, e.clientY));
  window.addEventListener('mouseup', endDrag);

  cutoutContainer.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX, e.touches[0].clientY));
  window.addEventListener('touchmove', (e) => moveDrag(e.touches[0].clientX, e.touches[0].clientY));
  window.addEventListener('touchend', endDrag);

  function updateCutoutTransform() {
    cutoutContainer.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
    resultImg.style.transform = `scale(${cutoutScale}) rotate(${cutoutRotate}deg) scaleX(${cutoutFlip})`;
  }

  // --- Transform Controls ---
  scaleSlider.addEventListener('input', (e) => { cutoutScale = parseFloat(e.target.value); updateCutoutTransform(); });
  rotateSlider.addEventListener('input', (e) => { cutoutRotate = parseInt(e.target.value); updateCutoutTransform(); });
  flipBtn.addEventListener('click', () => { cutoutFlip *= -1; updateCutoutTransform(); });
  centerBtn.addEventListener('click', () => {
    currentX = 0; currentY = 0; cutoutScale = 1; cutoutRotate = 0; cutoutFlip = 1;
    scaleSlider.value = 1; rotateSlider.value = 0;
    updateCutoutTransform();
  });

  // --- Background Selection Logic ---
  function setBackground(type, value) {
    currentBgType = type;
    if (type === 'transparent') {
      bgLayer.style.background = 'transparent';
      currentBgImageSrc = null;
    } else if (type === 'color') {
      bgLayer.style.background = value;
      currentBgColor = value;
      currentBgImageSrc = null;
    } else if (type === 'image') {
      bgLayer.style.background = `url('${value}') center/cover no-repeat`;
      currentBgImageSrc = value;
    }
  }

  btnTransparent.onclick = () => setBackground('transparent');
  colorPicker.oninput = (e) => setBackground('color', e.target.value);
  btnOffice.onclick = () => setBackground('image', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1080&q=80');
  btnNature.onclick = () => setBackground('image', 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1080&q=80');
  btnStudio.onclick = () => setBackground('image', 'https://images.unsplash.com/photo-1598084991519-c90900bc9f9c?auto=format&fit=crop&w=1080&q=80');
  
  customUpload.onchange = (e) => {
    if (e.target.files.length > 0) {
      const url = URL.createObjectURL(e.target.files[0]);
      setBackground('image', url);
    }
  };

  // --- Exporting Logic ---
  async function exportComposite(originalName) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1080;
    canvas.height = 1080;

    // Draw Background
    if (currentBgType === 'color') {
      ctx.fillStyle = currentBgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (currentBgType === 'image' && currentBgImageSrc) {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      await new Promise(r => { bgImg.onload = r; bgImg.src = currentBgImageSrc; });
      const scale = Math.max(canvas.width / bgImg.width, canvas.height / bgImg.height);
      const x = (canvas.width / 2) - (bgImg.width / 2) * scale;
      const y = (canvas.height / 2) - (bgImg.height / 2) * scale;
      ctx.drawImage(bgImg, x, y, bgImg.width * scale, bgImg.height * scale);
    }

    // Draw Cutout
    const fgImg = new Image();
    await new Promise(r => { fgImg.onload = r; fgImg.src = resultImg.src; });

    const rect = previewContainer.getBoundingClientRect();
    const exportScale = canvas.width / rect.width; 

    // Compute contain scaling used by object-fit: contain natively
    const containScale = Math.min(rect.width / fgImg.width, rect.height / fgImg.height);
    const drawW = fgImg.width * containScale;
    const drawH = fgImg.height * containScale;

    const cx = (canvas.width / 2) + (currentX * exportScale);
    const cy = (canvas.height / 2) + (currentY * exportScale);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((cutoutRotate * Math.PI) / 180);
    ctx.scale(cutoutFlip * cutoutScale, cutoutScale);
    ctx.drawImage(fgImg, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    canvas.toBlob((blob) => {
      triggerDownload(blob, `${originalName}_composite.png`);
    }, 'image/png');
  }

  dropzone.addEventListener('click', (e) => {
    if (e.target !== input) input.click();
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '#EC4899';
    dropzone.style.background = 'rgba(236, 72, 153, 0.1)';
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = 'rgba(236, 72, 153, 0.3)';
    dropzone.style.background = 'rgba(236, 72, 153, 0.02)';
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(236, 72, 153, 0.3)';
    dropzone.style.background = 'rgba(236, 72, 153, 0.02)';
    if (e.dataTransfer.files.length > 0) processBgImage(e.dataTransfer.files[0]);
  });

  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) processBgImage(e.target.files[0]);
  });

  async function processBgImage(file) {
    if (!file) return;

    // Reset UI
    dropzone.style.display = 'none';
    workspace.style.display = 'block';
    loadingArea.style.display = 'block';
    editorWrapper.style.display = 'none';
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    
    let processFile = file;
    
    try {
      // Handle HEIC fallback
      if (file.name.toLowerCase().endsWith('.heic')) {
        statusText.textContent = 'Decoding HEIC image first...';
        const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 1.0 });
        processFile = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      }

      statusText.textContent = 'Warming up AI Engine (this takes a moment on the first run)...';

      // Load imgly via dynamic import from esm.sh to properly resolve its dependencies (lodash)
      const imglyMod = await import('https://esm.sh/@imgly/background-removal@1.4.3');
      const removeBackground = imglyMod.default || imglyMod.removeBackground;

      const config = {
        publicPath: "https://unpkg.com/@imgly/background-removal-data@1.4.3/dist/",
        progress: (key, current, total) => {
          if (key === 'compute:inference') {
            statusText.textContent = 'Removing background...';
          } else {
            statusText.textContent = `Downloading AI Model (${key})...`;
          }
          if (total) {
            const p = Math.round((current / total) * 100);
            progressText.textContent = `${p}%`;
          }
        }
      };

      const transparentBlob = await removeBackground(processFile, config);

      // Display result
      rawTransparentBlob = transparentBlob;
      currentBlobUrl = URL.createObjectURL(transparentBlob);
      resultImg.src = currentBlobUrl;
      
      // Reset editor state
      currentX = 0; currentY = 0; cutoutScale = 1; cutoutRotate = 0; cutoutFlip = 1;
      scaleSlider.value = 1; rotateSlider.value = 0;
      updateCutoutTransform();
      setBackground('transparent');

      loadingArea.style.display = 'none';
      editorWrapper.style.display = 'block';
      
      const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      
      downloadBtn.onclick = () => {
        downloadBtn.textContent = 'EXPORTING COMPOSITE...';
        downloadBtn.disabled = true;
        exportComposite(originalName).then(() => {
          downloadBtn.textContent = '[ DOWNLOAD EDITED COMPOSITE ]';
          downloadBtn.disabled = false;
        }).catch(e => {
          console.error(e);
          downloadBtn.textContent = 'Error during export';
          downloadBtn.disabled = false;
        });
      };

    } catch (err) {
      console.error(err);
      statusText.textContent = 'Error processing image: ' + err.message;
      progressText.textContent = 'Failed';
      controls.style.display = 'flex';
      downloadBtn.style.display = 'none'; // hide download button on error
    }
  }

  resetBtn.addEventListener('click', () => {
    input.value = '';
    dropzone.style.display = 'flex';
    workspace.style.display = 'none';
    if (currentBlobUrl) URL.revokeObjectURL(currentBlobUrl);
    currentBlobUrl = null;
    rawTransparentBlob = null;
    resultImg.src = '';
  });
}
