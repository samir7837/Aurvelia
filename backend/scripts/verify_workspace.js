const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

function checkRequires(folder) {
  const files = fs.readdirSync(folder).filter(f => f.endsWith('.js'));
  const results = [];
  for (const f of files) {
    const full = path.join(folder, f);
    try {
      require(full);
      results.push({ file: full, ok: true });
    } catch (err) {
      results.push({ file: full, ok: false, error: err.message });
    }
  }
  return results;
}

console.log('Node version:', process.version);
console.log('Checking models...');
const modelsDir = path.join(__dirname, '..', 'src', 'models');
const modelResults = checkRequires(modelsDir);
modelResults.forEach(r => console.log(r.ok ? `OK  ${r.file}` : `ERR ${r.file} -> ${r.error}`));

console.log('\nRegistered mongoose models:');
try {
  const names = mongoose.modelNames();
  console.log(names.length ? names.join(', ') : '(none)');
} catch (e) {
  console.log('Could not list models:', e.message);
}

console.log('\nChecking routes...');
const routesDir = path.join(__dirname, '..', 'src', 'routes');
const routeResults = checkRequires(routesDir);
routeResults.forEach(r => console.log(r.ok ? `OK  ${r.file}` : `ERR ${r.file} -> ${r.error}`));

process.exit(0);
