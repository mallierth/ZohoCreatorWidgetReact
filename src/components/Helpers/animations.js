export const focusPop = (duration = 300, distance = 10) => {
	return {
		transition: `all ${duration}ms cubic-bezier(0.34, 1.61, 0.7, 1)`,
		'&:hover': { transform: `translateY(-${distance}px)` },
	};
};
