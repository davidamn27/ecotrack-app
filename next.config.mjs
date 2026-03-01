const isGithubPagesBuild = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "";
const githubPagesBasePath = isGithubPagesBuild && repositoryName ? `/${repositoryName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: githubPagesBasePath || undefined,
  basePath: githubPagesBasePath,
  output: "export",
  reactStrictMode: true,
  trailingSlash: true,
};

export default nextConfig;
