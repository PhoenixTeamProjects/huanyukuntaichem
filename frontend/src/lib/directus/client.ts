import { createDirectus, rest, staticToken } from '@directus/sdk';

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
const staticTokenValue = process.env.DIRECTUS_STATIC_TOKEN;

export function getDirectusClient() {
  if (!directusUrl) {
    return null;
  }

  const client = createDirectus(directusUrl).with(rest());

  if (staticTokenValue) {
    return client.with(staticToken(staticTokenValue));
  }

  return client;
}

export const directusAssetUrl = (assetId: string | null | undefined) => {
  if (!directusUrl || !assetId) {
    return null;
  }

  return `${directusUrl}/assets/${assetId}`;
};
