# dockerfiles/Dockerfile.ruby

FROM ruby:3.0-alpine

RUN adduser -D runner
USER runner

WORKDIR /home/runner

CMD ["ruby", "Main.rb"]
