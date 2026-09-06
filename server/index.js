import 'dotenv/config'; //mengaktifkan dotenv
import express, { text } from 'express'; //mengaktifkan express dan text
import multer from 'multer'; //mengaktifkan multer
import { GoogleGenAI } from "@google/genai"; //mengaktifkan gemini ai

const app = express(); //mengaktifkan express
const upload = multer(); //mengaktifkan multer

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); //inisialisasi gemini ai

const aiModel = "gemini-3.5-flash-lite"; //inisialisasi model

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