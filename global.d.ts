export {};

declare global {
  type OrientationLockType = "any" | "landscape" | "natural" | "portrait" | OrientationType;

  interface ScreenOrientation extends EventTarget {
    lock(orientation: OrientationLockType): Promise<void>;
  }
}
