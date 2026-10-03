#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:*) export SPRING_DATASOURCE_URL="$DATABASE_URL" ;;
    postgresql://*) export SPRING_DATASOURCE_URL="jdbc:$DATABASE_URL" ;;
    postgres://*) export SPRING_DATASOURCE_URL="jdbc:postgresql://${DATABASE_URL#postgres://}" ;;
    *) export SPRING_DATASOURCE_URL="$DATABASE_URL" ;;
  esac
fi

exec java ${JAVA_OPTS:-} -jar /app/app.jar