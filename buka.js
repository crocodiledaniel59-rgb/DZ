document.addEventListener('DOMContentLoaded', () => {
    const decrypter = {
        elements: {
            fileInput: document.getElementById('file-input'),
            secretKeyInput: document.getElementById('secret-key-input'),
            processBtn: document.getElementById('process-btn'),
            outputArea: document.getElementById('output-area'),
            fileInputLabel: document.querySelector('label[for="file-input"]')
        },

        init: function() {
            this.bindEvents();
            this.initializeParticles();
        },

        processFile: function() {
            const file = this.elements.fileInput.files[0];
            const secretKey = this.elements.secretKeyInput.value;

            if (!file) return alert('Pilih file HTML terlebih dahulu!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');

            const reader = new FileReader();
            reader.onload = (event) => {
                const fileContent = event.target.result;

                try {
                    // 1. Ekstrak data terenkripsi dan kunci yang diacak dari file
                    const dataRegex = /const a=(\[.*?\])/;
                    const keyXRegex = /x="(.*?)"/;
                    const keyYRegex = /y="(.*?)"/;

                    const dataMatch = fileContent.match(dataRegex);
                    const keyXMatch = fileContent.match(keyXRegex);
                    const keyYMatch = fileContent.match(keyYRegex);

                    if (!dataMatch || !keyXMatch || !keyYMatch) {
                        throw new Error("File tidak valid atau format tidak dikenali.");
                    }

                    const extractedChunks = JSON.parse(dataMatch[1]);
                    const extractedKeyPart1 = keyXMatch[1];
                    const extractedKeyPart2_reversed = keyYMatch[1];

                    // 2. Lakukan proses pengacakan yang SAMA pada kunci yang dimasukkan pengguna
                    const encodedUserKey = btoa(secretKey);
                    const midPoint = Math.ceil(encodedUserKey.length / 2);
                    const userKeyPart1 = encodedUserKey.substring(0, midPoint);
                    const userKeyPart2_reversed = encodedUserKey.substring(midPoint).split('').reverse().join('');

                    // 3. Verifikasi: Bandingkan kunci yang diacak dari file dengan hasil acakan kunci pengguna
                    if (userKeyPart1 !== extractedKeyPart1 || userKeyPart2_reversed !== extractedKeyPart2_reversed) {
                        throw new Error("Secret Key salah!");
                    }

                    // 4. Jika kunci cocok, lanjutkan dekripsi
                    const encryptedContent = extractedChunks.join('');
                    const bytes = CryptoJS.AES.decrypt(encryptedContent, secretKey);
                    const decryptedHtml = bytes.toString(CryptoJS.enc.Utf8);

                    if (!decryptedHtml) {
                        throw new Error("Dekripsi gagal. Konten mungkin rusak.");
                    }
                    
                    this.elements.outputArea.value = decryptedHtml;
                    this.elements.outputArea.classList.add('show');
                    setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

                } catch (e) {
                    alert('Error: ' + e.message);
                    this.elements.outputArea.value = '';
                }
            };
            reader.readAsText(file);
        },
        
        // ... fungsi pendukung ...
    };

    // Implementasi fungsi pendukung
    decrypter.initializeParticles = function() { /* ... salin dari kode sebelumnya ... */ };
    decrypter.bindEvents = function() {
        this.elements.processBtn.addEventListener('click', this.processFile.bind(this));
        this.elements.fileInput.addEventListener('change', () => {
            if (this.elements.fileInput.files.length > 0) {
                this.elements.fileInputLabel.textContent = this.elements.fileInput.files[0].name;
            } else {
                this.elements.fileInputLabel.textContent = 'Pilih File .html...';
            }
        });
    };
    decrypter.initializeParticles = function() { particlesJS('particles-js', { "particles": { "number": { "value": 80 }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "out_mode": "out" } }, "retina_detect": true }); };
    
    decrypter.init();
});
