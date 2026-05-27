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
      isMedia = false; // Default to canvas for simple formats
      setupOptions(['webp', 'png', 'jpeg', 'bmp', 'gif', 'tiff', 'ico', 'avif']);
      loadFFmpeg(); // Pre-load FFmpeg in background just in case they choose an advanced format
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

    } catch (err) {
      logTerminal(`[ERROR] ${err.message}`);
      forgeBtn.disabled = false;
    }
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
      
      // Simple generic conversion command
      await ffmpegInstance.run('-i', inputName, outputName);

      logTerminal(`Extracting payload from virtual filesystem...`);
      const data = ffmpegInstance.FS('readFile', outputName);
      
      let mimeType = 'video/mp4';
      if (targetFormat === 'mp3' || targetFormat === 'wav') mimeType = `audio/${targetFormat}`;
      if (targetFormat === 'gif') mimeType = 'image/gif';
      if (targetFormat === 'webm') mimeType = 'video/webm';
      if (targetFormat === 'bmp') mimeType = 'image/bmp';
      if (targetFormat === 'tiff') mimeType = 'image/tiff';
      if (targetFormat === 'ico') mimeType = 'image/x-icon';
      if (targetFormat === 'avif') mimeType = 'image/avif';

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
    
    // The native browser Canvas can handle these 3 instantly
    if (['webp', 'png', 'jpeg'].includes(targetFormat)) {
      convertImage();
    } else {
      // Send everything else (videos, audio, and advanced images like TIFF/ICO) to FFmpeg
      convertMedia();
    }
  });

});
