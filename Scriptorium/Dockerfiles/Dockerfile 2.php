# dockerfiles/Dockerfile.php

FROM php:8.0-cli-alpine

RUN adduser -D runner
USER runner

WORKDIR /home/runner

CMD ["php", "Main.php"]
