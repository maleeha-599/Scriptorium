# Use Perl image
FROM perl:5.32

# Create a non-root user
RUN useradd -ms /bin/bash runner
USER runner

# Set the working directory
WORKDIR /home/runner

# Default command to run the Perl program
CMD ["perl", "Main.pl"]
