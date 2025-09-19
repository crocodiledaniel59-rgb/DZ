document.addEventListener('DOMContentLoaded', () => {
    const crypter = {
        elements: {
            secretKeyInput: document.getElementById('secret-key-input'),
            inputArea: document.getElementById('input-area'),
            outputArea: document.getElementById('output-area'),
            processBtn: document.getElementById('process-btn'),
            downloadBtn: document.getElementById('download-btn'),
            modeRadios: document.querySelectorAll('input[name="mode"]'),
        },
        state: {
            currentOutputContent: '',
            currentOutputType: '',
            currentMode: 'encrypt' // Mode default
        },

        init: function() {
            this.bindEvents();
            this.initializeParticles();
        },

        // --- Logika Inti Crypter ---
        processAction: function() {
            const inputValue = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!inputValue) return alert('Input tidak boleh kosong!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 8) return alert('Gunakan Secret Key yang lebih panjang (minimal 8 karakter) untuk keamanan!');
            
            try {
                let result = '';
                if (this.state.currentMode === 'encrypt') {
                    // 1. Enkripsi Teks
                    result = CryptoJS.AES.encrypt(inputValue, secretKey).toString();
                    this.state.currentOutputType = 'text/plain';
                    this.elements.outputArea.placeholder = "Hasil enkripsi (teks)...";

                } else { // Mode 'decrypt'
                    // 2. Dekripsi Teks
                    const bytes = CryptoJS.AES.decrypt(inputValue, secretKey);
                    result = bytes.toString(CryptoJS.enc.Utf8);
                    
                    if (!result) {
                        throw new Error("Kunci salah atau data korup. Gagal mendekripsi.");
                    }
                    this.state.currentOutputType = 'text/html';
                    this.elements.outputArea.placeholder = "Hasil dekripsi (HTML)...";
                }

                this.state.currentOutputContent = result;
                this.elements.outputArea.value = result;

                // Efek visual
                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                alert('Terjadi error: ' + e.message);
                console.error(e);
                this.elements.outputArea.value = '';
                this.state.currentOutputContent = '';
            }
        },

        // --- Fitur Tambahan ---
        downloadOutput: function() {
            if (!this.state.currentOutputContent) {
                return alert('Tidak ada hasil untuk diunduh! Klik "PROSES" terlebih dahulu.');
            }

            const blob = new Blob([this.state.currentOutputContent], { type: this.state.currentOutputType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            // Atur nama file sesuai mode
            const timestamp = Date.now();
            let filename = '';
            if (this.state.currentMode === 'encrypt') {
                filename = `DZ-hasil-enkripsi-${timestamp}.txt`;
            } else {
                filename = `DZ-hasil-dekripsi-${timestamp}.html`;
            }

            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        handleDragDrop: function(e) {
            e.preventDefault();
            this.elements.inputArea.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.elements.inputArea.value = event.target.result;
                };
                reader.readAsText(file);
            }
        },

        updateMode: function() {
            this.state.currentMode = document.querySelector('input[name="mode"]:checked').value;
            // Ganti placeholder untuk memberi petunjuk kepada pengguna
            if (this.state.currentMode === 'encrypt') {
                this.elements.inputArea.placeholder = "Paste kode HTML Anda di sini...";
            } else {
                this.elements.inputArea.placeholder = "Paste teks terenkripsi Anda di sini...";
            }
        },
        
        // --- Inisialisasi Partikel ---
        initializeParticles: function() {
            particlesJS('particles-js', {
                "particles": {
                    "number": { "value": 80, "density": { "enable": true, "value_area": 800 } },
                    "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] },
                    "shape": { "type": "circle" },
                    "opacity": { "value": 0.4, "random": true },
                    "size": { "value": 4, "random": true },
                    "line_linked": { "enable": false },
                    "move": {
                        "enable": true, "speed": 1, "direction": "top", "random": true,
                        "straight": false, "out_mode": "out", "bounce": false
                    }
                },
                "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } },
                "retina_detect": true
            });
        },

        // --- Event Binding ---
        bindEvents: function() {
            this.elements.processBtn.addEventListener('click', this.processAction.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            
            this.elements.modeRadios.forEach(radio => {
                radio.addEventListener('change', this.updateMode.bind(this));
            });

            // Drag & Drop
            this.elements.inputArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.inputArea.classList.add('drag-over');
            });
            this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over'));
            this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this));
        }
    };

    crypter.init();
});
