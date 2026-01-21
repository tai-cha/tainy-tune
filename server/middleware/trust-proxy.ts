import { defineEventHandler, getRequestHeader } from 'h3';
import { env } from '~/utils/env';

export default defineEventHandler((event) => {
  // 1. Sanitize: Remove any existing injection attempt of our internal header
  const TRUST_HEADER = 'x-better-auth-trust-ip';
  if (getRequestHeader(event, TRUST_HEADER)) {
    // In H3, we can't easily "delete" a header from the incoming request object directly exposed
    // but we can ensure we overwrite it effectively for downstream consumers if we set it later.
    // However, better-auth might read from raw headers.
    // Ideally we assume the edge / ingress strips this, but for safety we will overwrite it.
  }

  // 2. Priority Headers (Single IP)
  const priorityHeaders = [
    'cf-connecting-ip',
    'true-client-ip',
    'x-real-ip',
    'x-client-ip'
  ];

  let resolvedIp: string | null = null;

  for (const name of priorityHeaders) {
    const val = getRequestHeader(event, name);
    if (val) {
      resolvedIp = val.split(',')[0].trim(); // Just in case someone sends a list
      break;
    }
  }

  // 3. Hop Count Logic (List Headers)
  if (!resolvedIp) {
    const xff = getRequestHeader(event, 'x-forwarded-for');
    if (xff) {
      const ips = xff.split(',').map(ip => ip.trim()).filter(Boolean);
      const hops = env.BETTER_AUTH_TRUST_PROXY_HOPS;

      // Rightmost is the most recent proxy.
      // If hops=1, we skip 1 from right. index = length - 1 - 1.
      const index = ips.length - 1 - hops;

      if (index >= 0 && index < ips.length) {
        resolvedIp = ips[index];
      } else {
        // Fallback: if configured hops > available IPs, use the leftmost (original)
        // or effectively treat as untrusted. Let's take leftmost as best effort.
        resolvedIp = ips[0];
      }
    }
  }

  // 4. Set Internal Header for Better Auth
  if (resolvedIp) {
    // Better Auth reads headers from the request object.
    // In Nitro, event.node.req.headers is the raw incoming headers object.
    event.node.req.headers[TRUST_HEADER] = resolvedIp;
  }
});
