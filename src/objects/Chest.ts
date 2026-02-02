import { Application, Container, Sprite, Text, Graphics } from "pixi.js";
import { sound } from "@pixi/sound";

export type ChestState = "Closed" | "Opening" | "Opened";
export type ChestResult = "Lose" | "Win" | "Bonus";

export class Chest extends Container {
  private closedSprite: Sprite;
  private openSprite: Sprite;
  private appTicker: Application["ticker"];
  private BASE_SCALE: number;
  private SCALE_BOOST: number = 0.15;
  private LOSE_SCALE: number = 0.03;
  private state: ChestState = "Closed";
  private result: ChestResult | null = null;
  private hoverTick?: any;
  private textShakeTick?: any;
  private baseY: number = 0;
  private resultText?: Text;
  private winLight?: Graphics;
  private winPulseTick?: any;
  private winValue: number = 0;
  private IDLE_SCALE = 0.9;
  private IDLE_ALPHA = 0.6;

  constructor(app: Application, scale: number) {
    super();

    this.BASE_SCALE = scale;

    this.appTicker = app.ticker;
    this.baseY = this.y;

    this.closedSprite = Sprite.from("closed");
    this.openSprite = Sprite.from("open");

    this.closedSprite.anchor.set(0.5);
    this.openSprite.anchor.set(0.5);

    this.closedSprite.scale.set(this.BASE_SCALE);
    this.openSprite.scale.set(this.BASE_SCALE);

    this.addChild(this.closedSprite);
    this.addChild(this.openSprite);

    this.openSprite.visible = false;

    this.interactive = false;
    this.cursor = "pointer";

    this.on("pointerdown", () => this.handleClick());
    this.on("pointerover", () => this.onHover());
    this.on("pointerout", () => this.onUnhover());
  }

  public setIdleState() {
    this.alpha = this.IDLE_ALPHA;

    this.closedSprite.scale.set(this.BASE_SCALE * this.IDLE_SCALE);
    this.openSprite.scale.set(this.BASE_SCALE * this.IDLE_SCALE);
    this.closedSprite.tint = 0xaaaaaa;

    this.interactive = false;
  }

  public activate() {
    let t = 0;
    const duration = 1.5;

    const startScale = this.closedSprite.scale.x;
    const targetScale = this.BASE_SCALE;

    const startAlpha = this.alpha;
    const targetAlpha = 1;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      const scale = startScale + (targetScale - startScale) * p;
      const alpha = startAlpha + (targetAlpha - startAlpha) * p;

      this.closedSprite.scale.set(scale);
      this.openSprite.scale.set(scale);
      this.closedSprite.tint = this.lerpColor(0xaaaaaa, 0xffffff, p);
      this.alpha = alpha;

      if (p >= 1) {
        this.appTicker.remove(tick);
        this.enable();
      }
    };

    this.appTicker.add(tick);
  }

  private onHover() {
    if (this.state !== "Closed") return;
    this.startShake();
    sound.play("hover", {
      loop: false,
      volume: 0.05,
    });
  }

  private startShake() {
    if (this.hoverTick) return;
    let elapsed = 0;
    const amplitude = 2;
    const freq = 2;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      elapsed += delta / 60;
      this.y = this.baseY + Math.sin(elapsed * freq) * amplitude;
    };

    this.hoverTick = tick;
    this.appTicker.add(tick);
  }

  setBasePosition() {
    this.baseY = this.y;
  }

  private onUnhover() {
    if (this.hoverTick) {
      this.appTicker.remove(this.hoverTick);
      this.hoverTick = null;
    }
    this.closedSprite.tint = 0xffffff;
    this.y = this.baseY;
  }

  private roll(): ChestResult {
    const r = Math.random();
    if (r < 0.6) return "Lose";
    if (r < 0.9) return "Win";
    return "Bonus";
  }

  private rollWin() {
    const max = 100;
    const min = 50;

    return Math.floor(Math.random() * (max - min) + min);
  }

  private rollBonus() {
    const max = 1000;
    const min = 500;

    return Math.floor(Math.random() * (max - min) + min);
  }

  private handleClick() {
    if (this.state !== "Closed") return;
    sound.play("open", { loop: false, volume: 0.1 });

    this.onUnhover();

    this.state = "Opening";
    this.result = this.roll();
    this.emit("opened", this);

    this.jump(() => {
      this.animateOpen();
    });
  }

  private jump(onDone: () => void) {
    const jumpHeight = -10;
    const speed = 0.5;
    let t = 0;

    const startY = this.baseY;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      if (t <= speed) {
        this.y = startY + jumpHeight * (t / speed);
      } else {
        this.y = startY;
        this.appTicker.remove(tick);
        onDone();
      }
    };

    this.appTicker.add(tick);
  }

  private animateOpen() {
    let t = 0;
    const duration = 1;

    this.closedSprite.alpha = 1;
    this.openSprite.alpha = 0;
    this.openSprite.visible = true;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const progress = Math.min(t / duration, 1);

      const scale = this.BASE_SCALE * (1 + this.SCALE_BOOST * progress);
      this.closedSprite.scale.set(scale);
      this.openSprite.scale.set(scale);

      this.closedSprite.alpha = 1 - progress;
      this.openSprite.alpha = progress;

      if (progress >= 1) {
        this.appTicker.remove(tick);
        this.finishOpening();
      }
    };

    this.appTicker.add(tick);
  }

  private animateLoseScale() {
    let t = 0;
    const duration = 0.5;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const progress = Math.min(t / duration, 1);

      const scale = this.BASE_SCALE * (1 - this.LOSE_SCALE * progress);
      this.openSprite.scale.set(scale);

      if (progress >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private finishOpening() {
    this.showResultFX();
    this.state = "Opened";
    this.closedSprite.visible = false;
    this.openSprite.visible = true;
    this.emit("animationEnd", this, this.result);
  }

  private showResultFX() {
    if (this.result === "Lose") {
      this.showLoseFX();
    } else if (this.result === "Win") {
      sound.play("win", { loop: false, volume: 0.1 });
      this.showWinFX();
    } else if (this.result === "Bonus") {
      sound.play("earthquake", { loop: false, volume: 0.1 });
      setTimeout(() => {
        sound.play("rocks", { loop: false, volume: 0.05 });
      }, 500);
      sound.stop("bg-music");
      this.showBonusFX();
    }
  }

  private createWinLight() {
    const g = new Graphics();
    g.beginFill(0xffd46b, 0.8);
    g.lineStyle(40, 0xffd46b, 0.2);
    g.drawCircle(0, 0, 50);
    g.endFill();

    g.alpha = 0;
    g.zIndex = -1;

    this.addChildAt(g, 0);
    this.winLight = g;

    this.startLightPulse(g);
  }

  private startLightPulse(light: Graphics) {
    let t = 0;
    const speed = 0.5;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const pulse = 0.5 + Math.sin(t * speed) * 0.5;

      if (!light.destroyed) {
        light.alpha = pulse * 0.6;
        light.scale.set(1 + pulse * 0.3);
      }
    };

    this.appTicker.add(tick);
    this.winPulseTick = tick;
  }

  private showWinFX() {
    const winResult = this.rollWin();
    this.winValue = winResult;
    const txt = new Text(`${winResult}$`, {
      fill: "#FFD46B",
      fontSize: 28,
      fontWeight: "bold",
      padding: 30,
      dropShadow: {
        color: "#FFD46B",
        alpha: 0.8,
        blur: 8,
        distance: 0,
        angle: Math.PI / 2,
      },
    });

    this.resultText = txt;
    txt.anchor.set(0.5);
    txt.x = 0;
    txt.y = -10;
    this.addChild(txt);

    this.applyWinTint();
    this.createWinLight();

    let t = 0;
    const duration = 0.8;
    const startY = txt.y;
    const targetY = startY - 20;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);
      txt.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
        this.textBounce(txt);
      }
    };

    this.appTicker.add(tick);
  }

  private applyWinTint() {
    const from = 0xffffff;
    const to = 0xc8a441;
    let t = 0;
    const duration = 0.4;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      const p = Math.min(t / duration, 1);

      this.openSprite.tint = this.lerpColor(from, to, p);

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private textBounce(text: Text) {
    const baseY = text.y;
    let elapsed = 0;
    const amplitude = 3;
    const freq = 2;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      elapsed += delta / 60;
      text.y = baseY + Math.sin(elapsed * freq) * amplitude;
    };

    this.textShakeTick = tick;
    this.appTicker.add(tick);
  }

  private showLoseFX() {
    const txt = new Text("LOSE", {
      fill: "#9c1f1f",
      fontSize: 23,
      fontWeight: "bold",
      padding: 30,
      dropShadow: {
        color: "#000",
        alpha: 0.7,
        blur: 2,
        distance: 2,
        angle: Math.PI / 2,
      },
    });
    this.resultText = txt;

    txt.anchor.set(0.5);
    txt.x = 0;
    txt.y = -10;
    this.addChild(txt);

    let t = 0;
    const duration = 0.8;
    const startY = -5;
    const targetY = startY - 20;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);
      txt.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
        this.textShake(txt);
        this.applyLoseTintAndDim();
        this.animateLoseScale();
      }
    };

    this.appTicker.add(tick);
  }

  private applyLoseTintAndDim() {
    const from = 0xffffff;
    const to = 0x7a1717;
    let t = 0;
    let duration = 0.5;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;
      const p = Math.min(t / duration, 1);

      this.openSprite.tint = this.lerpColor(from, to, p);

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;

    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;

    const rr = ar + (br - ar) * t;
    const rg = ag + (bg - ag) * t;
    const rb = ab + (bb - ab) * t;

    return ((rr & 0xff) << 16) + ((rg & 0xff) << 8) + (rb & 0xff);
  }

  private textShake(text: any) {
    const baseTextY = text.y;
    let elapsed = 0;
    const amplitude = 3;
    const freq = 1.5;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      elapsed += delta / 60;
      text.y = baseTextY + Math.sin(elapsed * freq) * amplitude;
    };

    this.textShakeTick = tick;

    this.appTicker.add(tick);
  }

  private showBonusFX() {
    const bonusValue = this.rollBonus();
    this.winValue = bonusValue;

    const txt = new Text("BONUS", {
      fill: "#6ddcff",
      fontSize: 30,
      fontWeight: "900",
      padding: 30,
      dropShadow: {
        color: "#6ddcff",
        alpha: 0.9,
        blur: 10,
        distance: 0,
        angle: Math.PI / 2,
      },
    });

    this.resultText = txt;

    txt.anchor.set(0.5);
    txt.x = 0;
    txt.y = -10;
    txt.alpha = 0;
    txt.scale.set(0.4);

    this.addChild(txt);

    this.applyBonusTint();
    this.createBonusLight();

    this.animateBonusText(txt);
  }

  private animateBonusText(text: Text) {
    let t = 0;
    const duration = 0.6;

    const startY = text.y;
    const targetY = startY - 20;

    const startScale = 0.4;
    const targetScale = 1;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      text.alpha = p;
      text.scale.set(startScale + (targetScale - startScale) * p);
      text.y = startY + (targetY - startY) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
        this.textBounce(text);
      }
    };

    this.appTicker.add(tick);
  }

  private applyBonusTint() {
    const from = 0xffffff;
    const to = 0x5ecbff;

    let t = 0;
    const duration = 0.4;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);
      this.openSprite.tint = this.lerpColor(from, to, p);

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private createBonusLight() {
    const g = new Graphics();
    g.beginFill(0x6ddcff, 0.6);
    g.lineStyle(40, 0x6ddcff, 0.2);
    g.drawCircle(0, 0, 50);
    g.endFill();

    g.alpha = 0;
    g.zIndex = -1;

    this.addChildAt(g, 0);
    this.winLight = g;

    this.startLightPulse(g);
  }

  enable() {
    this.interactive = true;
    this.cursor = "pointer";
  }

  disable() {
    this.interactive = false;
    this.cursor = "default";
    this.onUnhover();
  }

  isOpened() {
    return this.state === "Opened";
  }

  showWinValue() {
    return this.winValue;
  }

  reset() {
    this.state = "Closed";
    this.closedSprite.visible = true;
    this.openSprite.visible = false;
    this.result = null;
    this.closedSprite.scale.set(this.BASE_SCALE);
    this.openSprite.scale.set(this.BASE_SCALE);
    this.closedSprite.alpha = 1;
    this.openSprite.alpha = 0;
    this.openSprite.tint = 0xffffff;
    this.openSprite.alpha = 1;

    if (this.resultText) {
      this.removeChild(this.resultText);
      this.resultText.destroy();
      this.resultText = undefined;
    }
    if (this.textShakeTick) {
      this.appTicker.remove(this.textShakeTick);
      this.textShakeTick = undefined;
    }
    if (this.winPulseTick) {
      this.appTicker.remove(this.winPulseTick);
      this.winPulseTick = undefined;
    }

    if (this.winLight) {
      this.removeChild(this.winLight);
      this.winLight.destroy();
      this.winLight = undefined;
    }
  }
}
