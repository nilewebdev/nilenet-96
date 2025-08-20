#!/bin/bash

# Tauri Build Script for macOS
# Optimized for old Macs with OCLP and low CPU usage

set -e  # Exit on any error

echo "🚀 Starting Tauri build process..."
echo "📱 Optimized for macOS (including older Macs with OCLP)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "This script is designed for macOS only."
    exit 1
fi

print_status "Detected macOS system ✅"

# Check if Rust is installed
print_status "Checking Rust installation..."
if ! command -v rustc &> /dev/null; then
    print_warning "Rust not found. Installing Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    print_success "Rust installed successfully!"
else
    print_success "Rust is already installed ✅"
fi

# Check if Cargo is in PATH
if ! command -v cargo &> /dev/null; then
    print_status "Adding Cargo to PATH..."
    source ~/.cargo/env
fi

# Update Rust to latest stable (for compatibility)
print_status "Updating Rust to latest stable version..."
rustup update stable
rustup default stable

# Check if Tauri CLI is installed
print_status "Checking Tauri CLI..."
if ! cargo tauri --version &> /dev/null; then
    print_warning "Tauri CLI not found. Installing..."
    cargo install tauri-cli --version "^1.0"
    print_success "Tauri CLI installed successfully!"
else
    print_success "Tauri CLI is already installed ✅"
fi

# Check if Node.js is installed
print_status "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed."
    print_status "Please install Node.js from https://nodejs.org/ or use Homebrew:"
    print_status "brew install node"
    exit 1
else
    NODE_VERSION=$(node --version)
    print_success "Node.js is installed: $NODE_VERSION ✅"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is required but not installed."
    exit 1
fi

# Navigate to frontend directory and install dependencies
print_status "Installing frontend dependencies..."
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "No package.json found in frontend directory!"
    print_status "Please ensure your Vite project is in the frontend/ folder."
    exit 1
fi

# Install dependencies with optimizations for old Macs
print_status "Running npm install (with low CPU optimization)..."
npm install --prefer-offline --no-audit --no-fund

# Build the frontend
print_status "Building frontend application..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Frontend build failed! No 'dist' directory found."
    print_status "Make sure your package.json has a 'build' script that outputs to 'dist/'"
    exit 1
fi

print_success "Frontend build completed ✅"

# Navigate back to root
cd ..

# Set environment variables for old Mac optimization
export MACOSX_DEPLOYMENT_TARGET=10.15
export CARGO_PROFILE_RELEASE_LTO=false  # Disable LTO for faster builds on old hardware
export CARGO_PROFILE_RELEASE_CODEGEN_UNITS=16  # More codegen units for parallel compilation

# Build the Tauri app
print_status "Building Tauri application for macOS..."
print_status "This may take several minutes on older hardware..."

# Use nice to lower CPU priority for old Macs
nice -n 10 cargo tauri build --verbose

# Check if build was successful
if [ -d "src-tauri/target/release/bundle/macos" ]; then
    print_success "🎉 Build completed successfully!"
    echo ""
    print_success "✨ Your macOS app is ready!"
    print_status "📁 Location: src-tauri/target/release/bundle/macos/"
    echo ""
    
    # List the generated app
    APP_NAME=$(ls src-tauri/target/release/bundle/macos/ | grep ".app" | head -n 1)
    if [ ! -z "$APP_NAME" ]; then
        print_success "🚀 Generated app: $APP_NAME"
        print_status "You can now run your app by double-clicking it or using:"
        print_status "open 'src-tauri/target/release/bundle/macos/$APP_NAME'"
    fi
    
    echo ""
    print_success "🎯 Done! Your Tauri app is ready to run."
    
else
    print_error "Build failed! Please check the output above for errors."
    exit 1
fi