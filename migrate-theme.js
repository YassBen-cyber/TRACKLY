const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\bbg-white\b/g, replace: 'bg-card' },
  { regex: /\btext-zinc-900\b/g, replace: 'text-foreground' },
  { regex: /\btext-zinc-800\b/g, replace: 'text-foreground' },
  { regex: /\btext-zinc-700\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-zinc-600\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-zinc-500\b/g, replace: 'text-muted-foreground' },
  { regex: /\bborder-zinc-100\b/g, replace: 'border-border' },
  { regex: /\bborder-zinc-200\b/g, replace: 'border-border' },
  { regex: /\bborder-zinc-300\b/g, replace: 'border-border' },
  { regex: /\bbg-zinc-50\b/g, replace: 'bg-muted/50' },
  { regex: /\bbg-zinc-100\b/g, replace: 'bg-muted' },
  { regex: /\bbg-zinc-200\b/g, replace: 'bg-muted' },
  { regex: /\bhover:bg-zinc-50\b/g, replace: 'hover:bg-muted/50' },
  { regex: /\bhover:bg-zinc-100\b/g, replace: 'hover:bg-muted' },
  { regex: /\bhover:bg-zinc-200\b/g, replace: 'hover:bg-muted' },
  { regex: /\bbg-\[\#F2F1ED\]\b/g, replace: 'bg-background' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory('./src/app/coach');
processDirectory('./src/app/client');
processDirectory('./src/components');
console.log('Migration complete.');
