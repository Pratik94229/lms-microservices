FROM eclipse-temurin:17-jdk

WORKDIR /app

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN chmod +x mvnw

RUN ./mvnw dependency:go-offline

COPY src src

RUN ./mvnw clean package -DskipTests

EXPOSE 8083

ENTRYPOINT ["sh", "-c", "java -jar target/quiz-service-0.0.1-SNAPSHOT.jar"]

