/**
 * Parses process.version and checks if Node.js >= 22.6.0.
 * Handles both standard semver (v22.7.0) and non-standard variants.
 */
export function checkNodeVersion(): boolean {
  const version = process.version;
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  if (!match) {
    return false;
  }
  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10);
  const patch = parseInt(match[3], 10);

  if (major > 22) return true;
  if (major < 22) return false;
  if (minor > 6) return true;
  if (minor < 6) return false;
  return patch >= 0;
}
