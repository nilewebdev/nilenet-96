#!/bin/bash

# Build script for Nile Browser macOS app
# Optimized for older Macs with GPU limitations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only."
    exit 1
fi

print_status "Building Nile Browser for macOS..."

# Check for Node.js and npm
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Install Rust if not present
if ! command -v rustc &> /dev/null; then
    print_status "Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    print_success "Rust installed successfully"
else
    print_success "Rust is already installed"
    # Update Rust to latest stable
    print_status "Updating Rust to latest stable..."
    rustup update stable
fi

# Install Tauri CLI if not present
if ! command -v cargo-tauri &> /dev/null; then
    print_status "Installing Tauri CLI..."
    cargo install tauri-cli
    print_success "Tauri CLI installed successfully"
else
    print_success "Tauri CLI is already installed"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Build frontend
print_status "Building frontend..."
npm run build
print_success "Frontend built successfully"

# Set environment variables for older Mac optimization
export MACOSX_DEPLOYMENT_TARGET=10.15
export CARGO_PROFILE_RELEASE_LTO=false
export CARGO_PROFILE_RELEASE_CODEGEN_UNITS=16

# Build Tauri app with low CPU priority for old Macs
print_status "Building native macOS application..."
print_warning "This may take several minutes on older hardware..."

cd src-tauri
nice -n 10 cargo tauri build
cd ..

# Check if build was successful
if [ -d "src-tauri/target/release/bundle/macos" ]; then
    print_success "Build completed successfully!"
    echo ""
    echo "Your native macOS app is located at:"
    echo "📁 src-tauri/target/release/bundle/macos/"
    echo ""
    echo "To run your app:"
    echo "1. Open Finder"
    echo "2. Navigate to src-tauri/target/release/bundle/macos/"
    echo "3. Double-click 'Nile Browser.app'"
    echo ""
    echo "To distribute your app, you can compress the .app bundle or use Apple's notarization process."
else
    print_error "Build failed. Check the output above for errors."
    exit 1
fi