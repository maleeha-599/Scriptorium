#!/bin/bash

# Created with the help of ChatGPT

# Check for Node.js and npm installations
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install it."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install it."
    exit 1
fi

# Check for Docker installation
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install it."
    exit 1
fi

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    set -a # Automatically export all variables
    source .env # Source the environment file
    set +a # Disable automatic export
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    npm install fs-extra
    npm install path
    npm install child_process
    npm install util
fi

# Running database migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Create the admin user
echo "Creating admin user..."
ADMIN_USERNAME="admin_user"
ADMIN_PASSWORD="admin_password"

node -e "
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createAdmin() {
    const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', 10);

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: '$ADMIN_USERNAME' },
    });

    if (existingAdmin) {
        console.log('Admin user already exists.');
        return;
    }

    await prisma.user.create({
        data: {
            first_name: 'Admin',
            last_name: 'User',
            username: '$ADMIN_USERNAME',
            email: '$ADMIN_USERNAME@example.com',
            password: hashedPassword,
            phone_number: '123',
            is_admin: true,
        },
    });

    console.log('Admin user created successfully with hashed password.');
}

createAdmin()
    .catch((e) => {
        console.error('Error creating admin user:', e);
        process.exit(1);
    });
"

# Build Docker images
echo "Building Docker images..."
cd Dockerfiles || exit 1
docker build -t code-runner-python -f Dockerfile.python .
docker build -t code-runner-javascript -f Dockerfile.javascript .
docker build -t code-runner-java -f Dockerfile.java .
docker build -t code-runner-c -f Dockerfile.c .
docker build -t code-runner-cpp -f Dockerfile.cpp .
docker build -t code-runner-ruby -f Dockerfile.ruby .
docker build -t code-runner-go -f Dockerfile.go .
docker build -t code-runner-php -f Dockerfile.php .
docker build -t code-runner-rust -f Dockerfile.rust .
docker build -t code-runner-swift -f Dockerfile.swift .
docker build -t code-runner-kotlin -f Dockerfile.kotlin .
docker build -t code-runner-csharp -f Dockerfile.csharp .
docker build -t code-runner-perl -f Dockerfile.perl .
docker build -t code-runner-haskell -f Dockerfile.haskell .
docker build -t code-runner-r -f Dockerfile.r .

echo "Docker images built successfully."
