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
            finalHtmlOutput: ''
        },

        init: function() {
            this.bindEvents();
        },

        // --- Logika Inti Crypter ---
        processAndBundle: function() {
            const originalHtml = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!originalHtml) return alert('Input HTML tidak boleh kosong!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 8) return alert('Gunakan Secret Key yang lebih panjang (minimal 8 karakter) untuk keamanan!');

            try {
                // 1. Enkripsi HTML asli menggunakan AES
                const encrypted = CryptoJS.AES.encrypt(originalHtml, secretKey).toString();

                // 2. Buat template "Unpacker"
                //    Kita akan menyuntikkan data terenkripsi ke dalam template ini.
                //    Template ini didesain agar sulit dibaca (minified).
                const unpackerTemplate = `
                    (function(){
                        try {
                            const p = "${encrypted}";
                            const k = prompt("Masukkan kunci untuk melihat konten:");
                            if (!k) throw new Error("Akses ditolak.");
                            const b = CryptoJS.AES.decrypt(p, k);
                            const d = b.toString(CryptoJS.enc.Utf8);
                            if (!d) throw new Error("Kunci salah.");
                            document.open();
                            document.write(d);
                            document.close();
                        } catch(e) {
                            document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:50px;">Akses Ditolak: Kunci Salah atau Konten Rusak.</h1>';
                        }
                    })();
                `;
                
                // 3. Buat file HTML final yang akan diunduh
                this.state.finalHtmlOutput = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Konten Terlindungi</title>
    <!-- Library Crypto-JS wajib ada untuk mendekripsi -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script>
</head>
<body>
    <script>
        ${unpackerTemplate}
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

        // --- Fitur Tambahan ---
        downloadOutput: function() {
            if (!this.state.finalHtmlOutput) {
                return alert('Tidak ada hasil untuk diunduh! Klik "ENCRYPT & BUNDLE" terlebih dahulu.');
            }
            const blob = new Blob([this.state.finalHtmlOutput], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `protected-page-${Date.now()}.html`;
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
                if (file.type === "text/html") {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        this.elements.inputArea.value = event.target.result;
                    };
                    reader.readAsText(file);
                } else {
                    alert("Hanya file .html yang didukung untuk di-drag & drop.");
                }
            }
        },

        // --- Event Binding ---
        bindEvents: function() {
            this.elements.processBtn.addEventListener('click', this.processAndBundle.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            
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
