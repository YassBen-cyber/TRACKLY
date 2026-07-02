const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace font-ui with font-sans just in case any were missed
content = content.replace(/\bfont-ui\b/g, 'font-sans');

// Remove double tracking-tight
content = content.replace(/tracking-tight tracking-tight/g, 'tracking-tight');
content = content.replace(/tracking-tighter tracking-tight/g, 'tracking-tighter');
content = content.replace(/tracking-tight tracking-tighter/g, 'tracking-tighter');

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log('Cleaned up page.tsx');
