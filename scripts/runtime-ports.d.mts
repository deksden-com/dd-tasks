export function runtimePorts(env?: Record<string, string | undefined>): {
  api: number;
  web: number;
  preview: number;
  apiUrl: string;
  webUrl: string;
  previewUrl: string;
};
