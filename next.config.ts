import type { NextConfig } from "next";

const repository = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isGithubPages = process.env.GITHUB_ACTIONS === "true" && repository !== "";
const basePath = isGithubPages ? `/${repository}` : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  assetPrefix: basePath,
  images: { unoptimized: true },
  trailingSlash: true,
  // The starter includes Cloudflare-only database types that are not used by
  // this static site. Vinext performs the project type check before this build.
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
