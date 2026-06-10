export type SafeDatabaseConfig = {
  databaseConfigured: boolean;
  databaseHost?: string;
  databasePort?: string;
  databaseProtocol?: string;
};

export function getRequiredDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL nao foi definida no inventory-service');
  }

  return databaseUrl;
}

export function getSafeDatabaseConfig(
  databaseUrl = process.env.DATABASE_URL,
): SafeDatabaseConfig {
  if (!databaseUrl?.trim()) {
    return {
      databaseConfigured: false,
    };
  }

  try {
    const parsedUrl = new URL(databaseUrl);

    return {
      databaseConfigured: true,
      databaseHost: parsedUrl.hostname,
      databasePort: parsedUrl.port || undefined,
      databaseProtocol: parsedUrl.protocol.replace(':', ''),
    };
  } catch {
    return {
      databaseConfigured: true,
      databaseHost: 'invalid-url',
    };
  }
}
