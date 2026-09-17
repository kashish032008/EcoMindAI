const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./client/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remaining light text colors
    content = content.replace(/text-teal-[56789]00/g, 'text-[var(--color-accent)]');
    content = content.replace(/text-blue-[56789]00/g, 'text-[#60a5fa]');
    content = content.replace(/text-rose-[56789]00/g, 'text-[#f43f5e]');
    
    // Remaining light background colors
    content = content.replace(/bg-teal-50/g, 'bg-[rgba(6,182,212,0.1)]');
    content = content.replace(/bg-blue-50/g, 'bg-[rgba(59,130,246,0.1)]');
    content = content.replace(/bg-rose-50/g, 'bg-[rgba(244,63,94,0.1)]');
    
    // Blur decors
    content = content.replace(/bg-emerald-200\/30/g, 'bg-[rgba(16,185,129,0.1)]');
    content = content.replace(/bg-teal-200\/30/g, 'bg-[rgba(6,182,212,0.1)]');
    
    // Add Animations
    // Pulse glow to primary buttons
    content = content.replace(/btn btn-primary/g, 'btn btn-primary animate-pulse-glow');
    // We already have animate-fade-up, but let's add animate-float to some main icons if we can, or we can just leave it as is if it's too risky with regex.
    // Actually let's just add animate-float to the lucide icons inside concepts or hero
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Replaced more colors and added animations in TSX files!');
