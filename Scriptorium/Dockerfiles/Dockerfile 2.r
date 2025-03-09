# dockerfiles/Dockerfile.r

FROM r-base:4.1.3

RUN useradd -ms /bin/bash runner
USER runner

WORKDIR /home/runner

CMD ["Rscript", "Main.R"]
