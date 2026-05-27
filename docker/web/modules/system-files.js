/**
 * Server-side file browser for Settings → SYSTEM (Video Swarm–style grid).
 * Paths are constrained to configured roots only.
 */
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const VIDEO_EXT = new Set([".mp4", ".webm", ".mov", ".mkv", ".m4v", ".avi", ".gif"]);

function parseRoots(env = process.env, opts = {}) {
  const recordingsDir = opts.recordingsDir || path.join(__dirname, "..", "recordings");
  const framesDir = opts.framesDir || path.join(__dirname, "..", "frames");
  const runsDir = opts.runsDir || "/data/runs";
  const raw = String(env.SYSTEM_FILES_ROOTS || "").trim();
  const roots = [];
  const push = (id, label, rootPath) => {
    const resolved = path.resolve(rootPath);
    if (!roots.some((r) => r.path === resolved)) {
      roots.push({ id, label, path: resolved });
    }
  };
  if (raw) {
    raw.split(",").forEach((entry, idx) => {
      const piece = entry.trim();
      if (!piece) return;
      const pipe = piece.indexOf("|");
      if (pipe > 0) {
        push(
          piece.slice(0, pipe).trim() || `root-${idx + 1}`,
          piece.slice(0, pipe).trim() || `Root ${idx + 1}`,
          piece.slice(pipe + 1).trim()
        );
      } else {
        push(`root-${idx + 1}`, path.basename(piece) || piece, piece);
      }
    });
  }
  push("recordings", "Recordings", recordingsDir);
  push("frames", "Frames", framesDir);
  push("runs", "Runs", runsDir);
  return roots;
}

function createSystemFiles(opts = {}) {
  const roots = parseRoots(opts.env || process.env, opts);
  const rootPaths = roots.map((r) => r.path);

  function resolveSafePath(inputPath) {
    const raw = String(inputPath || "").trim();
    if (!raw) return null;
    const resolved = path.resolve(raw);
    const allowed = rootPaths.some(
      (root) => resolved === root || resolved.startsWith(root + path.sep)
    );
    if (!allowed) return null;
    return resolved;
  }

  function isVideoFile(name) {
    return VIDEO_EXT.has(path.extname(name).toLowerCase());
  }

  async function listDirectory(dirPath, { recursive = false, videosOnly = false } = {}) {
    const items = [];
    const videos = [];

    async function walk(current, relBase) {
      let entries;
      try {
        entries = await fsp.readdir(current, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        if (ent.name.startsWith(".")) continue;
        const abs = path.join(current, ent.name);
        const rel = relBase ? path.join(relBase, ent.name) : ent.name;
        let stat;
        try {
          stat = await fsp.stat(abs);
        } catch {
          continue;
        }
        if (ent.isDirectory()) {
          if (!videosOnly) {
            items.push({
              type: "dir",
              name: ent.name,
              path: abs,
              relativePath: rel,
              size: 0,
              mtime: stat.mtimeMs,
            });
          }
          if (recursive) await walk(abs, rel);
        } else if (ent.isFile() && isVideoFile(ent.name)) {
          const row = {
            type: "video",
            name: ent.name,
            path: abs,
            relativePath: rel,
            size: stat.size,
            mtime: stat.mtimeMs,
          };
          items.push(row);
          videos.push(row);
        }
      }
    }

    await walk(dirPath, "");
    return { items, videos };
  }

  function attachRoutes(app) {
    app.get("/api/system/files/roots", (_req, res) => {
      res.json({
        roots: roots.map((r) => ({ id: r.id, label: r.label, path: r.path })),
      });
    });

    app.get("/api/system/files/browse", async (req, res) => {
      try {
        const dirPath = resolveSafePath(req.query.path);
        if (!dirPath) {
          return res.status(400).json({ error: "Invalid or disallowed path" });
        }
        let stat;
        try {
          stat = await fsp.stat(dirPath);
        } catch {
          return res.status(404).json({ error: "Path not found" });
        }
        if (!stat.isDirectory()) {
          return res.status(400).json({ error: "Not a directory" });
        }
        const recursive = String(req.query.recursive || "true") !== "false";
        const { items, videos } = await listDirectory(dirPath, { recursive, videosOnly: false });
        const sort = String(req.query.sort || "name-asc");
        const sortFn = sortKeyToFn(sort);
        items.sort(sortFn);
        videos.sort(sortFn);
        res.json({
          path: dirPath,
          parent: parentWithinRoots(dirPath, rootPaths),
          recursive,
          items,
          videos,
          count: videos.length,
        });
      } catch (err) {
        res.status(500).json({ error: err.message || "Browse failed" });
      }
    });

    app.get("/api/system/files/media", async (req, res) => {
      try {
        const filePath = resolveSafePath(req.query.path);
        if (!filePath) return res.status(400).json({ error: "Invalid path" });
        if (!isVideoFile(filePath)) return res.status(400).json({ error: "Not a video file" });
        let stat;
        try {
          stat = await fsp.stat(filePath);
        } catch {
          return res.status(404).json({ error: "File not found" });
        }
        if (!stat.isFile()) return res.status(400).json({ error: "Not a file" });

        const range = req.headers.range;
        const fileSize = stat.size;
        const contentType = contentTypeFor(filePath);

        if (range) {
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          if (start >= fileSize || end >= fileSize) {
            res.status(416).set("Content-Range", `bytes */${fileSize}`);
            return res.end();
          }
          const chunkSize = end - start + 1;
          res.writeHead(206, {
            "Content-Range": `bytes ${start}-${end}/${fileSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": chunkSize,
            "Content-Type": contentType,
          });
          fs.createReadStream(filePath, { start, end }).pipe(res);
        } else {
          res.writeHead(200, {
            "Content-Length": fileSize,
            "Content-Type": contentType,
            "Accept-Ranges": "bytes",
          });
          fs.createReadStream(filePath).pipe(res);
        }
      } catch (err) {
        res.status(500).json({ error: err.message || "Stream failed" });
      }
    });

    app.delete("/api/system/files", async (req, res) => {
      try {
        const filePath = resolveSafePath(req.query.path || req.body?.path);
        if (!filePath) return res.status(400).json({ error: "Invalid path" });
        if (!isVideoFile(filePath)) return res.status(400).json({ error: "Only video files can be deleted" });
        await fsp.unlink(filePath);
        res.json({ ok: true, path: filePath });
      } catch (err) {
        res.status(500).json({ error: err.message || "Delete failed" });
      }
    });
  }

  return { attachRoutes, roots, resolveSafePath };
}

function parentWithinRoots(dirPath, rootPaths) {
  const parent = path.dirname(dirPath);
  const allowed = rootPaths.some(
    (root) => parent === root || parent.startsWith(root + path.sep)
  );
  return allowed && parent !== dirPath ? parent : null;
}

function sortKeyToFn(sort) {
  const [key, dir] = String(sort).split("-");
  const asc = dir !== "desc";
  return (a, b) => {
    let cmp = 0;
    if (key === "mtime") cmp = (a.mtime || 0) - (b.mtime || 0);
    else if (key === "size") cmp = (a.size || 0) - (b.size || 0);
    else cmp = String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
    return asc ? cmp : -cmp;
  };
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mkv": "video/x-matroska",
    ".m4v": "video/x-m4v",
    ".avi": "video/x-msvideo",
    ".gif": "image/gif",
  };
  return map[ext] || "application/octet-stream";
}

module.exports = { createSystemFiles, VIDEO_EXT };
