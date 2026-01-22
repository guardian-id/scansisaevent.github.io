const powerAutomateURL = "PASTE_URL_FLOW_ANDA_DISINI";
let isScanning = false;

function toggleScanner() {
    if (isScanning) {
        stopScanner();
    } else {
        startScanner();
    }
}

function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';
    document.getElementById('btnToggleScan').innerText = "Batalkan Scan";
    document.getElementById('btnToggleScan').classList.add('active');
    document.getElementById('status').innerText = "Status: Kamera Aktif";
    
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: { facingMode: "environment" }
        },
        decoder: {
            readers: ["code_128_reader", "ean_reader", "upc_reader", "code_39_reader"]
        }
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Gagal membuka kamera!");
            return;
        }
        Quagga.start();
        isScanning = true;
    });
}

function stopScanner() {
    Quagga.stop();
    document.getElementById('scanner-container').style.display = 'none';
    document.getElementById('btnToggleScan').innerText = "Mulai Scan Barcode";
    document.getElementById('btnToggleScan').classList.remove('active');
    document.getElementById('status').innerText = "Status: Kamera Mati";
    isScanning = false;
}

Quagga.onDetected(function(result) {
    const code = result.codeResult.code;
    if (code) {
        // 1. Langsung stop kamera setelah sukses baca (Auto Close)
        stopScanner();
        // 2. Kirim data
        sendData(code);
    }
});

async function sendData(barcode) {
    const scanName = document.getElementById('scanName').value;
    const storeCode = document.getElementById('storeCode').value;
    const qtyInput = document.getElementById('qty');
    const statusText = document.getElementById('status');

    const data = {
        nama_scan: scanName,
        store_code: storeCode,
        barcode: barcode,
        qty: parseInt(qtyInput.value),
        timestamp: new Date().toISOString()
    };

    statusText.innerText = "Mengirim: " + barcode;

    try {
        const response = await fetch(powerAutomateURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            statusText.innerText = "Berhasil: " + barcode;
            // AUTO RESET QTY SAJA
            qtyInput.value = "1";
        } else {
            statusText.innerText = "Gagal Kirim Data";
        }
    } catch (error) {
        statusText.innerText = "Error Koneksi!";
    }
}