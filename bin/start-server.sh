#!/bin/bash

# 海棠企业管理系统 - 本地服务器启动脚本
# 用途：在没有开发环境的机器上运行打包后的应用

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

print_info "项目根目录: $PROJECT_ROOT"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装，请先安装 Node.js"
    echo "访问 https://nodejs.org/ 下载安装"
    exit 1
fi

print_success "Node.js 已安装: $(node --version)"

# 检查 npm 是否安装
if ! command -v npm &> /dev/null; then
    print_error "npm 未安装"
    exit 1
fi

print_success "npm 已安装: $(npm --version)"

# 检查 http-server 是否全局安装
if ! command -v http-server &> /dev/null; then
    print_warning "http-server 未全局安装，正在安装..."
    npm install -g http-server
    print_success "http-server 安装完成"
fi

# 检查 dist 文件夹是否存在
if [ ! -d "$PROJECT_ROOT/dist" ]; then
    print_warning "dist 文件夹不存在，正在构建项目..."
    
    # 检查 node_modules 是否存在
    if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
        print_info "安装项目依赖..."
        cd "$PROJECT_ROOT"
        npm install
    fi
    
    print_info "构建项目..."
    cd "$PROJECT_ROOT"
    npm run build:prod
    
    if [ ! -d "$PROJECT_ROOT/dist" ]; then
        print_error "项目构建失败"
        exit 1
    fi
    
    print_success "项目构建完成"
fi

# 获取可用的端口
PORT=${1:-8080}

# 检查端口是否被占用
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "端口 $PORT 已被占用，尝试使用端口 8081"
    PORT=8081
fi

# 启动服务器
print_info "启动 HTTP 服务器..."
print_info "访问地址: ${GREEN}http://localhost:$PORT${NC}"
print_info "按 Ctrl+C 停止服务器"

cd "$PROJECT_ROOT/dist"
http-server . -p $PORT -c-1 -o


