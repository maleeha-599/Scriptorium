# Use a full OpenJDK image with JDK tools
FROM openjdk:11-jdk-slim

# Create a non-root user
RUN adduser --disabled-password --gecos "" runner
USER runner

# Set the working directory
WORKDIR /home/runner

# Default command to compile and run the Java program
CMD ["sh", "-c", "javac Main.java && java Main"]
