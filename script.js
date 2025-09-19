document.addEventListener('DOMContentLoaded', () => {
    const crypter = {
        elements: {
            secretKeyInput: document.getElementById('secret-key-input'),
            inputArea: document.getElementById('input-area'),
            outputArea: document.getElementById('output-area'),
            processBtn: document.getElementById('process-btn'),
            downloadBtn: document.getElementById('download-btn'),
        },
        state: {
            finalHtmlOutput: '' // Menyimpan seluruh string HTML yang akan di-download
        },

        init: function() {
            this.bindEvents();
            this.initializeParticles();
        },

        // --- LOGIKA INTI: ENKRIPSI DAN BUNGKUS OTOMATIS ---
        processAndBundle: function() {
            const originalHtml = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            // Validasi
            if (!originalHtml) return alert('Input HTML tidak boleh kosong!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 6) return alert('Gunakan Secret Key yang lebih panjang (minimal 6 karakter) untuk keamanan!');

            try {
                // 1. Enkripsi konten HTML asli
                const encryptedData = CryptoJS.AES.encrypt(originalHtml, secretKey).toString();

                // 2. Buat template "Unpacker" yang akan ditanam di file hasil.
                //    Template ini berisi data terenkripsi DAN kunci dekripsinya.
                //    Inilah bagian yang membuat file bisa mendekripsi diri sendiri.
                const unpackerScript = `
                    (function() {
                        // DATA TERENKRIPSI DAN KUNCI DEKRIPSI DITANAM DI SINI
                        const encryptedContent = "${encryptedData}";
                        const decryptionKey = "${secretKey}";

                        try {
                            // Dekripsi konten menggunakan kunci yang sudah tertanam
                            const bytes = CryptoJS.AES.decrypt(encryptedContent, decryptionKey);
                            const decryptedHtml = bytes.toString(CryptoJS.enc.Utf8);
                            
                            // Jika hasil dekripsi kosong, berarti ada yang salah
                            if (!decryptedHtml) { throw new Error('Decryption failed. Content might be corrupted.'); }

                            // Tulis ulang halaman dengan konten yang sudah didekripsi
                            document.open();
                            document.write(decryptedHtml);
                            document.close();
                        } catch (e) {
                            console.error("Decryption Error:", e);
                            document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50px;">Gagal Menampilkan Konten.</h1>';
                        }
                    })();
                `;
                
                // 3. Buat file HTML final yang akan diunduh
                //    File ini hanya berisi loader dan script unpacker.
                this.state.finalHtmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>apa liat liat?</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script>
</head>
<body>
    <script>
        ${unpackerScript}
    <\/script>
</body>
</html>`;
                
                // Menampilkan hasilnya di output area untuk dilihat
                this.elements.outputArea.value = this.state.finalHtmlOutput;

                // Efek visual
                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                alert('Terjadi error saat enkripsi: ' + e.message);
                console.error(e);
            }
        },

        // --- FUNGSI DOWNLOAD DENGAN NAMA FILE "DZ" ---
        downloadOutput: function() {
            if (!this.state.finalHtmlOutput) {
                return alert('Tidak ada hasil untuk diunduh! Klik "ENKRIPSI & BUNGKUS" terlebih dahulu.');
            }
            const blob = new Blob([this.state.finalHtmlOutput], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Format nama file sesuai permintaan
            a.download = `DZ-protected-page-${Date.now()}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // --- Fungsi pendukung lainnya (Drag/Drop, Particles) ---
        handleDragDrop: function(e) {
            e.preventDefault();
            this.elements.inputArea.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type === "text/html") {
                    const reader = new FileReader();
                    reader.onload = (event) => { this.elements.inputArea.value = event.target.result; };
                    reader.readAsText(file);
                } else {
                    alert("only html ya bulshit🗿.");
                }
            }
        },
        
        initializeParticles: function() {
            particlesJS('particles-js', {
                "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } }, "retina_detect": true
            });
        },

        bindEvents: function() {
            this.elements.processBtn.addEventListener('click', this.processAndBundle.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            
            this.elements.inputArea.addEventListener('dragover', (e) => { e.preventDefault(); this.elements.inputArea.classList.add('drag-over'); });
            this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over'));
            this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this));
        }
    };

    crypter.init();
});
