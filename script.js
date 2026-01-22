// Ganti dengan URL dari Power Automate Anda
const powerAutomateURL = "https://default9ec0d6c58a25418fb3841c77c55584.c2.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/2212167e0b4644b095c71f413d64034d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Weaii9pe3fNhjuf89xGcLQx9GUGbsMvDgmAZE5P-ZGM";

// Inisialisasi Scanner
Quagga.init({
    inputStream: {
        name: "Live",
        type: "LiveStream",
        target: document.querySelector('#interactive'),
        constraints: {
            facingMode: "environment" // Menggunakan kamera belakang
        }
    },
    decoder: {
        readers: ["code_128_reader", "ean_reader", "upc_reader", "code_39_reader"]
    }
}, function(err) {
    if (err) {
        console.error("Gagal inisialisasi kamera:", err);
        document.getElementById('status').innerText = "Status: Kamera Error";
        return;
    }
    Quagga.start();
});

// Deteksi Barcode
Quagga.onDetected(function(data) {
    const barcode = data.codeResult.code;
    if (barcode) {
        // Hentikan sementara scanner agar tidak double scan
        Quagga.stop();
        processScan(barcode);
    }
});

async function processScan(barcode) {
    const scanName = document.getElementById('scanName').value;
    const storeCode = document.getElementById('storeCode').value;
    const qtyInput = document.getElementById('qty');
    const statusDiv = document.getElementById('status');

    const payload = {
        nama_scan: scanName,
        store_code: storeCode,
        barcode: barcode,
        qty: parseInt(qtyInput.value),
        timestamp: new Date().toISOString()
    };

    statusDiv.innerText = "Status: Mengirim...";

    try {
        const response = await fetch(powerAutomateURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            statusDiv.innerText = `Berhasil: ${barcode}`;
            // Reset Field Qty saja sesuai permintaan
            qtyInput.value = "1";
        } else {
            statusDiv.innerText = "Gagal mengirim data.";
        }
    } catch (error) {
        statusDiv.innerText = "Error Koneksi.";
        console.error("Fetch Error:", error);
    }

    // Mulai kembali scanner setelah 2 detik jeda
    setTimeout(() => {
        Quagga.start();
        statusDiv.innerText = "Status: Ready";
    }, 2000);
}