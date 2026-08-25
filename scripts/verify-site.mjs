import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const checks = [
  {
    label: 'homepage has crawler-visible thesis',
    file: 'dist/index.html',
    includes: ['Architecture begins where the situation becomes accountable.', 'Flagship Investigation', 'Notes long-tail'],
  },
  {
    label: 'investigation index is static',
    file: 'dist/investigations/index.html',
    includes: ['Work only enters as an Investigation', 'Chankillo - In Between Scapes'],
  },
  {
    label: 'chankillo page carries publish gate',
    file: 'dist/investigations/chankillo-in-between-scapes/index.html',
    includes: ['Claim', 'Investigation', 'Artifact', 'Consequence', 'External consequence'],
  },
  {
    label: 'notes index is static',
    file: 'dist/notes/index.html',
    includes: ['Candidate work, kept under pressure.', 'In-Side In', 'Bamboo Wife', 'When Is A Kitchen Not A Kitchen?'],
  },
  {
    label: 'note detail explains gate status',
    file: 'dist/notes/in-side-in/index.html',
    includes: ['Gate status', 'remains a Note until its external consequence'],
  },
  {
    label: 'sitemap lists static review routes',
    file: 'dist/sitemap.xml',
    includes: ['https://wwwd-theta.vercel.app/', '/investigations/chankillo-in-between-scapes/', '/notes/in-side-in/'],
  },
  {
    label: 'robots points crawlers to sitemap',
    file: 'dist/robots.txt',
    includes: ['User-agent: *', 'Allow: /', 'Sitemap: https://wwwd-theta.vercel.app/sitemap.xml'],
  },
];

const failures = [];

for (const check of checks) {
  const path = join(process.cwd(), check.file);
  if (!existsSync(path)) {
    failures.push(`${check.label}: missing ${check.file}`);
    continue;
  }

  const html = readFileSync(path, 'utf8');
  for (const needle of check.includes) {
    if (!html.includes(needle)) {
      failures.push(`${check.label}: missing "${needle}" in ${check.file}`);
    }
  }
}

if (failures.length) {
  for (const failure of failures) {
    console.error(failure);
  }
  process.exit(1);
}

console.log(`Verified ${checks.length} static WWWD surfaces.`);
