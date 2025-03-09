# dockerfiles/Dockerfile.perl

FROM perl:5.32

RUN useradd -ms /bin/bash runner
USER runner

WORKDIR /home/runner

CMD ["perl", "Main.pl"]
