# Guide de Test Audio - Debugging

## Instructions pour tester le système audio avec les logs de débogage

### Étapes de test :

1. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

2. **Ouvrir le jeu** :
   - Naviguer vers `http://localhost:3000/game`
   - Ouvrir les outils de développement (F12)
   - Aller dans l'onglet "Console"

3. **Tester le bouton audio** :
   - Cliquer sur le bouton audio (🔇) en haut à droite
   - **Une alerte devrait apparaître** avec "Audio test lancé !"
   - **Vérifier la console** pour voir les logs détaillés

### Logs attendus dans la console :

#### Lors du clic sur le bouton audio :
```
Audio button clicked: {isAudioEnabled: false, isMuted: false}
Initializing audio system...
Resuming suspended audio context... (si nécessaire)
Audio context resumed, new state: running
Preloading critical sounds...
Audio system initialized successfully
Audio initialization result: true
Running audio test...
Testing audio system...
Audio system state: {initialized: true, enableAudio: true, muted: false, ...}
Attempting to play sound: ui_click {enableAudio: true, muted: false, ...}
```

#### Si les sons sont trouvés et jouent :
```
Playing pooled sound: ui_click, volume: 0.X
Pooled sound ui_click play result: [ID number]
```

#### Si les sons ne sont pas préchargés :
```
Sound ui_click not preloaded, attempting to load...
Available pools: ["laser", "shield_hit"]
Available sounds: ["explosion", "player_hit"]
```

### Problèmes possibles et solutions :

#### 1. Si "Sound blocked" apparaît :
- L'audio n'est pas activé ou est muté
- Vérifier l'état `enableAudio` et `muted` dans les logs

#### 2. Si les fichiers ne se chargent pas :
- Vérifier que les fichiers `.wav` existent dans `/public/sounds/`
- Regarder les erreurs de réseau dans l'onglet Network

#### 3. Si aucun son n'est audible mais les logs sont OK :
- Vérifier le volume du système
- Vérifier que le navigateur n'est pas muté
- Essayer dans un autre navigateur

### Tests supplémentaires :

#### Test de tir laser :
- Démarrer le jeu
- Appuyer sur Espace ou cliquer pour tirer
- Regarder les logs pour : `Attempting to play sound: laser`

#### Test de musique de fond :
- Démarrer le jeu 
- Regarder les logs pour le chargement de `space_ambient.wav`

### Formats des fichiers audio :

- **Format** : WAV (RIFF WAVE)
- **Qualité** : 16-bit, mono, 22050 Hz
- **Tailles** :
  - ui_click.wav : ~4KB
  - laser.wav : ~13KB
  - explosion.wav : ~35KB
  - space_ambient.wav : ~441KB

### Volume par défaut :

- **Master Volume** : 70%
- **SFX Volume** : 80%  
- **Music Volume** : 50%
- **Volume final** = (Volume option) × (SFX/Music Volume) × (Master Volume)

### Commandes utiles pour le debug :

```bash
# Vérifier les fichiers audio
ls -la public/sounds/sfx/
ls -la public/sounds/music/

# Nettoyer et relancer
npm run build
npm run dev
```

Si le problème persiste après ces vérifications, les logs de la console fourniront des informations précises sur ce qui ne fonctionne pas.