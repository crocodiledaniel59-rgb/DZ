document.addEventListener('DOMContentLoaded', () => {
    const crypter = {
        // ... elemen & state ...
        elements: { /* ... sama seperti sebelumnya ... */ },
        state: { finalHtmlOutput: '' },
        
        init: function() { /* ... sama seperti sebelumnya ... */ },

        processAndBundle: function() {
            const originalHtml = this.elements.inputArea.value;
            const secretKey = this.elements.secretKeyInput.value;

            if (!originalHtml) return alert('apanya yang mau di proses kalo gada input!');
            if (!secretKey || secretKey.length < 6) return alert('Secret Key minimal 6 karakter!');

            try {
                // INI ADALAH MESIN PENGACAK KUNCI
                const encodedKey = btoa(secretKey);
                const midPoint = Math.ceil(encodedKey.length / 2);
                const keyPart1 = encodedKey.substring(0, midPoint);
                const keyPart2_reversed = encodedKey.substring(midPoint).split('').reverse().join('');

                const encryptedContent = CryptoJS.AES.encrypt(originalHtml, secretKey).toString();
                const contentChunks = JSON.stringify(encryptedContent.match(/.{1,75}/g) || []);

                const unpackerScript = `(function(){const a=${contentChunks},x="${keyPart1}",y="${keyPart2_reversed}";try{const z=y.split('').reverse().join(''),k=atob(x+z),c=a.join(''),h=CryptoJS.AES.decrypt(c,k).toString(CryptoJS.enc.Utf8);if(!h)throw new Error();document.open();document.write(h);document.close()}catch(e){document.body.innerHTML='<h1>Gagal Memuat Konten.</h1>'}})();`;
                
                const finalHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>apa liat liat?</title><script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"><\/script></head><body><script>${unpackerScript}<\/script></body></html>`;
                
                this.state.finalHtmlOutput = finalHtml;
                this.elements.outputArea.value = finalHtml;
                this.elements.outputArea.classList.add('show');
                setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);

            } catch (e) { alert('Terjadi error saat enkripsi: ' + e.message); }
        },

        downloadOutput: function() { /* ... sama seperti sebelumnya ... */ },
        handleDragDrop: function(e) { /* ... sama seperti sebelumnya ... */ },
        initializeParticles: function() { /* ... sama seperti sebelumnya ... */ },
        bindEvents: function() { /* ... sama seperti sebelumnya ... */ }
    };
    
    // Implementasi fungsi-fungsi helper yang disingkat
    crypter.elements = { secretKeyInput: document.getElementById('secret-key-input'), inputArea: document.getElementById('input-area'), outputArea: document.getElementById('output-area'), processBtn: document.getElementById('process-btn'), downloadBtn: document.getElementById('download-btn') };
    crypter.init = function() { this.bindEvents(); this.initializeParticles(); };
    crypter.downloadOutput = function() { if (!this.state.finalHtmlOutput) return alert('Tidak ada hasil untuk diunduh!'); const blob = new Blob([this.state.finalHtmlOutput], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `DZ-protected-page-${Date.now()}.html`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
    crypter.handleDragDrop = function(e) { e.preventDefault(); this.elements.inputArea.classList.remove('drag-over'); if (e.dataTransfer.files[0] && e.dataTransfer.files[0].type === "text/html") { const reader = new FileReader(); reader.onload = (event) => { this.elements.inputArea.value = event.target.result; }; reader.readAsText(e.dataTransfer.files[0]); } else { alert("only html ya bulshit🗿."); }};
    crypter.initializeParticles = function() { particlesJS('particles-js', { "particles": { "number": { "value": 80 }, "color": { "value": ["#ff4747", "#ffc447", "#47ff7e", "#47d1ff", "#ff47e1"] }, "shape": { "type": "circle" }, "opacity": { "value": 0.4, "random": true }, "size": { "value": 4, "random": true }, "move": { "enable": true, "speed": 1, "direction": "top", "random": true, "out_mode": "out" } }, "retina_detect": true }); };
    crypter.bindEvents = function() { this.elements.processBtn.addEventListener('click', this.processAndBundle.bind(this)); this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this)); this.elements.inputArea.addEventListener('dragover', (e) => { e.preventDefault(); this.elements.inputArea.classList.add('drag-over'); }); this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over')); this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this)); };
    
    crypter.init();
});
