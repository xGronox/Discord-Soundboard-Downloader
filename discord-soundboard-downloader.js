const { Client } = require('discord.js-selfbot-v13');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { createWriteStream } = require('fs');
const { promisify } = require('util');
const { pipeline } = require('stream');
const pipelineAsync = promisify(pipeline);

// Settings
const TOKEN = 'token'; // Discord user token
const SERVER_ID = 'server-id'; // Server ID
const OUTPUT_FOLDER = './discord_sounds'; // Folder to save sounds
const FORMATS = ['.mp3', '.ogg']; // Formats to check
const MAX_RETRIES = 3; // Maximum number of download retries

// Console color formatting
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m"
};

// Custom error handler function for formatted output
function handleError(error, context = '') {
    let errorMessage = '';
    
    if (error.name === 'DiscordAPIError') {
        errorMessage = `${colors.red}${error.name}: ${error.message}${colors.reset}`;
    } else if (error.isAxiosError) {
        if (error.response) {
            errorMessage = `${colors.red}API Error: ${error.response.status} - ${error.response.statusText}${colors.reset}`;
        } else {
            errorMessage = `${colors.red}Network Error: ${error.message}${colors.reset}`;
        }
    } else {
        errorMessage = `${colors.red}Error: ${error.message}${colors.reset}`;
    }
    
    if (context) {
        console.error(`${context}: ${errorMessage}`);
    } else {
        console.error(errorMessage);
    }
}

if (!fs.existsSync(OUTPUT_FOLDER)) {
    fs.mkdirSync(OUTPUT_FOLDER, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function getRandomUserAgent() {
    const userAgents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

async function downloadFile(url, outputPath, attempt = 1) {
    try {
        let responseType = 'arraybuffer';
        let headers = {
            'User-Agent': getRandomUserAgent(),
            'Accept': 'audio/*,*/*',
            'Accept-Encoding': 'identity',
            'Connection': 'keep-alive',
            'Referer': 'https://discord.com/'
        };
        
        if (attempt === 2) {
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': '*/*',
                'Origin': 'https://discord.com',
                'Referer': 'https://discord.com/',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-site'
            };
        }
        
        if (attempt === 3) {
            responseType = 'blob';
            headers['sec-ch-ua'] = '"Google Chrome";v="91", "Chromium";v="91"';
            headers['sec-ch-ua-mobile'] = '?0';
        }
        
        const response = await axios({
            method: 'GET',
            url: url,
            responseType: responseType,
            headers: headers,
            timeout: 20000,
            maxContentLength: 10485760  // 10MB max - prevent memory issues
        });

        if (response.status !== 200) {
            return false;
        }

        fs.writeFileSync(outputPath, Buffer.from(response.data));
        
        const stats = fs.statSync(outputPath);
        if (stats.size < 1000) { // Minimum 1 KB
            fs.unlinkSync(outputPath);
            return false;
        }
        
        if (stats.size > 60000) {
            
            const buffer = Buffer.alloc(8);
            const fd = fs.openSync(outputPath, 'r');
            fs.readSync(fd, buffer, 0, 8, 0);
            fs.closeSync(fd);
            
            const hexHeader = buffer.toString('hex').substring(0, 16);
            
            if (buffer[0] === 0x4F && buffer[1] === 0x67 && buffer[2] === 0x67 && buffer[3] === 0x53) {
                
                if (outputPath.toLowerCase().endsWith('.mp3')) {
                    const newPath = outputPath.replace(/\.mp3$/i, '.ogg');
                    fs.renameSync(outputPath, newPath);
                    console.log(`Renamed ${path.basename(outputPath)} to ${path.basename(newPath)}`);
                    return true;
                }
            }
        }
        
        return true;
    } catch (error) {
        if (attempt < 3) {
            await sleep(2000 * attempt);
            return downloadFile(url, outputPath, attempt + 1);
        }
        return false;
    }
}

class DiscordSoundboard {
    constructor(token, guildId) {
        this.token = token;
        this.guildId = guildId;
        this.headers = {
            'Authorization': token,
            'Content-Type': 'application/json',
            'User-Agent': getRandomUserAgent()
        };
    }

    async getGuildSounds() {
        try {
            const response = await axios.get(`https://discord.com/api/v9/guilds/${this.guildId}/soundboard-sounds`, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            handleError(error, "Getting server sounds");
            throw error;
        }
    }

    async getSoundsViaGateway() {
        try {
            const response = await axios.post(`https://discord.com/api/v9/soundboard/sounds`, {
                guild_ids: [this.guildId]
            }, {
                headers: this.headers
            });
            return response.data;
        } catch (error) {
            handleError(error, "Getting sounds via gateway");
            return [];
        }
    }

    async downloadSound(soundId, soundName) {
        const sanitizedName = soundName.toString().replace(/[\\/:*?"<>|]/g, '_');
        
        // Try the official URL first (without extension)
        const mainOutputPath = path.join(OUTPUT_FOLDER, `${sanitizedName}.mp3`);
        const mainUrl = `https://cdn.discordapp.com/soundboard-sounds/${soundId}`;
        
        const mainSuccess = await downloadFile(mainUrl, mainOutputPath);
        
        if (mainSuccess) {
            const oggPath = path.join(OUTPUT_FOLDER, `${sanitizedName}.ogg`);
            if (fs.existsSync(oggPath) && !fs.existsSync(mainOutputPath)) {
                return true;
            }
            
            if (fs.existsSync(mainOutputPath)) {
                return true;
            }
        }
        
        for (const format of FORMATS) {
            if (format === '.mp3') continue;
            
            const outputPath = path.join(OUTPUT_FOLDER, `${sanitizedName}${format}`);
            const url = `https://cdn.discordapp.com/soundboard-sounds/${soundId}${format}`;
            
            const success = await downloadFile(url, outputPath);
            if (success) {
                if (fs.existsSync(mainOutputPath)) {
                    try { fs.unlinkSync(mainOutputPath); } catch (e) {}
                }
                return true;
            }
        }

        const opusPath = path.join(OUTPUT_FOLDER, `${sanitizedName}.opus`);
        const opusUrl = `https://cdn.discordapp.com/soundboard-sounds/${soundId}.opus`;
        
        const opusSuccess = await downloadFile(opusUrl, opusPath);
        if (opusSuccess) {
            if (fs.existsSync(mainOutputPath)) {
                try { fs.unlinkSync(mainOutputPath); } catch (e) {}
            }
            return true;
        }
        
        const lastPath = path.join(OUTPUT_FOLDER, `${sanitizedName}.ogg`);
        const cacheBuster = Date.now();
        const lastUrl = `https://cdn.discordapp.com/soundboard-sounds/${soundId}?_cb=${cacheBuster}`;
        
        const lastSuccess = await downloadFile(lastUrl, lastPath);
        
        return lastSuccess;
    }
}

const client = new Client({
    checkUpdate: false,
    ws: {
        properties: {
            $browser: "Discord Android"
        }
    }
});

client.on('ready', async () => {
    console.log(`${colors.green}Logged in as ${client.user.tag}${colors.reset}`);
    
    try {
        const guild = await client.guilds.fetch(SERVER_ID);
        if (!guild) {
            console.error(`${colors.red}Error: Server with ID ${SERVER_ID} not found${colors.reset}`);
            client.destroy();
            return;
        }
        
        console.log(`${colors.green}Access to server: ${guild.name}${colors.reset}`);
        
        const soundboard = new DiscordSoundboard(TOKEN, SERVER_ID);
        
        let successCount = 0;
        let failCount = 0;
        
        console.log('Getting sounds from server...');
        const guildSoundsData = await soundboard.getGuildSounds();
        
        let sounds = [];
        
        if (Array.isArray(guildSoundsData)) {
            sounds = guildSoundsData;
        } else if (guildSoundsData.items && Array.isArray(guildSoundsData.items)) {
            sounds = guildSoundsData.items;
        } else if (typeof guildSoundsData === 'object') {
            for (const key in guildSoundsData) {
                if (Array.isArray(guildSoundsData[key])) {
                    sounds = guildSoundsData[key];
                    break;
                }
            }
        }
        
        console.log(`Found ${colors.cyan}${sounds.length}${colors.reset} sounds`);
        
        const files = fs.readdirSync(OUTPUT_FOLDER);
        for (const file of files) {
            if (file.endsWith('.bak') || file.endsWith('.trimmed') || file.endsWith('.repaired')) {
                try {
                    fs.unlinkSync(path.join(OUTPUT_FOLDER, file));
                } catch (e) {}
            }
        }
        
        for (const sound of sounds) {
            const soundName = sound.name || 'unknown';
            const soundId = sound.sound_id;
            
            process.stdout.write(`Downloading: ${soundName}... `);
            
            let success = false;
            for (let attempt = 0; attempt < MAX_RETRIES && !success; attempt++) {
                if (attempt > 0) {
                    process.stdout.write(`Retry ${attempt}/${MAX_RETRIES-1}... `);
                    await sleep(1000 * Math.pow(2, attempt));
                }
                
                success = await soundboard.downloadSound(soundId, soundName);
                
                if (success) break;
            }
            
            if (success) {
                successCount++;
                process.stdout.write(`${colors.green}OK${colors.reset}\n`);
            } else {
                failCount++;
                process.stdout.write(`${colors.red}FAILED${colors.reset}\n`);
            }
            
            await sleep(1000);
        }
        
        // Output statistics
        console.log(`\n${colors.cyan}===== DOWNLOAD SUMMARY =====${colors.reset}`);
        console.log(`Found sounds: ${sounds.length}`);
        console.log(`Successfully downloaded: ${colors.green}${successCount}${colors.reset}`);
        console.log(`Failed to download: ${failCount > 0 ? colors.red + failCount + colors.reset : '0'}`);
        console.log(`${colors.cyan}===========================${colors.reset}`);
        
    } catch (error) {
        handleError(error, "An error occurred");
    } finally {
        client.destroy();
    }
});

// Custom error handling for login
client.login(TOKEN).catch(err => {
    handleError(err, "Login error");
});