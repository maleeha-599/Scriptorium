# Use PHP CLI image
FROM php:8.0-cli-alpine

# Create a non-root user
RUN adduser -D runner
USER runner

# Set the working directory
WORKDIR /home/runner

# Default command to run the PHP program
CMD ["php", "Main.php"]
