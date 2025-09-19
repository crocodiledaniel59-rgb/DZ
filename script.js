document.addEventListener('DOMContentLoaded', () => {
    // OBJEK UTAMA APLIKASI
    const crypter = {
        // --- Kumpulan Elemen HTML ---
        elements: {
            secretKeyInput: document.getElementById('secret-key-input'),
            inputArea: document.getElementById('input-area'),
            outputArea: document.getElementById('output-area'),
            processBtn: document.getElementById('process-btn'),
            downloadBtn: document.getElementById('download-btn'),
            modeRadios: document.querySelectorAll('input[name="mode"]'),
        },
        // --- Penyimpanan Status Aplikasi ---
        state: {
            currentOutputContent: '',
            currentOutputType: '',
            currentMode: 'encrypt' // Mode default saat pertama kali dibuka
        },

        // --- Fungsi Inisialisasi ---
        init: function() {
            this.bindEvents();
            this.initializeParticles();
        },

        // --- LOGIKA INTI YANG BARU (ENKRIPSI / DEKRIPSI) ---
        // PERHATIKAN: Fungsi ini menggantikan 'processAndBundle' yang lama.
        // TIDAK ADA LAGI PEMBUATAN FILE OTOMATIS DENGAN 'PROMPT'.
        processAction: function() {
            const inputValue = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            // Validasi input
            if (!inputValue) return alert('code yang mau di enkripsi mana woi!');
            if (!secretKey) return alert('kunci rahasianya isi dulu!');
            if (secretKey.length < 6) return alert('Gunakan Secret Key yang lebih panjang (minimal 6 karakter) untuk keamanan!');
            
            try {
                let result = '';
                // Jika mode 'encrypt' dipilih
                if (this.state.currentMode === 'encrypt') {
                    // Hanya mengubah HTML menjadi teks terenkripsi
                    result = CryptoJS.AES.encrypt(inputValue, secretKey).toString();
                    this.state.currentOutputType = 'text/plain';
                
                // Jika mode 'decrypt' dipilih
                } else { 
                    // Mengubah teks terenkripsi kembali menjadi HTML
                    const bytes = CryptoJS.AES.decrypt(inputValue, secretKey);
                    result = bytes.toString(CryptoJS.enc.Utf8);
                    
                    // Jika hasil dekripsi kosong, berarti kunci salah
                    if (!result) {
                        throw new Error("Kunci salah atau data korup. Gagal mendekripsi.");
                    }
                    this.state.currentOutputType = 'text/html';
                }

                // Simpan hasil ke state dan tampilkan di output area
                this.state.currentOutputContent = result;
                this.elements.outputArea.value = result;

                // Efek visual sederhana untuk menandakan proses selesai
                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                // Tangani error jika terjadi (misal: kunci salah)
                alert('Terjadi error: ' + e.message);
                console.error(e);
                this.elements.outputArea.value = ''; // Kosongkan output jika gagal
                this.state.currentOutputContent = '';
            }
        },

        // --- FUNGSI DOWNLOAD YANG SUDAH DIPERBAIKI ---
        downloadOutput: function() {
            if (!this.state.currentOutputContent) {
                return alert('apanya yang mau di download? Klik "PROSES" dulu wok🗿.');
            }

            const blob = new Blob([this.state.currentOutputContent], { type: this.state.currentOutputType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            const timestamp = Date.now();
            let filename = '';
            
            // Logika penamaan file dengan inisial "DZ"
            if (this.state.currentMode === 'encrypt') {
                // Hasil enkripsi disimpan sebagai .txt
                filename = `DZ-hasil-enkripsi-${timestamp}.txt`;
            } else {
                // Hasil dekripsi disimpan sebagai .html
                filename = `DZ-hasil-dekripsi-${timestamp}.html`;
            }

            a.href = url;
            a.download = filename; // Menggunakan nama file yang sudah dibuat
            document.body.appendChild(a);
            a.click(); // Otomatis klik link untuk download
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        // --- Fungsi pendukung lainnya tetap sama ---
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
            if (this.state.currentMode === 'encrypt') {
                this.elements.inputArea.placeholder = "Paste kode HTML lu di sini...";
            } else {
                this.elements.inputArea.placeholder = "Paste code terenkripsi lu di sini...";
            }
            // Kosongkan area saat mode diganti
            this.elements.inputArea.value = '';
            this.elements.outputArea.value = '';
            this.state.currentOutputContent = '';
        },
        
        initializeParticles: function() {
            particlesJS('particles-js', {
                "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } }, "retina_detect": true
            });
        },

        bindEvents: function() {
            this.elements.processBtn.addEventListener('click', this.processAction.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            
            this.elements.modeRadios.forEach(radio => {
                radio.addEventListener('change', this.updateMode.bind(this));
            });

            this.elements.inputArea.addEventListener('dragover', (e) => { e.preventDefault(); this.elements.inputArea.classList.add('drag-over'); });
            this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over'));
            this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this));
        }
    };

    // Jalankan aplikasi
    crypter.init();
});
