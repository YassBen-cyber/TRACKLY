const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\btext-zinc-400\b/g, replace: 'text-muted-foreground' },
  { regex: /\btext-zinc-300\b/g, replace: 'text-muted-foreground' },
  { regex: /\bshadow-zinc-200\/\d+\b/g, replace: 'shadow-foreground/5' },
  { regex: /\bbg-zinc-900\b/g, replace: 'bg-primary' },
  { regex: /\bhover:bg-zinc-800\b/g, replace: 'hover:bg-primary/90' },
  { regex: /\bshadow-zinc-900\/\d+\b/g, replace: 'shadow-primary/20' },
  { regex: /\btext-white\b/g, replace: 'text-primary-foreground' },
  { regex: /\bhover:bg-red-50\b/g, replace: 'hover:bg-destructive/10' },
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
        console.log(`Updated Phase 2: ${fullPath}`);
      }
    }
  }
}

processDirectory('./src/app/coach');
processDirectory('./src/app/client');
processDirectory('./src/components');
console.log('Migration Phase 2 complete.');
