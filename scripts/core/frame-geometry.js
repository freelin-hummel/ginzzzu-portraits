export function fittedFrameWidth({ naturalWidth, naturalHeight, renderedHeight, slotWidth, minimumWidth = 48 }) {
  const width = Number(naturalWidth);
  const height = Number(naturalHeight);
  const targetHeight = Number(renderedHeight);
  const maximum = Number(slotWidth);
  const minimum = Math.max(1, Number(minimumWidth) || 48);

  if (!(width > 0) || !(height > 0) || !(targetHeight > 0) || !(maximum > 0)) return maximum;
  return Math.max(minimum, Math.min(maximum, targetHeight * (width / height)));
}
