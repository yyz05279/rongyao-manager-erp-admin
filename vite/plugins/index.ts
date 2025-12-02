import vue from '@vitejs/plugin-vue';
import createUnoCss from './unocss';
import createAutoImport from './auto-import';
import createComponents from './components';
import createIcons from './icons';
import createSvgIconsPlugin from './svg-icon';
import createCompression from './compression';
import createSetupExtend from './setup-extend';
import path from 'path';

export default (viteEnv: any, isBuild = false): [] => {
  const vitePlusgins: any = [];
  vitePlusgins.push(vue());
  vitePlusgins.push(createUnoCss());
  vitePlusgins.push(createAutoImport(path));
  vitePlusgins.push(createComponents(path));
  vitePlusgins.push(createCompression(viteEnv));
  // 在构建时跳过 unplugin-icons 以避免 Windows 环境中的 ESM/CommonJS 兼容性问题
  // 这个插件在 GitHub Actions 流水线中会导致构建失败
  if (!isBuild) {
    vitePlusgins.push(createIcons());
  }
  vitePlusgins.push(createSvgIconsPlugin(path, isBuild));
  vitePlusgins.push(createSetupExtend());
  return vitePlusgins;
};
