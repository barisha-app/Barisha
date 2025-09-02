// api/upload.js  — TAMAMINI YAPIŞTIR
import formidable from "formidable";
import * as fs from "fs/promises";
import fetch from "node-fetch";

export const config = {
  api: { bodyParser: false }, // ÖNEMLİ: Form-data'yı kendimiz parse edeceğiz
};

function pickFile(f) {
  // formidable bazen tek dosya, bazen dizi döndürebilir
  if (!f) return null;
  return Array.isArray(f) ? f[0] : f;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("ENV ERROR: GITHUB_TOKEN yok");
    return res.status(500).json({ error: "Sunucu yapılandırması eksik (GITHUB_TOKEN)." });
  }

  try {
    // 1) Form verisini al
    const form = formidable({ multiples: false, keepExtensions: true });
    const { fields, files } = await form.parse(req);

    console.log("FIELDS:", fields);
    // files.file veya files["file"] olabilir
    const fileObj = pickFile(files.file || files["file"]);
    if (!fileObj) {
      return res.status(400).json({ error: "Dosya bulunamadı (field name: file)." });
    }

    const owner  = String(fields.owner || "barisha-app");
    const repo   = String(fields.repo  || "Barisha");
    const branch = String(fields.branch || "main");
    const root   = String(fields.root || "Ziyaret");
    const nick   = String(fields.nick || "misafir");

    const filename = fileObj.originalFilename || "upload.bin";
    const uploadPath = `${root}/${nick}/${filename}`.replace(/\/+/g, "/");

    // 2) Dosyayı oku → base64
    const buf = await fs.readFile(fileObj.filepath);
    const contentB64 = buf.toString("base64");

    // 3) İlk deneme: dosya YOK varsay → PUT (create)
    let putBody = {
      message: `upload via vercel api: ${uploadPath}`,
      content: contentB64,
      branch,
    };

    const putUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(uploadPath)}`;
    let resp = await fetch(putUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(putBody),
    });

    // 4) Eğer "already exists" (422) gelirse → önce SHA al, sonra overwrite et
    if (resp.status === 422) {
      console.log("File exists, fetching SHA to overwrite…");
      const getResp = await fetch(putUrl + `?ref=${encodeURIComponent(branch)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json"
        }
      });
      if (!getResp.ok) {
        const t = await getResp.text();
        console.error("GET for SHA failed:", t);
        return res.status(500).json({ error: "SHA alınamadı", detail: t });
      }
      const meta = await getResp.json();
      const sha = meta?.sha;
      if (!sha) {
        return res.status(500).json({ error: "SHA yok" });
      }
      putBody = { ...putBody, sha };
      resp = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(putBody),
      });
    }

    // 5) Sonuç kontrolü
    const text = await resp.text();
    if (!resp.ok) {
      console.error("GITHUB PUT ERROR:", resp.status, text);
      return res.status(resp.status).json({ error: "GitHub yükleme hatası", detail: text });
    }

    console.log("UPLOAD OK:", uploadPath);
    return res.status(200).json({ ok: true, path: uploadPath });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    return res.status(500).json({ error: err?.message || "Bilinmeyen hata" });
  }
}
