import type { NextConfig } from "next";

/**
 * SharePoint-embedding configuration.
 *
 * - APP_BASE_PATH: set this when the app is hosted under a subpath (e.g. a
 *   reverse proxy at https://intranet.example.com/it-equipment maps to this
 *   app). Leave unset for root-path hosting.
 * - ALLOWED_FRAME_ANCESTORS: comma-separated list of origins permitted to
 *   embed this app in an <iframe> -- typically your tenant's SharePoint
 *   domain(s), e.g. "https://contoso.sharepoint.com". Left empty by
 *   default, which sends no frame-ancestors directive (browsers apply
 *   their normal same-origin framing rules) until a deployment explicitly
 *   opts in to being embedded.
 */
const basePath = process.env.APP_BASE_PATH || undefined;
const allowedFrameAncestors = (process.env.ALLOWED_FRAME_ANCESTORS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  basePath,

  // Allows LAN devices to load dev-mode JS chunks/data requests (Next
  // blocks cross-origin access to these by default as a DNS-rebinding
  // protection). Update this if the host machine's LAN IP changes.
  allowedDevOrigins: ["10.100.160.63"],

  async headers() {
    if (allowedFrameAncestors.length === 0) return [];

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-ancestors 'self' ${allowedFrameAncestors.join(" ")};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
