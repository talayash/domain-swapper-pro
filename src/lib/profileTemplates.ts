import type { ProfileInput } from '~/types';

export interface ProfileTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  profile: ProfileInput;
}

export const PROFILE_TEMPLATES: ProfileTemplate[] = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Standard web app with dev, staging, and production environments',
    icon: '🌐',
    profile: {
      name: 'My Web App',
      description: 'Web application environments',
      entries: [
        { url: 'app.example.com', role: 'production', label: 'Production', protocol: 'https' },
        { url: 'staging.example.com', role: 'staging', label: 'Staging', protocol: 'https' },
        { url: 'qa.example.com', role: 'qa', label: 'QA', protocol: 'https' },
        { url: 'dev.example.com', role: 'dev', label: 'Dev', protocol: 'https' },
        { url: 'localhost:3000', role: 'local', label: 'Local', protocol: 'http' },
      ],
    },
  },
  {
    id: 'microservice',
    name: 'API / Microservice',
    description: 'API service with environment-specific subdomains',
    icon: '🔧',
    profile: {
      name: 'My API',
      description: 'API service environments',
      entries: [
        { url: 'api.example.com', role: 'production', label: 'Production API', protocol: 'https' },
        { url: 'api.staging.example.com', role: 'staging', label: 'Staging API', protocol: 'https' },
        { url: 'api.dev.example.com', role: 'dev', label: 'Dev API', protocol: 'https' },
        { url: 'localhost:8080', role: 'local', label: 'Local API', protocol: 'http' },
      ],
    },
  },
  {
    id: 'multi-region',
    name: 'Multi-Region',
    description: 'Geographically distributed production environments',
    icon: '🗺️',
    profile: {
      name: 'My Service (Multi-Region)',
      description: 'Multi-region deployment',
      entries: [
        { url: 'us.example.com', role: 'production', label: 'US Production', protocol: 'https' },
        { url: 'eu.example.com', role: 'production', label: 'EU Production', protocol: 'https' },
        { url: 'ap.example.com', role: 'production', label: 'AP Production', protocol: 'https' },
        { url: 'staging.example.com', role: 'staging', label: 'Staging', protocol: 'https' },
      ],
    },
  },
  {
    id: 'preview-deploys',
    name: 'Preview Deploys',
    description: 'For platforms with branch-based preview URLs (Vercel, Netlify)',
    icon: '🚀',
    profile: {
      name: 'My Project (Previews)',
      description: 'Preview deploy environments',
      entries: [
        { url: 'my-project.vercel.app', role: 'production', label: 'Production', protocol: 'https' },
        { url: 'my-project-staging.vercel.app', role: 'staging', label: 'Staging', protocol: 'https' },
        { url: 'my-project-dev.vercel.app', role: 'dev', label: 'Dev Preview', protocol: 'https' },
        { url: 'localhost:3000', role: 'local', label: 'Local', protocol: 'http' },
      ],
    },
  },
];
