# syntax=docker/dockerfile:1

# Build the Spring Boot executable JAR with the Gradle wrapper included in this project.
FROM gradle:9.8.1-jdk17 AS builder

WORKDIR /workspace

# Copy the wrapper and build metadata first so dependency resolution can be cached.
COPY gradlew gradle/ settings.gradle build.gradle ./
RUN chmod +x ./gradlew
RUN ./gradlew dependencies --no-daemon || true

COPY src ./src
RUN ./gradlew clean bootJar --no-daemon

# Keep the runtime image limited to a JRE and the packaged application.
FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

ENV JAVA_OPTS=""

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
