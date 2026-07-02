const fs = require('fs');

let content = fs.readFileSync('src/app/page.tsx', 'utf8');

// Replace font weights and tracking
content = content.replace(/\bfont-black\b/g, 'font-light tracking-tighter');
content = content.replace(/\bfont-bold\b/g, 'font-medium tracking-tight');
content = content.replace(/\bfont-semibold\b/g, 'font-medium tracking-tight');

// Ensure we don't have duplicate tracking classes if we just added them
content = content.replace(/tracking-tighter tracking-tight/g, 'tracking-tighter');
content = content.replace(/tracking-tighter tracking-tighter/g, 'tracking-tighter');

fs.writeFileSync('src/app/page.tsx', content, 'utf8');
console.log('Fonts and tracking updated in page.tsx');
