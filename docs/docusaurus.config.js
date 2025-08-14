// @ts-check
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Git-Inspect Docs',
  tagline: 'Documentation',
  url: 'http://localhost:3000', // root site URL
  baseUrl: '/docs/', // docs will be served from /docs/
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'git-inspect',
  projectName: 'docs',

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */ ({
        docs: {
          path: 'docs',
          routeBasePath: '/', // serve docs at /docs/ instead of /docs/docs
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */ ({
      navbar: {
        title: 'Git-Inspect',
        logo: {
          alt: 'Git-Inspect',
          src: 'img/logo.svg',
        },
        items: [
          {
            to: '/', // since routeBasePath is '/', this is /docs/
            label: 'Docs',
            position: 'left',
          },
          {
            href: 'http://localhost:3000/', // absolute link to root Next.js app
            label: 'Back to App',
            position: 'right',
          },
        ],
      },
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
    }),
};

module.exports = config;
