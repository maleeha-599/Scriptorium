#!/bin/bash

# Created with the help of ChatGPT

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# running startup script
echo "Running startup script..."
./startup.sh

# Check if the environment is set up correctly
if [ ! -d "node_modules" ]; then
    echo "Dependencies not installed. Please run 'startup.sh' first."
    exit 1
fi

# Start the server
echo "Starting the server in development mode..."
npm run dev
