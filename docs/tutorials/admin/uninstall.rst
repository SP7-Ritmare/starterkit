.. _uninstall:


================
Uninstall GET-IT
================

If you want to uninstall GET-IT please follw this commands:

    docker-compose down
    docker-compose down -v
    docker rm -v $(docker ps -a -q -f status=exited)
    docker system prune -a
