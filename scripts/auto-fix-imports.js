#!/usr/bin/env node

/**
 * 自动修复缺失的导出
 * 用法: node scripts/auto-fix-imports.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`)
};

// 修复配置
const FIXES = [
  {
    file: 'src/api/erp/saltprocess/preheating/index.ts',
    additions: `
/**
 * 获取预热图表数据
 */
export const getPreheatingChartData = (taskId: string, type?: string): AxiosPromise<any> => {
  return request({
    url: \`/erp/saltprocess/preheating/chart/\${taskId}\`,
    method: 'get',
    params: { type }
  });
};`
  },
  {
    file: 'src/api/erp/saltprocess/saltmaking/index.ts',
    additions: `
/**
 * 获取实时数据
 */
export const getRealtimeData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: \`/erp/saltprocess/saltmaking/realtime/\${taskId}\`,
    method: 'get'
  });
};

/**
 * 获取制盐图表数据
 */
export const getSaltmakingChartData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: \`/erp/saltprocess/saltmaking/chart/\${taskId}\`,
    method: 'get'
  });
};

/**
 * 获取制盐比例数据
 */
export const getSaltmakingRatioData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: \`/erp/saltprocess/saltmaking/ratio/\${taskId}\`,
    method: 'get'
  });
};

/**
 * 获取制盐比例配置
 */
export const getSaltmakingRatioConfig = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/saltmaking/ratio/config',
    method: 'get'
  });
};

/**
 * 获取制盐质量列表
 */
export const listSaltmakingQuality = (taskId?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/saltmaking/quality/list',
    method: 'get',
    params: { taskId }
  });
};`
  },
  {
    file: 'src/api/erp/saltprocess/quality/index.ts',
    additions: `
/**
 * 获取质量测试列表
 */
export const listQualityTest = (query?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/quality/test/list',
    method: 'get',
    params: query
  });
};

/**
 * 删除质量测试
 */
export const deleteQualityTest = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: \`/erp/saltprocess/quality/test/\${ids.join(',')}\`,
    method: 'delete'
  });
};

/**
 * 批准质量测试
 */
export const approveQualityTest = (id: string): AxiosPromise<void> => {
  return request({
    url: \`/erp/saltprocess/quality/test/\${id}/approve\`,
    method: 'post'
  });
};

/**
 * 拒绝质量测试
 */
export const rejectQualityTest = (id: string, reason: string): AxiosPromise<void> => {
  return request({
    url: \`/erp/saltprocess/quality/test/\${id}/reject\`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 获取质量概览
 */
export const getQualityOverview = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/quality/overview',
    method: 'get'
  });
};

/**
 * 导出质量测试列表
 */
export const exportQualityTestList = (query?: any): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/quality/test/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};`
  }
];

function applyFix(filePath, additions) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(fullPath)) {
      log.warn(`文件不存在: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // 检查是否已经添加
    if (content.includes(additions.trim().split('\n')[1])) {
      log.info(`已跳过 (已存在): ${filePath}`);
      return true;
    }

    // 添加到文件末尾
    content = content.trimEnd() + '\n' + additions + '\n';
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    log.success(`已修复: ${filePath}`);
    return true;
  } catch (error) {
    log.error(`修复失败 ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  log.info('开始自动修复缺失的导出...\n');

  let fixed = 0;
  let failed = 0;

  for (const fix of FIXES) {
    if (applyFix(fix.file, fix.additions)) {
      fixed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  log.info(`修复完成: ${fixed} 个文件已修复, ${failed} 个失败`);
  console.log('='.repeat(60));

  if (failed === 0) {
    log.success('所有修复都已应用！');
    log.info('下一步: 运行 node scripts/check-imports.js 验证');
  }
}

main().catch(error => {
  log.error(`执行出错: ${error.message}`);
  process.exit(1);
});

