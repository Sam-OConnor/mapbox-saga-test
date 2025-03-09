import portsJSON from "./ports.json";

export const searchPorts = (searchQuery = "") => {
  return portsJSON.features.filter((port) =>
    port.properties.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
};
