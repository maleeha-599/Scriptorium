# Use R base image
FROM r-base:4.1.3

# Create a non-root user for running the R scripts
RUN adduser --disabled-password --gecos "" runner

# Set working directory
WORKDIR /home/runner

# Create temporary directories and set permissions
RUN mkdir -p /home/runner/tmp /home/runner/R_libs && chmod 777 /home/runner/tmp /home/runner/R_libs

# Install necessary R packages
RUN Rscript -e "install.packages(c('ggplot2', 'dplyr', 'tidyr', 'data.table', 'readr'), repos='http://cran.us.r-project.org')"

# Copy the Main.R file into the container (ensure it's in the build context)
COPY Main.R /home/runner/

# Set user to non-root
USER runner

# Default command to execute an R script
CMD ["Rscript", "/home/runner/Main.R"]
