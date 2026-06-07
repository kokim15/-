import * as fs from 'fs';
import * as path from 'path';

const logPath = '/.gemini/antigravity/brain/b8174710-1ca5-4b80-a320-4bade4ff28af/.system_generated/logs/transcript.jsonl';

console.log("Checking if transcript log exists...");
if (fs.existsSync(logPath)) {
  console.log("Log exists! Reading contents...");
  const content = fs.readFileSync(logPath, 'utf8');
  console.log("Log size:", content.length);
  
  // Find all blocks corresponding to "Content" of src/App.tsx or edits to src/App.tsx
  // We can write a parser to extract edit tool actions to target src/App.tsx
  const lines = content.split('\n');
  console.log("Total lines in log:", lines.length);
  
  // Let's search from the end to find any large react component content containing "Multi-Faith Scripture Search App"
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i];
    if (line.includes('Multi-Faith Scripture Search App') && line.length > 20000) {
       console.log(`Found a large JSON or text block at line ${i} of length ${line.length}`);
       // Let's parse it as JSON if possible
       try {
         const parsed = JSON.parse(line);
         console.log("Parsed JSON key keys:", Object.keys(parsed));
         // Check if contains tool arguments or file contents
         // Let's dump some keys
         fs.writeFileSync('logs_parsed_extracted.txt', JSON.stringify(parsed, null, 2), 'utf8');
         console.log("Extracted line to logs_parsed_extracted.txt");
         break;
       } catch(e: any) {
         console.log("Not strict JSON, checking indexes...");
       }
    }
  }
} else {
  console.log("Log does NOT exist at:", logPath);
}
