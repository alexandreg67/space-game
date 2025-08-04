import { Howl } from 'howler';

/**
 * Audio object pool for frequently played sounds (like laser shots)
 * Prevents garbage collection and improves performance
 */
export class AudioPool {
  private pool: Howl[] = [];
  private activeInstances: Set<Howl> = new Set();
  private readonly maxPoolSize: number;

  constructor(
    private readonly src: string,
    private readonly poolSize: number = 5,
    private readonly options: any = {}
  ) {
    this.maxPoolSize = poolSize;
    this.initializePool();
  }

  private initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const sound = new Howl({
        src: [this.src],
        ...this.options,
        onend: () => this.releaseToPool(sound),
        onstop: () => this.releaseToPool(sound),
      });
      this.pool.push(sound);
    }
  }

  /**
   * Get a sound instance from the pool and play it
   */
  play(options?: { volume?: number; rate?: number }): number | null {
    const sound = this.pool.pop();
    if (!sound) {
      // Pool exhausted, try to reuse oldest active instance
      const oldestSound = this.activeInstances.values().next().value;
      if (oldestSound) {
        oldestSound.stop();
        return this.playInstance(oldestSound, options);
      }
      return null;
    }

    return this.playInstance(sound, options);
  }

  private playInstance(sound: Howl, options?: { volume?: number; rate?: number }): number {
    this.activeInstances.add(sound);
    
    if (options?.volume !== undefined) {
      sound.volume(options.volume);
    }
    
    if (options?.rate !== undefined) {
      sound.rate(options.rate);
    }

    return sound.play();
  }

  private releaseToPool(sound: Howl) {
    this.activeInstances.delete(sound);
    
    // Only return to pool if we haven't exceeded max size
    if (this.pool.length < this.maxPoolSize) {
      this.pool.push(sound);
    }
  }

  /**
   * Stop all active instances and return them to pool
   */
  stopAll() {
    this.activeInstances.forEach(sound => sound.stop());
  }

  /**
   * Update volume for all instances
   */
  setVolume(volume: number) {
    [...this.pool, ...this.activeInstances].forEach(sound => {
      sound.volume(volume);
    });
  }

  /**
   * Cleanup all instances
   */
  dispose() {
    this.stopAll();
    [...this.pool, ...this.activeInstances].forEach(sound => sound.unload());
    this.pool.length = 0;
    this.activeInstances.clear();
  }

  /**
   * Get pool status for debugging
   */
  getStatus() {
    return {
      available: this.pool.length,
      active: this.activeInstances.size,
      total: this.pool.length + this.activeInstances.size,
    };
  }
}