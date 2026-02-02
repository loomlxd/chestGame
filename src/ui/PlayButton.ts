import { Container, Sprite, Text, Application } from "pixi.js";
import { sound } from "@pixi/sound";

export class PlayButton extends Container {
  private bg: Sprite;
  private text: Text;
  private appTicker: Application["ticker"];
  private startY = 0;
  private state: "idle" | "animating" = "idle";
  private startX = 0;
  private bgScale: number = 0.6;
  private bgHoverScale: number = 0.05;
  private fontScale: number = 1;
  private fontHoverScale: number = 0.1;

  constructor(app: Application) {
    super();

    this.appTicker = app.ticker;

    this.bg = Sprite.from("sign");
    this.bg.anchor.set(0.5);
    this.addChild(this.bg);

    this.bg.scale.set(this.bgScale);

    this.text = new Text("PLAY", {
      fill: "#ffffff",
      fontSize: 28,
      fontWeight: "bold",
    });
    this.text.anchor.set(0.5);
    this.text.position.set(0, 25);
    this.text.scale.set(this.fontScale);
    this.addChild(this.text);

    this.interactive = true;
    this.cursor = "pointer";

    this.on("pointerdown", () => this.handleClick());
    this.on("pointerover", () => this.onHover());
    this.on("pointerout", () => this.onUnhover());
  }

  private onHover() {
    let t = 0;
    const duration = 0.3;

    const startBgScale = this.bg.scale.x;
    const startFontScale = this.text.scale.x;

    const targetBgScale = this.bgScale * (1 + this.bgHoverScale);
    const targetFontScale = this.fontScale * (1 + this.fontHoverScale);

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      this.bg.scale.set(startBgScale + (targetBgScale - startBgScale) * p);

      this.text.scale.set(
        startFontScale + (targetFontScale - startFontScale) * p,
      );

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };
    sound.play("hover", {
      loop: false,
      volume: 0.05,
    });

    this.appTicker.add(tick);
  }

  private onUnhover() {
    let t = 0;
    const duration = 0.3;

    const startBgScale = this.bg.scale.x;
    const startFontScale = this.text.scale.x;

    const targetBgScale = this.bgScale;
    const targetFontScale = this.fontScale;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      this.bg.scale.set(startBgScale + (targetBgScale - startBgScale) * p);

      this.text.scale.set(
        startFontScale + (targetFontScale - startFontScale) * p,
      );

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  public setInitialPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.startY = y;
    this.startX = x;
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

  private handleClick() {
    if (this.state !== "idle") return;
    sound.play("click", { loop: false, volume: 0.1 });
    this.state = "animating";
    this.animateUp(() => {
      this.emit("clicked");
    });
  }

  private animateUp(onDone: () => void) {
    let t = 0;
    const dur = 2;
    const startY = this.y;
    const targetY = -this.height - 20;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      const p = Math.min(t / dur, 1);
      this.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
        onDone();
      }
    };

    sound.play("wood", {
      loop: false,
      volume: 0.2,
    });

    this.appTicker.add(tick);
  }

  public resetButton() {
    let t = 0;
    const dur = 3.5;
    const startY = this.y;
    const targetY = this.startY;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      const p = Math.min(t / dur, 1);

      this.y = startY + (targetY - startY) * p;
      this.x = this.startX;

      if (p >= 1) {
        this.appTicker.remove(tick);
        sound.play("wood", {
          loop: false,
          volume: 0.2,
        });
        this.state = "idle";
      }
    };

    this.appTicker.add(tick);
  }

  public disable() {
    this.interactive = false;
    this.cursor = "default";
    this.alpha = 0.5;
  }

  public enable() {
    this.interactive = true;
    this.cursor = "pointer";
    this.alpha = 1;
  }
}
