/** Live-updating touch / pointer mode (rotating a tablet updates these getters). */
const coarseMq = matchMedia("(pointer: coarse)");
const ZOOM_DESKTOP = 1.25;
const ZOOM_MOBILE = 1.0;
const MOBILE_AUDIO_MULT = 0.5;

export const UI = {
  get coarsePointer() {
    return coarseMq.matches;
  },
  get cameraZoom() {
    return coarseMq.matches ? ZOOM_MOBILE : ZOOM_DESKTOP;
  },
  /** Footsteps + wind: mobile runs quieter than desktop. */
  get audioMult() {
    return coarseMq.matches ? MOBILE_AUDIO_MULT : 1;
  },
};
