// Mapping container names to team, hourly cost (in ₹), and declared limits
const serviceMetadata = {
  'checkout-service': {
    team: 'payments',
    costPerHour: 12.50, // ₹12.50 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'payment-gateway': {
    team: 'payments',
    costPerHour: 25.00, // ₹25.00 / hour
    cpuLimitCores: 1.00,
    memLimitMB: 512
  },
  'user-auth': {
    team: 'platform',
    costPerHour: 10.00, // ₹10.00 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'api-gateway': {
    team: 'platform',
    costPerHour: 48.00, // ₹48.00 / hour
    cpuLimitCores: 2.00,
    memLimitMB: 1024
  },
  'inventory-api': {
    team: 'platform',
    costPerHour: 15.00, // ₹15.00 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'search-service': {
    team: 'platform',
    costPerHour: 32.00, // ₹32.00 / hour
    cpuLimitCores: 1.50,
    memLimitMB: 512
  },
  'notification-worker': {
    team: 'growth',
    costPerHour: 11.00, // ₹11.00 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'email-service': {
    team: 'growth',
    costPerHour: 8.00, // ₹8.00 / hour
    cpuLimitCores: 0.25,
    memLimitMB: 128
  },
  'recommendation-engine': {
    team: 'growth',
    costPerHour: 50.00, // ₹50.00 / hour
    cpuLimitCores: 2.00,
    memLimitMB: 1024
  },
  'cache-warmer': {
    team: 'growth',
    costPerHour: 14.00, // ₹14.00 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'log-aggregator': {
    team: 'infra',
    costPerHour: 18.00, // ₹18.00 / hour
    cpuLimitCores: 0.50,
    memLimitMB: 256
  },
  'metrics-collector': {
    team: 'infra',
    costPerHour: 22.00, // ₹22.00 / hour
    cpuLimitCores: 1.00,
    memLimitMB: 512
  }
};

/**
 * Get metadata for a given container name, with intelligent defaults
 */
function getMetadataForContainer(containerName) {
  // Strip leading slash if Docker returns /checkout-service
  const cleanName = containerName.replace(/^\//, '');
  if (serviceMetadata[cleanName]) {
    return serviceMetadata[cleanName];
  }

  // Fallback if container is not in pre-defined metadata list
  return {
    team: 'general',
    costPerHour: 15.00,
    cpuLimitCores: 1.00,
    memLimitMB: 512
  };
}

module.exports = {
  serviceMetadata,
  getMetadataForContainer
};
