#!/bin/bash

# Run setup
npm run test:integration:setup

# Run tests with any passed arguments
cross-env NODE_OPTIONS='--experimental-vm-modules' dotenv -e .env.test -- jest -c jest.config.integration.js "$@"

# Run cleanup
npm run test:integration:cleanup 