# ================================
# Build image
# ================================
FROM swift:6.0-jammy AS build

# Install OS updates and dependencies
RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get install -y libjemalloc-dev

# Set up a build area
WORKDIR /build

# Copy the Swift source files directly into the container
COPY . .

# Build the Swift project using swiftc
RUN swiftc -o /build/App Main.swift  # Replace with your actual Swift file if it's not "Main.swift"

# ================================
# Run image
# ================================
FROM ubuntu:jammy

# Install required dependencies (including libraries for your Swift app to run)
RUN export DEBIAN_FRONTEND=noninteractive DEBCONF_NONINTERACTIVE_SEEN=true \
    && apt-get -q update \
    && apt-get -q dist-upgrade -y \
    && apt-get install -y \
      libjemalloc2 \
      ca-certificates \
      tzdata \
    && rm -r /var/lib/apt/lists/*

# Create a vapor user and group with /app as its home directory
RUN useradd --user-group --create-home --system --skel /dev/null --home-dir /app vapor

# Switch to the new home directory
WORKDIR /app

# Copy the built executable from the build image
COPY --from=build /build/App /app/

# Set permissions for the App executable
RUN chmod +x /app/App

# Ensure all further commands run as the vapor user
USER vapor:vapor

# Expose the port (if your app is serving a web service)
EXPOSE 8080

# Run the Swift application
ENTRYPOINT ["./App"]
