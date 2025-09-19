document.addEventListener('DOMContentLoaded', () => {
    const app = {
        elements: {
            loginShell: document.getElementById('login-shell'),
            registerShell: document.getElementById('register-shell'),
            appShell: document.getElementById('app-shell'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            showRegister: document.getElementById('showRegister'),
            showLogin: document.getElementById('showLogin'),
            logoutBtn: document.getElementById('logoutBtn'),
            loggedInUser: document.getElementById('loggedInUser'),
            encryptModeBtn: document.getElementById('encrypt-mode-btn'),
            decryptModeBtn: document.getElementById('decrypt-mode-btn'),
            algorithmSelect: document.getElementById('algorithm-select'),
            secretKeyWrapper: document.getElementById('secret-key-wrapper'),
            secretKeyInput: document.getElementById('secret-key-input'),
            inputArea: document.getElementById('input-area'),
            outputArea: document.getElementById('output-area'),
            copyBtn: document.getElementById('copy-btn'),
            downloadBtn: document.getElementById('download-btn'),
        },
        state: {
            mode: 'encrypt',
            algorithm: 'base64',
            currentUser: null,
            users: {}
        },

        init: function() {
            this.loadUsers();
            this.checkSession();
            this.bindEvents();
        },

        loadUsers: function() {
            const usersData = localStorage.getItem('playground_users');
            this.state.users = usersData ? JSON.parse(usersData) : {};
        },
        saveUsers: function() {
            localStorage.setItem('playground_users', JSON.stringify(this.state.users));
        },
        checkSession: function() {
            const lastUser = localStorage.getItem('playground_session');
            if (lastUser && this.state.users[lastUser]) {
                this.state.currentUser = lastUser;
                this.showApp();
            } else {
                this.showLogin();
            }
        },
        handleLogin: function(e) {
            e.preventDefault();
            // PERBAIKAN: Mengambil nilai langsung dari ID, lebih andal.
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;

            if (this.state.users[user] && this.state.users[user].password === pass) {
                this.state.currentUser = user;
                localStorage.setItem('playground_session', user);
                this.showApp();
            } else {
                alert('Username atau password salah!');
            }
        },
        handleRegister: function(e) {
            e.preventDefault();
            // PERBAIKAN: Mengambil nilai langsung dari ID.
            const user = document.getElementById('reg-user').value.trim();
            const pass = document.getElementById('reg-pass').value;

            if (user.length < 3) return alert('Username minimal 3 karakter.');
            if (pass.length < 4) return alert('Password minimal 4 karakter.');
            if (this.state.users[user]) return alert('Username sudah digunakan!');
            
            this.state.users[user] = { password: pass, secretKey: '' };
            this.saveUsers();
            alert('Registrasi berhasil! Silakan login.');
            this.showLogin();
        },
        handleLogout: function() {
            this.state.currentUser = null;
            localStorage.removeItem('playground_session');
            // PERBAIKAN: Membersihkan form saat logout.
            document.getElementById('login-user').value = '';
            document.getElementById('login-pass').value = '';
            this.showLogin();
        },

        showLogin: function() {
            this.elements.registerShell.classList.add('hidden');
            this.elements.appShell.classList.add('hidden');
            this.elements.loginShell.classList.remove('hidden');
        },
        showRegister: function() {
            this.elements.loginShell.classList.add('hidden');
            this.elements.appShell.classList.add('hidden');
            this.elements.registerShell.classList.remove('hidden');
        },
        showApp: function() {
            this.elements.loginShell.classList.add('hidden');
            this.elements.registerShell.classList.add('hidden');
            this.elements.appShell.classList.remove('hidden');
            this.elements.loggedInUser.textContent = this.state.currentUser;
            // PERBAIKAN: Memastikan secret key di-load dengan benar untuk user saat ini.
            this.elements.secretKeyInput.value = this.state.users[this.state.currentUser]?.secretKey || '';
            this.updateUIForAlgorithm();
        },
        updateUIForAlgorithm: function() {
            this.state.algorithm = this.elements.algorithmSelect.value;
            this.elements.secretKeyWrapper.classList.toggle('hidden', this.state.algorithm !== 'aes');
            this.processText();
        },
        setMode: function(mode) {
            this.state.mode = mode;
            this.elements.encryptModeBtn.classList.toggle('bg-red-500', mode === 'encrypt');
            this.elements.encryptModeBtn.classList.toggle('text-white', mode === 'encrypt');
            this.elements.decryptModeBtn.classList.toggle('bg-red-500', mode === 'decrypt');
            this.elements.decryptModeBtn.classList.toggle('text-white', mode === 'decrypt');
            this.processText();
        },

        processText: function() {
            const input = this.elements.inputArea.value;
            const key = this.elements.secretKeyInput.value;
            let output = '';

            if (!input) {
                this.elements.outputArea.value = '';
                return;
            }
            if (this.state.algorithm === 'aes' && !key) {
                this.elements.outputArea.value = 'ERROR: Secret Key dibutuhkan untuk enkripsi/dekripsi AES.';
                return;
            }

            try {
                if (this.state.mode === 'encrypt') {
                    switch(this.state.algorithm) {
                        case 'base64': output = btoa(unescape(encodeURIComponent(input))); break; // PERBAIKAN: Menangani karakter non-ASCII
                        case 'aes': output = CryptoJS.AES.encrypt(input, key).toString(); break;
                        case 'rot13': output = this.rot13(input); break;
                    }
                } else { // Decrypt
                    switch(this.state.algorithm) {
                        case 'base64': output = decodeURIComponent(escape(atob(input))); break; // PERBAIKAN: Menangani karakter non-ASCII
                        case 'aes':
                            const bytes = CryptoJS.AES.decrypt(input, key);
                            output = bytes.toString(CryptoJS.enc.Utf8);
                            if (!output) throw new Error("Decryption failed");
                            break;
                        case 'rot13': output = this.rot13(input); break;
                    }
                }
            } catch (e) {
                output = 'ERROR: Input tidak valid untuk dekripsi. (Pastikan key benar atau data tidak rusak)';
            }
            
            this.elements.outputArea.value = output;
            this.elements.outputArea.classList.add('show');
            setTimeout(() => this.elements.outputArea.classList.remove('show'), 500);
        },
        rot13: function(s) {
            return s.replace(/[a-zA-Z]/g, function(c) {
                return String.fromCharCode((c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
            });
        },

        copyOutput: function() {
            if (!this.elements.outputArea.value || this.elements.outputArea.value.startsWith('ERROR:')) {
                return alert('Tidak ada hasil valid untuk disalin!');
            }
            navigator.clipboard.writeText(this.elements.outputArea.value);
            alert('Hasil berhasil disalin ke clipboard!');
        },
        downloadOutput: function() {
            if (!this.elements.outputArea.value || this.elements.outputArea.value.startsWith('ERROR:')) {
                return alert('Tidak ada hasil valid untuk diunduh!');
            }
            const blob = new Blob([this.elements.outputArea.value], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `output-${this.state.algorithm}.txt`;
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
                    this.processText();
                };
                reader.readAsText(file);
            }
        },

        bindEvents: function() {
            this.elements.loginForm.addEventListener('submit', this.handleLogin.bind(this));
            this.elements.registerForm.addEventListener('submit', this.handleRegister.bind(this));
            this.elements.showRegister.addEventListener('click', (e) => { e.preventDefault(); this.showRegister(); });
            this.elements.showLogin.addEventListener('click', (e) => { e.preventDefault(); this.showLogin(); });
            this.elements.logoutBtn.addEventListener('click', this.handleLogout.bind(this));
            this.elements.encryptModeBtn.addEventListener('click', () => this.setMode('encrypt'));
            this.elements.decryptModeBtn.addEventListener('click', () => this.setMode('decrypt'));
            this.elements.algorithmSelect.addEventListener('change', this.updateUIForAlgorithm.bind(this));
            this.elements.secretKeyInput.addEventListener('input', (e) => {
                this.state.users[this.state.currentUser].secretKey = e.target.value;
                this.saveUsers();
                this.processText();
            });
            this.elements.inputArea.addEventListener('input', this.processText.bind(this));
            this.elements.copyBtn.addEventListener('click', this.copyOutput.bind(this));
            this.elements.downloadBtn.addEventListener('click', this.downloadOutput.bind(this));
            this.elements.inputArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                this.elements.inputArea.classList.add('drag-over');
            });
            this.elements.inputArea.addEventListener('dragleave', () => this.elements.inputArea.classList.remove('drag-over'));
            this.elements.inputArea.addEventListener('drop', this.handleDragDrop.bind(this));
        }
    };

    app.init();
});