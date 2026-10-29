/*
 * Fact images come from Wikimedia, as 1280px thumbnails or original files of
 * up to several hundred KB, while the app shows them at phone width. Wikimedia
 * serves any image at a set of standard widths: ask for those instead.
 */

const WIDTHS = [500, 960];
const RESIZABLE = /\.(jpe?g|png|gif|webp)$/i;

// .../commons/thumb/a/ab/Name.jpg/1280px-Name.jpg
const THUMB = /^(https:\/\/(?:upload|thumb)\.wikimedia\.org\/wikipedia\/[^/]+\/thumb\/[0-9a-f]\/[0-9a-f]{2}\/[^/]+\/)\d+px-([^/]+)$/;
// .../commons/a/ab/Name.jpg (the original file)
const ORIGINAL = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/([^/]+)\/([0-9a-f])\/([0-9a-f]{2})\/([^/]+)$/;

/** The URL of a Wikimedia image at a given width, or null when it is not one we can resize. */
export function wikimediaAtWidth(url: string, width: number): string | null {
  const thumb = url.match(THUMB);
  if (thumb && RESIZABLE.test(thumb[2])) return `${thumb[1]}${width}px-${thumb[2]}`;
  const original = url.match(ORIGINAL);
  if (original && RESIZABLE.test(original[4])) {
    const [, project, a, ab, name] = original;
    return `https://upload.wikimedia.org/wikipedia/${project}/thumb/${a}/${ab}/${name}/${width}px-${name}`;
  }
  return null;
}

/** A srcset with Wikimedia's standard widths, or undefined for other images. */
export function wikimediaSrcSet(url: string): string | undefined {
  const candidates = WIDTHS.map((w) => [wikimediaAtWidth(url, w), w] as const);
  if (candidates.some(([u]) => !u)) return undefined;
  return candidates.map(([u, w]) => `${u} ${w}w`).join(", ");
}
