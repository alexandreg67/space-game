#!/usr/bin/env node

/**
 * Creates minimal placeholder audio files for development
 * These are tiny silent MP3 files that prevent 404 errors during development
 */

const fs = require('fs');
const path = require('path');

// Base64 encoded minimal silent MP3 file (about 0.1 seconds of silence)
// This is a valid MP3 file with minimal metadata
const SILENT_MP3_BASE64 = `
SUQzAwAAAAAJdlRJVDIAAAACAAABAAAAVEVOQwAAAAgAAAFMYW1lIDMuOTkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/+xDEAAHAAAAAAAAAAAAAAAAAAAAAAD/+xDEIAAGrAAAA/wAAAA0A+gf/////////+xDEXAGOzgABgAAAA4AA6B//////////Lv//////////+xDEgAGQygABgAAAA4AA6B//////////Lv//////////+xDEkgGQygABgAAAA4AA6B//////////Lv/////////8=
`.trim();

const audioFiles = [
  { dir: 'sfx', name: 'laser.mp3' },
  { dir: 'sfx', name: 'explosion.mp3' },
  { dir: 'sfx', name: 'shield_hit.mp3' },
  { dir: 'sfx', name: 'player_hit.mp3' },
  { dir: 'sfx', name: 'game_over.mp3' },
  { dir: 'sfx', name: 'level_up.mp3' },
  { dir: 'sfx', name: 'ui_click.mp3' },
  { dir: 'music', name: 'space_ambient.mp3' },
];

const soundsDir = path.join(__dirname, '..', 'public', 'sounds');

function createPlaceholderAudio() {
  console.log('Creating placeholder audio files for development...');

  audioFiles.forEach(({ dir, name }) => {
    const targetDir = path.join(soundsDir, dir);
    const targetFile = path.join(targetDir, name);

    // Ensure directory exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Only create if file doesn't exist
    if (!fs.existsSync(targetFile)) {
      try {
        const audioData = Buffer.from(SILENT_MP3_BASE64, 'base64');
        fs.writeFileSync(targetFile, audioData);
        console.log(`✓ Created: ${dir}/${name}`);
      } catch (error) {
        console.error(`✗ Failed to create ${dir}/${name}:`, error.message);
      }
    } else {
      console.log(`- Exists: ${dir}/${name}`);
    }
  });

  console.log('\nPlaceholder audio files created successfully!');
  console.log('\nTo replace with real audio:');
  console.log('1. Download audio files from free sources (see public/sounds/README.md)');
  console.log('2. Replace the placeholder files with real audio');
  console.log('3. Ensure files are in MP3 format with appropriate quality settings');
  console.log('\nNote: These placeholder files are silent and for development only.');
}

// Create .gitkeep files to preserve directory structure
function createGitkeep() {
  ['sfx', 'music'].forEach(dir => {
    const targetDir = path.join(soundsDir, dir);
    const gitkeepFile = path.join(targetDir, '.gitkeep');
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (!fs.existsSync(gitkeepFile)) {
      fs.writeFileSync(gitkeepFile, '# This file keeps the directory in git\n');
      console.log(`✓ Created: ${dir}/.gitkeep`);
    }
  });
}

// Main execution
if (require.main === module) {
  try {
    createGitkeep();
    createPlaceholderAudio();
  } catch (error) {
    console.error('Error creating placeholder audio:', error);
    process.exit(1);
  }
}

module.exports = { createPlaceholderAudio, createGitkeep };