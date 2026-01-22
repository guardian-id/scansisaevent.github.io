const powerAutomateURL = "PASTE_URL_FLOW_ANDA_DISINI";
let isScanning = false;
let currentFacingMode = "environment"; // Default kamera belakang

function toggleScanner() {
    if (isScanning) {
        stopScanner();
    } else {
        startScanner();
    }
}

function switchCamera() {
    // Ubah mode kamera
    currentFacingMode = (currentFacingMode === "environment") ? "user" : "environment";
    
    if (isScanning) {
        // Jika sedang nyala, restart dengan mode baru
        Quagga.stop();
        startScanner();
    } else {
        alert("Mode kamera diubah ke: " + (currentFacingMode === "user" ? "Depan" : "Belakang"));
    }
}

function startScanner() {
    document.getElementById('scanner-container').style.display = 'block';
    document.getElementById('btnToggleScan').innerText = "Berhenti";
    document.getElementById('btnToggleScan').classList.add('active');
    document.getElementById('status').innerText = "Status: Mencari Barcode...";

    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#interactive'),
            constraints: {
                facingMode: currentFacingMode,
                width: { min: 640 },
                height: { min: 480 }
            },
        },
        locator: {
            patchSize: "medium", // Ukuran pencarian barcode (medium paling stabil)
            halfSample: true
        },
        decoder: {
            // Membaca berbagai tipe barcode populer
            readers: ["code_128_reader", "ean_reader", "upc_reader", "code_39_reader"]
        },
        locate: true
    }, function(err) {
        if (err) {
            console.error(err);
            alert("Error: " + err.name);
            return;
        }
        Quagga.start();
        isScanning = true;
    });
}

function stopScanner() {
    Quagga.stop();
    document.getElementById('scanner-container').style.display = 'none';
    document.getElementById('btnToggleScan').innerText = "Mulai Scan";
    document.getElementById('btnToggleScan').classList.remove('active');
    document.getElementById('status').innerText = "Status: Kamera Mati";
    isScanning = false;
}

Quagga.onDetected(function(result) {
    if (result.codeResult.code) {
        const code = result.codeResult.code;
        // Auto-Close: Langsung stop kamera
        stopScanner();
        // Kirim data JSON
        sendData(code);
    }
});

async function sendData(barcode) {
    const payload = {
        nama_scan: document.getElementById('scanName').value,
        store_code: document.getElementById('storeCode').value,
        barcode: barcode,
        qty: parseInt(document.getElementById('qty').value),
        timestamp: new Date().toISOString()
    };

    const statusDiv = document.getElementById('status');
    statusDiv.innerText = "Mengirim Data: " + barcode;

    try {
        const response = await fetch(powerAutomateURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            statusDiv.innerText = "Sukses: " + barcode;
            // Auto Reset Qty
            document.getElementById('qty').value = "1";
        } else {
            statusDiv.innerText = "Gagal Kirim ke Server";
        }
    } catch (error) {
        statusDiv.innerText = "Error Koneksi";
        console.error(error);
    }
}