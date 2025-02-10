const express = require("express");
const bodyParser = require("body-parser");
const { Client, LocalAuth } = require("whatsapp-web.js"); // Tambahkan LocalAuth di sini
const qrcode = require("qrcode-terminal");
const cors = require("cors");
const puppeteer = require('puppeteer-core');

// Membuat instance Express
const app = express();
app.use(cors()); // Mengaktifkan CORS untuk semua origin
app.use(bodyParser.json());

// Membuat client WhatsApp dengan LocalAuth untuk menyimpan sesi
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Menampilkan QR code di terminal untuk autentikasi pertama kali
client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

// Ketika client berhasil login
client.on("ready", () => {
  console.log("WhatsApp Bot siap!");
});

// Mengirim pesan ke nomor tertentu
client.on("message", (message) => {
  // Cek apakah pesan datang dari nomor tertentu atau berdasarkan kondisi lainnya
  if (message.body === "Kirim Pesan") {
    const nomorTujuan = message.from; // Anda bisa sesuaikan jika perlu
    client.sendMessage(nomorTujuan, "Pesan otomatis dari Bot WhatsApp");
  }
});

// Endpoint untuk mengirim pesan WhatsApp
app.post("/kirim-pesan", (req, res) => {
  const { nomorWa, namaPengguna, idPengguna, selisih } = req.body;

  if (!nomorWa || !namaPengguna || !idPengguna || !selisih) {
    return res.status(400).json({ error: "Data tidak lengkap" });
  }

  // Pastikan nomor dimulai dengan kode negara Indonesia
  let formattedNomor = nomorWa.replace(/\D/g, ""); // Menghapus semua karakter non-angka
  if (formattedNomor.startsWith("0")) {
    formattedNomor = "62" + formattedNomor.slice(1); // Menambahkan kode negara Indonesia
  }

  const message = `Semangat Pagi, Bossku *${namaPengguna}* ! \n\n Konfirmasi Total Rekap Tagihan :\n*${selisih}*\n\nDetail Rekap klik  : \nhttps://rekap.makaryoserver.com/?idPengguna=${idPengguna}`;

  client
    .sendMessage(`${formattedNomor}@c.us`, message) // Kirim pesan ke nomor yang diformat
    .then((response) => {
      res.json({ status: "success", response });
    })
    .catch((error) => {
      console.error("Error sending message:", error); // Log error di server
      res.status(500).json({ status: "error", error: error.message });
    });
  console.log("Mengirim pesan ke:", namaPengguna);
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log("Server berjalan di port 3000");
});

// Menjalankan bot
client.initialize();
