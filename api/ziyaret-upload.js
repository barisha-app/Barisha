// Vercel Serverless Function (Node 18+)
export const config = {
  api: { bodyParser: false }, // çoklu dosya için form-data'yı kendimiz okuyacağız
};

function sanitize(str) {
  return (str || "")
    .normalize("NFKC")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 60) || "misafir";
}

async function readFormData(req) {
  const buffers = [];
  for await (const chunk of req) buffers.push(chunk);
  const blob = new Blob(buffers, { type: req.headers["content-type"] || "" });
  return await (new Response(blob)).formData();
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST" });
  }

  const OWNER  = process.env.GH_OWNER  || "barisha-app";
  const REPO   = process.env.GH_REPO   || "Barisha";
  const BRANCH = process.env.GH_BRANCH || "main";
  const FOLDER = process.env.GH_FOLDER || "Ziyaret";
  const TOKEN  = process.env.GITHUB_TOKEN;

  if (!TOKEN) return res.status(500).json({ error: "Missing GITHUB_TOKEN secret" });

  try {
    const form = await readFormData(req);
    const nickname = sanitize(form.get("nickname"));
    const files = form.getAll("files");

    if (!files?.length) return res.status(400).json({ error: "No files" });

    const saved = [];

    for (const file of files) {
      const arrayBuf = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuf).toString("base64");
      const safeName = sanitize(file.name);
      const now = new Date().toISOString().replace(/[:.]/g,"-");
      const path = `${FOLDER}/${nickname}/${now}__${safeName}`;

      const putUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(path)}`;
      const payload = {
        message: `upload(ziyaret): ${safeName} by ${nickname}`,
        content: base64,
        branch: BRANCH,
      };

      const gh = await fetch(putUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${TOKEN}`,
          "Accept": "application/vnd.github+json",
          "Content-Type": "application/json",
          "User-Agent": "barisha-ziyaret-upload"
        },
        body: JSON.stringify(payload)
      });

      if (!gh.ok) {
        const txt = await gh.text();
        console.error("GitHub error", gh.status, txt);
        return res.status(gh.status).json({ error: "GitHub API error", details: txt });
      }

      saved.push({ path });
    }

    return res.status(200).json({ ok: true, saved });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Upload failed" });
  }
}
