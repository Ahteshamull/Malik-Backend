import os from "os";

export const getSystemStats = () => {
  const uptime = process.uptime();
  const days = Math.floor(uptime / (60 * 60 * 24));
  const hours = Math.floor((uptime / (60 * 60)) % 24);
  const minutes = Math.floor((uptime / 60) % 60);
  const seconds = Math.floor(uptime % 60);

  const totalMemory = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
  const freeMemory = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
  const usedMemory = (totalMemory - freeMemory).toFixed(1);
  const memoryPercentage = ((usedMemory / totalMemory) * 100).toFixed(2);

  const systemTime = new Date().toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const cpuLoad = (os.loadavg()[0] * 100 / os.cpus().length).toFixed(2);

  return {
    uptime: `${days}d ${hours}h ${minutes}m ${seconds}s`,
    memory: `${usedMemory} GB / ${totalMemory} GB (${memoryPercentage}%)`,
    cpuLoad: `${cpuLoad}%`,
    systemTime,
  };
};
