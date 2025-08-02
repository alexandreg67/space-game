import type { Vector2D } from '@/types/game';

// Vector2D utility functions
export const Vector2 = {
  // Create a new vector
  create: (x: number = 0, y: number = 0): Vector2D => ({ x, y }),
  
  // Clone a vector
  clone: (v: Vector2D): Vector2D => ({ x: v.x, y: v.y }),
  
  // Add two vectors
  add: (a: Vector2D, b: Vector2D): Vector2D => ({ 
    x: a.x + b.x, 
    y: a.y + b.y 
  }),
  
  // Subtract two vectors
  subtract: (a: Vector2D, b: Vector2D): Vector2D => ({ 
    x: a.x - b.x, 
    y: a.y - b.y 
  }),
  
  // Multiply vector by scalar
  multiply: (v: Vector2D, scalar: number): Vector2D => ({ 
    x: v.x * scalar, 
    y: v.y * scalar 
  }),
  
  // Divide vector by scalar
  divide: (v: Vector2D, scalar: number): Vector2D => ({ 
    x: v.x / scalar, 
    y: v.y / scalar 
  }),
  
  // Get vector magnitude (length)
  magnitude: (v: Vector2D): number => Math.sqrt(v.x * v.x + v.y * v.y),
  
  // Get squared magnitude (faster, avoids sqrt)
  magnitudeSquared: (v: Vector2D): number => v.x * v.x + v.y * v.y,
  
  // Normalize vector (make length = 1)
  normalize: (v: Vector2D): Vector2D => {
    const mag = Vector2.magnitude(v);
    if (mag === 0) return { x: 0, y: 0 };
    return Vector2.divide(v, mag);
  },
  
  // Get distance between two points
  distance: (a: Vector2D, b: Vector2D): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  
  // Get squared distance (faster, avoids sqrt)
  distanceSquared: (a: Vector2D, b: Vector2D): number => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  },
  
  // Dot product
  dot: (a: Vector2D, b: Vector2D): number => a.x * b.x + a.y * b.y,
  
  // Cross product (2D returns scalar)
  cross: (a: Vector2D, b: Vector2D): number => a.x * b.y - a.y * b.x,
  
  // Rotate vector by angle (in radians)
  rotate: (v: Vector2D, angle: number): Vector2D => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
      x: v.x * cos - v.y * sin,
      y: v.x * sin + v.y * cos
    };
  },
  
  // Get angle of vector (in radians)
  angle: (v: Vector2D): number => Math.atan2(v.y, v.x),
  
  // Create vector from angle and magnitude
  fromAngle: (angle: number, magnitude: number = 1): Vector2D => ({
    x: Math.cos(angle) * magnitude,
    y: Math.sin(angle) * magnitude
  }),
  
  // Linear interpolation between two vectors
  lerp: (a: Vector2D, b: Vector2D, t: number): Vector2D => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t
  }),
  
  // Clamp vector magnitude
  clamp: (v: Vector2D, maxMagnitude: number): Vector2D => {
    const magSq = Vector2.magnitudeSquared(v);
    if (magSq > maxMagnitude * maxMagnitude) {
      const mag = Math.sqrt(magSq);
      return Vector2.multiply(v, maxMagnitude / mag);
    }
    return v;
  },
  
  // Reflect vector off a normal
  reflect: (v: Vector2D, normal: Vector2D): Vector2D => {
    const dot = Vector2.dot(v, normal);
    return Vector2.subtract(v, Vector2.multiply(normal, 2 * dot));
  }
};

// Math utility functions
export const MathUtils = {
  // Clamp value between min and max
  clamp: (value: number, min: number, max: number): number => 
    Math.min(Math.max(value, min), max),
  
  // Linear interpolation
  lerp: (a: number, b: number, t: number): number => a + (b - a) * t,
  
  // Map value from one range to another
  map: (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number): number => {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  },
  
  // Convert degrees to radians
  degToRad: (degrees: number): number => degrees * (Math.PI / 180),
  
  // Convert radians to degrees
  radToDeg: (radians: number): number => radians * (180 / Math.PI),
  
  // Wrap angle to 0-2π range
  wrapAngle: (angle: number): number => {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  },
  
  // Get shortest angular distance between two angles
  angleDifference: (a: number, b: number): number => {
    let diff = b - a;
    while (diff > Math.PI) diff -= 2 * Math.PI;
    while (diff < -Math.PI) diff += 2 * Math.PI;
    return diff;
  },
  
  // Random number between min and max
  random: (min: number, max: number): number => 
    Math.random() * (max - min) + min,
  
  // Random integer between min and max (inclusive)
  randomInt: (min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min,
  
  // Random boolean with given probability (0-1)
  randomBool: (probability: number = 0.5): boolean => 
    Math.random() < probability,
  
  // Ease functions for smooth animations
  ease: {
    linear: (t: number): number => t,
    
    easeInQuad: (t: number): number => t * t,
    easeOutQuad: (t: number): number => t * (2 - t),
    easeInOutQuad: (t: number): number => 
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    
    easeInCubic: (t: number): number => t * t * t,
    easeOutCubic: (t: number): number => (--t) * t * t + 1,
    easeInOutCubic: (t: number): number => 
      t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    
    easeInSine: (t: number): number => 1 - Math.cos(t * Math.PI / 2),
    easeOutSine: (t: number): number => Math.sin(t * Math.PI / 2),
    easeInOutSine: (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2
  }
};

// Noise functions for procedural generation
export class SimplexNoise {
  private grad3 = [
    [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
    [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
    [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
  ];
  
  private p = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  
  private perm: number[];
  private permMod12: number[];
  
  constructor(seed?: number) {
    if (seed !== undefined) {
      // Simple seeded random
      const random = this.seedRandom(seed);
      this.p = this.p.slice().sort(() => random() - 0.5);
    }
    
    this.perm = new Array(512);
    this.permMod12 = new Array(512);
    
    for(let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = this.perm[i] % 12;
    }
  }
  
  private seedRandom(seed: number): () => number {
    let m_w = seed;
    let m_z = 987654321;
    const mask = 0xffffffff;
    
    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
      let result = ((m_z << 16) + m_w) & mask;
      result /= 4294967296;
      return result + 0.5;
    };
  }
  
  private fastFloor(x: number): number {
    const xi = Math.floor(x);
    return x < xi ? xi - 1 : xi;
  }
  
  private dot(g: number[], x: number, y: number): number {
    return g[0] * x + g[1] * y;
  }
  
  // 2D simplex noise
  noise2D(xin: number, yin: number): number {
    const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
    const s = (xin + yin) * F2;
    const i = this.fastFloor(xin + s);
    const j = this.fastFloor(yin + s);
    
    const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;
    
    let i1, j1;
    if(x0 > y0) {
      i1 = 1; j1 = 0;
    } else {
      i1 = 0; j1 = 1;
    }
    
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = this.permMod12[ii + this.perm[jj]];
    const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]];
    const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]];
    
    let n0, n1, n2;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if(t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
    }
    
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if(t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
    }
    
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if(t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
    }
    
    return 70.0 * (n0 + n1 + n2);
  }
}