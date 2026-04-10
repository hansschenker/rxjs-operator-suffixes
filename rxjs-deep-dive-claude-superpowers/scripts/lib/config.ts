import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export const WIKI_DIR = path.resolve(ROOT, '../rxjs-wiki');
export const SPA_DIR = path.resolve(ROOT, '../rxjs-spa');
export const SLIDES_DRAFT_DIR = path.join(WIKI_DIR, 'slides');
export const SLIDES_POLISHED_DIR = path.join(ROOT, 'slides-polished');
export const RECORDING_NOTES_DIR = path.join(ROOT, 'docs/recording-notes');
export const CURRICULUM_PATH = path.join(ROOT, 'curriculum.json');
