const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /\[color-scheme:dark\]/g, replace: 'dark:[color-scheme:dark]' },
  { regex: /dark:dark:\[color-scheme:dark\]/g, replace: 'dark:[color-scheme:dark]' },
  { regex: /\bbg-black\/40\b/g, replace: 'bg-muted/40' },
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
        console.log(`Updated Phase 3: ${fullPath}`);
      }
    }
  }
}

processDirectory('./src/app/coach');
processDirectory('./src/app/client');
processDirectory('./src/components');
console.log('Migration Phase 3 complete.');
