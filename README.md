# NotebookLM 游乐场

### 作者：技术爬爬虾
[B站](https://space.bilibili.com/316183842)，[Youtube](https://www.youtube.com/@Tech_Shrimp)，抖音，公众号 全网同名。转载请注明作者。

基于原 Grok 游乐场项目修改，适配 Google NotebookLM。

## 项目简介

10秒部署一个 NotebookLM 反向代理服务，实现真正的中转代理功能。支持多账户聚合，单账户额度不够可秒换账号。
不限地区/网络环境，打开即用，适配手机端。
支持Netlify/Deno/Cloudflare Worker无服务器免费部署。

**核心特性：**
- 🔄 **真正的反向代理**：所有请求都通过您的服务器中转，用户始终看到您的域名
- 🌐 **多域名支持**：自动代理 NotebookLM、Google 静态资源、APIs 等
- 🔗 **智能链接重写**：自动重写响应中的所有链接
- 🍪 **完整认证支持**：支持 Google 账户 Cookie 认证

**注意：** NotebookLM 需要 Google 账户登录，请确保您有有效的 Google 账户和相应的访问权限。

## 服务器部署[推荐]
0. 准备一台海外IP的云服务器，香港也可以
1. git clone https://github.com/tech-shrimp/notebooklm-playground
2. (Ubuntu服务器需要先安装unzip:)<br> sudo apt-get install unzip -y
3. 安装Deno:<br> curl -fsSL https://deno.land/install.sh | sh （安装后需重启shell）
4. cd notebooklm-playground
5. sh deno_start.sh
6. 默认使用服务器80端口，可以修改src/deno_index.ts改端口号
7. 使用Cloudflare配置网站DNS+HTTPS（也可以自己配置HTTPS）

**使用说明：**
1. 部署完成后，访问 `/admin` 路径配置 Google 账户 Cookie
2. 配置完成后，直接访问根域名即可使用 NotebookLM
3. 所有请求都会通过您的服务器中转到 Google NotebookLM


## Netlify部署
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tech-shrimp/notebooklm-playground)
点击部署按钮，登录Github账户即可
免费分配域名，国内可直连。

**使用说明：** 部署完成后，访问 `/admin` 配置 Google 账户的 Cookie，然后直接访问根域名即可使用 NotebookLM 反向代理。

## Deno部署

1. [fork](https://github.com/tech-shrimp/grok-playground/fork)本项目
2. 登录/注册 https://dash.deno.com/
3. 创建项目 https://dash.deno.com/new_project
4. 选择此项目，填写项目名字（请仔细填写项目名字，关系到自动分配的域名）
5. Entrypoint 填写 `src/deno_index.ts` 其他字段留空 
   <details>
   <summary>如图</summary>
   ![image](/docs/images/1.png)
   </details>
6. 点击 <b>Deploy Project</b>
7. 部署成功后获得域名，点开即用。

## Cloudflare Worker 部署
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/tech-shrimp/notebooklm-playground)

1. 点击部署按钮
2. 登录Cloudflare账号
3. 填入Account ID，与API Token
4. Fork本项目，开启Github Action功能
5. 部署，打开dash.cloudflare.com，查看部署后的worker
6. 访问 worker 域名即可使用 NotebookLM 代理

## 打赏
#### 帮忙点点关注点点赞，谢谢啦~
B站：[https://space.bilibili.com/316183842](https://space.bilibili.com/316183842)<br>
Youtube: [https://www.youtube.com/@Tech_Shrimp](https://www.youtube.com/@Tech_Shrimp)

## 本地调试（Deno）

Windows 安装Deno:
> irm https://deno.land/install.ps1 | iex

Mac/Linux 安装Deno:
> curl -fsSL https://deno.land/install.sh | sh

启动项目：

>cd 项目目录 <br>
>deno run start


## 本地调试（Netlify）

1. 安装NodeJs
2. npm install -g netlify-cli
3. cd 项目根目录
4. netlify login
5. netlify dev

## 故障排除

如果遇到 400 错误或其他问题，请查看 [故障排除指南](TROUBLESHOOTING.md)。

**常见问题：**
- **400 错误**：通常是 Cookie 配置问题，请重新获取并配置 Cookie
- **403 错误**：Cookie 可能已过期，请重新登录 NotebookLM
- **无法访问**：确保访问 `/admin` 路径进行配置

## 免责声明

本项目仅供学习和研究使用，请遵守相关法律法规和服务条款。
