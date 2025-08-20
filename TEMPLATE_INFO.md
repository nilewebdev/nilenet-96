# Tauri Template Structure

This template creates a complete Vite → Tauri build environment optimized for macOS.

## What's Created:

### Root Files:
- `README.md` - User instructions
- `nile.sh` - Automated build script (executable)
- `.gitignore` - Git ignore rules

### src-tauri/ (Tauri Backend):
- `tauri.conf.json` - Main Tauri configuration
- `Cargo.toml` - Rust dependencies and build settings
- `build.rs` - Build script
- `src/main.rs` - Main Rust application code
- `icons/` - App icon placeholders

### frontend/ (Vite Frontend):
- `package.json` - Node.js dependencies and scripts
- `index.html` - Sample HTML page
- `vite.config.js` - Vite configuration

## Key Optimizations for Old Macs:

1. **GPU Acceleration Disabled**:
   - `"accelerated": false` in tauri.conf.json
   - Browser args to disable GPU features
   - WebView optimizations in main.rs

2. **Build Optimizations**:
   - LTO disabled for faster compilation
   - More codegen units for parallel builds
   - Size optimization over speed
   - Reduced memory usage settings

3. **macOS Compatibility**:
   - Minimum system version: 10.15
   - Works with OpenCore Legacy Patcher (OCLP)
   - Low CPU usage during builds and runtime

## Usage:

1. Make the script executable: `chmod +x nile.sh`
2. Run: `./nile.sh`
3. Wait for completion
4. Find your app in: `src-tauri/target/release/bundle/macos/`

## Customization:

- Replace `frontend/` with your Vite project
- Edit `src-tauri/tauri.conf.json` for app settings
- Replace icon files in `src-tauri/icons/`
- Modify `src-tauri/src/main.rs` for Rust functionality

The template is ready to zip and distribute!