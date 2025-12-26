// app.js

// State Management
let currentSvgContent = "";
let currentFileName = "image.svg";

// DOM Elements
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const workspace = document.getElementById('workspace');
const previewContainer = document.getElementById('svg-preview-container');
const codeOutput = document.getElementById('code-output');
const filenameDisplay = document.getElementById('filename-display');
const errorMsg = document.getElementById('error-msg');
const errorText = document.getElementById('error-text');

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
});

// Keyboard Shortcut: Pressing 'Delete' clears the workspace
document.addEventListener('keydown', (e) => {
    const isEditing = document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA';
    
    if (currentSvgContent && !isEditing) {
        if (e.key === 'Delete') {
            e.preventDefault();
            resetApp();
        }
    }
});

// Drag and Drop Logic
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    const file = e.dataTransfer.files[0];
    handleFile(file);
});

dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// File Handling
function handleFile(file) {
    if (!file) return;
    
    if (file.type !== 'image/svg+xml' && !file.name.endsWith('.svg')) {
        showError("Invalid format. Please upload an SVG file.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        renderApp(content, file.name);
    };
    reader.onerror = () => showError("Error reading file.");
    reader.readAsText(file);
}

// Render Application
function renderApp(content, name) {
    currentSvgContent = content;
    currentFileName = name;

    errorMsg.classList.add('hidden');
    dropZone.classList.add('hidden-node');
    workspace.classList.remove('hidden-node');
    
    filenameDisplay.textContent = name;
    codeOutput.value = content;
    previewContainer.innerHTML = content;
    lucide.createIcons();
}

// Reset Application
function resetApp() {
    currentSvgContent = "";
    workspace.classList.add('hidden-node');
    dropZone.classList.remove('hidden-node');
    fileInput.value = "";
    previewContainer.innerHTML = "";
    codeOutput.value = "";
}

// Error Handling
function showError(msg) {
    errorText.textContent = msg;
    errorMsg.classList.remove('hidden');
}

// Copy to Clipboard
async function copyToClipboard() {
    const btn = document.getElementById('copy-btn');
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(currentSvgContent);
        } else {
            codeOutput.select();
            document.execCommand('copy');
        }
        
        const originalContent = btn.innerHTML;
        btn.classList.replace('bg-white/10', 'bg-green-600');
        btn.innerHTML = `<i data-lucide="check" class="w-3.5 h-3.5"></i> Copied`;
        lucide.createIcons();
        
        setTimeout(() => {
            btn.classList.replace('bg-green-600', 'bg-white/10');
            btn.innerHTML = originalContent;
            lucide.createIcons();
        }, 2000);
    } catch (err) {
        console.error('Copy failed', err);
    }
}

// Download SVG File
function downloadSvg() {
    const blob = new Blob([currentSvgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}