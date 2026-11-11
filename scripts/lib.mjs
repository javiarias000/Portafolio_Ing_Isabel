export const widthsFor = (srcW, targets) => [...new Set(targets.filter(w => w < srcW).concat(Math.min(srcW, targets.at(-1))))].sort((a, b) => a - b);
export const FB_TARGETS = [480, 960];
export const SITE_TARGETS = [480, 960, 1600];
