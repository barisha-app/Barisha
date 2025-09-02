// api/upload.js
import { IncomingForm } from "formidable";
import fs from "fs";
import { Buffer } from "buffer";

export const config = {
  api: {
    bodyParser: false, // multipart/form-data için kapat
  },
};

const MAX_BYTES = 60 * 1024 * 1024; // 60MB üstünü reddet (istemci 50MB öneriyor)

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function sanitizeSegment(s, fallback = "anon") {
  // Güvenli klasör/rumuz için basit temizlik
  const out = (s || "").toString().trim().replace(/[^\w\-\.]/gi, "_").slice(0, 80);
  return out || fallback;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("ENV ERROR: GITHUB_TOKEN yok");
    return json(res, 500, { ok: false, error: "server_misconfig", detail: "GITHUB_TOKEN is missing" });
  }

  try {
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ multiples: false, maxFileSize: MAX_BYTES });
      form.parse(req, (err, fields, files) => (err ? reject(err) : resolve({ fields, files })));
    });

    const owner  = sanitizeSegment(fields.owner);
    const repo   = sanitizeSegment(fields.repo);
    const branch = sanitizeSegment(fields.branch || "main");
    const root   = sanitizeSegment(fields.root || "Ziyaret");
    const rawNick= sanitizeSegment(fields.nick || "anon");

    const file = files.file;
    if (!file) return json(res, 400, { ok: false, error: "no_file" });

    // Vercel + formidable: "filepath" (v3) veya "path" (v2) olabilir
    const filepath = file.filepath || file.path;
    const originalName = sanitizeSegment(file.originalFilename || file.name || "upload.bin", "upload.bin");

    // Dosyayı oku ve base64'e çevir
    const fileBuffer = await fs.promises.readFile(filepath);
    const contentB64 = Buffer.from(fileBuffer).toString("base64");

    // GitHub path
    const ghPath = `${root}/${rawNick}/${originalName}`;

    // Contents API: PUT /repos/{owner}/{repo}/contents/{path}
    const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(ghPath)}`;
    const payload = {
      message: `upload ${originalName} via /api/upload`,
      content: contentB64,
      branch,
    };

    const ghRes = await fetch(ghUrl, {
      method: "PUT",
      headers: {
        "Authorization": `token ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json",
      },
      body: JSON.stringify(payload),
    });

    const ghJson = await ghRes.json();

    if (!ghRes.ok) {
      console.error("GitHub PUT error", ghRes.status, ghJson);
      // Eğer dosya zaten varsa (409): istersen burada önce GET ile sha alıp update yapabilirsin.
      return json(res, ghRes.status, { ok: false, error: "github_error", detail: ghJson });
    }

    // Başarılı
    return json(res, 200, {
      ok: true,
      path: ghPath,
      size: file.size,
      content_url: ghJson.content?.html_url || null,
      download_url: ghJson.content?.download_url || null,
    });
  } catch (err) {
    console.error("UPLOAD ERROR", err);
    if (String(err)?.includes("maxFileSize")) {
      return json(res, 413, { ok: false, error: "file_too_large", max: MAX_BYTES });
    }
    return json(res, 500, { ok: false, error: "server_error" });
  }
}
