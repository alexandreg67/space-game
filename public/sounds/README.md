# Audio Assets

This directory contains the game's audio assets.

## Directory Structure

- `sfx/` - Sound effects
- `music/` - Background music

## Required Audio Files

### Sound Effects (public/sounds/sfx/)
- `laser.mp3` - Player shooting sound
- `explosion.mp3` - Enemy destruction sound
- `shield_hit.mp3` - Shield impact sound
- `player_hit.mp3` - Player damage sound
- `game_over.mp3` - Game over sound
- `level_up.mp3` - Level progression sound
- `ui_click.mp3` - UI interaction sound

### Music (public/sounds/music/)
- `space_ambient.mp3` - Background music (loopable, 3-5 minutes)

## Audio Requirements

### Technical Specifications
- **Format**: MP3 (for compatibility)
- **SFX Quality**: 44.1kHz, 128kbps
- **Music Quality**: 44.1kHz, 96kbps
- **Total Size**: < 2MB combined

### Sources for Free Audio
1. **Freesound.org** - Creative Commons licensed sounds
2. **Mixkit.co** - Royalty-free game audio
3. **OpenGameArt.org** - Game-specific audio resources
4. **Pixabay** - Free sound effects and music
5. **Kenney.nl** - CC0 game assets

### Search Terms
- **Laser**: "sci-fi laser", "space weapon", "energy blast"
- **Explosion**: "space explosion", "ship destruction", "energy blast"
- **Shield**: "energy shield", "force field", "deflection"
- **Music**: "space ambient", "sci-fi background", "cosmic music"

## Implementation Notes

The audio system is already implemented and ready to use these files:
- Audio is disabled by default (user must enable)
- Automatic preloading of critical sounds
- Object pooling for performance
- Cross-browser compatibility
- Mobile-friendly (autoplay policy compliant)

Simply add the audio files to their respective directories and they will be loaded automatically.

## Development Setup

For development purposes, you can create placeholder audio files using:

```bash
npm run audio:placeholder
```

This creates minimal silent MP3 files that prevent 404 errors during development. The placeholder files are:
- Ignored by git (won't be committed)
- Very small (minimal file size)
- Valid MP3 format (won't break audio system)
- Silent (won't interfere with development)

## Production Audio

For production, replace the placeholder files with real audio assets:

1. **Remove placeholder files**: Delete existing MP3 files
2. **Add real audio**: Copy your audio files to the correct directories
3. **Test thoroughly**: Ensure all audio plays correctly
4. **Commit real files**: Add them to git if desired (remove from .gitignore)

## File Structure After Setup

```
public/sounds/
├── README.md
├── sfx/
│   ├── laser.mp3           # Player shooting sound
│   ├── explosion.mp3       # Enemy destruction sound
│   ├── shield_hit.mp3      # Shield impact sound
│   ├── player_hit.mp3      # Player damage sound
│   ├── game_over.mp3       # Game over sound
│   ├── level_up.mp3        # Level progression sound
│   └── ui_click.mp3        # UI interaction sound
└── music/
    └── space_ambient.mp3   # Background music
```

The audio system will:
- Automatically detect and load these files
- Handle missing files gracefully (no crashes)
- Log warnings for missing audio to console
- Continue game operation without audio if files are missing