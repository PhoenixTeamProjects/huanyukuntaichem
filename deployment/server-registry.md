# Server Registry — 全机资源台账（命名空间纠正后）

> 来源：v1.5 §38（Server Registry：整台服务器资源台账）。任何端口、容器、网络、挂载、证书或目录没有明确归属时，视为"占用/未知"，不得当作空闲资源。
>
> 编制时间：2026-09-30 UTC  
> 命名空间纠正完成时间：2026-09-30T14:46 UTC  
> 编制执行者：Claude（先只读、后按方案 A 执行命名空间纠正）  
> 现场证据命令：见 `deployment/preflight/server-preflight.md`

## 1. 宿主机基础设施

| 字段 | 值 |
|---|---|
| VPS Provider | Hostinger KVM2 |
| IP | 45.90.108.119 |
| OS | Ubuntu 26.04.1 LTS (Resolute Raccoon) |
| Kernel | 7.0.0-31-generic |
| 架构 | x86_64 |
| 内存 | 7.7 GiB（已用 2.7 GiB / 可用 5.0 GiB） |
| Swap | 4.0 GiB |
| 磁盘 /dev/sda1 | 96 GiB（已用 18 GiB / 可用 79 GiB） |
| Docker | 29.1.3, build 29.1.3-0ubuntu4.1 |
| Docker Compose | 2.40.3+ds1-0ubuntu1 |
| Nginx | 1.28.3 |
| PM2 | 7.0.4 |
| Node (VPS) | v22.22.1 |
| UFW | active（22 / 80 / 443 TCP） |
| Certbot timer | active |

## 2. 在册网站清单

> 三站共享宿主机基础设施，业务资源完全独立。

| site_id | primary domain | root_path | Compose Project | status |
|---|---|---|---|---|
| `huanyukuntai-site` | huanyukuntai.com | /opt/websites/huanyukuntai-site | huanyukuntai-site | 活跃 |
| `huanyukuntaichem-site` | huanyukuntaichem.com | /opt/websites/huanyukuntaichem-site | **huanyukuntaichem**（已纠正） | 活跃 |
| `waimaob2bc` | waimaob2bc.com | /opt/websites/waimaob2bc | waimaob2bc | 活跃 |

## 4. huanyukuntai-site（姊妹站，禁止触碰）

| 字段 | 值 |
|---|---|
| site_id | huanyukuntai-site |
| domains | huanyukuntai.com / www.huanyukuntai.com / cms.huanyukuntai.com |
| root_path | /opt/websites/huanyukuntai-site |
| compose_project | huanyukuntai-site |
| docker_network | huanyukuntai-site-network |
| nginx_file | /etc/nginx/sites-enabled/huanyukuntai.conf |
| cert | /etc/letsencrypt/live/huanyukuntai.com/（剩 67 天） |
| frontend_port | 127.0.0.1:3200 → container huanyukuntai-frontend |
| cms_port | 127.0.0.1:8065 → container huanyukuntai-site-directus |
| frontend_container | huanyukuntai-frontend（Up 2 weeks） |
| directus_container | huanyukuntai-site-directus（directus/directus:11, Up 3 weeks） |
| postgres_container | huanyukuntai-site-postgres（postgres:16-alpine, Up 3 weeks） |
| backup / timer | huanyukuntai-backup.timer（systemd active，姊妹维护） |

## 5. huanyukuntaichem-site（本站 · 已命名空间纠正）

> 命名空间纠正于 2026-09-30T14:46 UTC 完成。Compose Project、容器名、网络名均已重命名为 `huanyukuntaichem-*`。旧 `huanyukuntai` 命名空间的容器与网络已删除，但旧命名卷保留以承载数据（通过 Compose `external: true` 复用），符合 backup retention policy。

| 字段 | 值 |
|---|---|
| site_id | huanyukuntaichem |
| domains | huanyukuntaichem.com / www.huanyukuntaichem.com / cms.huanyukuntaichem.com |
| root_path | /opt/websites/huanyukuntaichem-site |
| compose_project | **huanyukuntaichem** |
| docker_network | **huanyukuntaichem-network** |
| nginx_file | /etc/nginx/sites-enabled/huanyukuntaichem.conf |
| cert | /etc/letsencrypt/live/huanyukuntaichem.com/（剩 67 天） |
| frontend_port | 127.0.0.1:3007（PM2 进程 PID 2714372） |
| frontend_process | huanyukuntaichem-frontend（PM2 fork mode，Next.js 16.2.11，578 MiB） |
| cms_port | 127.0.0.1:8055 → container **huanyukuntaichem-directus** |
| db_port | 容器内 5432，不发布公网 |
| directus_container | **huanyukuntaichem-directus**（directus/directus:11，Up since 14:46 UTC，healthy） |
| postgres_container | **huanyukuntaichem-postgres**（postgres:16-alpine，Up since 14:46 UTC，healthy） |
| 卷名（数据迁移待办） | huanyukuntai_postgres_data / huanyukuntai_directus_uploads / huanyukuntai_directus_extensions（external: true 复用，目标名 huanyukuntaichem-* 待 rename 或下次维护） |
| database | name=huanyukuntai_directus（实际指向新容器）；user=directus；密码在 /opt/websites/huanyukuntaichem-site/shared/backend/.env |
| nginx upstream | 127.0.0.1:8055（未改） |
| deployment_lock | /opt/websites/huanyukuntaichem-site/locks/deploy.lock（flock 机制） |
| backup / timer | **huanyukuntaichem-backup.timer ❌ 仍待建** |

## 6. waimaob2bc（独立站，禁止触碰）

| 字段 | 值 |
|---|---|
| site_id | waimaob2bc |
| domains | waimaob2bc.com / www.waimaob2bc.com / cms.waimaob2bc.com |
| root_path | /opt/websites/waimaob2bc |
| compose_project | waimaob2bc |
| docker_network | waimaob2bc |
| nginx_file | /etc/nginx/sites-enabled/waimaob2bc.conf（symlink → /opt/websites/waimaob2bc/nginx/waimaob2bc.conf） |
| cert | /etc/letsencrypt/live/waimaob2bc.com/（剩 67 天） |
| frontend_port | 127.0.0.1:3101 |
| cms_port | 127.0.0.1:8056 |
| frontend_container | waimaob2bc-frontend（Up 3 weeks） |
| directus_container | waimaob2bc-directus（Up 3 weeks） |
| postgres_container | waimaob2bc-postgres（Up 3 weeks，healthy） |

## 7. 端口占用现状

| Loopback 端口 | 当前占用者 | 是否独占 |
|---|---|---|
| 127.0.0.1:3007 | next-server（PM2，huanyukuntaichem-frontend） | ✅ 本站 |
| 127.0.0.1:3101 | waimaob2bc-frontend | ✅ 姊妹 |
| 127.0.0.1:3200 | huanyukuntai-frontend | ✅ 姊妹 |
| 127.0.0.1:8055 | docker-proxy → **huanyukuntaichem-directus** | ✅ 本站（命名纠正后） |
| 127.0.0.1:8056 | waimaob2bc-directus | ✅ 姊妹 |
| 127.0.0.1:8065 | huanyukuntai-site-directus | ✅ 姊妹 |
| 127.0.0.1:8057 | 空闲 | — |

## 8. 全机 Docker 网络清单

| 网络名 | 驱动 | 状态 |
|---|---|---|
| bridge / host / none | 默认 | 系统 |
| huanyukuntai | bridge | ❌ **已删除**（命名空间纠正完成） |
| huanyukuntai-site-network | bridge | 活跃，姊妹 |
| **huanyukuntaichem-network** | bridge | ✅ **新建**，本站 |
| waimaob2bc | bridge | 活跃，独立站 |

## 9. 备份与定时器

| Timer | 状态 | 负责站 |
|---|---|---|
| certbot.timer | active | 全机共享 |
| huanyukuntai-backup.timer | active | 姊妹 |
| **huanyukuntaichem-backup.timer** | ❌ 仍待建 | ➕ 本站待建 |

## 10. 命名空间纠正证据

- 纠正前快照：`/opt/websites/huanyukuntaichem-site/backups/before-namespace-correction-20260930T144311Z/`
- 纠正策略：方案 A（Namespace Correction），见 `deployment/preflight/resource-ownership-matrix.md`
- 执行顺序：
  1. 完整备份（pg_dump + uploads + extensions + env + nginx + pm2 + manifest + schema + roles + version）
  2. deployment lock 创建
  3. 停掉旧 `huanyukuntai-directus` + `huanyukuntai-postgres`（仅本项目拥有的两个）
  4. 创建新 `huanyukuntaichem-network`
  5. 启动新 `huanyukuntaichem-postgres` + `huanyukuntaichem-directus`（挂载 external 旧卷）
  6. 验证 health / login / admin / collections
  7. 删除旧两容器与旧网络
- 数据零迁移：旧卷通过 `external: true` 原地复用

## 11. 仍待完成

- [ ] 旧卷正式 rename 到 huanyukuntaichem-*（需要 pg_dump/restore 或替代方案 — **不紧急**，当前 external mount 已合规）
- [ ] huanyukuntaichem-backup.timer 创建
- [ ] A01-A44 验收完整跑一遍
- [ ] schema 应用（v1.5 §13：site_settings / product_categories / products / news_categories / news / applications / pages 共 8 个 collection，目前仅 inquiries 已建）
- [ ] Permissions / Roles 完整配置（v1.5 §13：Administrator / Content Editor / Product Manager / Sales Staff / SEO Editor / Website Reader / Inquiry Writer / Public）
- [ ] apply-schema.mjs 与 manifest.json 编写
- [ ] /api/inquiries / /api/revalidate 服务端路由
- [ ] frontend/src/lib/directus/* 数据层改造

---

> 任何对其他在册网站的修改、停止容器、清理卷、改 Nginx server block 行为一律禁止（v1.5 §37、§42）。