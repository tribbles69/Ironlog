/* Ironlog — bundled data. Split out of index.html (r&d/notes/module-split.md).

   The shipped program's manifest: what Settings shows for it, so that row
   costs nothing until the program itself (program.json, 38 kB) is wanted.
   It lives in program-manifest.json, written by r&d/tools/build-program-wdc.py
   — do not hand-edit either file. Programs installed from an earlier manifest
   are listed under it in Settings so their planned sessions can still be
   removed; PROGRAM_NAMES is how those are named.

   Both are filled once, by loadBundledData(), which boot waits for before the
   first render. If the file cannot be read the manifest stays null, which
   every use already allows for: Settings shows no shipped program. */
export let PROGRAM_MANIFEST = null;
export let PROGRAM_NAMES = {};

export async function loadBundledData() {
  try {
    const r = await fetch('program-manifest.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const d = await r.json();
    PROGRAM_MANIFEST = d.manifest || null;
    PROGRAM_NAMES = d.names || {};
  } catch (e) {
    console.warn('program-manifest.json', e);
  }
}
