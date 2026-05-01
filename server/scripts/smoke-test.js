const baseUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

const requestJson = async path => {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(`${path} failed with HTTP ${response.status}: ${JSON.stringify(body)}`);
  }

  return body;
};

try {
  const health = await requestJson('/api/health');
  const analyses = await requestJson('/api/analyses');

  if (!health.ok || !analyses.ephemeral) {
    throw new Error(`Unexpected smoke response: ${JSON.stringify({ health, analyses })}`);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        health: {
          service: health.service,
          config: health.config
        },
        analyses: {
          ephemeral: analyses.ephemeral,
          itemCount: analyses.items?.length ?? 0
        }
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(`Smoke test failed: ${error.message}`);
  process.exit(1);
}
