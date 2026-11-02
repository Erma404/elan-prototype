// Génère les modules JavaScript du site HTML à partir de la logique métier du prototype (types retirés).
import { transformSync } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
const conv = (src, dst, fix = (s) => s) => {
  const js = transformSync(readFileSync(src, 'utf8'), { loader: 'ts', format: 'esm', target: 'es2022' }).code;
  writeFileSync(dst, fix(js));
};
const imp = (s) => s.replace(/from "\.\/types"/g, '').replace(/from "(\.\.?\/[^"]+?)(?<!\.js)"/g, 'from "$1.js"');
conv('src/domain/eligibility.ts', 'html/js/engine.js', (s) => imp(s).replace('import data from "./financements.json.js"', 'import data from "./financements.js"').replace('import data from "./financements.json"', 'import data from "./financements.js"'));
conv('src/domain/pieces.ts', 'html/js/pieces.js', imp);
conv('src/features/ia/reponses.ts', 'html/js/reponses.js', (s) => imp(s).replace('"../../domain/eligibility.js"', '"./engine.js"'));
conv('src/features/eligibilite/questions.ts', 'html/js/questions.js', imp);
conv('src/mocks/api.ts', 'html/js/api.js', imp);
conv('src/mocks/dossiers.ts', 'html/js/dossiers.js', imp);
conv('src/lib/format.ts', 'html/js/format.js', imp);
writeFileSync('html/js/financements.js', 'export default ' + readFileSync('src/domain/financements.json', 'utf8') + '\n');
console.log('modules convertis');
