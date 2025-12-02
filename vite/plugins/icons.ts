import Icons from 'unplugin-icons/vite';

export default () => {
  return Icons({
    // 禁用自动安装图标库以避免 Windows 环境中的 ESM/CommonJS 兼容性问题
    // 在 GitHub Actions 流水线中会导致构建失败
    autoInstall: false
  });
};
