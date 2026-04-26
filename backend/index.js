import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

function escapeXml(unsafe) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function synthesizeSpeech(text, lang) {
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;

  const url = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const voices = {
    en: { name: "en-US-JennyNeural", locale: "en-US" },
    ar: { name: "ar-SA-ZariyahNeural", locale: "ar-SA" },
    uk: { name: "uk-UA-PolinaNeural", locale: "uk-UA" },
    vi: { name: "vi-VN-HoaiMyNeural", locale: "vi-VN" },
    zh: { name: "zh-CN-XiaoxiaoNeural", locale: "zh-CN" },
    si: { name: "si-LK-ThiliniNeural", locale: "si-LK" },
    tr: { name: "tr-TR-EmelNeural", locale: "tr-TR" },
    ro: { name: "ro-RO-AlinaNeural", locale: "ro-RO" },
    ru: { name: "ru-RU-SvetlanaNeural", locale: "ru-RU" },
    so: { name: "so-SO-MuuseNeural", locale: "so-SO" },
    sw: { name: "sw-TZ-RehemaNeural", locale: "sw-TZ" },

    bn: { name: "bn-BD-NabanitaNeural", locale: "bn-BD" },
    yo: { name: "en-US-JennyNeural", locale: "en-US" },
    ms: { name: "ms-MY-YasminNeural ", locale: "ms-MY" },
    ur: { name: "ur-PK-UzmaNeural", locale: "ur-PK" },
  };

  const selectedVoice = voices[lang] || voices.en;

  const ssml = `
    <speak version="1.0" xml:lang="${selectedVoice.locale}">
      <voice xml:lang="${selectedVoice.locale}" name="${selectedVoice.name}">
        ${escapeXml(text)}
      </voice>
    </speak>
  `.trim();

  const response = await axios.post(url, ssml, {
    headers: {
      "Ocp-Apim-Subscription-Key": speechKey,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-32kbitrate-mono-mp3",
      "User-Agent": "VakaTulkki",
    },
    responseType: "arraybuffer",
  });

  return Buffer.from(response.data);
}

app.get("/", (req, res) => {
  res.send("VakaTulkki backend toimii");
});

app.post("/translate", async (req, res) => {
  try {
    const { text, lang } = req.body;

    if (!text || !lang) {
      return res.status(400).json({
        error: "text ja lang ovat pakollisia",
      });
    }

    const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    const url = `${endpoint}/translate?api-version=3.0&to=${encodeURIComponent(lang)}`;

    const response = await axios.post(url, [{ Text: text }], {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
    });

    const translatedText = response.data?.[0]?.translations?.[0]?.text ?? text;

    res.json({
      ok: true,
      originalText: text,
      translatedText,
      targetLanguage: lang,
    });
  } catch (error) {
    console.error("Translation error:", error.response?.data || error.message);

    res.status(500).json({
      ok: false,
      error: "Käännös epäonnistui",
      details: error.response?.data || error.message,
    });
  }
});

app.post("/speak", async (req, res) => {
  try {
    const { text, lang } = req.body;

    if (!text || !lang) {
      return res.status(400).json({
        error: "text ja lang ovat pakollisia",
      });
    }

    const endpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
    const key = process.env.AZURE_TRANSLATOR_KEY;
    const region = process.env.AZURE_TRANSLATOR_REGION;

    const translateUrl = `${endpoint}/translate?api-version=3.0&to=${encodeURIComponent(lang)}`;

    const translateRes = await axios.post(translateUrl, [{ Text: text }], {
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
    });

    const translated = translateRes.data?.[0]?.translations?.[0]?.text ?? text;

    const audioBuffer = await synthesizeSpeech(translated, lang);

    res.json({
      ok: true,
      translated,
      audioBase64: audioBuffer.toString("base64"),
    });
  } catch (error) {
    console.error("TTS error status:", error.response?.status);
    console.error("TTS error headers:", error.response?.headers);

    if (error.response?.data) {
      try {
        console.error(
          "TTS error data:",
          Buffer.from(error.response.data).toString("utf8"),
        );
      } catch {
        console.error("TTS error raw data:", error.response.data);
      }
    } else {
      console.error("TTS error message:", error.message);
    }

    res.status(500).json({
      ok: false,
      error: "TTS failed",
      status: error.response?.status || null,
    });
  }
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running at http://192.168.1.3:${PORT}`);
});
