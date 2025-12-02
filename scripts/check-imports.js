#!/usr/bin/env node

/**
 * 检查所有缺失的导入和导出
 * 用法: node scripts/check-imports.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('fast-glob');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`)
};

// 获取所有导出的函数
function getExportsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const exports = new Set();

    // 匹配 export const/function/default
    const exportConstRegex = /export\s+const\s+(\w+)/g;
    const exportFunctionRegex = /export\s+function\s+(\w+)/g;
    const exportDefaultRegex = /export\s+default\s+(\w+)/g;
    const namedExportRegex = /export\s*\{\s*([^}]+)\s*\}/g;

    let match;

    // 获取 export const
    while ((match = exportConstRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }

    // 获取 export function
    while ((match = exportFunctionRegex.exec(content)) !== null) {
      exports.add(match[1]);
    }

    // 获取 export default
    while ((match = exportDefaultRegex.exec(content)) !== null) {
      exports.add('default');
    }

    // 获取命名导出
    while ((match = namedExportRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(n => n.trim().split(' as ')[0].trim());
      names.forEach(name => exports.add(name));
    }

    return exports;
  } catch (error) {
    return new Set();
  }
}

// 获取文件中的所有导入
function getImportsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = [];

    // 匹配 import { ... } from '...'
    const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]([^'"]+)['"]/g;
    const importDefaultRegex = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;
    const importStarRegex = /import\s*\*\s+as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;

    let match;

    // 获取命名导入
    while ((match = importRegex.exec(content)) !== null) {
      const names = match[1].split(',').map(n => n.trim().split(' as ')[0].trim());
      const source = match[2];
      names.forEach(name => {
        if (name) {
          imports.push({ name, source, type: 'named', line: content.substring(0, match.index).split('\n').length });
        }
      });
    }

    // 获取默认导入
    while ((match = importDefaultRegex.exec(content)) !== null) {
      imports.push({ name: match[1], source: match[2], type: 'default', line: content.substring(0, match.index).split('\n').length });
    }

    // 获取星号导入
    while ((match = importStarRegex.exec(content)) !== null) {
      imports.push({ name: match[1], source: match[2], type: 'star', line: content.substring(0, match.index).split('\n').length });
    }

    return imports;
  } catch (error) {
    return [];
  }
}

// 解析导入路径
function resolveImportPath(importPath, fromFile) {
  // 处理别名
  if (importPath.startsWith('@/')) {
    return importPath.replace('@/', path.join(__dirname, '../src/'));
  }

  // 处理相对路径
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    return path.resolve(path.dirname(fromFile), importPath);
  }

  // 处理 node_modules
  return null;
}

// 检查导入是否存在
function checkImport(importItem, fromFile) {
  const { name, source, type, line } = importItem;

  // 跳过 node_modules
  if (!source.startsWith('@/') && !source.startsWith('./') && !source.startsWith('../')) {
    return { valid: true, reason: 'node_modules' };
  }

  const resolvedPath = resolveImportPath(source, fromFile);
  if (!resolvedPath) {
    return { valid: true, reason: 'external' };
  }

  // 尝试找到文件
  let filePath = resolvedPath;

  // 尝试不同的扩展名
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '.vue', '/index.ts', '/index.js'];
  let found = false;
  let actualPath = null;

  for (const ext of extensions) {
    const testPath = filePath + ext;
    if (fs.existsSync(testPath)) {
      found = true;
      actualPath = testPath;
      break;
    }
  }

  if (!found) {
    return { valid: false, reason: `File not found: ${filePath}` };
  }

  // 如果是星号导入，跳过检查
  if (type === 'star') {
    return { valid: true, reason: 'star import' };
  }

  // 如果是默认导入，跳过检查
  if (type === 'default') {
    return { valid: true, reason: 'default import' };
  }

  // 检查导出是否存在
  const exports = getExportsFromFile(actualPath);
  if (exports.has(name)) {
    return { valid: true, reason: 'exported' };
  }

  return { valid: false, reason: `"${name}" is not exported by "${source}"`, actualPath };
}

// 主函数
async function main() {
  log.info('开始检查所有导入...\n');

  // 获取所有 TypeScript 和 Vue 文件
  const files = await glob(['src/**/*.{ts,tsx,js,jsx,vue}'], {
    cwd: path.join(__dirname, '..')
  });

  const errors = [];
  const warnings = [];
  let checkedCount = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    const imports = getImportsFromFile(filePath);

    for (const importItem of imports) {
      const result = checkImport(importItem, filePath);

      if (!result.valid) {
        errors.push({
          file,
          line: importItem.line,
          name: importItem.name,
          source: importItem.source,
          reason: result.reason
        });
      }

      checkedCount++;
    }
  }

  // 输出结果
  console.log('\n' + '='.repeat(80));
  log.info(`总共检查了 ${checkedCount} 个导入`);

  if (errors.length === 0) {
    log.success(`所有导入都是有效的！`);
  } else {
    log.error(`发现 ${errors.length} 个问题：\n`);

    // 按文件分组
    const errorsByFile = {};
    errors.forEach(error => {
      if (!errorsByFile[error.file]) {
        errorsByFile[error.file] = [];
      }
      errorsByFile[error.file].push(error);
    });

    Object.entries(errorsByFile).forEach(([file, fileErrors]) => {
      console.log(`\n${colors.red}${file}${colors.reset}`);
      fileErrors.forEach(error => {
        console.log(`  ${colors.yellow}Line ${error.line}:${colors.reset} ${error.name}`);
        console.log(`    ${colors.cyan}from: ${error.source}${colors.reset}`);
        console.log(`    ${colors.red}${error.reason}${colors.reset}`);
      });
    });

    console.log('\n' + '='.repeat(80));
    process.exit(1);
  }
}

main().catch(error => {
  log.error(`检查过程中出错: ${error.message}`);
  process.exit(1);
});

