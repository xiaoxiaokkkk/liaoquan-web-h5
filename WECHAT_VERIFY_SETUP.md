# 微信授权回调域名验证文件配置指南

## 问题说明

微信授权 10003 错误通常是因为：
1. **授权回调域名验证文件未正确配置**（最常见）
2. redirect_uri 参数与微信公众平台配置不匹配
3. 协议不匹配（http vs https）

## 解决方案

### 1. 获取微信验证文件

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 进入 **设置与开发** → **公众号设置** → **功能设置**
3. 找到 **网页授权域名** 配置
4. 点击 **设置**，输入域名（如：`ls.hainanjunfeng.com`，**不要带协议**）
5. 下载验证文件（文件名类似：`MP_verify_xxxxx.txt`）

### 2. 放置验证文件

#### 方式1：放到 public 目录（推荐）

将验证文件放到项目的 `public/` 目录下：

```
public/
  ├── MP_verify_xxxxx.txt  ← 放在这里
  └── favicon.ico
```

Vite 构建时会将 `public/` 目录下的文件复制到 `dist/` 根目录，这样验证文件就会在：
- `dist/MP_verify_xxxxx.txt`

#### 方式2：直接放到服务器 dist 目录

如果已经构建完成，可以直接将验证文件放到服务器的 dist 目录根目录：
- `/home/web/liaoquan-h5/MP_verify_xxxxx.txt`

### 3. 配置 Nginx

确保 Nginx 配置中包含验证文件的处理规则（已在 `nginx.conf.example` 和 `nginx-webh5-fix.conf` 中添加）：

```nginx
# 微信验证文件（必须放在最前面，优先级最高）
location ~ ^/MP_verify_[a-zA-Z0-9]+\.txt$ {
    root /home/web/liaoquan-h5;  # 修改为你的实际路径
    
    default_type text/plain;
    add_header Content-Type text/plain;
    
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    
    try_files $uri =404;
}
```

### 4. 验证配置

1. **测试验证文件是否可访问**：
   ```bash
   # 在浏览器或命令行中访问
   curl https://ls.hainanjunfeng.com/MP_verify_xxxxx.txt
   ```
   
   应该能返回验证文件的内容（一串随机字符串）

2. **在微信公众平台完成验证**：
   - 回到微信公众平台
   - 点击 **验证** 按钮
   - 等待验证通过

3. **检查授权回调域名配置**：
   - 确保域名配置为：`ls.hainanjunfeng.com`（不带协议，不带路径）
   - 不要配置为：`https://ls.hainanjunfeng.com` 或 `ls.hainanjunfeng.com/webh5`

### 5. 检查 redirect_uri 配置

确保代码生成的 `redirect_uri` 与微信配置匹配：

- 微信配置的域名：`ls.hainanjunfeng.com`
- 代码生成的 redirect_uri：`https://ls.hainanjunfeng.com/webh5/login` ✅ 正确
- 代码生成的 redirect_uri：`http://ls.hainanjunfeng.com/webh5/login` ❌ 错误（协议不匹配）

**注意**：如果生产环境强制使用 HTTPS，确保：
1. 代码生成的 redirect_uri 使用 `https://`
2. 验证文件可以通过 `https://` 访问

### 6. 常见问题排查

#### 问题1：验证文件 404

**原因**：
- 文件未放到正确位置
- Nginx 配置未生效
- 文件路径错误

**解决**：
```bash
# 检查文件是否存在
ls -la /home/web/liaoquan-h5/MP_verify_*.txt

# 检查 Nginx 配置
nginx -t

# 重载 Nginx 配置
nginx -s reload
```

#### 问题2：验证文件返回 HTML（SPA 路由干扰）

**原因**：Nginx 配置顺序错误，SPA 路由规则覆盖了验证文件规则

**解决**：确保验证文件的 location 规则放在 SPA 路由规则**之前**

#### 问题3：测试环境正常，生产环境失败

**可能原因**：
1. 生产环境验证文件未部署
2. 生产环境 Nginx 配置不同
3. 生产环境域名配置错误

**解决**：
- 检查生产环境是否有验证文件
- 检查生产环境 Nginx 配置
- 确认生产环境域名在微信公众平台已正确配置

## 测试环境 vs 生产环境

### 测试环境
- 域名：`t.hainanjunfeng.com`
- 授权链接使用：`http://`（测试环境可能允许 http）
- 验证文件：`https://t.hainanjunfeng.com/MP_verify_xxxxx.txt`

### 生产环境
- 域名：`ls.hainanjunfeng.com`
- 授权链接必须使用：`https://`
- 验证文件：`https://ls.hainanjunfeng.com/MP_verify_xxxxx.txt`

**重要**：两个环境都需要各自的验证文件！

## 总结

1. ✅ 将验证文件放到 `public/` 目录（或直接放到 dist 根目录）
2. ✅ 配置 Nginx 支持验证文件访问
3. ✅ 确保验证文件可以通过 `https://域名/MP_verify_xxxxx.txt` 访问
4. ✅ 在微信公众平台完成域名验证
5. ✅ 确保 redirect_uri 使用正确的协议（生产环境必须 https）




