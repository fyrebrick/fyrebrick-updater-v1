# Fyrebrick updater v1 

Improved bricklink orders and inventory local sync system
- uses postgresql
- improved performances
- uses progress bar in terminal
- container available at [ghcr.io/fyrebrick/fyrebrick-updater-v1](ghcr.io/fyrebrick/fyrebrick-updater-v1)


Enviroment variables:
- `PGHOST`
- `PGUSER`
- `PGDATABASE`
- `PGPASSWORD`
- `PGPORT`
- `CRON_CLEANING`
- `CRON_INVENTORY`
- `CRON_ORDERS`

Terminal looks like this:
```
Started FYREBRICK UPDATER V1
CRON SCHEDULES:
orders * * * * *
inventory */10 * * * *
cleaning 0 0 * * *
 ████████████████████████████████████████ 100% | ETA: 0s | 2531/2531 | Update orders for desmetm
 ████████████████████████████████████████ 100% | ETA: 0s | 2531/2531 | Update orders for desmetm
 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20% | ETA: 1065s | 3255/16189 | Update inventory for desmetm
 ███████████████████████████████░░░░░░░░░ 77% | ETA: 132s | 1957/2532 | Update orders for desmetm
```