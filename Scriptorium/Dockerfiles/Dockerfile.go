# Use an official Go runtime as a base image
FROM ubuntu:20.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    wget \
    tar \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install Go manually
RUN wget https://golang.org/dl/go1.18.10.linux-amd64.tar.gz && \
    tar -C /usr/local -xzf go1.18.10.linux-amd64.tar.gz && \
    rm go1.18.10.linux-amd64.tar.gz

# Set the Go environment variables
ENV PATH=$PATH:/usr/local/go/bin

# Create a non-root user for running the application
RUN useradd -ms /bin/bash runner

# Switch to the non-root user
USER runner

# Set the working directory
WORKDIR /home/runner

# Command to run when the container starts
CMD ["go", "run", "main.go"]
