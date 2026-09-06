export function runtimePorts(env = process.env) {
  const number = (value, fallback) => {
    const parsed = Number(value ?? fallback);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535)
      throw new Error("Invalid runtime port");
    return parsed;
  };
  const api = number(env.DD_FLOW_PORT_API ?? env.API_PORT, 8787);
  const web = number(env.DD_FLOW_PORT_WEB ?? env.WEB_PORT, 5173);
  const preview = number(env.DD_FLOW_PORT_PREVIEW ?? env.PREVIEW_PORT, 4173);
  return {
    api,
    web,
    preview,
    apiUrl: `http://127.0.0.1:${api}`,
    webUrl: `http://127.0.0.1:${web}`,
    previewUrl: `http://127.0.0.1:${preview}`,
  };
}
