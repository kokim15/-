import * as fs from 'fs';
import * as path from 'path';

function searchRoot(dir: string, currentDepth: number = 0) {
  if (currentDepth > 4) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      if (f === 'node_modules' || f === '.git' || f === 'proc' || f === 'sys' || f === 'dev') continue;
      const full = path.join(dir, f);
      try {
        const stat = fs.statSync(full);
        if (stat.isDirectory()) {
          searchRoot(full, currentDepth + 1);
        } else if (f === 'App.tsx') {
          console.log(`Found App.tsx at: ${full}, size: ${stat.size}`);
        }
      } catch (e) {}
    }
  } catch (e) {}
}

console.log("Searching root for App.tsx replicas...");
searchRoot('/');
