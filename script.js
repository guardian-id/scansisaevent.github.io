const powerAutomateUrl = "https://default9ec0d6c58a25418fb3841c77c55584.c2.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2212167e0b4644b095c71f413d64034d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Weaii9pe3fNhjuf89xGcLQx9GUGbsMvDgmAZE5P-ZGM";

// Buat variabel scanner di luar agar bisa diakses secara global
let html5QrcodeScanner = new Html5QrcodeScanner(
    "reader", 
    { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0 
    }
);

function onScanSuccess(decodedText, decodedResult) {
    const namaInput = document.getElementById('pemeriksa').value;
    const statusDiv = document.getElementById('status');
    
    if (!namaInput) {
        alert("PENTING: Isi nama Anda sebelum melakukan scan!");
        return; 
    }

    // Berhenti scan agar tidak mengirim data berkali-kali untuk 1 barcode
    html5QrcodeScanner.pause(true); 
    
    statusDiv.innerText = "Mengirim data ke sistem...";
    statusDiv.style.color = "orange";

    const dataToSend = {
        nama: namaInput,
        barcode: decodedText
    };

    fetch(powerAutomateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend)
    })
    .then(response => {
        if (response.ok) {
            statusDiv.innerText = `✅ Berhasil! Terkirim: ${decodedText}`;
            statusDiv.style.color = "green";
        } else {
            statusDiv.innerText = "❌ Gagal mengirim.";
            statusDiv.style.color = "red";
        }
        
        // LANJUTKAN SCAN TANPA REFRESH
        // Kita beri jeda 2 detik agar user bisa melihat status sukses
        setTimeout(() => {
            statusDiv.innerText = "Siap memindai berikutnya...";
            statusDiv.style.color = "#555";
            html5QrcodeScanner.resume(); // Melanjutkan kamera tanpa hapus input nama
        }, 2000);
    })
    .catch(error => {
        console.error("Error:", error);
        statusDiv.innerText = "Terjadi kesalahan koneksi.";
        // Tetap izinkan coba lagi
        setTimeout(() => html5QrcodeScanner.resume(), 2000);
    });
}

html5QrcodeScanner.render(onScanSuccess);