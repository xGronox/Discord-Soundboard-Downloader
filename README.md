# Discord Soundboard Downloader

<p align="center">
  <img src="https://i.imgur.com/s2rwHq6.png" alt="Discord Soundboard Downloader" width="720"/>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#disclaimer">Disclaimer</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-14%2B-brightgreen" alt="Node.js Version"/>
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-blue" alt="Platform"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License"/>
</p>

A tool for downloading all sound files from a Discord server's soundboard. Simple to use and works with all types of soundboard content.

## Features

- ✅ Download all sounds from a Discord server's soundboard
- ✅ Automatic format detection and correction
- ✅ Smart handling of large files (>60KB)
- ✅ Built-in retry mechanism for failed downloads
- ✅ Auto-recovery for corrupted audio files
- ✅ User-friendly interface with detailed logs
- ✅ Works on Windows, macOS, and Linux

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)

### Automatic Installation

1. Clone or download this repository
2. Run the included start.bat file (Windows) or start.sh file (macOS/Linux)
3. The script will automatically check for and install all required dependencies

### Manual Installation

If the automatic installation doesn't work:

1. Clone or download this repository
2. Open a terminal/command prompt in the project folder
3. Run the following command:
   ```bash
   npm install discord.js-selfbot-v13 axios
   ```

## Configuration

Open the `discord-soundboard-downloader.js` file and modify the following settings at the top:

```javascript
// Settings
const TOKEN = 'token'; // Discord user token
const SERVER_ID = 'server-id'; // Server ID
const OUTPUT_FOLDER = './discord_sounds'; // Folder to save sounds
const FORMATS = ['.mp3', '.ogg', '.wav', '.opus']; // Formats to check
const MAX_RETRIES = 3; // Maximum number of download retries
const PREFER_MP3 = true; // Set to true to use .mp3 extension for all files
```

### How to get your Discord user token

**IMPORTANT**: Using a user token with selfbot libraries violates Discord's Terms of Service. Use at your own risk.

1. Open Discord in your web browser
2. Press F12 to open Developer Tools
3. Go to the "Network" tab
4. Refresh the page (F5)
5. Look for any request to "discord.com"
6. In the request headers, find "Authorization" - this is your token

### How to get a server ID

1. Enable Developer Mode in Discord (Settings → Advanced → Developer Mode)
2. Right-click on the server icon
3. Click "Copy ID"

## Usage

After configuring the script, you can run it in several ways:

### On Windows:

Double-click the `start.bat` file

### On macOS/Linux:

Run the start.sh file:
```bash
chmod +x start.sh
./start.sh
```

### Manual execution:

```bash
node discord-soundboard-downloader.js
```

## How it Works

The script will:
1. Connect to Discord using your token
2. Fetch all sounds from the specified server's soundboard
3. Download each sound to the `discord_sounds` folder
4. Automatically detect and fix file format issues
5. Display a summary when finished

### Understanding Log Output

```
Downloading: sound_name... OK
```
- Normal successful download

```
Large file detected: filename.mp3 (65536 bytes)
File header (hex): 4f67675300020000
File is actually OGG format.
Renamed filename.mp3 to filename.ogg
```
- The script detected a file with incorrect extension and fixed it

```
Downloading: sound_name... Retry 1/2... OK
```
- Download failed on first attempt but succeeded on retry

## Troubleshooting

### Common Issues

#### "Error: Cannot find module 'discord.js-selfbot-v13'"
Run `npm install discord.js-selfbot-v13` to install the missing dependency

#### "TypeError: Cannot read properties of null"
This usually means your token is invalid or expired. Get a new token and update the configuration.

#### "Large files not playing correctly"
If files around 60KB+ don't play properly, check if they were correctly renamed to .ogg format

### Advanced Troubleshooting

1. Make sure your Discord token is valid and not expired
2. Check that you have the correct server ID
3. Ensure you have proper permissions to access the server
4. Check your internet connection
5. Try increasing the MAX_RETRIES value in the configuration

## Contributing

Contributions are welcome! If you'd like to improve this tool:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool is provided for educational purposes only. Use of selfbots and automated user accounts violates Discord's Terms of Service and may result in account termination. Use at your own risk.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/xGronox">xGronox</a>
</p>