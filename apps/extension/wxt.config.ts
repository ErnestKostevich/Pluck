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
    action: {
      default_title: 'Pluck',
    },
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
  },
});
