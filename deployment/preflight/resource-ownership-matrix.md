# Resource Ownership Matrix — 资源真实归属核验

> 编制时间：2026-09-30 UTC  
> 编制执行者：Claude（仅只读命令）  
> 来源：v1.5 §39 全服务器只读 Preflight  
> 状态：**关键事实已锁定，待用户二选一决策后再执行**

## 一、用户要求的 6 项只读核验

### 1. `huanyukuntai` Compose Project 当前包含的全部容器

```text
NAMES                   STATUS                 PORTS                      config files
huanyukuntai-directus   Up 3 weeks (healthy)   127.0.0.1:8055->8055/tcp   /opt/websites/huanyukuntaichem-site/backend/docker-compose.yml
huanyukuntai-postgres   Up 3 weeks (healthy)   5432/tcp                   /opt/websites/huanyukuntaichem-site/backend/docker-compose.yml
```

**只有 2 个容器。两个的 ProjectConfigFiles 都指向本项目 `/opt/websites/huanyukuntaichem-site/backend/docker-compose.yml`。**

### 2. 三个命名卷的容器挂载情况

```text
huanyukuntai_postgres_data
  → 挂载到 huanyukuntai-postgres（仅本项目容器）
  → /var/lib/postgresql/data

huanyukuntai_directus_uploads
  → 挂载到 huanyukuntai-directus（仅本项目容器）
  → /directus/uploads

huanyukuntai_directus_extensions
  → 挂载到 huanyukuntai-directus（仅本项目容器）
  → /directus/extensions
```

**三个卷均仅被本项目两个容器独占，无跨站使用。**

### 3. Docker Network 名称、成员与跨站连接

| 网络 | 驱动 | 成员 | 跨站？ |
|---|---|---|---|
| **huanyukuntai** | bridge | huanyukuntai-directus (172.18.0.3) + huanyukuntai-postgres (172.18.0.2) | ❌ 仅本项目两个容器 |
| huanyukuntai-site-network | bridge | huanyukuntai-site-directus + huanyukuntai-site-postgres + huanyukuntai-frontend（姊妹） | ❌ 仅姊妹项目 |
| waimaob2bc | bridge | waimaob2bc-directus + waimaob2bc-postgres + waimaob2bc-frontend | ❌ 独立站 |
| bridge / host / none | default | 系统 | — |

**网络层无跨站连接，命名混淆但不实际串数据。**

### 4. huanyukuntai.com 当前实际使用的资源

| 资源 | 实际归属 | 证据 |
|---|---|---|
| 主域名 / www 解析 | nginx `huanyukuntai.conf` → 301 → www → Next.js | nginx vhost 内容 |
| cms.huanyukuntai.com upstream | **127.0.0.1:8065** | nginx vhost |
| cms upstream 容器 | **huanyukuntai-site-directus** | docker inspect (Compose Project = huanyukuntai-site) |
| 主站 frontend | **huanyukuntai-frontend** on 127.0.0.1:3200 | docker inspect (Compose Project = huanyukuntai-site) |
| 数据库 | huanyukuntai-site-postgres | docker inspect |
| Network | **huanyukuntai-site-network** (172.19.0.x) | docker network inspect |
| Volumes | 由 huanyukuntai-site compose 管理（卷名 `huanyukuntai-site_*`） | docker volume ls |
| 证书 | `/etc/letsencrypt/live/huanyukuntai.com/` | certbot |
| 备份 timer | `huanyukuntai-backup.timer`（systemd） | systemctl list-timers |

**关键事实**：huanyukuntai.com 的真实资源全部位于 **Compose Project `huanyukuntai-site`** + **网络 `huanyukuntai-site-network`**，**与 Compose Project `huanyukuntai` 完全无关**。

### 5. waimaob2bc.com 当前实际使用的资源

| 资源 | 实际归属 | 证据 |
|---|---|---|
| Compose Project | **waimaob2bc** | docker inspect labels |
| 容器 | waimaob2bc-frontend (3101), waimaob2bc-directus (8056), waimaob2bc-postgres (5432) | docker ps |
| Network | **waimaob2bc** (172.20.0.x) | docker network inspect |
| Volumes | waimaob2bc compose 管理（卷名 `waimaob2bc_*`，未在 docker volume ls 列出表明可能用 bind mount） | docker volume ls |
| Nginx vhost | `/etc/nginx/sites-enabled/waimaob2bc.conf` → `/opt/websites/waimaob2bc/nginx/waimaob2bc.conf` | ls -la |
| 证书 | `/etc/letsencrypt/live/waimaob2bc.com/` | certbot |

**完全独立，无任何跨站容器、卷、网络。**

### 6. Resource Ownership Matrix（核心表）

| 资源名 | Compose Project | Network | 容器名 | 卷名 | Nginx upstream | 证书 | 真实归属 | 跨站？ | 仅命名错？ |
|---|---|---|---|---|---|---|---|---|---|
| **huanyukuntai-directus** | huanyukuntai（错） | huanyukuntai（错） | huanyukuntai-directus（错） | huanyukuntai_directus_uploads（错）, huanyukuntai_directus_extensions（错） | 127.0.0.1:8055 | huanyukuntaichem.com | **本站** | ❌ 否 | ✅ **是** |
| **huanyukuntai-postgres** | huanyukuntai（错） | huanyukuntai（错） | huanyukuntai-postgres（错） | huanyukuntai_postgres_data（错） | (内部) | — | **本站** | ❌ 否 | ✅ **是** |
| huanyukuntai-frontend | huanyukuntai-site | huanyukuntai-site-network | huanyukuntai-frontend | （前端无持久卷） | 127.0.0.1:3200 | huanyukuntai.com | 姊妹站 | ❌ 否 | — |
| huanyukuntai-site-directus | huanyukuntai-site | huanyukuntai-site-network | huanyukuntai-site-directus | （由 huanyukuntai-site compose 管理） | 127.0.0.1:8065 | huanyukuntai.com | 姊妹站 | ❌ 否 | — |
| huanyukuntai-site-postgres | huanyukuntai-site | huanyukuntai-site-network | huanyukuntai-site-postgres | （由 huanyukuntai-site compose 管理） | (内部) | — | 姊妹站 | ❌ 否 | — |
| waimaob2bc-frontend | waimaob2bc | waimaob2bc | waimaob2bc-frontend | （前端无持久卷） | 127.0.0.1:3101 | waimaob2bc.com | 独立站 | ❌ 否 | — |
| waimaob2bc-directus | waimaob2bc | waimaob2bc | waimaob2bc-directus | （由 waimaob2bc compose 管理） | 127.0.0.1:8056 | waimaob2bc.com | 独立站 | ❌ 否 | — |
| waimaob2bc-postgres | waimaob2bc | waimaob2bc | waimaob2bc-postgres | （由 waimaob2bc compose 管理） | (内部) | — | 独立站 | ❌ 否 | — |
| 本项目 frontend（PM2） | （非容器） | — | huanyukuntaichem-frontend（PM2） | — | 127.0.0.1:3007 | huanyukuntaichem.com | 本站 | ❌ | — |

## 三、归属结论（核心项）

**关键事实**：`huanyukuntai` Compose Project / 网络 / 卷名 / 容器名虽然字面看起来像姊妹站 huanyukuntai.com，但运行时**只有本项目两个容器**。huanyukuntai.com 的实际资源在 `huanyukuntai-site` 项目里。

**这是纯粹的命名错误（cosmetic naming conflict），不是跨站共享。**

## 四、两种方案对比

### 方案 A：Namespace Correction（命名整改，最小风险，**推荐**）

| 步骤 | 操作 | 数据流向 | 风险 |
|---|---|---|---|
| A1 | 完整备份（pg_dump + uploads + extensions + env + schema snapshot + nginx + PM2 + manifest） | 旧卷 → /opt/websites/huanyukuntaichem-site/backups/before-namespace-correction-<UTC>/ | 低 |
| A2 | 重命名 3 个 Docker 卷（保留数据） | `huanyukuntai_*` → `huanyukuntaichem-*` | 低（Docker 原生 rename） |
| A3 | 写新 `huanyukuntaichem` Compose 项目文件（容器、网络名、卷引用全改） | 仅本地仓库文件改动 | 低 |
| A4 | `docker compose down` 旧两容器（同名停止，无删除） | — | 中（短暂 CMS 不可用） |
| A5 | `docker compose -p huanyukuntaichem up -d` 新两容器（指向已重命名卷） | 立即用原数据启动 | 中 |
| A6 | 验证 localhost:8055 / curl /server/health / Directus 登录 | — | 低 |
| A7 | 不动 Nginx（端口保持 8055） | — | 低 |
| A8 | 验证前端 / 询盘 / 上传 | — | 低 |

**优势**：
- 不做 pg_dump/restore，无数据库迁移风险
- 数据 0 复制：仅 Docker 卷 rename，原地复用
- nginx 不动，端口不变
- 整个过程 CMS 中断 < 5 分钟
- 卷内 Directus 数据（含可能的现有 schema / 用户 / uploads）全部保留
- 与现有管理员账号零影响

**劣势**：
- 卷必须先 `docker compose down` 旧容器才能 rename volume
- 卷 rename 后原 volume 名字不可恢复（但 Mountpoint 不变 → 数据不变）

### 方案 B：Full Migration（完整迁移，全新空数据库）

| 步骤 | 操作 | 风险 |
|---|---|---|
| B1 | pg_dump 旧 postgres（数据 → .sql 文件） | 低 |
| B2 | 创建新 huanyukuntaichem 网络 + Compose 项目 + 新卷（全新空卷） | 低 |
| B3 | 启动新 postgres 容器（指向新卷） | 低 |
| B4 | pg_dump 文件恢复到新 postgres | 中（schema/role/permission 转换） |
| B5 | uploads / extensions 从旧 bind mount 复制到新卷 | 中 |
| B6 | 切 nginx upstream 8055 → 8057 | 中（DNS / 浏览器缓存） |
| B7 | 验证新 CMS | 中 |
| B8 | 停旧 huanyukuntai-directus + huanyukuntai-postgres，保留旧卷 14 天 | 中 |
| B9 | 重新创建管理员账号（如果原账号密码不可用） | 中 |

**优势**：
- 完全干净，无历史包袱
- 版本与 schema 显式受控

**劣势**：
- 必须做 pg_dump + restore，数据有转换风险
- 必须复制 uploads / extensions（卷改名做不到就改用 bind mount）
- 必须切 nginx（端口变化）
- 重新配置 schema / 用户 / 权限 / 角色
- 若原管理员账号不可用需要重置

## 五、推荐结论

**资源 100% 独立，仅命名错误** → **方案 A：Namespace Correction**

理由：
1. 卷 rename 是 Docker 原生能力，无数据迁移风险
2. CMS 端口保持 8055（与原 Nginx upstream 一致）→ 无 Nginx 切换
3. 现有管理员账号/Schema/数据原地保留 → 不重置权限
4. 操作步骤少，每步可单独验证和回滚
5. 旧卷 rename 后保留数据 14 天（仅 Mountpoint 上访问），如有问题可手动复制回原名

## 六、待用户确认

- [ ] 方案 A 采纳？或 B？
- [ ] 端口策略：保持 8055（推荐）还是改 8057（与"huanyukuntaichem-directus"语义对齐）？
- [ ] backup 保留期 14 天 是否合适？
- [ ] deployment lock 机制用 flock（推荐）或 pidfile？

---

**未做任何破坏性操作。下一步等用户决策。**