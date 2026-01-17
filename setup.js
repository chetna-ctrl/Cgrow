#!/usr/bin/env node

/**
 * Agri-OS Setup Script
 * Helps developers set up the project quickly
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    log('\n🌱 Welcome to Agri-OS Setup!\n', 'green');
    log('This script will help you set up your development environment.\n', 'blue');

    // Check if .env already exists
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        log('⚠️  .env file already exists!', 'yellow');
        const overwrite = await question('Do you want to overwrite it? (y/N): ');
        if (overwrite.toLowerCase() !== 'y') {
            log('\n✅ Setup cancelled. Your existing .env file is safe.', 'green');
            rl.close();
            return;
        }
    }

    log('\n📝 Let\'s configure your Supabase connection:\n', 'blue');
    log('You can find these values at: https://supabase.com/dashboard/project/_/settings/api\n', 'yellow');

    // Get Supabase URL
    const supabaseUrl = await question('Enter your Supabase URL: ');
    if (!supabaseUrl || !supabaseUrl.includes('supabase.co')) {
        log('\n❌ Invalid Supabase URL. Please run the script again.', 'red');
        rl.close();
        return;
    }

    // Get Supabase Anon Key
    const supabaseKey = await question('Enter your Supabase Anon Key: ');
    if (!supabaseKey || supabaseKey.length < 20) {
        log('\n❌ Invalid Supabase Anon Key. Please run the script again.', 'red');
        rl.close();
        return;
    }

    // Create .env file
    const envContent = `# Supabase Configuration
# Get these from: https://supabase.com/dashboard/project/_/settings/api

REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseKey}

# Optional: Weather API (if using weather features)
# REACT_APP_WEATHER_API_KEY=your-weather-api-key
`;

    try {
        fs.writeFileSync(envPath, envContent);
        log('\n✅ .env file created successfully!', 'green');
    } catch (error) {
        log(`\n❌ Error creating .env file: ${error.message}`, 'red');
        rl.close();
        return;
    }

    // Check if node_modules exists
    log('\n📦 Checking dependencies...', 'blue');
    const nodeModulesPath = path.join(__dirname, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        log('⚠️  Dependencies not installed.', 'yellow');
        const install = await question('Do you want to install dependencies now? (Y/n): ');
        if (install.toLowerCase() !== 'n') {
            log('\n📦 Installing dependencies... (this may take a few minutes)', 'blue');
            const { execSync } = require('child_process');
            try {
                execSync('npm install', { stdio: 'inherit' });
                log('\n✅ Dependencies installed successfully!', 'green');
            } catch (error) {
                log('\n❌ Error installing dependencies. Please run "npm install" manually.', 'red');
            }
        }
    } else {
        log('✅ Dependencies already installed.', 'green');
    }

    // Next steps
    log('\n🎉 Setup complete! Here\'s what to do next:\n', 'green');
    log('1. Set up your Supabase database:', 'blue');
    log('   - Go to https://supabase.com/dashboard', 'yellow');
    log('   - Open SQL Editor', 'yellow');
    log('   - Run the SQL from supabase_setup.sql', 'yellow');
    log('');
    log('2. (Optional) Configure Google OAuth:', 'blue');
    log('   - Follow instructions in google_auth_setup.md', 'yellow');
    log('');
    log('3. Start the development server:', 'blue');
    log('   npm start', 'yellow');
    log('');
    log('4. Open http://localhost:3000 in your browser', 'blue');
    log('');
    log('5. Try demo mode by clicking "Try Demo (No Login)"', 'blue');
    log('');
    log('📚 For more help, check out:', 'green');
    log('   - SETUP_GUIDE.md - Complete setup instructions', 'yellow');
    log('   - ARCHITECTURE.md - Application architecture', 'yellow');
    log('   - testing_guide.md - Testing instructions', 'yellow');
    log('');

    rl.close();
}

main().catch(error => {
    log(`\n❌ Setup failed: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
});
