FROM eclipse-temurin:21-jre

WORKDIR /app

COPY target/hospital-booking-backend-*.jar app.jar
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
