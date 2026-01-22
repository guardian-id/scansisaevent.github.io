// GANTI DENGAN URL FLOW POWER AUTOMATE ANDA
const powerAutomateUrl = "https://default9ec0d6c58a25418fb3841c77c55584.c2.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2212167e0b4644b095c71f413d64034d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Weaii9pe3fNhjuf89xGcLQx9GUGbsMvDgmAZE5P-ZGM";

let scannedBarcode = "";
const html5QrCode = new Html5Qrcode("reader");

const startBtn = document.getElementById('startBtn');
const readerArea = document.getElementById('reader');
const resultArea = document.getElementById('resultArea');
const scannedCodeText = document.getElementById('scannedCode');

// 1. Fungsi Klik Tombol Aktifkan Kamera
startBtn.addEventListener('click', () => {
    readerArea.style.display = 'block';
    
    const config = { 
        fps: 10, 
        qrbox: { width: 250, height: 150 }
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (decodedText) => {
            // Jika scan berhasil
            scannedBarcode = decodedText;
            scannedCodeText.innerText = decodedText;
            resultArea.style.display = 'block';
            
            if (navigator.vibrate) navigator.vibrate(100);

            // Matikan kamera secara otomatis setelah scan berhasil
            stopCamera();
        }
    ).catch(err => {
        alert("Kamera tidak diizinkan atau tidak ditemukan.");
    });
});

function stopCamera() {
    html5QrCode.stop().then(() => {
        readerArea.style.display = 'none';
    }).catch(err => console.error(err));
}

// 2. Fungsi Kirim Data
document.getElementById('sendBtn').addEventListener('click', async () => {
    const nama = document.getElementById('namaScan').value;
    const store = document.getElementById('codeStore').value;
    const qty = document.getElementById('qtyScan').value;

    if (!nama || !store || !qty || !scannedBarcode) {
        alert("Mohon lengkapi Nama, Store, dan Scan Barcode!");
        return;
    }

    const payload = {
        nama_scan: nama,
        code_store: store,
        qty: parseInt(qty),
        barcode: scannedBarcode,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(powerAutomateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Berhasil Terkirim!");
            
            // RESET HANYA AREA BARCODE & QTY
            scannedBarcode = "";
            resultArea.style.display = 'none';
            document.getElementById('qtyScan').value = "1";
            
            // Nama & Store Code TIDAK direset agar bisa scan barang lain dengan cepat
        } else {
            alert("Gagal kirim. Cek URL Power Automate.");
        }
    } catch (error) {
        alert("Kesalahan koneksi internet.");
    }
});