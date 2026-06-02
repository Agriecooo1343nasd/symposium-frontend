import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "../..");
const reactRoutes = path.join(root, "react/src/routes");
const exhibitorApp = path.join(root, "frontend/app/exhibitor");

const mappings = [
  ["exhibitor.index.tsx", "page.tsx"],
  ["exhibitor.booth.tsx", "booth/page.tsx"],
  ["exhibitor.qr.tsx", "qr/page.tsx"],
  ["exhibitor.sponsorship.tsx", "sponsorship/page.tsx"],
  ["exhibitor.materials.tsx", "materials/page.tsx"],
  ["exhibitor.leads.tsx", "leads/page.tsx"],
  ["exhibitor.passes.tsx", "passes/page.tsx"],
  ["exhibitor.analytics.tsx", "analytics/page.tsx"],
  ["exhibitor.location.tsx", "location/page.tsx"],
  ["exhibitor.networking.tsx", "networking/page.tsx"],
  ["exhibitor.live.tsx", "live/page.tsx"],
];

function transform(src, fileName) {
  let s = src;

  s = s.replace(/^import \{ createFileRoute[^]*?\} from "@tanstack\/react-router";\n?/m, "");
  s = s.replace(/^export const Route = createFileRoute\([^)]+\)\(\{[^}]*\}\);\n?/m, "");
  s = s.replace(/^export const Route = createFileRoute\([^)]+\)\(\{\n[^]*?\}\);\n?/m, "");

  if (s.includes('from "@tanstack/react-router"')) {
    s = s.replace(/import \{([^}]+)\} from "@tanstack\/react-router";/, (_, names) => {
      const parts = names.split(",").map((n) => n.trim()).filter(Boolean);
      const linkOnly = parts.filter((p) => p === "Link");
      const navParts = parts.filter((p) => p !== "Link");
      let out = "";
      if (linkOnly.length) out += 'import Link from "next/link";\n';
      if (navParts.length) out += `import { ${navParts.join(", ")} } from "next/navigation";\n`;
      return out;
    });
  } else if (s.includes("<Link ") && !s.includes('from "next/link"')) {
    s = 'import Link from "next/link";\n' + s;
  }

  s = s.replace(/<Link to="([^"]+)"/g, '<Link href="$1"');
  s = s.replace(/<Link to=\{`([^`]+)`\}/g, "<Link href={`$1`}");
  s = s.replace(/<Link to="([^"]+)" target="_blank"/g, '<Link href="$1" target="_blank"');

  s = s.replace(/^function Page\(\)/m, "export default function Page()");
  if (!s.includes("export default function Page")) {
    s = s.replace(/^function (\w+)\(\)/m, "export default function $1()");
  }

  if (!s.includes('"use client"')) {
    s = '"use client";\n\n' + s;
  }

  return s;
}

fs.mkdirSync(exhibitorApp, { recursive: true });

for (const [srcName, destRel] of mappings) {
  const srcPath = path.join(reactRoutes, srcName);
  if (!fs.existsSync(srcPath)) {
    console.warn("SKIP missing:", srcName);
    continue;
  }
  const raw = fs.readFileSync(srcPath, "utf8");
  const out = transform(raw, destRel);
  const destPath = path.join(exhibitorApp, destRel);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, out);
  console.log("Wrote", destRel);
}

console.log("Done");
