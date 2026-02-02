#!/bin/bash

# Install dependencies if node_modules is empty or doesn't exist
if [ ! -d "node_modules" ] || [ -z "$(ls -A node_modules 2>/dev/null)" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start development server
echo "Starting Next.js development server..."
npm run dev
