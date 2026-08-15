export const getCourseHue = (subject: string, code: string) => {
	const str = (subject + code).toUpperCase();
	let hash = 0;

	for (let i = 0; i < str.length; i++) {
		// Using a larger prime multiplier helps spread the values
		hash = hash * 131 + str.charCodeAt(i);
		// Standard bitwise mixing to further scramble the bits
		hash = hash | 0;
	}

	/**
	 * Bit Scrambling (Jenkin's-style mix):
	 * This ensures that small changes in the hash input result in
	 * large jumps in the final output.
	 */
	hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
	hash = ((hash >> 16) ^ hash) * 0x45d9f3b;
	hash = (hash >> 16) ^ hash;

	// We use modulo 360 to get the final hue, taking the absolute value.
	return Math.abs(hash % 360);
};
