/**
 * Created by: devops-agent
 * Role:       DevOps Engineer
 * Purpose:    Next.js configuration — keeps `pg` external on the server
 *             so the PostgreSQL adapter works in serverless/Node runtimes.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],
};

export default nextConfig;
