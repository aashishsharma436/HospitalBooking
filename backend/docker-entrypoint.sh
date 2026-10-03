#!/bin/sh
set -eu

# Prefer the explicit Spring datasource URL configured by Render.
# Only derive one from DATABASE_URL when no explicit URL is present.
if [ -z "${SPRING_DATASOURCE_URL:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  case "$DATABASE_URL" in
    jdbc:*) export SPRING_DATASOURCE_URL="$DATABASE_URL" ;;
    postgresql://*) export SPRING_DATASOURCE_URL="jdbc:$DATABASE_URL" ;;
    postgres://*) export SPRING_DATASOURCE_URL="jdbc:postgresql://${DATABASE_URL#postgres://}" ;;
    *) export SPRING_DATASOURCE_URL="$DATABASE_URL" ;;
  esac
fi

exec java ${JAVA_OPTS:-} -jar /app/app.jar