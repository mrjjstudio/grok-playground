# NotebookLM 游乐场

### 作者：技术爬爬虾
[B站](https://space.bilibili.com/316183842)，[Youtube](https://www.youtube.com/@Tech_Shrimp)，抖音，公众号 全网同名。转载请注明作者。

基于原 Grok 游乐场项目修改，适配 Google NotebookLM。

## 项目简介

10秒部署一个 NotebookLM 国内镜像网站，支持多账户聚合，单账户额度不够可秒换账号。
不限地区/网络环境，打开即用，适配手机端。
支持Netlify/Deno/Cloudflare Worker无服务器免费部署。
<b>建议用服务器部署，使用IP干净的云服务部署最保险</b>
无服务器部署可能因为IP不干净被拦截,（如果被拦截，尝试刷新几次页面换个IP）

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

**注意：** 部署后访问 `/notebooklm` 路径即可使用 NotebookLM 代理功能。


## Netlify部署
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/tech-shrimp/notebooklm-playground)
点击部署按钮，登录Github账户即可
免费分配域名，国内可直连。

**使用说明：** 部署完成后，访问首页配置 Google 账户的 Cookie，然后点击 "📚 点击前往 NotebookLM 页面 📚" 即可使用。

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
