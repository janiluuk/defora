const path = require('path');
const { pathToFileURL } = require('url');

/** Load an ESM module from tests running as CommonJS (Node 18 CI). */
function loadEsm(...segmentsFromTestDir) {
  const abs = path.resolve(__dirname, ...segmentsFromTestDir);
  return import(pathToFileURL(abs).href);
}

module.exports = { loadEsm };
