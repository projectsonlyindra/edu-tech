import 'dotenv/config'; //mengaktifkan dotenv
import express, { text } from 'express'; //mengaktifkan express dan text
import multer from 'multer'; //mengaktifkan multer
import cors from 'cors'; //mengaktifkan cors
import { GoogleGenAI } from "@google/genai"; //mengaktifkan gemini ai

const app = express(); //mengaktifkan express
const upload = multer(); //mengaktifkan multer

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); //inisialisasi gemini ai

const aiModel = "gemini-3.5-flash-lite"; //inisialisasi model

app.use(cors()); //mengaktifkan cors
app.use(express.json()); //mengaktifkan json

const PORT = 3000; //inisialisasi port

app.listen(PORT, () => { //function untuk menjalankan server
    console.log(`Server is running on http://localhost:${PORT}`); //menampilkan pesan bahwa server berjalan
});

app.get("/", (req, res) => { //function untuk halaman utama
    res.send("Hello World!"); //menampilkan pesan "Hello World!" jika mengakses halaman utama
});

app.post("/generate-text", async (req, res) => { //function untuk generate text
    const { prompt } = req.body; //mengambil prompt dari body
    try { //mencoba menjalankan kode di dalam try
        const response = await ai.models.generateContent({ //mengirim prompt ke gemini api
            model: aiModel, //memilih model
            contents: prompt //memasukan prompt
        });
        res.status(200).json({ result: response.text }); //mengirim hasil ke client
    } catch (error) { //jika terjadi error
        console.error(error); //menampilkan error
        res.status(500).json({ message: error.message }); //mengirim error ke client
    }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => { //function untuk generate text dari gambar
    const { prompt } = req.body; //mengambil prompt dari body
    const base64Image = req.file.buffer.toString("base64"); //mengubah gambar menjadi base64
    try { //mencoba menjalankan kode di dalam try
        const response = await ai.models.generateContent({ //mengirim prompt ke gemini api
            model: aiModel, //memilih model
            contents: [
                { text: prompt, type: "text" }, //memasukan prompt
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } } //memasukan gambar
            ]
        });
        res.status(200).json({ result: response.text }); //mengirim hasil ke client
    } catch (error) { //jika terjadi error
        console.error(error); //menampilkan error
        res.status(500).json({ message: error.message }); //mengirim error ke client
    }
})

app.post("/generate-from-document", upload.single("document"), async (req, res) => { //function untuk generate text dari document
    const { prompt } = req.body; //mengambil prompt dari body
    const base64Document = req.file.buffer.toString("base64"); //mengubah document menjadi base64
    try { //mencoba menjalankan kode di dalam try
        const response = await ai.models.generateContent({ //mengirim prompt ke gemini api
            model: aiModel, //memilih model
            contents: [
                { text: prompt, type: "text" }, //memasukan prompt
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } } //memasukan document
            ]
        });
        res.status(200).json({ result: response.text }); //mengirim hasil ke client
    } catch (error) { //jika terjadi error
        console.error(error); //menampilkan error
        res.status(500).json({ message: error.message }); //mengirim error ke client
    }
})

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => { //function untuk generate text dari audio
    const { prompt } = req.body; //mengambil prompt dari body
    const base64Audio = req.file.buffer.toString("base64"); //mengubah audio menjadi base64
    try { //mencoba menjalankan kode di dalam try
        const response = await ai.models.generateContent({ //mengirim prompt ke gemini api
            model: aiModel, //memilih model
            contents: [
                { text: prompt, type: "text" }, //memasukan prompt
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } } //memasukan audio
            ]
        });
        res.status(200).json({ result: response.text }); //mengirim hasil ke client
    } catch (error) { //jika terjadi error
        console.error(error); //menampilkan error
        res.status(500).json({ message: error.message }); //mengirim error ke client
    }
})

app.post('/api/chat', async (req, res) => { //function untuk chat
    const { conversation } = req.body; //mengambil conversation dari body
    try { //mencoba menjalankan kode di dalam try
        if (!Array.isArray(conversation)) throw new Error("Conversation must be an array"); //mengecek apakah conversation berupa array

        const contents = conversation.map(({ role, text }) => ({
            role,
            parts: [{ text }]
        }));

        const systemInstruction = `Kamu adalah asisten AI resmi dari EduTech (Institut Teknologi & Edukasi Cerdas), instansi pendidikan tinggi swasta yang fokus pada integrasi Artificial Intelligence (AI) dalam pendidikan.

PENGETAHUAN EDUTECH:
- Keunggulan AI: Adaptive Learning Engine (kurikulum adaptif personal), 24/7 AI Personal Mentor, Predictive Skill Analytics (pelacakan kompetensi berbasis ML), dan Immersive Virtual Lab (simulasi cloud & robotik).
- Program Studi:
  1. S1 Artificial Intelligence & Data Science (8 semester)
  2. S1 Intelligent Software Engineering (8 semester, program paling diminati)
  3. D4 Robotics & Smart Automation (8 semester)
  4. Executive EdTech & AI Innovation Fellowship
- Data Instansi & Kontak:
  * Alamat: EduTech Innovation Tower Lt. 8–12, Jl. Jendral Sudirman Kav. 45, Senayan, Jakarta Selatan 12190
  * Telepon: +62 (21) 2985-7890
  * WhatsApp Admisi: +62 811-9988-7766
  * Email: info@edutech.ac.id / admissions@edutech.ac.id
  * Akreditasi: Terakreditasi Unggul (A) BAN-PT, SK Kemendikbudristek No. 412/E/O/2023
  * Statistik: 15.000+ siswa aktif, 98.6% lulusan terserap industri < 3 bulan, 120+ mitra riset/industri global. Tersedia jalur beasiswa dan reguler.

BATASAN KETAT & ATURAN:
1. HANYA jawab pertanyaan yang relevan dengan EduTech (profil kampus, program studi, kurikulum AI, fasilitas, pendaftaran, beasiswa, dan kontak).
2. JANGAN menjawab pertanyaan yang aneh-aneh, tidak pantas, atau topik di luar EduTech (seperti politik, resep masakan, hiburan, kode/skrip di luar konteks EduTech, tugas sekolah umum yang tidak berkaitan, gosip, dsb).
3. Jika pengguna menanyakan hal di luar konteks EduTech, TOLAK SECARA SOPAN DAN RAMAH dalam bahasa Indonesia, lalu arahkan kembali ke topik EduTech. Contoh respon penolakan: "Maaf, sebagai asisten resmi EduTech, saya hanya dapat membantu menjawab pertanyaan seputar program pendidikan, kurikulum berbasis AI, pendaftaran, dan informasi kampus EduTech. Ada hal seputar EduTech yang ingin Anda ketahui?"
4. Selalu jawab dalam bahasa Indonesia yang ramah, sopan, profesional, ringkas, dan jelas.`;

        const response = await ai.models.generateContent({
            model: aiModel,
            contents,
            config: {
                temperature: 0.2,
                systemInstruction,
            },
        });

        res.status(200).json({ result: response.text }); //mengirim hasil ke client
    } catch (error) { //jika terjadi error
        console.error(error); //menampilkan error
        res.status(500).json({ message: error.message }); //mengirim error ke client
    }
})