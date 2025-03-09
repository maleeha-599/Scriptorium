FROM gcc:10.2.0

RUN adduser --disabled-password --gecos "" runner
USER runner

WORKDIR /home/runner

COPY . .

CMD ["./your-program"]
