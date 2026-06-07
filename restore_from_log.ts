import * as fs from 'fs';
import * as path from 'path';

function findFiles(dir: string, pattern: RegExp): string[] {
  let results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
         // Avoid large node_modules
         if (file !== 'node_modules' && file !== '.git') {
           results = results.concat(findFiles(fullPath, pattern));
         }
      } else {
         if (pattern.test(fullPath)) {
           results.push(fullPath);
         }
      }
    }
  } catch (e) {}
  return results;
}

console.log("Searching for potential App.tsx content backups...");
const matches = findFiles('.', /App\.tsx/i);
console.log("Matches:", matches);

// Let's search inside /.gemini folder as well!
if (fs.existsSync('/.gemini')) {
  console.log("Searching in /.gemini...");
  const geminiMatches = findFiles('/.gemini', /transcript/i);
  console.log("Gemini transcript matches:", geminiMatches);
  
  // Let's print the size and some lines of transcript if found
  if (geminiMatches.length > 0) {
    const logPath = geminiMatches[0];
    const stat = fs.statSync(logPath);
    console.log(`Found log file at ${logPath} with size ${stat.size} bytes`);
  }
}
