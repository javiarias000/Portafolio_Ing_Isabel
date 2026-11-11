// Auditoría de assets/src (excluye fb/, que es una instantánea cruda de Facebook).
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
export const NAME_RE = /^[a-z0-9-]+\.(jpg|png)$/;
export function auditAssets(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isFile()).map(d => d.name);
  const byHash = new Map(); const badNames = [];
  const walk = (base, rel = '') => {
    for (const e of fs.readdirSync(path.join(base, rel), { withFileTypes: true })) {
      if (e.isDirectory()) { if (e.name !== 'fb') walk(base, path.join(rel, e.name)); continue; }
      if (!/\.(jpg|png)$/i.test(e.name)) continue;
      if (!NAME_RE.test(e.name)) badNames.push(path.join(rel, e.name));
      const h = crypto.createHash('sha1').update(fs.readFileSync(path.join(base, rel, e.name))).digest('hex');
      byHash.set(h, [...(byHash.get(h) || []), path.join(rel, e.name)]);
    }
  };
  walk(dir);
  return { badNames, duplicates: [...byHash.values()].filter(v => v.length > 1), files };
}
