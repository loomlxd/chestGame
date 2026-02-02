import { Container, Sprite, Application } from "pixi.js";

type RockData = {
  sprite: Sprite;
  speedX: number;
  speedY: number;
  rotationSpeed: number;
};

export class RockRain extends Container {
  private app: Application;
  private rocks: RockData[] = [];
  private life = 0;
  private duration = 2;

  constructor(app: Application) {
    super();
    this.app = app;

    this.spawnRocks();
    this.app.ticker.add(this.update);
  }

  private spawnRocks() {
    for (let i = 0; i < 7; i++) {
      const rock = Sprite.from("rock");
      rock.anchor.set(0.5);

      const scale = 0.3 + Math.random() * 0.4;
      rock.scale.set(scale);

      rock.x = Math.random() * (900 - 100) + 100;
      rock.y = -100 - Math.random() * 300;

      const speedY = 6 + Math.random() * 6;
      const speedX = (Math.random() - 0.5) * 3;
      const rotationSpeed = (Math.random() - 0.5) * 0.1;

      this.addChild(rock);

      this.rocks.push({
        sprite: rock,
        speedX,
        speedY,
        rotationSpeed,
      });
    }
  }

  private update = (ticker: any) => {
    const delta = ticker.deltaTime / 60;
    this.life += delta;

    for (const r of this.rocks) {
      r.sprite.x += r.speedX * 60 * delta;
      r.sprite.y += r.speedY * 60 * delta;
      r.sprite.rotation += r.rotationSpeed * 60 * delta;
    }

    if (this.life >= this.duration) {
      this.destroySelf();
    }
  };

  private destroySelf() {
    this.app.ticker.remove(this.update);
    this.destroy({ children: true });
  }
}
