const TelegramBot = require("node-telegram-bot-api");

const token = "YourTelegramBotToken";
const option = {
    polling: true
};

const genjorbot = new TelegramBot(token, option);

const BMKG_ENDPOINT = "https://data.bmkg.go.id/DataMKG/TEWS/";

// Menangani perintah /start
genjorbot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || "Pengguna"; // Menggunakan username atau "Pengguna" jika tidak ada username

    const welcomeMessage = `Halo ${username}! Selamat datang di GenjorBot\u{1F450}. Ketik "Rehan Si Anak Kece" untuk mulai.`;
    
    genjorbot.sendMessage(chatId, welcomeMessage);
});

// Menangani input teks dari pengguna
genjorbot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userMessage = msg.text.toLowerCase();

    // Jika pengguna mengetik pesan yang ingin dijawab oleh bot
    if (userMessage.includes('rehan si anak kece')) {
        const optionsMessage = "Berikut beberapa Opsi Yang Bisa Anda Pilih:";
        const options = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: "Data Gempa Hari Ini\u{1F30E}", callback_data: "gempa_hari_ini" }
                    ],
                    [
                        { text: "Lokasi Universitas Pamulang\u{1F3EB}", callback_data: "lokasi_UNPAM" }
                    ],
                    [
                        { text: "Rekomendasi Pempek Terenak Di Bogor\u{1F3E1}", callback_data: "pempek_info" }
                    ]
                ]
            }
        };

        genjorbot.sendMessage(chatId, optionsMessage, options);
    } else if (userMessage === '/start') {
        // Mengabaikan jika pesan adalah /start karena sudah dihandle sebelumnya
        return;
    } else {
        // Jika pengguna mengetik sesuatu yang tidak terdaftar, bot akan menampilkan opsi pertanyaan
        const responseMessage = `Saya belum mengerti pertanyaan Anda. Ketik "Rehan Si Anak Kece" untuk melihat opsi.`;
        genjorbot.sendMessage(chatId, responseMessage);
    }
});

// Menangani klik pada tombol
genjorbot.on("callback_query", async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === "gempa_hari_ini") {
        try {
            const apiCall = await fetch(BMKG_ENDPOINT + "autogempa.json");
            const {
                Infogempa: { 
                    gempa: { Jam, Magnitude, Tanggal, Wilayah, Potensi, Kedalaman, Shakemap }
                }    
            } = await apiCall.json();

            const BMKGImage = BMKG_ENDPOINT + Shakemap;
            const resultText = `
📅 Waktu      \t: ${Tanggal} | ${Jam}
🌡️ Besaran   \t: ${Magnitude} SR
📍 Wilayah   \t: ${Wilayah}
🔸 Potensi   \t: ${Potensi}
🌊 Kedalaman \t: ${Kedalaman}
`;

            genjorbot.sendPhoto(chatId, BMKGImage, { caption: resultText });
        } catch (error) {
            genjorbot.sendMessage(chatId, "Maaf, terjadi kesalahan saat mengambil data gempa.");
            console.error(error);
        }
    } else if (data === "lokasi_UNPAM") {
        // Lokasi Masjid Istiqlal
        const latitude = -6.3438317111946425;  
        const longitude = 106.73707493335709;  
        genjorbot.sendLocation(chatId, latitude, longitude);
        genjorbot.sendMessage(chatId, "Berikut Adalah Lokasi Univeristas Pamulang.");
    } else if (data === "pempek_info") {
        const latitude = -6.456583656272402;  
        const longitude = 106.74604843684105;  
        genjorbot.sendLocation(chatId, latitude, longitude);
        genjorbot.sendMessage(chatId, "Ini Dia Restoran Pempek TerEnak Di Bogor.\u{1F372}");
    }
});