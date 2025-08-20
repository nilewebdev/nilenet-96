# How to Create the Tauri Template ZIP

## Step 1: Generate Template Files
All the necessary template files have been created in this project:

### Template Files Created:
- `nile.sh` - Main build script (will be made executable)
- `TAURI_README.md` - Instructions for template users
- `src-tauri/tauri.conf.json` - Tauri configuration (GPU disabled, optimized for old Macs)
- `src-tauri/Cargo.toml` - Rust dependencies and build optimizations
- `src-tauri/build.rs` - Build script
- `src-tauri/src/main.rs` - Main Rust application
- `frontend/package.json` - Frontend dependencies
- `frontend/index.html` - Sample frontend page
- `frontend/vite.config.js` - Vite configuration
- `src-tauri/icons/*` - Icon placeholders

## Step 2: Create Template Package
Run the template creation script:

```bash
chmod +x create_template.sh
./create_template.sh
```

This will:
- Create `my-tauri-template/` directory with proper structure
- Copy all template files to correct locations
- Make `nile.sh` executable
- Prepare everything for ZIP packaging

## Step 3: Create ZIP Package
```bash
zip -r my-tauri-template.zip my-tauri-template/
```

## Final Template Structure:
```
my-tauri-template.zip
└── my-tauri-template/
    ├── README.md (user instructions)
    ├── nile.sh (executable build script)
    ├── frontend/
    │   ├── package.json
    │   ├── index.html
    │   └── vite.config.js
    └── src-tauri/
        ├── tauri.conf.json
        ├── Cargo.toml
        ├── build.rs
        ├── src/
        │   └── main.rs
        └── icons/
            ├── icon.ico
            ├── icon.icns
            ├── 32x32.png
            ├── 128x128.png
            └── 128x128@2x.png
```

## Key Optimizations for Old Macs:

### 1. GPU Acceleration Disabled:
- `tauri.conf.json` has `"accelerated": false`
- Browser args disable GPU features
- WebView optimizations in `main.rs`

### 2. Build Performance:
- LTO disabled for faster builds
- Multiple codegen units for parallel compilation
- Size optimization over speed
- Reduced memory usage

### 3. macOS Compatibility:
- Minimum system version: 10.15
- OCLP (OpenCore Legacy Patcher) compatible
- Low CPU usage during builds

## User Experience:
1. User downloads and unzips `my-tauri-template.zip`
2. Opens Terminal, navigates to `my-tauri-template/`
3. Runs `./nile.sh`
4. Script automatically:
   - Installs Rust if needed
   - Installs Tauri CLI if needed
   - Builds frontend
   - Compiles native macOS app
5. App ready in `src-tauri/target/release/bundle/macos/`

## Template is Ready!
The ZIP package will be a complete, self-contained Tauri development environment optimized for macOS, especially older Macs with GPU limitations.