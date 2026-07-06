/** Radix Select inside Dialog can leave `pointer-events: none` on body after close. */
export function releaseStuckRadixLayerLocks() {
  requestAnimationFrame(() => {
    const anyOpenOverlay =
      document.querySelector('[data-state="open"][role="dialog"]') ||
      document.querySelector('[data-state="open"][role="alertdialog"]') ||
      document.querySelector("[data-radix-select-content][data-state='open']");

    if (!anyOpenOverlay) {
      document.body.style.removeProperty("pointer-events");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
      document.body.removeAttribute("data-scroll-locked");
    }
  });
}

export function isRadixSelectPortalTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest("[data-radix-select-content]") ||
      target.closest("[role='listbox']") ||
      target.closest("[data-radix-popper-content-wrapper]"),
  );
}

export function preventCloseOnSelectPortal(
  e: Event,
) {
  if (isRadixSelectPortalTarget(e.target)) {
    e.preventDefault();
  }
}
