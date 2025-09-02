// File: api/upload.js  (Vercel Serverless Function)
import formidable from "formidable";
import { promises as fs } from "fs";

export const config = {
  api: { bodyParser: false }, // formidable kullanıyoruz
};

function b64(buf) {
  return Buffer.from(buf).toString("base64");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).send("Server misconfigured: missing GITHUB_TOKEN");

  const form = formidable({ multiples: false });
  let fields, files;
  try {
    [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve([flds, fls])));
    });
  } catch (e) {
    console.error(e);
    return res.status(400).send("Invalid form data");
  }

  const owner = String(fields.owner || "");
  const repo  = String(fields.repo  || "");
  const branch= String(fields.branch|| "main");
  const root  = String(fields.root  || "Ziyaret");
  const nick  = String(fields.nick  || "").trim().replace(/[^a-zA-Z0-9-_]/g, "_");

  if (!owner || !repo || !nick) {
    return res.status(400).send("Missing owner/repo/nick");
  }

  const file = files.file;
  if (!file) return res.status(400).send("No file");
  const buf = await fs.readFile(file.filepath);
  const filename = file.originalFilename || "upload.bin";

  // Çakışma riskini azaltmak için timestamp ekle
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const path = `${root}/${nick}/${ts}-${filename}`;

  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`;

  try {
    const ghRes = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
      },
      body: JSON.stringify({
        message: `Ziyaret yükleme: ${nick} - ${filename}`,
        content: b64(buf),
        branch
      })
    });

    const text = await ghRes.text();
    if (!ghRes.ok) {
      console.error("GitHub error:", ghRes.status, text);
      return res.status(ghRes.status).send(text);
    }
    return res.status(200).send(text);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Upload failed");
  }
}
