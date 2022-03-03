```
  ███████╗██╗   ██╗██████╗ ███████╗██████╗ ██████╗ ██╗ ██████╗██╗  ██╗
  ██╔════╝╚██╗ ██╔╝██╔══██╗██╔════╝██╔══██╗██╔══██╗██║██╔════╝██║ ██╔╝               _|
  █████╗   ╚████╔╝ ██████╔╝█████╗  ██████╔╝██████╔╝██║██║     █████╔╝  _|      _|  _|_|
  ██╔══╝    ╚██╔╝  ██╔══██╗██╔══╝  ██╔══██╗██╔══██╗██║██║     ██╔═██╗  _|      _|    _|
  ██║        ██║   ██║  ██║███████╗██████╔╝██║  ██║██║╚██████╗██║  ██╗   _|  _|      _|
  ╚═╝        ╚═╝   ╚═╝  ╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝     _|        _|
=======================================================================================
```

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

To start in docker-compose, check the `docker-compose.yml` file.

Terminal looks like this:
```
 ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20% | ETA: 1065s | 3255/16189 | Update inventory for username
 ███████████████████████████████░░░░░░░░░ 77% | ETA: 132s | 1957/2532 | Update orders for username
```