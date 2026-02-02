import { sound } from "@pixi/sound";
import { Container, Graphics, Text, Ticker, Sprite } from "pixi.js";

export class TotalPopup extends Container {
  private bg: Graphics;
  private textBg: Sprite;
  private title: Text;
  private value: Text;
  private ticker: Ticker;
  private panel!: Container;

  constructor(width: number, height: number, ticker: Ticker) {
    super();

    this.ticker = ticker;

    this.eventMode = "static";
    this.cursor = "pointer";
    this.bg = new Graphics().rect(0, 0, width, height).fill(0x000000);

    this.bg.alpha = 0.85;
    this.bg.eventMode = "static";

    this.addChild(this.bg);

    this.title = new Text("TOTAL WIN", {
      fill: "#ffffff",
      fontSize: 70,
      fontWeight: "700",
    });

    this.title.anchor.set(0.5);
    this.title.y = height / 1.5;
    this.title.x = width / 2;
    this.title.alpha = 0.4;

    this.addChild(this.title);

    this.panel = new Container();
    this.panel.x = width / 2;
    this.panel.y = height / 3;

    this.addChild(this.panel);

    this.textBg = Sprite.from("sign");
    this.textBg.anchor.set(0.5);
    this.textBg.scale.set(1.3);

    this.panel.addChild(this.textBg);

    this.value = new Text("0$", {
      fill: "#ffffff",
      fontSize: 80,
      fontWeight: "900",
    });

    this.value.anchor.set(0.5);
    this.value.y = 52;

    this.panel.addChild(this.value);

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  public swing() {
    let t = 0;

    const rotationSpeed = 1.5;
    const rotationAmplitude = (2 * Math.PI) / 180;

    const floatSpeed = 1;
    const floatAmplitude = 6;

    const baseY = this.panel.y;

    const tick = (ticker: any) => {
      const delta = ticker.deltaTime ?? 1;
      t += delta / 60;

      this.panel.rotation = Math.sin(t * rotationSpeed) * rotationAmplitude;

      this.panel.y = baseY + Math.sin(t * floatSpeed) * floatAmplitude;
    };

    this.ticker.add(tick);
  }

  public animateDown() {
    let t = 0;
    const dur = 3;
    const startY = -this.height - 20;
    const targetY = this.panel.y;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      const p = Math.min(t / dur, 1);
      this.panel.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.ticker.remove(tick);
      }
    };

    sound.play("wood", {
      loop: false,
      volume: 0.2,
    });
    this.ticker.add(tick);
  }

  public show(total: number) {
    this.setTotal(total);

    this.alpha = 0;
    this.visible = true;

    let t = 0;
    const duration = 1;

    const tick = (ticker: any) => {
      t += ticker.deltaTime / 60;

      const p = Math.min(t / duration, 1);

      this.alpha = p;

      if (p >= 1) {
        this.ticker.remove(tick);
      }
    };

    this.ticker.add(tick);
  }

  setTotal(v: number) {
    this.value.text = `${v}$`;
  }
}
