import { execSync } from 'child_process';

try {
  console.log("Restoring src/App.tsx...");
  const out = execSync('git checkout -- src/App.tsx', { encoding: 'utf8' });
  console.log("Git checkout output:", out);
} catch (err: any) {
  console.error("Git checkout failed:", err.message);
  if (err.stdout) console.log("stdout:", err.stdout);
  if (err.stderr) console.log("stderr:", err.stderr);
}
