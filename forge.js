// forge.js

document.addEventListener('DOMContentLoaded', () => {
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

  // --- UI & DRAG/DROP ---

  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleFile(e.target.files[0]);
  });

  function handleFile(file) {
    currentFile = file;
    dropzone.querySelector('p').innerHTML = `Loaded: <span style="color: #F59E0B;">${file.name}</span> (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
    
    // Reset state
    formatOptions.innerHTML = '';
    forgeBtn.textContent = '[ SELECT A FORMAT ]';
    forgeBtn.disabled = true;
    targetFormat = null;
    terminal.style.display = 'none';

    // Determine type
    if (file.type.startsWith('image/')) {
      isMedia = false; 
      setupOptions(['webp', 'png', 'jpeg', 'ico', 'bmp']);
    } else if (file.type.startsWith('video/') || file.type.startsWith('audio/')) {
      isMedia = true;
      setupOptions(['mp4', 'webm', 'gif', 'mp3', 'wav']);
      loadFFmpeg(); // Pre-load it quietly in the background
    } else {
      alert("Unsupported file type. Please upload an image, video, or audio file.");
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
        // visually select
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

  // --- IMAGE FORGE (CANVAS) ---

  async function convertImage() {
    terminal.style.display = 'block';
    terminal.innerHTML = '';
    logTerminal(`Initializing HTML5 Canvas Engine...`);
    
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
        
        canvas.toBlob((blob) => {
          if (!blob) throw new Error("Canvas encoding failed");
          triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.${targetFormat}`);
          logTerminal(`[200 OK] Forging Complete! File downloaded.`);
          forgeBtn.textContent = `[ FORGE ANOTHER ]`;
          forgeBtn.disabled = false;
        }, mimeType, quality);
      } else if (targetFormat === 'ico') {
        const blob = await encodeICO(canvas);
        triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.ico`);
        logTerminal(`[200 OK] Binary ICO Forging Complete!`);
        forgeBtn.textContent = `[ FORGE ANOTHER ]`;
        forgeBtn.disabled = false;
      } else if (targetFormat === 'bmp') {
        const blob = encodeBMP(canvas);
        triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.bmp`);
        logTerminal(`[200 OK] Binary BMP Forging Complete!`);
        forgeBtn.textContent = `[ FORGE ANOTHER ]`;
        forgeBtn.disabled = false;
      }

    } catch (err) {
      logTerminal(`[ERROR] ${err.message}`);
      forgeBtn.disabled = false;
    }
  }

  // --- CUSTOM BINARY ENCODERS ---

  async function encodeICO(canvas) {
    logTerminal(`Executing custom binary ICO forge...`);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        const pngBuffer = await blob.arrayBuffer();
        const pngBytes = new Uint8Array(pngBuffer);
        
        const buffer = new ArrayBuffer(22 + pngBytes.length);
        const view = new DataView(buffer);
        
        view.setUint16(0, 0, true); 
        view.setUint16(2, 1, true); 
        view.setUint16(4, 1, true); 
        
        let w = canvas.width;
        let h = canvas.height;
        if (w > 256) w = 0; 
        if (h > 256) h = 0;
        
        view.setUint8(6, w); 
        view.setUint8(7, h); 
        view.setUint8(8, 0); 
        view.setUint8(9, 0); 
        view.setUint16(10, 1, true); 
        view.setUint16(12, 32, true); 
        view.setUint32(14, pngBytes.length, true); 
        view.setUint32(18, 22, true); 
        
        const outArray = new Uint8Array(buffer);
        outArray.set(pngBytes, 22); 
        
        resolve(new Blob([buffer], { type: 'image/x-icon' }));
      }, 'image/png');
    });
  }

  function encodeBMP(canvas) {
    logTerminal(`Executing custom binary BMP forge...`);
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    
    const rowSize = Math.floor((width * 32 + 31) / 32) * 4;
    const pixelArraySize = rowSize * Math.abs(height);
    const fileSize = 54 + pixelArraySize;
    
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    
    // BITMAPFILEHEADER
    view.setUint8(0, 0x42); // 'B'
    view.setUint8(1, 0x4D); // 'M'
    view.setUint32(2, fileSize, true); 
    view.setUint32(6, 0, true); 
    view.setUint32(10, 54, true); 
    
    // BITMAPINFOHEADER
    view.setUint32(14, 40, true); 
    view.setInt32(18, width, true); 
    view.setInt32(22, height, true); // Positive height = Bottom-Up BMP (Max compatibility)
    view.setUint16(26, 1, true); 
    view.setUint16(28, 32, true); 
    view.setUint32(30, 0, true); 
    view.setUint32(34, pixelArraySize, true); 
    view.setInt32(38, 2835, true); 
    view.setInt32(42, 2835, true); 
    view.setUint32(46, 0, true); 
    view.setUint32(50, 0, true); 
    
    const outArray = new Uint8Array(buffer);
    let offset = 54;
    
    // Write bottom-up pixel data (BGRA format)
    for (let y = height - 1; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        outArray[offset++] = data[i + 2]; // B
        outArray[offset++] = data[i + 1]; // G
        outArray[offset++] = data[i + 0]; // R
        outArray[offset++] = data[i + 3]; // A
      }
    }
    
    return new Blob([buffer], { type: 'image/bmp' });
  }

  // --- MEDIA FORGE (FFMPEG.WASM) ---

  async function loadFFmpeg() {
    if (ffmpegInstance || document.getElementById('ffmpeg-script')) return;
    
    // Inject FFmpeg script
    const script = document.createElement('script');
    script.id = 'ffmpeg-script';
    script.src = 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
    document.head.appendChild(script);
  }

  async function convertMedia() {
    terminal.style.display = 'block';
    terminal.innerHTML = '';
    logTerminal(`Waking up WebAssembly FFmpeg Engine...`);
    
    if (!window.FFmpeg) {
      logTerminal(`[ERROR] FFmpeg library not loaded yet. Retrying in 2 seconds...`);
      setTimeout(convertMedia, 2000);
      return;
    }

    try {
      if (!ffmpegInstance) {
        logTerminal(`Allocating SharedArrayBuffer... (This may take a moment on first run)`);
        const { createFFmpeg } = FFmpeg;
        ffmpegInstance = createFFmpeg({
          log: true,
          logger: ({ message }) => logTerminal(message)
        });
        await ffmpegInstance.load();
        logTerminal(`FFmpeg WASM Core Mounted Successfully.`);
      }

      const { fetchFile } = FFmpeg;
      const inputName = `input_${Date.now()}.${currentFile.name.split('.').pop()}`;
      const outputName = `output_${Date.now()}.${targetFormat}`;

      logTerminal(`Writing file to virtual WASM filesystem...`);
      ffmpegInstance.FS('writeFile', inputName, await fetchFile(currentFile));

      logTerminal(`Executing: ffmpeg -i ${inputName} ${outputName}`);
      
      // Run conversion
      const exitCode = await ffmpegInstance.run('-i', inputName, outputName);
      if (exitCode !== 0) {
        throw new Error(`FFmpeg engine failed to encode ${targetFormat.toUpperCase()}. The codec might not be supported in this browser build.`);
      }

      logTerminal(`Extracting payload from virtual filesystem...`);
      const data = ffmpegInstance.FS('readFile', outputName);
      
      let mimeType = 'video/mp4';
      if (targetFormat === 'mp3' || targetFormat === 'wav') mimeType = `audio/${targetFormat}`;
      if (targetFormat === 'gif') mimeType = 'image/gif';
      if (targetFormat === 'webm') mimeType = 'video/webm';

      const blob = new Blob([data.buffer], { type: mimeType });
      triggerDownload(blob, `forged_${currentFile.name.split('.')[0]}.${targetFormat}`);
      
      logTerminal(`[200 OK] Media Forging Complete! File downloaded.`);
      
      // Cleanup virtual FS
      ffmpegInstance.FS('unlink', inputName);
      ffmpegInstance.FS('unlink', outputName);

      forgeBtn.textContent = `[ FORGE ANOTHER ]`;
      forgeBtn.disabled = false;

    } catch (err) {
      logTerminal(`[CRITICAL ERROR] ${err.message}`);
      logTerminal(`If SharedArrayBuffer failed, ensure coi-serviceworker is active.`);
      forgeBtn.disabled = false;
    }
  }

  // --- UTILS ---

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

  // --- ACTION ---

  forgeBtn.addEventListener('click', () => {
    if (!currentFile || !targetFormat) return;
    
    forgeBtn.disabled = true;
    forgeBtn.textContent = '[ FORGING... DO NOT CLOSE ]';
    
    if (isMedia) {
      convertMedia();
    } else {
      convertImage();
    }
  });

});
