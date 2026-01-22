#!/bin/bash

# Exit on error
set -e

echo "Building ng-reports library..."

# Navigate to client app directory
cd apps/client

# Build the library
npx ng build ng-reports

# Navigate to dist folder
cd dist/ng-reports

echo "Packing library..."
# Create tarball
npm pack

# Move to root releases folder (create if not exists)
mkdir -p ../../../api/lib-releases
mv *.tgz ../../../api/lib-releases/

echo "Library packed successfully!"
echo "Find the package in apps/api/lib-releases directory."
