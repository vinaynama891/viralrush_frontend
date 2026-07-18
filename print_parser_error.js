const esbuild = require('esbuild');
const fs = require('fs');

const code = fs.readFileSync('src/pages/AnalyzeCompetitorPage.jsx', 'utf8');
const lines = code.split('\n');

function checkCompiles(content) {
  try {
    esbuild.transformSync(content, { loader: 'jsx' });
    return true;
  } catch (err) {
    return false;
  }
}

// Let's find the exact line causing the issue by checking prefixes of the file.
// Since a prefix of the file might not compile due to open functions/braces,
// we can append closing brackets to the prefix to make it a syntactically valid Javascript file.
// Specifically, we want to see where esbuild starts complaining about a syntax error that is NOT a simple missing bracket/brace.
// Or even simpler: we can check where the esbuild parser error is reported.
// Let's run esbuild transform and log the exact error object!
try {
  esbuild.transformSync(code, { loader: 'jsx' });
  console.log('Parser success!');
} catch (err) {
  console.log('Error message:', err.message);
  console.log('Error errors:', JSON.stringify(err.errors, null, 2));
}
