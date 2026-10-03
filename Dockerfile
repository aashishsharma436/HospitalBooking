FROM maven:3.9.11-eclipse-temurin-21 AS build

WORKDIR /build

COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml dependency:go-offline -DskipTests

COPY backend backend
RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /build/backend/target/hospital-booking-backend-*.jar app.jar
COPY backend/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/docker-entrypoint.sh"]
