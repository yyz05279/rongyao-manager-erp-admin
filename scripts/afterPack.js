// Minimal afterPack hook to prevent missing file errors in electron-builder
// This hook currently only logs basic info and performs no modifications.

/**
 * afterPack hook for electron-builder
 * @param {import('electron-builder').AfterPackContext} context
 */
module.exports = async function afterPack(context) {
  try {
    const { electronPlatformName, arch, appOutDir } = context;
    console.log(`[afterPack] noop hook -> platform: ${electronPlatformName}, arch: ${arch}, out: ${appOutDir}`);
  } catch (err) {
    console.warn('[afterPack] noop hook error (non-fatal):', err && err.message ? err.message : err);
  }
};

