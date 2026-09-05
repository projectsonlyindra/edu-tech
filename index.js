import 'dotenv/config';
import express, { text } from 'express';
import multer from 'multer';
import { GoogleGenAI } from "@google/genai";

const app = express(); //mengaktifkan express
const upload = multer(); //mengaktifkan multer

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); //inisialisasi gemini ai

const aiModel = "gemini-3.5-flash-lite"; //inisialisasi model

app.use(express.json());

const PORT = 3000; //inisialisasi port

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`); //menampilkan pesan bahwa server berjalan
});

app.get("/", (req, res) => {
    res.send("Hello World!"); //menampilkan pesan "Hello World!" jika mengakses halaman utama
});

app.post("/generate-text", async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: aiModel,
            contents: prompt
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: aiModel,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: aiModel,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})

app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: aiModel,
            contents: [
                { text: prompt, type: "text" },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
})