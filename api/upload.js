// api/upload.js  (ESM)

import { IncomingForm } from "formidable";
import fs from "fs";
import { Buffer } from "buffer";

// ---- Vercel ayarı: form-data'yı kendimiz parse edeceğiz
export const config = {
  api: { bodyParser: false },
};

// ---- küçük yardımcılar
function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function setCORS(res) {
  // İstersen * yerine tam domainini yaz: https://barisha.vercel.app
  res.setHeader("Access-Control-Allow-Origin", "https://barisha.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sanitizeSegment(s, fallback = "anon") {
  const out = (s || "")
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 80);
  return out || fallback;
}

const MAX_BYTES = 60 * 1024 * 1024; // 60MB üstünü reddet (istemci için 50MB öner)
const GITHUB_API = "https://api.github.com";

async function getFileSha(owner, repo, path, branch, token) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    path
  )}?ref=${encodeURIComponent(branch)}`;

  const r = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "vercel-upload-edge",
    },
  });

  if (r.status === 404) return null;
  if (!r.ok) {
    throw new Error(`SHA sorgu hatası: ${r.status}`);
  }
  const j = await r.json();
  return j.sha || null;
}

async function putFile(owner, repo, path, branch, token, contentB64, message, sha) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encodeURIComponent(
    path
  )}`;
  const body = {
    message,
    content: contentB64,
    branch,
    committer: { name: "Barisha Uploader", email: "uploader@vercel.local" },
  };
  if (sha) body.sha = sha;

  const r = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "vercel-upload-edge",
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`GitHub PUT hatası: ${r.status} ${t}`);
  }
  return r.json();
}

// ---- ana handler
export default async function handler(req, res) {
  setCORS(res);

  // Preflight
  if (req.method === "OPTIONS") return res.status(200).end();

  // Sadece POST
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
    // formidable ile form verisini al
    const { fields, files } = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ multiples: false, maxFileSize: MAX_BYTES });
      form.parse(req, (err, flds, fls) => (err ? reject(err) : resolve({ fields: flds, files: fls })));
    });

    const owner = sanitizeSegment(fields.owner || "barisha-app");
    const repo  = sanitizeSegment(fields.repo  || "Barisha");
    const branch = sanitizeSegment(fields.branch || "main");
    const root = sanitizeSegment(fields.root || "Ziyaret");
    const nick = sanitizeSegment(fields.nick || "anon");

    // Tek dosya bekliyoruz: input name="file"
    const fileObj = files.file;
    if (!fileObj) {
      return json(res, 400, { ok: false, error: "no_file" });
    }

    // formidable v3 -> fileObj.filepath
    const filePath = Array.isArray(fileObj) ? fileObj[0].filepath : fileObj.filepath;
    const fileName = Array.isArray(fileObj) ? sanitizeSegment(fileObj[0].originalFilename) : sanitizeSegment(fileObj.originalFilename);

    // Dosyayı oku (buffer)
    const buf = await fs.promises.readFile(filePath);
    if (buf.byteLength > MAX_BYTES) {
      return json(res, 413, { ok: false, error: "too_large" });
    }

    const relPath = `${root}/${nick}/${fileName}`; // Ziyaret/<rumuz>/<dosya>
    const sha = await getFileSha(owner, repo, relPath, branch, token);
    const message = sha
      ? `update: ${relPath}`
      : `upload: ${relPath}`;

    const resJson = await putFile(
      owner,
      repo,
      relPath,
      branch,
      token,
      buf.toString("base64"),
      message,
      sha || undefined
    );

    return json(res, 200, {
      ok: true,
      path: relPath,
      size: buf.byteLength,
      content: resJson.content,
      commit: resJson.commit?.sha,
      html_url: resJson.content?.html_url,
    });
  } catch (err) {
    console.error(err);
    return json(res, 500, { ok: false, error: "upload_failed", detail: String(err?.message || err) });
  }
}
