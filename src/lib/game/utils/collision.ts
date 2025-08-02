import type { Vector2D, CollisionBox, EntityType } from '@/types/game';

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

// AABB (Axis-Aligned Bounding Box) collision detection
export function checkAABBCollision(a: CollisionBox, b: CollisionBox): boolean {
  return !(a.x + a.width < b.x || 
           b.x + b.width < a.x || 
           a.y + a.height < b.y || 
           b.y + b.height < a.y);
}

// Circle collision detection (optimized - avoids Math.sqrt)
export function checkCircleCollision(a: Circle, b: Circle): boolean {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radiusSum = a.radius + b.radius;
  return (dx * dx + dy * dy) < (radiusSum * radiusSum);
}

// Entity collision detection (uses entity bounds)
export function checkEntityCollision(a: EntityType, b: EntityType): boolean {
  const boxA: CollisionBox = {
    x: a.position.x - a.size.x / 2,
    y: a.position.y - a.size.y / 2,
    width: a.size.x,
    height: a.size.y
  };
  
  const boxB: CollisionBox = {
    x: b.position.x - b.size.x / 2,
    y: b.position.y - b.size.y / 2,
    width: b.size.x,
    height: b.size.y
  };
  
  return checkAABBCollision(boxA, boxB);
}

// Point-in-circle collision
export function pointInCircle(point: Vector2D, circle: Circle): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  return (dx * dx + dy * dy) < (circle.radius * circle.radius);
}

// Point-in-rectangle collision
export function pointInRect(point: Vector2D, rect: CollisionBox): boolean {
  return point.x >= rect.x && 
         point.x <= rect.x + rect.width &&
         point.y >= rect.y && 
         point.y <= rect.y + rect.height;
}

// Get collision box from entity
export function getEntityCollisionBox(entity: EntityType): CollisionBox {
  return {
    x: entity.position.x - entity.size.x / 2,
    y: entity.position.y - entity.size.y / 2,
    width: entity.size.x,
    height: entity.size.y
  };
}

// Check if entity is within screen bounds
export function isEntityInBounds(entity: EntityType, screenWidth: number, screenHeight: number, margin: number = 100): boolean {
  return entity.position.x > -margin &&
         entity.position.x < screenWidth + margin &&
         entity.position.y > -margin &&
         entity.position.y < screenHeight + margin;
}

// Spatial partitioning for performance optimization
export class QuadTree {
  private bounds: CollisionBox;
  private maxObjects: number;
  private maxLevels: number;
  private level: number;
  private objects: EntityType[];
  private nodes: QuadTree[];

  constructor(bounds: CollisionBox, maxObjects = 10, maxLevels = 5, level = 0) {
    this.bounds = bounds;
    this.maxObjects = maxObjects;
    this.maxLevels = maxLevels;
    this.level = level;
    this.objects = [];
    this.nodes = [];
  }

  clear(): void {
    this.objects = [];
    this.nodes.forEach(node => node.clear());
    this.nodes = [];
  }

  split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

    this.nodes[0] = new QuadTree(
      { x: x + subWidth, y: y, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[1] = new QuadTree(
      { x: x, y: y, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[2] = new QuadTree(
      { x: x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
    this.nodes[3] = new QuadTree(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxObjects, this.maxLevels, this.level + 1
    );
  }

  getIndex(entity: EntityType): number {
    let index = -1;
    const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
    const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);

    const entityBox = getEntityCollisionBox(entity);
    const topQuadrant = entityBox.y < horizontalMidpoint && entityBox.y + entityBox.height < horizontalMidpoint;
    const bottomQuadrant = entityBox.y > horizontalMidpoint;

    if (entityBox.x < verticalMidpoint && entityBox.x + entityBox.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1;
      } else if (bottomQuadrant) {
        index = 2;
      }
    } else if (entityBox.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0;
      } else if (bottomQuadrant) {
        index = 3;
      }
    }

    return index;
  }

  insert(entity: EntityType): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(entity);
      if (index !== -1) {
        this.nodes[index].insert(entity);
        return;
      }
    }

    this.objects.push(entity);

    if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.objects.length) {
        const index = this.getIndex(this.objects[i]);
        if (index !== -1) {
          this.nodes[index].insert(this.objects.splice(i, 1)[0]);
        } else {
          i++;
        }
      }
    }
  }

  retrieve(entity: EntityType): EntityType[] {
    const returnObjects: EntityType[] = [];
    const index = this.getIndex(entity);

    if (this.nodes.length > 0) {
      if (index !== -1) {
        returnObjects.push(...this.nodes[index].retrieve(entity));
      }
    }

    returnObjects.push(...this.objects);
    return returnObjects;
  }
}