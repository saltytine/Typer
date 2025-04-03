document.addEventListener('DOMContentLoaded', () => {
    const textEditor = document.getElementById('textEditor');
    const rippleContainer = document.getElementById('rippleContainer');
    const soundToggle = document.getElementById('soundToggle');
    const fullscreenToggle = document.getElementById('fullscreenToggle');
    const charCountElement = document.getElementById('charCount');
    const wordCountElement = document.getElementById('wordCount');
    const appContainer = document.querySelector('.app-container');
    const themeSelect = document.getElementById('themeSelect');
    const formatButton = document.getElementById('formatButton');
    const formatToolbar = document.getElementById('formatToolbar');
    const saveButton = document.getElementById('saveButton');
    const saveDialog = document.getElementById('saveDialog');
    const saveDialogCancel = document.getElementById('saveDialogCancel');
    const saveDialogConfirm = document.getElementById('saveDialogConfirm');
    const formatButtons = document.querySelectorAll('.format-toolbar button');

    const state = {
        currentTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        isSoundEnabled: true,
        isFullscreen: false,
        lastInputTimestamp: Date.now(),
        textContent: '',
        isToolbarVisible: false,
    };

    init();

    function init() {
        updateTheme();
        
        setupEventListeners();
        
        textEditor.focus();
    }

    function setupEventListeners() {
        textEditor.addEventListener('input', handleInput);
        textEditor.addEventListener('keydown', handleKeyDown);
        
        themeSelect.addEventListener('change', handleThemeChange);
        soundToggle.addEventListener('click', toggleSound);
        fullscreenToggle.addEventListener('click', toggleFullscreen);
        formatButton.addEventListener('click', toggleFormatToolbar);
        saveButton.addEventListener('click', openSaveDialog);

        saveDialogCancel.addEventListener('click', closeSaveDialog);
        saveDialogConfirm.addEventListener('click', saveDocument);

        formatButtons.forEach(button => {
            button.addEventListener('click', () => {
                applyFormat(button.getAttribute('data-format'));
            });
        });

        window.addEventListener('keydown', handleGlobalKeyDown);
        window.addEventListener('resize', updateUI);

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    function handleInput(e) {
        updateTextStats();
        
        createRippleEffect();
        
        state.lastInputTimestamp = Date.now();
        state.textContent = textEditor.innerHTML;
    }

    function handleKeyDown(e) {
        if (state.isSoundEnabled && e.key.length === 1) {
            playKeySound(e.key);
        }
        
        if (e.key.length > 1 && !['Enter', 'Space', 'Tab', 'Backspace'].includes(e.key)) {
            return;
        }
        
        textEditor.classList.add('key-press');
        setTimeout(() => {
            textEditor.classList.remove('key-press');
        }, 100);
    }

    function updateTextStats() {
        const text = textEditor.textContent || '';
        const charCount = text.length;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        
        charCountElement.textContent = charCount;
        wordCountElement.textContent = wordCount;
        
        animateElement(charCountElement);
        if (text.trim().endsWith(' ') || text.trim().includes('\n')) {
            animateElement(wordCountElement);
        }
    }

    function animateElement(element) {
        element.style.animation = 'none';
        element.offsetHeight; // trigger reflow
        element.style.animation = 'key-press 300ms ease';
    }

    function createRippleEffect() {
        const cursorPos = getCursorPosition();
        if (!cursorPos) return;
        
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = `${cursorPos.x}px`;
        ripple.style.top = `${cursorPos.y}px`;
        
        rippleContainer.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 1000);
    }

    function getCursorPosition() {
        try {
            const editorRect = textEditor.getBoundingClientRect();
            
            const selection = window.getSelection();
            if (!selection.rangeCount) return null;
            
            const range = selection.getRangeAt(0).cloneRange();
            range.collapse(true);
            
            const tempSpan = document.createElement('span');
            tempSpan.textContent = '|';
            range.insertNode(tempSpan);
            
            const spanRect = tempSpan.getBoundingClientRect();
            
            tempSpan.remove();
            
            const x = spanRect.left - editorRect.left;
            const y = spanRect.top - editorRect.top;
            
            return {
                x: x,
                y: y
            };
        } catch (error) {
            console.error('Error getting cursor position:', error);
            
            const editorRect = textEditor.getBoundingClientRect();
            
            return {
                x: editorRect.width / 2,
                y: editorRect.height / 2
            };
        }
    }



    function handleThemeChange() {
        state.currentTheme = themeSelect.value;
        updateTheme();
        animateThemeChange();
    }

    function updateTheme() {
        document.documentElement.setAttribute('data-theme', state.currentTheme);
        themeSelect.value = state.currentTheme;
    }

    function animateThemeChange() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = state.currentTheme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)';
        overlay.style.zIndex = '9999';
        overlay.style.pointerEvents = 'none';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 500ms ease';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                }, 500);
            }, 200);
        }, 10);
    }

    function toggleSound() {
        state.isSoundEnabled = !state.isSoundEnabled;
        soundToggle.classList.toggle('sound-muted', !state.isSoundEnabled);
        
        if (state.isSoundEnabled) {
            playKeySound('s');
        }
    }

    function toggleFullscreen() {
        if (!state.isFullscreen) {
            if (appContainer.requestFullscreen) {
                appContainer.requestFullscreen();
            } else if (appContainer.mozRequestFullScreen) {
                appContainer.mozRequestFullScreen();
            } else if (appContainer.webkitRequestFullscreen) {
                appContainer.webkitRequestFullscreen();
            } else if (appContainer.msRequestFullscreen) {
                appContainer.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }

    function handleFullscreenChange() {
        state.isFullscreen = !!document.fullscreenElement || 
                           !!document.mozFullScreenElement || 
                           !!document.webkitFullscreenElement || 
                           !!document.msFullscreenElement;
        
        appContainer.classList.toggle('fullscreen-mode', state.isFullscreen);
        
        updateUI();
        
        textEditor.focus();
    }

    function toggleFormatToolbar() {
        state.isToolbarVisible = !state.isToolbarVisible;
        formatToolbar.style.display = state.isToolbarVisible ? 'flex' : 'none';
    }

    function applyFormat(format) {
        document.execCommand('styleWithCSS', false, true);
        
        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'heading1':
                document.execCommand('formatBlock', false, '<h1>');
                break;
            case 'heading2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
        }
        
        textEditor.focus();
    }

    function openSaveDialog() {
        saveDialog.classList.add('active');
    }

    function closeSaveDialog() {
        saveDialog.classList.remove('active');
    }

    function saveDocument() {
        const filename = document.getElementById('filename').value || 'tiv-typer-document';
        const format = document.getElementById('fileformat').value;
        
        let content = '';
        let mimeType = '';
        let extension = '';
        
        if (format === 'txt') {
            content = textEditor.innerText || '';
            mimeType = 'text/plain';
            extension = '.txt';
        } else {
            content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            font-size: 16px;
        }
        h1, h2 {
            color: #2c7be5;
        }
        h1 {
            font-size: 1.75rem;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.5rem;
        }
        h2 {
            font-size: 1.4rem;
        }
        strong, b {
            color: #2c7be5;
        }
    </style>
</head>
<body>
    ${textEditor.innerHTML}
</body>
</html>`;
            mimeType = 'text/html';
            extension = '.html';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + extension;
        a.style.display = 'none';
        
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            closeSaveDialog();
        }, 100);
    }

    function handleGlobalKeyDown(e) {
        if (e.key === 'Escape' && state.isFullscreen) {
            toggleFullscreen();
        }
        
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                openSaveDialog();
            }
            
            if (e.key === 'b') {
                e.preventDefault();
                applyFormat('bold');
            }
            
            if (e.key === 'i') {
                e.preventDefault();
                applyFormat('italic');
            }
            
            if (e.key === 'f') {
                e.preventDefault();
                toggleFullscreen();
            }
        }
    }

    function updateUI() {
        formatToolbar.style.display = state.isToolbarVisible ? 'flex' : 'none';
    }

    updateUI();
});

function playKeySound(key) {
    const { audioContext, oscillator, envelopes } = window.KeySoundModule;
    
    let frequency;
    let modulationType;
    
    if ('aeiou'.includes(key.toLowerCase())) {
        // vowels - higher tone
        frequency = 520 + Math.random() * 20;
        modulationType = 'triangle';
    } else if (key === ' ' || key === 'Enter') {
        // space or enter - lower tone
        frequency = 220 + Math.random() * 20;
        modulationType = 'sine';
    } else if (key === 'Backspace') {
        // backspace - unique tone
        frequency = 330 + Math.random() * 20;
        modulationType = 'sawtooth';
    } else {
        frequency = 440 + Math.random() * 20;
        modulationType = 'sine';
    }
    
    const osc = audioContext.createOscillator();
    osc.type = modulationType;
    osc.frequency.value = frequency;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    
    osc.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
    
    // start and stop
    osc.start(now);
    osc.stop(now + 0.2);
}
