import fs from "node:fs";
import path from "node:path";

function listSvgFiles(rootDir: string): string[] {
  const out: string[] = [];
  const stack = [rootDir];
  while (stack.length) {
    const current = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      entries = [];
    }
    for (const entry of entries) {
      const abs = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(abs);
      else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) out.push(abs);
    }
  }
  return out.sort((a, b) => a.localeCompare(b));
}

export { listSvgFiles };
