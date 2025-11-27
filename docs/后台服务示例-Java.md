# 后台服务示例 - Java 版本

## 📋 概述

本文档提供一个完整的 Java 后台服务示例，可与 Electron 前端应用集成。

---

## 🏗️ Spring Boot 应用示例

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.haitang</groupId>
    <artifactId>haitang-backend</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>海棠企业管理系统 - 后台服务</name>
    <description>后台 REST API 服务</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.0</version>
        <relativePath/>
    </parent>

    <properties>
        <java.version>11</java.version>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Spring Boot Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- MySQL Driver -->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
            <version>8.0.33</version>
        </dependency>

        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Spring Boot Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### application.yml

```yaml
spring:
  application:
    name: haitang-backend
  
  # 数据库配置
  datasource:
    url: jdbc:mysql://localhost:3306/haitang?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=UTC
    username: root
    password: password
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true

# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# 日志配置
logging:
  level:
    root: INFO
    com.haitang: DEBUG
  file:
    name: logs/application.log
```

### 主应用类

```java
package com.haitang;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@SpringBootApplication
public class HaitangBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(HaitangBackendApplication.class, args);
    }

    /**
     * 配置 CORS
     */
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 健康检查端点

```java
package com.haitang.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    /**
     * 健康检查端点
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    /**
     * 获取应用版本
     */
    @GetMapping("/version")
    public Map<String, String> version() {
        Map<String, String> response = new HashMap<>();
        response.put("version", "1.0.0");
        response.put("name", "海棠企业管理系统");
        return response;
    }
}
```

### 示例 API 端点

```java
package com.haitang.controller;

import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    /**
     * 获取用户列表
     */
    @GetMapping
    public Map<String, Object> listUsers(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        response.put("data", new Object[]{});
        return response;
    }

    /**
     * 获取用户详情
     */
    @GetMapping("/{id}")
    public Map<String, Object> getUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        response.put("data", new Object(){});
        return response;
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Map<String, Object> createUser(@RequestBody Map<String, Object> user) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        response.put("data", user);
        return response;
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public Map<String, Object> updateUser(
            @PathVariable Long id,
            @RequestBody Map<String, Object> user) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        response.put("data", user);
        return response;
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("message", "success");
        return response;
    }
}
```

---

## 📦 打包为可执行文件

### 方式 1：使用 Maven 打包

```bash
# 构建 JAR 文件
mvn clean package

# 运行 JAR 文件
java -jar target/haitang-backend-1.0.0.jar --server.port=8080
```

### 方式 2：使用 GraalVM 编译为本地可执行文件

#### 安装 GraalVM

```bash
# macOS
brew install graalvm-ce-java11

# 或从官网下载
# https://www.graalvm.org/downloads/
```

#### 配置 pom.xml

```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
    <version>0.9.13</version>
</plugin>
```

#### 编译

```bash
# 编译为本地可执行文件
mvn -Pnative native:compile

# 输出文件
# target/haitang-backend
# target/haitang-backend.exe (Windows)
```

### 方式 3：使用 Spring Boot Maven 插件

```bash
# 构建可执行 JAR
mvn spring-boot:build-image

# 运行
java -jar target/haitang-backend-1.0.0.jar
```

---

## [object Object]Electron

### 步骤 1：准备可执行文件

```bash
# 构建
mvn clean package

# 复制到项目
cp target/haitang-backend-1.0.0.jar ../haitang-web-admin/backend/
```

### 步骤 2：创建启动脚本

**Windows** (`backend/start.bat`)：

```batch
@echo off
java -jar haitang-backend-1.0.0.jar --server.port=8080
```

**macOS/Linux** (`backend/start.sh`)：

```bash
#!/bin/bash
java -jar haitang-backend-1.0.0.jar --server.port=8080
```

### 步骤 3：更新后台服务管理器

在 `src/main/backend.ts` 中：

```typescript
private getExecutablePath(): string {
  const platform = process.platform
  
  if (isDev) {
    return path.join(__dirname, '../../backend/start.sh')
  } else {
    return path.join(process.resourcesPath, 'backend', 'start.sh')
  }
}
```

---

## 🔍 测试

### 测试健康检查

```bash
curl http://localhost:8080/api/health
```

**预期响应：**

```json
{
  "status": "UP",
  "timestamp": 1234567890
}
```

### 测试 API

```bash
# 获取用户列表
curl http://localhost:8080/api/users

# 获取用户详情
curl http://localhost:8080/api/users/1

# 创建用户
curl -X POST http://localhost:8080/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com"}'
```

---

## 📝 注意事项

1. **端口配置**
   - 确保使用 `--server.port=8080` 参数
   - 前端会自动连接到该端口

2. **CORS 配置**
   - 已在主应用类中配置
   - 允许所有来源的跨域请求

3. **健康检查**
   - 必须提供 `/health` 端点
   - 前端会定期检查该端点

4. **优雅关闭**
   - Spring Boot 默认支持 SIGTERM 信号
   - 应用会优雅关闭

---

## 🆘 常见问题

### Q1：如何修改数据库连接

在 `application.yml` 中修改：

```yaml
spring:
  datasource:
    url: jdbc:mysql://your-host:3306/your-db
    username: your-username
    password: your-password
```

### Q2：如何添加新的 API 端点

创建新的 Controller 类：

```java
@RestController
@RequestMapping("/api/endpoint")
public class EndpointController {
    @GetMapping
    public Map<String, Object> get() {
        // 实现逻辑
    }
}
```

### Q3：如何处理数据库初始化

使用 JPA 的 `ddl-auto: update` 自动创建表，或使用 Flyway/Liquibase 管理迁移。

---

## 📚 参考资源

- Spring Boot 官方文档：https://spring.io/projects/spring-boot
- Spring Data JPA：https://spring.io/projects/spring-data-jpa
- GraalVM Native Image：https://www.graalvm.org/native-image/

