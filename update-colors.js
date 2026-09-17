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
    
    // Text colors
    content = content.replace(/text-slate-[789]00/g, 'text-[var(--color-text)]');
    content = content.replace(/text-slate-[456]00/g, 'text-[var(--color-text-muted)]');
    content = content.replace(/text-slate-[123]00/g, 'text-[var(--color-text-muted)]');
    content = content.replace(/text-emerald-[6789]00/g, 'text-[var(--color-primary)]');
    content = content.replace(/text-emerald-[45]00/g, 'text-[var(--color-primary-light)]');
    
    // Backgrounds
    content = content.replace(/bg-white/g, 'bg-[var(--color-surface)]');
    content = content.replace(/bg-slate-50/g, 'bg-[var(--color-bg)]');
    content = content.replace(/bg-slate-100/g, 'bg-[var(--color-surface)]');
    content = content.replace(/bg-emerald-50/g, 'bg-[rgba(16,185,129,0.05)]');
    content = content.replace(/bg-emerald-100/g, 'bg-[rgba(16,185,129,0.1)]');
    
    // Borders
    content = content.replace(/border-slate-[123]00/g, 'border-[var(--color-border)]');
    content = content.replace(/border-emerald-[12]00/g, 'border-[var(--color-border)]');
    content = content.replace(/border-emerald-[345]00/g, 'border-[var(--color-primary)]');
    
    // Shadows
    content = content.replace(/shadow-sm/g, ''); 
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Replaced colors in TSX files!');
