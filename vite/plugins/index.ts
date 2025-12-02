import vue from '@vitejs/plugin-vue';
import createUnoCss from './unocss';
import createAutoImport from './auto-import';
import createComponents from './components';
// import createIcons from './icons'; // 禁用 unplugin-icons 以避免 Windows 环境中的 ESM/CommonJS 兼容性问题
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
  // unplugin-icons 已禁用，使用 SVG 图标插件替代
  // vitePlusgins.push(createIcons());
  vitePlusgins.push(createSvgIconsPlugin(path, isBuild));
  vitePlusgins.push(createSetupExtend());
  return vitePlusgins;
};
