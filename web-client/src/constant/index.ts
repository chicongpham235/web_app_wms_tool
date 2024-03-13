export function getBackEndUrl() {
  return import.meta.env.VITE_API_BASE_URL || "/";
}
export * from "./_type";
export * from "./_color";
export * from "./_config";
export * from "./_status";
