module.exports = {
  apps: [
    {
      name: 'huanyukuntaichem-frontend',
      cwd: '/opt/websites/huanyukuntaichem-site/current/frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3007',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_SITE_URL: 'https://huanyukuntaichem.com',
        NEXT_PUBLIC_DIRECTUS_URL: 'https://cms.huanyukuntaichem.com'
      }
    }
  ]
};
