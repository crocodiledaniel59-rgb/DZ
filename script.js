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
            this.initializeParticles();
        },

        processAndBundle: function() {
            let originalHtml = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!originalHtml) return alert('apanya yang mau di proses kalo gada input!');
            if (!secretKey) return alert('Secret Key tidak boleh kosong!');
            if (secretKey.length < 6) return alert('Gunakan Secret Key yang lebih panjang (minimal 6 karakter) untuk keamanan!');

            try {
                let manifestLink = '';
                let swScript = '';

                const manifestRegex = /<link\s+rel="manifest"[^>]*>/i;
                const manifestMatch = originalHtml.match(manifestRegex);
                if (manifestMatch) {
                    manifestLink = manifestMatch[0];
                    originalHtml = originalHtml.replace(manifestRegex, ''); 
                }

                const swRegex = /<script>([\s\S]*?navigator\.serviceWorker\.register[\s\S]*?)<\/script>/i;
                const swMatch = originalHtml.match(swRegex);
                if (swMatch) {
                    swScript = swMatch[0].replace(/<\/script>/i, '<\\/script>');
                    originalHtml = originalHtml.replace(swRegex, '');
                }

                const encodedKey = btoa(secretKey);
                const midPoint = Math.ceil(encodedKey.length / 2);
                const keyPart1 = encodedKey.substring(0, midPoint);
                const keyPart2_reversed = encodedKey.substring(midPoint).split('').reverse().join('');
                const encryptedContent = CryptoJS.AES.encrypt(originalHtml, secretKey).toString();
                const contentChunks = JSON.stringify(encryptedContent.match(/.{1,75}/g) || []);

                let unpackerScript = `(function(){const a=${contentChunks};const x="${keyPart1}";const y="${keyPart2_reversed}";try{const z=y.split('').reverse().join('');const k=atob(x+z);const c=a.join('');const h=CryptoJS.AES.decrypt(c,k).toString(CryptoJS.enc.Utf8);if(!h)throw new Error();document.open();document.write(h);document.close();}catch(e){document.body.innerHTML='<h1>Gagal Memuat Konten.</h1>';}})();`;
                
                const minifiedUnpacker = unpackerScript.replace(/\s+/g, ' ').trim();

                this.state.finalHtmlOutput = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>apa liat liat?</title>
    ${manifestLink}
    <script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script>
</head>
<body>
    <script>${minifiedUnpacker}<\/script>
    ${swScript}
</body>
</html>`;
                
                this.elements.outputArea.value = this.state.finalHtmlOutput;
                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) {
                alert('Terjadi error saat enkripsi: ' + e.message);
                console.error(e);
            }
        },

        downloadOutput: function() {
            if (!this.state.finalHtmlOutput) return alert('Tidak ada hasil untuk diunduh! Klik "ENKRIPSI & BUNGKUS" terlebih dahulu.');
            const blob = new Blob([this.state.finalHtmlOutput], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DZ-protected-page-${Date.now()}.html`;
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
                    reader.onload = (event) => { this.elements.inputArea.value = event.target.result; };
                    reader.readAsText(file);
                } else {
                    alert("only html ya bulshit🗿.");
                }
            }
        },
        
        initializeParticles: function() {
            particlesJS('particles-js', { "particles": { "number": { "value": 80, "density": { "enable": true, "value_area": 800 } }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "line_linked": { "enable": false }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "straight": false, "out_mode": "out", "bounce": false } }, "interactivity": { "detect_on": "canvas", "events": { "onhover": { "enable": false }, "onclick": { "enable": false } } }, "retina_detect": true });
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
            
