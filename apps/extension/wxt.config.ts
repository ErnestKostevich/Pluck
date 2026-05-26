import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  srcDir: 'src',
  manifest: {
    name: 'Pluck — AI Visual Web Scraper',
    description: 'Click anything on any page to extract structured data.',
    permissions: ['activeTab', 'tabs', 'storage', 'scripting', 'alarms'],
    host_permissions: ['<all_urls>'],
    icons: {
      16: 'icon/16.png',
      32: 'icon/32.png',
      48: 'icon/48.png',
      96: 'icon/96.png',
      128: 'icon/128.png',
    },
    action: {
      default_title: 'Pluck',
      default_icon: {
        16: 'icon/16.png',
        32: 'icon/32.png',
      },
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  },
});
