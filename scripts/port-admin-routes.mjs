import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "../..");
const reactRoutes = path.join(root, "react/src/routes");
const adminApp = path.join(root, "frontend/app/admin");

const mappings = [
  ["admin.index.tsx", "page.tsx"],
  ["admin.registrations.tsx", "registrations/page.tsx"],
  ["admin.refunds.tsx", "refunds/page.tsx"],
  ["admin.ticket-plans.tsx", "ticket-plans/page.tsx"],
  ["admin.finance.tsx", "finance/page.tsx"],
  ["admin.programme.tsx", "programme/page.tsx"],
  ["admin.speakers.tsx", "speakers/page.tsx"],
  ["admin.exhibitors.tsx", "exhibitors/page.tsx"],
  ["admin.applications.tsx", "applications/page.tsx"],
  ["admin.moderation.tsx", "moderation/page.tsx"],
  ["admin.certificate.tsx", "certificate/page.tsx"],
  ["admin.committee.tsx", "committee/page.tsx"],
  ["admin.news.tsx", "news/page.tsx"],
  ["admin.networking.tsx", "networking/page.tsx"],
  ["admin.checkin.tsx", "checkin/page.tsx"],
  ["admin.communications.tsx", "communications/page.tsx"],
  ["admin.content.tsx", "content/page.tsx"],
  ["admin.analytics.tsx", "analytics/page.tsx"],
  ["admin.users.tsx", "users/page.tsx"],
  ["admin.desk.tsx", "desk/page.tsx"],
  ["admin.settings.tsx", "settings/page.tsx"],
  ["admin.abstracts.index.tsx", "abstracts/page.tsx"],
  ["admin.abstracts.$applicationId.tsx", "abstracts/[applicationId]/page.tsx"],
  ["admin.exhibitors.application.$applicationId.tsx", "exhibitors/application/[applicationId]/page.tsx"],
  ["admin.surveys.index.tsx", "surveys/page.tsx"],
  ["admin.surveys.$responseId.tsx", "surveys/[responseId]/page.tsx"],
];

function transform(src, fileName) {
  let s = src;

  // Remove route definition lines
  s = s.replace(/^import \{ createFileRoute[^]*?\} from "@tanstack\/react-router";\n?/m, "");
  s = s.replace(/^export const Route = createFileRoute\([^)]+\)\(\{[^}]*\}\);\n?/m, "");
  s = s.replace(/^export const Route = createFileRoute\([^)]+\)\(\{\n[^]*?\}\);\n?/m, "");

  // Merge Link imports with next/link
  if (s.includes('from "@tanstack/react-router"')) {
    s = s.replace(
      /import \{([^}]+)\} from "@tanstack\/react-router";/,
      (_, names) => {
        const parts = names.split(",").map((n) => n.trim()).filter(Boolean);
        const linkOnly = parts.filter((p) => p === "Link");
        const navParts = parts.filter((p) => p !== "Link");
        let out = "";
        if (linkOnly.length) out += 'import Link from "next/link";\n';
        if (navParts.length) out += `import { ${navParts.join(", ")} } from "next/navigation";\n`;
        return out;
      },
    );
  } else if (s.includes("<Link ") && !s.includes('from "next/link"')) {
    s = 'import Link from "next/link";\n' + s;
  }

  if (s.includes("notFound") && !s.includes('from "next/navigation"')) {
    if (!s.includes("useParams")) {
      s = s.replace(/^(import )/m, 'import { notFound } from "next/navigation";\n$1');
    } else {
      s = s.replace(
        /import \{([^}]+)\} from "next\/navigation";/,
        (_, names) => {
          const set = new Set(names.split(",").map((n) => n.trim()));
          set.add("notFound");
          return `import { ${[...set].join(", ")} } from "next/navigation";`;
        },
      );
    }
  }

  s = s.replace(/Route\.useParams\(\)/g, "useParams()");
  s = s.replace(/throw notFound\(\)/g, "notFound()");
  s = s.replace(/if \(!app\) throw notFound\(\)/g, "if (!app) notFound()");
  s = s.replace(/if \(!app\) notFound\(\)/g, "if (!app) notFound()");

  // Link conversions
  s = s.replace(/<Link to="([^"]+)"/g, '<Link href="$1"');
  s = s.replace(/<Link to=\{`([^`]+)`\}/g, "<Link href={`$1`}");
  s = s.replace(
    /<Link to="([^"]+)" params=\{\{ applicationId: ([^}]+) \}\}/g,
    '<Link href={`$1/${$2}`}',
  );
  s = s.replace(
    /<Link to="\/admin\/abstracts\/\$applicationId" params=\{\{ applicationId: ([^}]+) \}\}/g,
    "<Link href={`/admin/abstracts/${$1}`}",
  );
  s = s.replace(
    /<Link to="\/admin\/exhibitors\/application\/\$applicationId" params=\{\{ applicationId: ([^}]+) \}\}/g,
    "<Link href={`/admin/exhibitors/application/${$1}`}",
  );

  // Params destructuring for detail pages
  if (fileName.includes("[applicationId]") || fileName.includes("[responseId]")) {
    if (!s.includes("useParams")) {
      s = s.replace(
        /function Page\(\) \{/,
        `function Page() {\n  const params = useParams();`,
      );
    }
    s = s.replace(
      /const \{ applicationId \} = useParams\(\);/,
      'const applicationId = typeof params.applicationId === "string" ? params.applicationId : "";',
    );
    s = s.replace(
      /const \{ responseId \} = useParams\(\);/,
      'const responseId = typeof params.responseId === "string" ? params.responseId : "";',
    );
  }

  // Default export
  s = s.replace(/^function Page\(\)/m, "export default function Page()");
  if (!s.includes("export default function Page")) {
    s = s.replace(/^function (\w+)\(\)/m, "export default function $1()");
  }

  if (!s.includes('"use client"')) {
    s = '"use client";\n\n' + s;
  }

  return s;
}

fs.mkdirSync(adminApp, { recursive: true });

for (const [srcName, destRel] of mappings) {
  const srcPath = path.join(reactRoutes, srcName);
  if (!fs.existsSync(srcPath)) {
    console.warn("SKIP missing:", srcName);
    continue;
  }
  const raw = fs.readFileSync(srcPath, "utf8");
  const out = transform(raw, destRel);
  const destPath = path.join(adminApp, destRel);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, out);
  console.log("Wrote", destRel);
}

console.log("Done");
