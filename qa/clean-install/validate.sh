#!/bin/bash
set -e

# Clean Environment Validation Script for @qwickapps/server
# This script validates that the package can be installed and used in a clean environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PACKAGE_NAME="@qwickapps/server"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  $PACKAGE_NAME - Clean Install Validation                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker."
    exit 1
fi

# Build the package first
echo "📦 Building package..."
cd "$PACKAGE_DIR"
npm run build

# Create tarball
echo "📦 Creating npm tarball..."
TARBALL=$(npm pack 2>&1 | tail -1)
echo "   Created: $TARBALL"

# Build Docker image and run test
echo ""
echo "🐳 Running clean environment test..."
docker build -t qwickapps-control-panel-test \
    --build-arg TARBALL="$TARBALL" \
    -f "$SCRIPT_DIR/Dockerfile" \
    "$PACKAGE_DIR"

# Cleanup
echo ""
echo "🧹 Cleaning up..."
rm -f "$PACKAGE_DIR/$TARBALL"

echo ""
echo "✅ Clean environment validation passed!"
