# 海棠企业管理系统 - Docker 构建文件
# 多阶段构建：先构建，再运行

# ============ 构建阶段 ============
FROM node:18-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm ci

# 复制源代码
COPY . .

# 构建项目
RUN npm run build:prod

# ============ 运行阶段 ============
FROM node:18-alpine

WORKDIR /app

# 安装 http-server
RUN npm install -g http-server

# 从构建阶段复制 dist 文件夹
COPY --from=builder /app/dist ./dist

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# 启动命令
CMD ["http-server", "dist", "-p", "8080", "-c-1"]

