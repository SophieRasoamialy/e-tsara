const runtimeEnv =
  typeof window !== "undefined" && window.env ? window.env : {};

function getDefaultApiUrl() {
  if (typeof window === "undefined") {
    return "";
  }

  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}:8000`;
}

const env = {
  API_URL:
    runtimeEnv.API_URL ||
    process.env.REACT_APP_API_URL ||
    getDefaultApiUrl(),
};

export default env;
