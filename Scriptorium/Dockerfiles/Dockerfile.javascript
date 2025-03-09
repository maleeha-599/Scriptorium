# dockerfiles/Dockerfile.javascript

FROM node:14-alpine

RUN adduser -D runner
USER runner

WORKDIR /home/runner

CMD ["node", "Main.js"]
