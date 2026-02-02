import { Container, Sprite, Text, Application } from "pixi.js";
import { sound } from "@pixi/sound";

export class TotalSign extends Container {
  private bg: Sprite;
  private text: Text;
  private appTicker: Application["ticker"];
  private visibleY = 0;
  private hiddenY = 0;
  private bgScale: number = 0.6;
  private fontScale: number = 1;

  constructor(app: Application) {
    super();

    this.appTicker = app.ticker;

    this.bg = Sprite.from("sign");
    this.bg.anchor.set(0.5);
    this.addChild(this.bg);

    this.bg.scale.set(this.bgScale);

    this.text = new Text(`0$`, {
      fill: "#ffffff",
      fontSize: 28,
      fontWeight: "bold",
    });
    this.text.anchor.set(0.5);
    this.text.position.set(0, 25);
    this.text.scale.set(this.fontScale);
    this.addChild(this.text);

    this.interactive = false;
  }

  public setTotal(value: number) {
    this.text.text = `${value}$`;
  }

  public setInitialPosition(x: number, visibleY: number) {
    this.x = x;

    this.visibleY = visibleY;
    this.hiddenY = -200;

    this.y = this.hiddenY;
  }

  public swing() {
    let t = 0;
    const speed = 0.4;
    const amplitude = (2 * Math.PI) / 180;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      this.rotation = Math.sin(t * speed) * amplitude;
    };
    this.appTicker.add(tick);
  }

  public animateDown() {
    let t = 0;
    const dur = 2;

    const startY = this.y;
    const targetY = this.visibleY;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / dur, 1);
      this.y = startY + (targetY - startY) * p;
      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    sound.play("wood", {
      loop: false,
      volume: 0.2,
    });

    this.appTicker.add(tick);
  }

  public resetSign() {
    let t = 0;
    const dur = 0.8;

    const startY = this.y;
    const targetY = this.hiddenY;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / dur, 1);
      this.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }
}
