.. _uninstall:


================
Uninstall GET-IT
================

If you want to uninstall GET-IT please follow this commands from the starterkit folder:

for shut down GET-IT
    docker-compose down

for shut down GET-IT and remove volumes 
    docker-compose down -v

for remove all the docker containers 
    docker rm -v $(docker ps -a -q -f status=exited)

for erasing all images, volumes and containers
    docker system prune -a
