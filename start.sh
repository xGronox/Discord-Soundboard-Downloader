#!/bin/bash

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print banner
echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}Discord Soundboard Downloader - Dependency Check${NC}"
echo -e "${GREEN}Created: xGronox${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo ""

# Check for Node.js
echo -e "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERROR] Node.js is not installed on your computer.${NC}"
    echo ""
    echo "Please install Node.js by going to:"
    echo "https://nodejs.org/en/download/"
    echo ""
    echo "After installing Node.js, run this script again."
    echo ""
    read -p "Press enter to exit"
    exit 1
fi

# Get Node.js version
NODE_VERSION=$(node --version)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
NODE_MINOR=$(echo $NODE_VERSION | cut -d. -f2)

echo -e "Node.js installed: version ${GREEN}$NODE_VERSION${NC}"
echo ""

# Check Node.js version
if [ $NODE_MAJOR -lt 14 ]; then
    echo -e "${YELLOW}[WARNING] It is recommended to use Node.js version 14 or higher.${NC}"
    echo -e "Your version: $NODE_VERSION"
    echo ""
    read -p "Do you want to continue with the older version? (y/n): " CONTINUE
    if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
        echo ""
        echo "Please update Node.js at:"
        echo "https://nodejs.org/en/download/"
        echo ""
        read -p "Press enter to exit"
        exit 1
    fi
fi

# Check for npm
echo "Checking for npm..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}[ERROR] npm is not installed or not found in PATH.${NC}"
    echo ""
    echo "Please reinstall Node.js including npm."
    read -p "Press enter to exit"
    exit 1
fi
echo -e "npm found."
echo ""

# Install dependencies (regardless of node_modules folder)
echo "Installing dependencies..."
echo "This may take a few moments..."
echo ""

# Try to install dependencies with --save flag
npm install discord.js-selfbot-v13@latest axios --save

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] Failed to install dependencies. Trying alternative method...${NC}"
    echo ""
    
    # Create or update package.json if it doesn't exist
    if [ ! -f "package.json" ]; then
        echo "Creating package.json..."
        echo '{"name":"discord-soundboard-downloader","dependencies":{}}' > package.json
    fi
    
    # Try another installation approach
    npm install discord.js-selfbot-v13@latest --save
    
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${RED}[ERROR] Still unable to install discord.js-selfbot-v13.${NC}"
        echo ""
        echo "Please try manually running:"
        echo "npm init -y"
        echo "npm install discord.js-selfbot-v13@latest axios --save"
        echo ""
        read -p "Press enter to exit"
        exit 1
    fi
    
    npm install axios --save
    
    if [ $? -ne 0 ]; then
        echo ""
        echo -e "${YELLOW}[WARNING] axios installation may have failed, but we'll try to continue.${NC}"
        echo ""
    fi
fi

# Verify modules were actually installed
echo ""
echo "Verifying installed modules..."
if [ ! -d "node_modules/discord.js-selfbot-v13" ]; then
    echo ""
    echo -e "${RED}[ERROR] Module verification failed. discord.js-selfbot-v13 is not installed correctly.${NC}"
    echo ""
    echo "Please try manually running:"
    echo "npm cache clean --force"
    echo "npm install discord.js-selfbot-v13@latest axios --force"
    echo ""
    read -p "Press enter to exit"
    exit 1
fi

echo -e "${GREEN}All dependencies successfully installed.${NC}"
echo ""

# Check for script file
echo "Checking for script file..."
if [ ! -f "discord-soundboard-downloader.js" ]; then
    echo -e "${RED}[ERROR] File discord-soundboard-downloader.js not found!${NC}"
    echo ""
    echo "Please make sure this file is in the same folder as start.sh."
    echo ""
    read -p "Press enter to exit"
    exit 1
fi
echo -e "Script file found."
echo ""

# Check settings
echo "Checking settings..."
grep "const TOKEN = 'token'" discord-soundboard-downloader.js > /dev/null
if [ $? -eq 0 ]; then
    echo -e "${YELLOW}[WARNING] It seems you haven't changed the Discord token in the script file.${NC}"
    echo ""
    echo "Please open the discord-soundboard-downloader.js file"
    echo "and replace 'token' and 'server-id' with your values."
    echo ""
    read -p "Do you want to continue without changing settings? (y/n): " CONTINUE
    if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
        if command -v nano &> /dev/null; then
            nano discord-soundboard-downloader.js
        elif command -v vim &> /dev/null; then
            vim discord-soundboard-downloader.js
        else
            echo "Please edit discord-soundboard-downloader.js with your preferred text editor"
            read -p "Press enter when done"
        fi
        echo ""
        echo "Run the script again after changing settings."
        read -p "Press enter to exit"
        exit 0
    fi
fi

# Create sounds folder
if [ ! -d "discord_sounds" ]; then
    mkdir discord_sounds
fi

echo -e "${GREEN}=======================================================${NC}"
echo -e "${GREEN}      Starting Discord Soundboard Downloader${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo ""
echo "Launching script..."
echo ""

# Run the script
node discord-soundboard-downloader.js

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}[ERROR] Script exited with an error.${NC}"
    echo "Check if your token and server ID are correct."
else
    echo ""
    echo -e "${GREEN}Script completed.${NC}"
fi

echo ""
echo "Done! Press enter to exit."
read
exit 0