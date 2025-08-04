# ENEMY_DESIGN_RESOURCES.md

## Vue d'ensemble du projet

Ce document rassemble toutes les ressources de recherche pour l'amélioration du design visuel des ennemis dans notre space shooter React + Next.js. L'objectif est de créer des ennemis visuellement distinctifs qui contrastent avec le vaisseau joueur tout en maintenant une cohérence esthétique dans l'univers spatial.

---

## 🎯 Objectifs visuels

### Contraste avec le joueur
- **Joueur actuel** : Design angulaire sophistiqué, palette cyan/bleu (#00FFFF, #4a9eff), effets de glow, animations de propulseurs
- **Ennemis cibles** : Formes plus organiques/géométriques agressives, palette rouge/orange/violet, animations menaçantes

### Caractéristiques recherchées
- Visuellement reconnaissables comme hostiles
- Différenciation claire entre types d'ennemis
- Animation et effets qui évoquent le danger
- Intégration harmonieuse dans l'esthétique spatiale

---

## 📚 Références de projets GitHub

### 1. MichalGoly/SpaceShooter ⭐⭐⭐⭐⭐
**URL** : https://github.com/MichalGoly/SpaceShooter
**Pourquoi utile** : Implémentation de référence avec 4 types d'ennemis distincts
**Caractéristiques techniques** :
- Physiques avec conservation de momentum
- 4 types d'IA bien définis :
  - **Bleus** : Descente vers positions aléatoires puis collision
  - **Rouges** : Version rapide des bleus
  - **Verts** : Vol vertical avec tir de lasers rouges
  - **Noirs** : Vol aléatoire avec tir constant (plus dangereux)

**Code snippets utiles** :
```javascript
// Système de types d'ennemis avec comportements distincts
const enemyTypes = {
  BLUE: { speed: 2, behavior: 'descent_crash' },
  RED: { speed: 4, behavior: 'quick_descent' },
  GREEN: { speed: 1.5, behavior: 'vertical_shooter' },
  BLACK: { speed: 3, behavior: 'random_aggressive' }
};
```

### 2. naelkhann/Descent
**URL** : https://github.com/naelkhann/Descent
**Pourquoi utile** : Implémentation JavaScript/EaselJS avec génération procédurale
**Techniques applicables** :
- Spawn d'ennemis à positions X aléatoires
- Système de nettoyage et régénération
- Scrolling vertical fluide

### 3. coryrylan/space-shooter
**URL** : https://github.com/coryrylan/space-shooter
**Pourquoi utile** : Implémentation minimaliste JavaScript + HTML5 Canvas
**Techniques applicables** :
- Patterns d'ennemis simples mais efficaces
- Code léger et performant

---

## 🎨 Inspiration visuelle

### Enter the Gungeon - Philosophie de design
**Caractéristiques visuelles** :
- Style graphique NES malgré la plateforme moderne
- Sprites d'armes 32-64 pixels avec détails fins
- Couleurs vives avec lumières brillantes
- Lignes d'action dramatiques
- Types d'ennemis iconiques (Bullet Kin, Gunjurers)

**Application à notre projet** :
- Formes géométriques simples mais expressives
- Palette de couleurs vives pour différenciation
- Effets lumineux pour les armes/capacités ennemies

### Terraria - Art pixel optimisé
**Techniques applicables** :
- Formes simplifiées avec palettes limitées
- Esthétique 8-16 bit nostalgique
- Développement économe en ressources
- Templates de sprites réutilisables

### R-Type - Classics du genre
**Éléments visuels iconiques** :
- Formes organiques/bio-mécaniques
- Animations fluides de déplacement
- Effets d'explosion détaillés
- Progression visuelle de la difficulté

---

## 🛠️ Techniques d'implémentation React Konva

### Animation de sprites avec Konva
**Documentation officielle** : https://konvajs.org/docs/shapes/Sprite.html

```javascript
// Implémentation d'animation sprite basique
const EnemySprite = () => {
  const [animation, setAnimation] = useState('idle');
  
  const spriteData = {
    idle: [0, 0, 32, 32, 32, 0, 32, 32],
    attack: [64, 0, 32, 32, 96, 0, 32, 32],
    death: [128, 0, 32, 32, 160, 0, 32, 32]
  };

  return (
    <Sprite
      x={enemy.x}
      y={enemy.y}
      image={enemyImage}
      animation={animation}
      animations={spriteData}
      frameRate={7}
      frameIndex={0}
    />
  );
};
```

### Patterns d'animation d'ennemis
```javascript
// Effet d'explosion optimisé
function createExplosion(enemy) {
  // Son d'explosion
  explosionSound.play();
  
  // Changement de sprite
  enemy.img.src = explosionImage;
  
  // Transition de fade-out
  enemy.classList.add('dead-monster');
  
  // Suppression après animation
  setTimeout(() => enemy.remove(), 500);
}

// Spawn d'ennemis hors canvas
function spawnEnemy() {
  const enemy = {
    x: Math.random() * canvas.width,
    y: -enemyHeight, // Spawn au-dessus du canvas
    velocity: { x: 0, y: 2 },
    type: getRandomEnemyType(),
    animation: 'idle'
  };
  enemies.push(enemy);
}
```

### Optimisations performance
```javascript
// Object pooling pour ennemis
const enemyPool = {
  objects: [],
  get() {
    return this.objects.pop() || createNewEnemy();
  },
  release(enemy) {
    enemy.reset();
    this.objects.push(enemy);
  }
};

// Cache des formes complexes
const cachedEnemyShape = new Konva.Shape({
  sceneFunc: function (context, shape) {
    // Dessin complexe
    context.beginPath();
    // ... forme complexe
    context.fillStrokeShape(shape);
  }
});
cachedEnemyShape.cache(); // Cache pour performance
```

---

## 🎨 Palettes de couleurs

### Système de couleurs ennemi vs joueur
**Joueur** : Cyan/Bleu technologique (#00FFFF, #4a9eff, #1a2332)
**Ennemis** :
- **Type Basic** : Rouge/Orange (#FF4444, #FF6B35)
- **Type Intermédiaire** : Violet/Magenta (#AA0044, #FF0080)
- **Type Avancé** : Rouge sombre/Noir (#8B0000, #330000)
- **Type Boss** : Jaune/Or (#FFD700, #FF8C00)

### Principes de contraste élevé
- Couleurs complémentaires pour identification rapide
- Rouge pour ennemis, vert pour alliés (si applicable)
- Considérations d'accessibilité pour daltonisme
- Une teinte dominante pour l'atmosphère

---

## 🎬 Patterns d'animation

### Types de mouvement ennemis
1. **Descente droite** : Mouvement vertical simple
2. **Zigzag** : Oscillation horizontale en descendant
3. **Seeking** : IA qui suit la position du joueur
4. **Circulaire/Orbital** : Ennemis qui tournent autour de points
5. **Vol aléatoire** : Mouvement imprévisible pour ennemis avancés

### États d'animation sprite
```javascript
const enemyAnimations = {
  idle: { 
    frames: [0, 1, 2, 1], 
    duration: 800,
    loop: true 
  },
  attack: { 
    frames: [3, 4, 5, 4], 
    duration: 400,
    loop: false 
  },
  damage: { 
    frames: [6], 
    duration: 200,
    effect: 'flash_red' 
  },
  death: { 
    frames: [7, 8, 9, 10], 
    duration: 600,
    loop: false,
    onComplete: 'remove'
  }
};
```

### Effets visuels de feedback
- **Animations idle** : Mouvement subtil pendant l'état normal
- **Télégraphage d'attaque** : Visual indicator avant l'action
- **Feedback de dégâts** : Flash de couleur ou changement de sprite
- **Animations de mort** : Explosion ou désintégration

---

## ⚡ Systèmes de particules

### Trails de propulsion ennemis
```javascript
const EnemyThruster = ({ enemy }) => {
  const particles = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      x: enemy.x - i * 3,
      y: enemy.y + enemy.height,
      opacity: 1 - (i * 0.2),
      size: 3 - (i * 0.5)
    }))
  , [enemy.x, enemy.y]);

  return (
    <Group>
      {particles.map((particle, i) => (
        <Circle
          key={i}
          x={particle.x}
          y={particle.y}
          radius={particle.size}
          fill="orange"
          opacity={particle.opacity}
        />
      ))}
    </Group>
  );
};
```

### Effets d'impact et d'explosion
- **Muzzle flashes** pour les ennemis qui tirent
- **Particules d'impact** pour les collisions de balles
- **Particules de destruction** pour la mort des ennemis
- **Étincelles** pour les ricochets (si applicable)

---

## 📊 Considérations de performance

### Optimisations clés
1. **Boucle de jeu centralisée** : Éviter les multiples requestAnimationFrame
2. **Object pooling** : Réutilisation d'objets pour bullets et particules
3. **Culling spatial** : Ne pas render les ennemis hors écran
4. **Cache des formes** : Mémorisation des shapes complexes Konva
5. **Limitation de framerate** : Maintenir 60 FPS constant

### Memory Management
- Flags `active` au lieu de suppression d'array
- Nettoyage par batches
- Spatial partitioning avec QuadTree

---

## 🎮 Références inspirantes

### Jeux mentionnés par l'utilisateur
- **Terraria** : Pixel art simple mais expressif
- **Enter the Gungeon** : Bullet-hell avec ennemis iconiques
- **R-Type** : Classique avec designs organiques/mécaniques

### Autres références visuelles
- **Kenney Game Assets** : https://kenney.nl/assets (ressources gratuites haute qualité)
- **Dribbble space games** : Portfolio designs pour inspiration
- **PixelJoint** : Communauté pixel art pour sprites

---

## 🚀 Plan d'implémentation progressive

### Phase 1 : Formes géométriques améliorées
- Remplacement des formes simples par des designs plus complexes
- Implémentation de la nouvelle palette de couleurs
- Effets de glow et contours

### Phase 2 : Animations de base
- Rotation, pulsation, déplacement fluide
- États d'animation idle/attaque/dégâts
- Feedback visuel de collision

### Phase 3 : Effets avancés
- Systèmes de particules pour trails et explosions
- Animations de mort sophistiquées
- Effets d'armes spécialisés par type

### Phase 4 : Variantes et boss
- Sous-types visuels pour chaque catégorie d'ennemi
- Ennemis boss avec designs uniques
- Système de skins/variants procéduraux

---

## 💡 Notes d'implémentation

### Contraintes techniques respectées
- React + Next.js maintenu
- React Konva pour le rendu 2D
- Structure ECS existante préservée
- Object pooling maintenu pour performance
- Single game loop centralisé

### Métriques de succès
- FPS stable à 60 (pas de dégradation)
- Temps de reconnaissance visuelle < 0.5s
- Différenciation claire joueur/ennemis à 95%
- Code maintenable et extensible

Cette ressource servira de guide complet pour implémenter des améliorations visuelles qui transformeront l'expérience de jeu tout en maintenant d'excellentes performances techniques.