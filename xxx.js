document.addEventListener('DOMContentLoaded', () => {
    const background = document.querySelector('.background-gradient');
    const firstCard = document.querySelector('.app-card');

    if (!firstCard) return;

    // Tambahkan atribut crossOrigin untuk menghindari masalah keamanan (CORS)
    // saat mengambil warna dari gambar yang di-host di domain lain.
    const firstIcon = firstCard.querySelector('.app-icon');
    firstIcon.crossOrigin = "Anonymous";

    const colorThief = new ColorThief();

    const setBackgroundColor = (imgElement) => {
        // Pastikan gambar sudah dimuat
        if (imgElement.complete) {
            try {
                const dominantColor = colorThief.getColor(imgElement);
                const palette = colorThief.getPalette(imgElement, 2);
                
                const color1 = `rgb(${dominantColor.join(',')})`;
                // Ambil warna kedua dari palet, atau gunakan warna dominan jika tidak ada
                const color2 = palette[1] ? `rgb(${palette[1].join(',')})` : color1;

                background.style.background = `linear-gradient(45deg, ${color1}, ${color2})`;
            } catch (e) {
                console.error("Error saat mengambil warna:", e);
                // Fallback jika terjadi error
                background.style.background = `linear-gradient(45deg, #232526, #414345)`;
            }
        } else {
            // Jika gambar belum dimuat, tunggu sampai selesai
            imgElement.addEventListener('load', () => {
                setBackgroundColor(imgElement);
            });
        }
    };

    setBackgroundColor(firstIcon);
});