// Ganti dengan URL dari HTTP Trigger Power Automate Anda
const powerAutomateUrl = "https://default9ec0d6c58a25418fb3841c77c55584.c2.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2212167e0b4644b095c71f413d64034d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Weaii9pe3fNhjuf89xGcLQx9GUGbsMvDgmAZE5P-ZGM";

let scannedBarcode = "";

// 1. Inisialisasi Scanner
const html5QrCode = new Html5Qrcode("reader");
const config = { 
    fps: 10, 
    qrbox: { width: 250, height: 150 },
    aspectRatio: 1.0 
};

// Fungsi saat scan berhasil
function onScanSuccess(decodedText) {
    scannedBarcode = decodedText;
    document.getElementById('scannedCode').innerText = decodedText;
    document.getElementById('resultArea').style.display = 'block';
    
    // Memberikan feedback getaran pada HP
    if (navigator.vibrate) navigator.vibrate(100);
}

// Menjalankan Kamera Belakang
html5QrCode.start(
    { facingMode: "environment" }, 
    config, 
    onScanSuccess
).catch(err => {
    console.error("Gagal akses kamera: ", err);
});

// 2. Fungsi Kirim Data ke Power Automate
document.getElementById('sendBtn').addEventListener('click', async () => {
    const nama = document.getElementById('namaScan').value;
    const store = document.getElementById('codeStore').value;
    const qty = document.getElementById('qtyScan').value;

    if (!nama || !store || !qty) {
        alert("Mohon isi semua data input terlebih dahulu!");
        return;
    }

    const payload = {
        nama_scan: nama,
        code_store: store,
        qty: parseInt(qty),
        barcode: scannedBarcode,
        timestamp: new Date().toLocaleString('id-ID')
    };

    try {
        const response = await fetch(powerAutomateUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert("Data Berhasil Terkirim ke Sistem!");
            // Reset form setelah sukses
            location.reload();
        } else {
            alert("Gagal mengirim data. Cek koneksi atau URL Flow.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Terjadi kesalahan teknis.");
    }
});