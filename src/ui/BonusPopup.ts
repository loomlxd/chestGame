import { sound } from "@pixi/sound";
import { Container, Graphics, Text, Ticker } from "pixi.js";

export class BonusPopup extends Container {
  private bg: Graphics;
  private title: Text;
  private value: Text;
  private ticker: Ticker;
  private valueStartScale: number = 1;
  private valueAnimatedScale: number = 1.2;
  private valueGlow!: Graphics;

  constructor(width: number, height: number, ticker: Ticker) {
    super();
    this.cursor = "pointer";

    this.ticker = ticker;

    this.eventMode = "static";
    this.cursor = "pointer";
    this.bg = new Graphics().rect(0, 0, width, height).fill("#5f7781");
    this.bg.cursor = "pointer";

    this.bg.alpha = 0.85;
    this.bg.eventMode = "static";

    this.addChild(this.bg);

    this.valueGlow = new Graphics();
    this.valueGlow.beginFill(0x7fd8ff, 0.9);
    this.valueGlow.lineStyle(80, 0xb6f0ff, 0.4);
    this.valueGlow.drawCircle(0, 0, 170);
    this.valueGlow.endFill();

    this.valueGlow.x = width / 2;
    this.valueGlow.y = height / 2 - 25;
    this.valueGlow.alpha = 0.8;

    this.addChild(this.valueGlow);

    this.title = new Text("BONUS WIN", {
      fill: "#ffffff",
      fontSize: 70,
      fontWeight: "700",
    });

    this.title.anchor.set(0.5);
    this.title.x = width / 2;
    this.title.y = height / 2 - 100;
    this.title.alpha = 1;

    this.addChild(this.title);

    this.value = new Text("0$", {
      fill: "#ffffff",
      fontSize: 80,
      fontWeight: "900",
      padding: 30,
      dropShadow: {
        color: "#B6F0FF",
        alpha: 0.6,
        blur: 8,
        distance: 0,
        angle: Math.PI / 2,
      },
    });

    this.value.anchor.set(0.5);
    this.value.x = width / 2;
    this.value.y = height / 2 + 20;
    this.addChild(this.value);

    this.eventMode = "static";
    this.cursor = "pointer";
  }

  private startPulse() {
    let t = 0;

    const tick = (ticker: any) => {
      if (!this.visible) return;

      t += ticker.deltaTime / 60;

      const pulse = 0.5 + Math.sin(t * 3) * 0.5;

      const scale =
        this.valueStartScale +
        (this.valueAnimatedScale - this.valueStartScale) * pulse;

      this.value.scale.set(scale);
      this.title.scale.set(scale);

      this.value.style.dropShadow.alpha = 0.4 + pulse * 0.6;
      this.value.style.dropShadow.blur = 6 + pulse * 10;
      this.valueGlow.scale.set(0.9 + pulse * 0.3);
      this.valueGlow.alpha = 0.5 + pulse * 0.5;
    };

    this.ticker.add(tick);
  }

  public show(value: number) {
    this.setValue(value);

    this.alpha = 0;
    this.visible = true;

    let t = 0;
    const duration = 0.35;

    const tick = (ticker: any) => {
      t += ticker.deltaTime / 60;

      const p = Math.min(t / duration, 1);

      this.alpha = p;

      if (p >= 1) {
        this.ticker.remove(tick);
      }
    };
    sound.play("bonus", { loop: false, volume: 0.1 });
    sound.play("clapping", { loop: false, volume: 0.05 });

    this.ticker.add(tick);
    this.startPulse();
  }

  setValue(v: number) {
    this.value.text = `${v}$`;
  }
}
