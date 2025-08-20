# Tauri Template for macOS

A ready-to-run Vite → Tauri template optimized for macOS, including older Macs with GPU limitations.

## Quick Start

1. Unzip this template wherever you want your project
2. Open Terminal and navigate to the extracted folder
3. Run the setup script:
   ```bash
   ./nile.sh
   ```

That's it! The script will handle everything automatically.

## What the script does:

- ✅ Checks and installs Rust if needed
- ✅ Installs Tauri CLI if needed  
- ✅ Installs frontend dependencies
- ✅ Builds your Vite project
- ✅ Packages your native macOS app
- ✅ Optimized for old Macs (GPU acceleration disabled)

## Using your own Vite project:

1. Replace the contents of the `frontend/` folder with your Vite project files
2. Make sure your `package.json` has a `build` script that outputs to `dist/`
3. Run `./nile.sh` again

## Output:

Your finished macOS app will be in:
```
src-tauri/target/release/bundle/macos/
```

## System Requirements:

- macOS 10.15+ (optimized for macOS Sequoia)
- Works on Intel and Apple Silicon Macs
- Supports older Macs with OpenCore Legacy Patcher (OCLP)
- No GPU acceleration required

## Troubleshooting:

If you get permission errors, make the script executable:
```bash
chmod +x nile.sh
```

If Rust installation fails, install manually:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Configuration:

Edit `src-tauri/tauri.conf.json` to customize:
- App name and identifier
- Window size and behavior
- Icons and metadata