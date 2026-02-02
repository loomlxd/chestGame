import { Container, Sprite, Application } from "pixi.js";

export class Fog extends Container {
  private fog1: Sprite;
  private fog2: Sprite;
  private fog3: Sprite;
  private fog1HiddenX!: number;
  private fog3HiddenX!: number;
  private ticker: Application["ticker"];

  private time = 0;

  private fog1BaseX!: number;
  private fog2BaseX!: number;
  private fog3BaseX!: number;

  private fog1BaseY!: number;
  private fog2BaseY!: number;
  private fog3BaseY!: number;

  constructor(app: Application) {
    super();

    this.ticker = app.ticker;

    this.fog1 = Sprite.from("fog");
    this.fog2 = Sprite.from("fog");
    this.fog3 = Sprite.from("fog");

    this.setupFog(this.fog1, 0.25, 0.7);
    this.setupFog(this.fog2, 0.4, 0.5);
    this.setupFog(this.fog3, 0.55, 0.6);

    this.fog1HiddenX = this.fog1.x + 800;
    this.fog3HiddenX = this.fog3.x - 800;

    this.addChild(this.fog1, this.fog2, this.fog3);

    this.fog1BaseX = this.fog1.x;
    this.fog2BaseX = this.fog2.x;
    this.fog3BaseX = this.fog3.x;

    this.fog1BaseY = this.fog1.y;
    this.fog2BaseY = this.fog2.y;
    this.fog3BaseY = this.fog3.y;

    this.ticker.add(this.update, this);
  }

  private setupFog(sprite: Sprite, alpha: number, scale: number) {
    sprite.anchor.set(0.5);
    sprite.alpha = alpha;
    sprite.scale.set(scale);

    sprite.x = 500;
    sprite.y = 400;
  }

  private update(ticker: any) {
    const delta = ticker.deltaTime / 60;
    this.time += delta;

    const speed1 = 0.8;
    const speed2 = 1.2;
    const speed3 = 0.4;

    const ampX = 30;
    const ampY = 12;

    this.fog1.x = this.fog1BaseX + Math.sin(this.time * speed1) * ampX;
    this.fog2.x = this.fog2BaseX + Math.sin(this.time * speed2 + 2) * ampX;
    this.fog3.x = this.fog3BaseX + Math.sin(this.time * speed3 + 4) * ampX;

    this.fog1.y = this.fog1BaseY + Math.cos(this.time * speed1) * ampY;
    this.fog2.y = this.fog2BaseY + Math.cos(this.time * speed2 + 1) * ampY;
    this.fog3.y = this.fog3BaseY + Math.cos(this.time * speed3 + 3) * ampY;
  }

  public fadeOut() {
    let t = 0;
    const duration = 0.8;

    const start1 = this.fog1.x;
    const start3 = this.fog3.x;

    const target1 = this.fog1HiddenX;
    const target3 = this.fog3HiddenX;

    const tick = (ticker: any) => {
      t += ticker.deltaTime / 60;

      const p = Math.min(t / duration, 1);

      this.fog1.x = start1 + (target1 - start1) * p;
      this.fog3.x = start3 + (target3 - start3) * p;

      this.alpha = 1 - p;

      if (p >= 1) {
        this.ticker.remove(tick);
      }
    };

    this.ticker.add(tick);
  }

  public fadeIn() {
    let t = 0;
    const duration = 1;

    const startAlpha = this.alpha;
    const targetAlpha = 1;

    const tick = (ticker: any) => {
      t += ticker.deltaTime / 60;

      const p = Math.min(t / duration, 1);

      this.alpha = startAlpha + (targetAlpha - startAlpha) * p;

      if (p >= 1) {
        this.ticker.remove(tick);
        this.alpha = 1;
      }
    };

    this.ticker.add(tick);
  }
}
