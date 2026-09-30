# Server Preflight — 全机只读 Preflight 证据

> 来源：v1.5 §39 全服务器只读 Preflight。任何写操作前必须完成。  
> 执行时间：2026-09-30 UTC  
> 执行者：Claude（仅只读命令）

## P1 — /opt/websites

```text
/opt/websites/
├── huanyukuntai-site/   （10 个子目录，姊妹站，禁止触碰）
├── huanyukuntaichem-site/   （6 个子目录，本项目）
└── waimaob2bc/   （7 个子目录，禁止触碰）
```

## P2 — Docker 容器清单

| 容器 | 镜像 | 状态 | 端口映射 | Compose Project |
|---|---|---|---|---|
| huanyukuntai-frontend | huanyukuntai-site-frontend | Up 2 weeks | 127.0.0.1:3200→3000 | huanyukuntai-site |
| huanyukuntai-site-directus | directus/directus:11 | Up 3 weeks | 127.0.0.1:8065→8055 | huanyukuntai-site |
| huanyukuntai-site-postgres | postgres:16-alpine | Up 3 weeks (healthy) | 5432/tcp | huanyukuntai-site |
| huanyukuntai-directus | directus/directus:11 | Up 3 weeks (healthy) | 127.0.0.1:8055→8055 | **huanyukuntai**（命名违规，实为本项目） |
| huanyukuntai-postgres | postgres:16-alpine | Up 3 weeks (healthy) | 5432/tcp | **huanyukuntai**（命名违规，实为本项目） |
| waimaob2bc-frontend | waimaob2bc-frontend | Up 3 weeks | 127.0.0.1:3101→3000 | waimaob2bc |
| waimaob2bc-directus | directus/directus:11 | Up 3 weeks | 127.0.0.1:8056→8055 | waimaob2bc |
| waimaob2bc-postgres | postgres:16-alpine | Up 3 weeks (healthy) | 5432/tcp | waimaob2bc |

**本项目容器归属证据**（huanyukuntai-directus 实质为本项目）：
- ProjectConfigFiles = `/opt/websites/huanyukuntaichem-site/backend/docker-compose.yml`
- PUBLIC_URL = `https://cms.huanyukuntaichem.com`
- DB_DATABASE = `huanyukuntai_directus`（命名违规）

## P3 — Docker 网络

| 网络名 | 驱动 | 状态 |
|---|---|---|
| bridge | bridge | 默认 |
| host | host | 默认 |
| none | null | 默认 |
| huanyukuntai | bridge | ⚠️ 命名违规，含本项目两个容器 |
| huanyukuntai-site-network | bridge | 姊妹 |
| waimaob2bc | bridge | 独立 |

## P4 — Docker 命名卷

| 卷名 | 状态 |
|---|---|
| huanyukuntai_postgres_data | 命名违规（实为本项目） |
| huanyukuntai_directus_uploads | 命名违规 |
| huanyukuntai_directus_extensions | 命名违规 |

## P5 — 监听端口

| 端口 | 监听者 | 用途 |
|---|---|---|
| 0.0.0.0:22 | sshd | SSH |
| 0.0.0.0:80 | nginx | HTTP |
| 0.0.0.0:443 | nginx | HTTPS |
| 127.0.0.1:3007 | next-server (PM2) | 本项目 frontend |
| 127.0.0.1:3101 | docker-proxy | waimaob2bc frontend |
| 127.0.0.1:3200 | docker-proxy | huanyukuntai frontend |
| 127.0.0.1:8055 | docker-proxy | 本项目 CMS（命名违规，待迁移） |
| 127.0.0.1:8056 | docker-proxy | waimaob2bc CMS |
| 127.0.0.1:8065 | docker-proxy | huanyukuntai CMS |

空闲可用端口：`8057`（CMS 新目标）、`3100`（备用 frontend）、`8058`（备用）。

## P6 — PM2 / systemd

| 项 | 值 |
|---|---|
| PM2 进程 | `huanyukuntaichem-frontend`（fork mode, pid 2714372, 12 天稳定, 578 MiB, 0% CPU） |
| systemd 关键 | docker.service / nginx.service active |

## P7 — Nginx sites-enabled

| 文件 | 归属 |
|---|---|
| default → sites-available/default | 默认 |
| huanyukuntai.conf（直文件） | 姊妹 |
| huanyukuntaichem.conf → sites-available/huanyukuntaichem.conf | 本项目 |
| waimaob2bc.conf → /opt/websites/waimaob2bc/nginx/waimaob2bc.conf | 独立站 |

## P8 — TLS 证书

| 证书 | 域名 | 到期 |
|---|---|---|
| huanyukuntai.com | huanyukuntai.com / cms. / www. | 2026-12-06（剩 67 天） |
| huanyukuntaichem.com | huanyukuntaichem.com / cms. / www. | 2026-12-07（剩 67 天） |
| waimaob2bc.com | waimaob2bc.com / cms. / www. | 2026-12-07（剩 67 天） |

certbot.timer 已配置自动续期。

## P9 — crontab / systemd timers

- crontab：空
- systemd timers：
  - certbot.timer（active，全机）
  - **huanyukuntai-backup.timer**（active，姊妹项目维护）
  - huanyukuntaichem-backup.timer ❌ 不存在
  - 其他系统 timer（apt-daily / sysstat / logrotate 等）

## P10 — deployment lock

- /opt/websites/huanyukuntaichem-site/locks/ ❌ 不存在
- 其他站同样未建（v1.5 §42 要求每站独立锁，本任务需为本站创建）

## P11 — 资源现状

| 项 | 总量 | 已用 | 空闲 |
|---|---|---|---|
| 内存 | 7.7 GiB | 2.7 GiB（34%） | 5.0 GiB |
| Swap | 4.0 GiB | <1% | 4.0 GiB |
| 磁盘 /dev/sda1 | 96 GiB | 18 GiB（19%） | 79 GiB |

Directus + Postgres 各 1 GiB 配额足够。剩余资源足够支撑新站隔离部署。

## P12 — 阻断规则复核

| 项 | 状态 |
|---|---|
| 本项目唯一 root_path | ✅ 确认 /opt/websites/huanyukuntaichem-site |
| 本项目 frontend port | ✅ 3007 独占 |
| 本项目 CMS port（迁移后） | ✅ 8057 空闲 |
| 本项目 Compose Project（迁移后） | ✅ huanyukuntaichem（待新建） |
| 本项目 Network（迁移后） | ✅ huanyukuntaichem（待新建） |
| 本项目 Volumes（迁移后） | ✅ huanyukuntaichem_*（待新建） |
| 本项目 nginx server block | ✅ 已独立 |
| 本项目 certificate | ✅ 独立 + 自动续期 |
| 本项目 deployment_lock | ❌ 需建 |
| 本项目 backup_timer | ❌ 需建 |

## P13 — 已确认不动项

- /opt/openclaw、/opt/hermes、其他项目目录
- docker system prune / volume prune / network prune
- pm2 restart all / delete all
- killall / pkill node
- 全局 rm -rf / chown -R / chmod -R
- reboot、docker daemon restart
- 其他站点的 nginx server block、cert、env、uploads、extensions、database、tokens