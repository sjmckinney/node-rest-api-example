#!/bin/sh
docker-compose down &&
docker-compose rm &&
docker-compose pull &&
docker-compose build --no-cache &&
docker-compose up -d --force-recreate
sleep 1 
docker exec db_mongodb mongo admin ./setup/create-admin.js
docker exec db_mongodb mongo test ./setup/create-test-user.js -u admin -p admin --authenticationDatabase admin
