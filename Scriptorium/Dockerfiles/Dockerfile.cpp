# Use GCC as the base image
FROM gcc:10.2.0

# Create a non-root user with a home directory and bash shell
RUN adduser --disabled-password --gecos "" --home /home/runner runner

# Switch to the created user
USER runner

# Set the working directory
WORKDIR /home/runner

# Default command for the container (adjust as per your needs)
CMD ["./a.out"]
