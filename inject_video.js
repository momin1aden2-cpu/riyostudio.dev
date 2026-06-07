const fs = require('fs');
let code = fs.readFileSync('scanner.js', 'utf8');

// 1. Add global variables at the top
const globalsToInsert = `
    let isAnimating = false;
    let autoRotate = false;
    let autoRotateAngle = 0;
    let bgAudioElement = null;
    let audioContext = null;
    let audioDestination = null;
    let mediaRecorder = null;
    let recordedChunks = [];
`;
code = code.replace(/let targetWidth = 1080;/g, globalsToInsert + '\n    let targetWidth = 1080;');

// 2. Replace image upload to handle video
const oldImageUpload = `    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => { addImageLayer(img, index); URL.revokeObjectURL(url); };
            img.src = url;
        });
        e.target.value = ''; 
    });`;

const newImageUpload = `    imageUpload.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        // Initialize Audio Context on user interaction if not exists
        if (!audioContext) {
            try {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                audioDestination = audioContext.createMediaStreamDestination();
            } catch(e) { console.warn('AudioContext not supported'); }
        }

        files.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            if (file.type.startsWith('video/')) {
                const vid = document.createElement('video');
                vid.src = url;
                vid.muted = true; // start muted to satisfy autoplay policy, we will unmute later or rely on audio routing
                vid.loop = true;
                vid.autoplay = true;
                vid.crossOrigin = 'anonymous';
                vid.playsInline = true;
                
                vid.onloadeddata = () => {
                    vid.play().then(() => {
                        vid.muted = false; // Unmute after play to try getting audio
                    }).catch(e => console.warn('Video autoplay failed', e));
                    
                    // Connect video audio to the audio destination for recording
                    if (audioContext) {
                        try {
                            const source = audioContext.createMediaElementSource(vid);
                            source.connect(audioContext.destination); // Play to speakers
                            source.connect(audioDestination);         // Record
                        } catch(e) { console.warn('Audio context error for video', e); }
                    }
                    
                    addImageLayer(vid, index);
                    
                    if (!isAnimating) {
                        isAnimating = true;
                        render();
                    }
                };
            } else {
                const img = new Image();
                img.onload = () => { addImageLayer(img, index); URL.revokeObjectURL(url); };
                img.src = url;
            }
        });
        e.target.value = ''; 
    });`;
code = code.replace(oldImageUpload, newImageUpload);

// 3. Audio track upload & Auto Rotate toggle
const audioUploadLogic = `
    const audioUploadBtn = document.getElementById('upload-audio-btn');
    const audioUploadInput = document.getElementById('audio-upload-input');
    const audioTrackName = document.getElementById('audio-track-name');
    const autoRotateToggle = document.getElementById('auto-rotate-toggle');

    if (audioUploadBtn) {
        audioUploadBtn.addEventListener('click', () => audioUploadInput.click());
        audioUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!audioContext) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    audioDestination = audioContext.createMediaStreamDestination();
                } catch(err) { console.warn('AudioContext not supported'); }
            }

            const url = URL.createObjectURL(file);
            if (bgAudioElement) {
                bgAudioElement.pause();
                bgAudioElement.src = '';
            }
            bgAudioElement = new Audio(url);
            bgAudioElement.loop = true;
            
            if (audioContext) {
                try {
                    const source = audioContext.createMediaElementSource(bgAudioElement);
                    source.connect(audioContext.destination);
                    source.connect(audioDestination);
                } catch(err) { console.warn('Audio context error for audio track', err); }
            }

            bgAudioElement.play().catch(e => console.warn('Audio play failed', e));
            audioTrackName.style.display = 'block';
            audioTrackName.innerText = 'Track: ' + file.name;
            e.target.value = '';
            
            if (!isAnimating) {
                isAnimating = true;
                render();
            }
        });
    }

    if (autoRotateToggle) {
        autoRotateToggle.addEventListener('change', (e) => {
            autoRotate = e.target.checked;
            if (autoRotate && !isAnimating) {
                isAnimating = true;
                render();
            }
        });
    }
`;

code = code.replace(`    // Bg Upload`, audioUploadLogic + `\n    // Bg Upload`);

// 4. Update render loop
const oldRender = `    function render() {
        renderSceneToContext(ctx, targetWidth, targetHeight, true);
    }`;

const newRender = `    function render() {
        renderSceneToContext(ctx, targetWidth, targetHeight, true);
        
        if (autoRotate) {
            autoRotateAngle += 0.02;
            let needsPanelUpdate = false;
            layers.forEach(l => {
                if(l.type === 'image' && l.frameStyle !== 'none') {
                    // Smooth back and forth between -15 and 15
                    l.tiltY = Math.sin(autoRotateAngle) * 15;
                    l.tiltX = Math.cos(autoRotateAngle) * 5;
                    if (l.id === selectedLayerId) needsPanelUpdate = true;
                }
            });
            if (needsPanelUpdate) {
                const tyInput = document.getElementById('tilt-y-input');
                const txInput = document.getElementById('tilt-x-input');
                const selected = layers.find(l => l.id === selectedLayerId);
                if (tyInput && selected) tyInput.value = Math.round(selected.tiltY);
                if (txInput && selected) txInput.value = Math.round(selected.tiltX);
            }
        }

        if (isAnimating) {
            requestAnimationFrame(render);
        }
    }`;
code = code.replace(oldRender, newRender);

// 5. Add Export Video Button logic
const exportVideoLogic = `
    const exportVideoBtn = document.getElementById('export-video-btn');
    if (exportVideoBtn) {
        exportVideoBtn.addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                // Stop recording
                mediaRecorder.stop();
                exportVideoBtn.innerText = 'RECORD VIDEO';
                exportVideoBtn.style.background = '#f43f5e';
                exportVideoBtn.style.animation = '';
                return;
            }
            
            // Start recording
            const prevSelected = selectedLayerId; 
            selectedLayerId = null; 
            if (!isAnimating) {
                isAnimating = true; // force animation on to record frames
                render();
            }
            
            const canvasStream = canvas.captureStream(30);
            let finalStream = canvasStream;
            
            if (audioDestination) {
                const audioTracks = audioDestination.stream.getAudioTracks();
                if (audioTracks.length > 0) {
                    finalStream = new MediaStream([canvasStream.getVideoTracks()[0], ...audioTracks]);
                }
            }

            recordedChunks = [];
            try {
                mediaRecorder = new MediaRecorder(finalStream, { mimeType: 'video/webm;codecs=vp9' });
            } catch (e) {
                try {
                    mediaRecorder = new MediaRecorder(finalStream, { mimeType: 'video/webm' }); // fallback
                } catch(e2) {
                    alert('MediaRecorder is not supported in your browser.');
                    return;
                }
            }

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mockup-video.webm';
                a.click();
                URL.revokeObjectURL(url);
                selectedLayerId = prevSelected;
                // Optional: Stop animating if no video/audio is active, but keeping it true is fine
                // isAnimating = false;
                render();
            };

            mediaRecorder.start();
            exportVideoBtn.innerText = 'STOP RECORDING';
            exportVideoBtn.style.background = '#ef4444';
            // We can rely on CSS animation or just a visual change
            exportVideoBtn.style.animation = 'pulse 1.5s infinite';
        });
    }
`;

code = code.replace(`    init();\n});`, exportVideoLogic + `\n    init();\n});`);

fs.writeFileSync('scanner.js', code);
console.log('Video logic injected!');
