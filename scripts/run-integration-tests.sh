#!/bin/bash

# Kill any existing ngrok sessions
echo "Killing existing ngrok sessions..."
pkill ngrok

# Kill any process using port 3001
echo "Killing any process using port 3001..."
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9 || true

# Start ngrok in the background
echo "Starting ngrok..."
ngrok http 3001 &
NGROK_PID=$!

# Wait for ngrok to start
echo "Waiting for ngrok to start..."
sleep 5

# Start Next.js dev server with .env.test in the background
echo "Starting Next.js dev server with test environment..."
dotenv -e .env.test -- yarn dev &
NEXT_PID=$!

# Wait for Next.js to start
echo "Waiting for Next.js to start..."
sleep 10

# Run the integration test
echo "Running integration tests..."
dotenv -e .env.test -- npm run test:setup-db && cross-env NODE_OPTIONS='--experimental-vm-modules' jest -c jest.config.integration.js --testPathPattern=integration && dotenv -e .env.test -- npm run test:cleanup-db

# Clean up
echo "Cleaning up..."
kill $NGROK_PID
kill $NEXT_PID

echo "Done!" 