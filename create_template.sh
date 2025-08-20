#!/bin/bash

# Script to create the Tauri template ZIP package

echo "🔧 Creating Tauri Template Package..."

# Create the template directory structure
mkdir -p my-tauri-template/frontend
mkdir -p my-tauri-template/src-tauri/src
mkdir -p my-tauri-template/src-tauri/icons

# Copy all the template files
echo "📁 Copying template files..."

# Root files
cp TAURI_README.md my-tauri-template/README.md
cp nile.sh my-tauri-template/
cp TEMPLATE_INFO.md my-tauri-template/

# Frontend files
cp frontend/package.json my-tauri-template/frontend/
cp frontend/index.html my-tauri-template/frontend/
cp frontend/vite.config.js my-tauri-template/frontend/

# Tauri files
cp src-tauri/tauri.conf.json my-tauri-template/src-tauri/
cp src-tauri/Cargo.toml my-tauri-template/src-tauri/
cp src-tauri/build.rs my-tauri-template/src-tauri/
cp src-tauri/src/main.rs my-tauri-template/src-tauri/src/

# Icon placeholders
cp src-tauri/icons/* my-tauri-template/src-tauri/icons/

# Make nile.sh executable
chmod +x my-tauri-template/nile.sh

echo "✅ Template directory created: my-tauri-template/"
echo ""
echo "📦 To create ZIP package:"
echo "zip -r my-tauri-template.zip my-tauri-template/"
echo ""
echo "🚀 Template is ready for distribution!"
echo ""
echo "Users can:"
echo "1. Unzip the package"
echo "2. cd my-tauri-template"
echo "3. ./nile.sh"
echo ""
echo "And they'll have a native macOS app!"