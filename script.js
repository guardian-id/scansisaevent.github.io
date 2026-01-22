// LINK MILIK BOS SUDAH SAYA MASUKKAN DI SINI
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
            scannedBarcode = decodedText;
            scannedCodeText.innerText = decodedText;
            resultArea.style.display = 'block';
            
            if (navigator.vibrate) navigator.vibrate(100);

            // Matikan kamera otomatis setelah dapat barcode
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

// 2. Fungsi Kirim Data & Terima Balasan
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
        // Biar user tau lagi proses, tombol kita ubah teksnya
        document.getElementById('sendBtn').innerText = "Sedang Mengirim...";
        document.getElementById('sendBtn').disabled = true;

        const response = await fetch(powerAutomateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // MENERIMA PESAN BALIK DARI POWER AUTOMATE
            const dataBalik = await response.json(); 
            
            // alert ini akan menampilkan pesan dari Flow (Response Body)
            alert("Berhasil! Pesan: " + (dataBalik.pesan || "Data Terkirim"));
            
            // Reset barcode dan qty saja
            scannedBarcode = "";
            resultArea.style.display = 'none';
            document.getElementById('qtyScan').value = "";
        } else {
            alert("Gagal kirim. Cek kembali koneksi atau setting Flow.");
        }
    } catch (error) {
        alert("Kesalahan koneksi internet.");
        console.error(error);
    } finally {
        // Kembalikan tombol ke semula
        document.getElementById('sendBtn').innerText = "Kirim Data";
        document.getElementById('sendBtn').disabled = false;
    }
});