/**
 * Preloaded (via NODE_OPTIONS=--require) shim for vinyl-fs/src used by gulp.
 * Filters out falsy/blank glob entries so gulp.src('') never throws
 * "Invalid glob argument:" during VS Code packaging of local extensions.
 */
const vfs = require('vinyl-fs');
const realSrc = vfs.src;

/**
 * Return an empty readable stream (gulp-compatible) when there is nothing to process.
 */
function emptyStream() {
	const { Readable } = require('stream');
	return Readable.from([]);
}

/**
 * Sanitize a glob or array of globs: drop non-strings and blank strings.
 * @param {string|string[]} globs
 * @returns {string|string[]|null}
 */
function sanitize(globs) {
	if (Array.isArray(globs)) {
		const cleaned = globs.filter(g => typeof g === 'string' && g.trim().length > 0);
		return cleaned.length ? cleaned : null;
	}
	if (typeof globs === 'string') {
		return globs.trim().length ? globs : null;
	}
	return null;
}

// Monkey-patch vinyl-fs.src to be tolerant of empty globs.
vfs.src = function patchedSrc(globs, options) {
	const safe = sanitize(globs);
	if (!safe) return emptyStream();
	return realSrc.call(this, safe, options);
};
