import cors from "cors";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("VakaTulkki backend toimii");
});

app.post("/test", (req, res) => {
  const { text, lang } = req.body;

  res.json({
    ok: true,
    receivedText: text,
    receivedLang: lang,
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
