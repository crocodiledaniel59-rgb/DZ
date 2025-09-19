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
            currentOutputType: 'text/html',
            currentMode: 'bundle' // Mode default
        },

        init: function() {
            this.bindEvents();
            this.initializeParticles();
        },

        // Router untuk memilih aksi
        processAction: function() {
            switch (this.state.currentMode) {
                case 'bundle':
                    this.processAndBundle();
                    break;
                case 'encrypt':
                case 'decrypt':
                    this.processEncryptDecrypt(this.state.currentMode);
                    break;
            }
        },

        // Fungsi "Bungkus" (Self-Decrypting) dari kode Anda, dengan perbaikan keamanan
        processAndBundle: function() {
            const originalHtml = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!originalHtml) return alert('apanya yang mau di proses kalo gada input!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 6) return alert('Gunakan Secret Key yang lebih panjang (minimal 6 karakter) untuk keamanan!');

            try {
                // Keamanan: Kunci diacak agar tidak terlihat jelas
                const encodedKey = btoa(secretKey);
                const midPoint = Math.ceil(encodedKey.length / 2);
                const keyPart1 = encodedKey.substring(0, midPoint);
                const keyPart2_reversed = encodedKey.substring(midPoint).split('').reverse().join('');

                const encryptedContent = CryptoJS.AES.encrypt(originalHtml, secretKey).toString();
                const contentChunks = JSON.stringify(encryptedContent.match(/.{1,75}/g) || []);

                const unpackerScript = `(function(){const a=${contentChunks},x="${keyPart1}",y="${keyPart2_reversed}";try{const z=y.split('').reverse().join(''),k=atob(x+z),c=a.join(''),h=CryptoJS.AES.decrypt(c,k).toString(CryptoJS.enc.Utf8);if(!h)throw new Error();document.open();document.write(h);document.close();}catch(e){document.body.innerHTML='<h1>Gagal Memuat Konten.</h1>'}})();`;
                
                const finalHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>apa liat liat?</title><script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script></head><body><script>${unpackerScript}<\/script></body></html>`;
                
                this.state.currentOutputContent = finalHtml;
                this.state.currentOutputType = 'text/html';
                this.elements.outputArea.value = finalHtml;

                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                alert('Terjadi error saat enkripsi: ' + e.message);
            }
        },

        // Fungsi Enkripsi & Dekripsi yang ditambahkan kembali
        processEncryptDecrypt: function(mode) {
            const inputValue = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!inputValue) return alert('apanya yang mau di proses kalo gada input!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 6) return alert('Gunakan Secret Key yang lebih panjang (minimal 6 karakter) untuk keamanan!');

            try {
                let result = '';
                if (mode === 'encrypt') {
                    result = CryptoJS.AES.encrypt(inputValue, secretKey).toString();
                    this.state.currentOutputType = 'text/plain';
                } else { // decrypt
                    const bytes = CryptoJS.AES.decrypt(inputValue, secretKey);
                    result = bytes.toString(CryptoJS.enc.Utf8);
                    if (!result) throw new Error("Kunci salah atau data korup.");
                    this.state.currentOutputType = 'text/html';
                }

                this.state.currentOutputContent = result;
                this.elements.outputArea.value = result;

                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                alert('Terjadi error: ' + e.message);
                this.state.currentOutputContent = '';
                this.elements.outputArea.value = '';
            }
        },

        // Fungsi download yang menyesuaikan nama file berdasarkan mode
        downloadOutput: function() {
            if (!this.state.currentOutputContent) return alert('Tidak ada hasil untuk diunduh! Klik "PROSES" terlebih dahulu.');
            
            const blob = new Blob([this.state.currentOutputContent], { type: this.state.currentOutputType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            let filename = '';

            switch (this.state.currentMode) {
                case 'bundle':
                    filename = `DZ-protected-page-${Date.now()}.html`;
                    break;
                case 'encrypt':
                    filename = `DZ-encrypted-text-${Date.now()}.txt`;
                    break;
                case 'decrypt':
                    filename = `DZ-decrypted-page-${Date.now()}.html`;
                    break;
            }

            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // Memperbarui UI saat mode diganti
        updateMode: function() {
            this.state.currentMode = document.querySelector('input[name="mode"]:checked').value;
            const placeholders = {
                bundle: "Paste kode HTML untuk dibungkus...",
                encrypt: "Paste kode HTML untuk dienkripsi...",
                decrypt: "Paste teks terenkripsi untuk didekripsi..."
            };
            this.elements.inputArea.placeholder = placeholders[this.state.currentMode];
            this.elements.inputArea.value = '';
            this.elements.outputArea.value = '';
            this.state.currentOutputContent = '';
        },
        
        // Fungsi pendukung
        handleDragDrop: function(e) {
            e.preventDefault();
            this.elements.inputArea.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if ((this.state.currentMode === 'bundle' || this.state.currentMode === 'encrypt') && file.type !== "text/html") {
                    alert("only html ya bulshit🗿.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = (event) => { this.elements.inputArea.value = event.target.result; };
                reader.readAsText(file);
            }
        },
        
        initializeParticles: function() {
            particlesJS('particles-js', { "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } }, "retina_detect": true });
        },

        bindEvents: function() {
            this.elements.processBtn.addEventListener('click', this.processAction.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            this.elements.modeRadios.forEach(radio => radio.addEventListener('change', this.updateMode.bind(this)));
            this.elements.inputArea.addEventListener('dragover', (e) => { e.preventDefault(); this.elements.inputArea.classList.add('drag-over'); });
            this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over'));
            this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this));
        }
    };

    crypter.init();
});