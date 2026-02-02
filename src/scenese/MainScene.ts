import { Application, Container, Graphics } from "pixi.js";
import { sound } from "@pixi/sound";
import { PlayButton } from "../ui/PlayButton";
import { TotalSign } from "../ui/TotalSign";
import { Chest, type ChestResult } from "../objects/Chest";
import { Fog } from "../effects/Fog";
import { RockRain } from "../effects/RockRain";
import { TotalPopup } from "../ui/TotalPopup";
import { BonusPopup } from "../ui/BonusPopup";
import { StartOverlay } from "../ui/StartOverlay";

export class MainScene extends Container {
  private root: Container;
  private chests: Chest[] = [];
  private playButton!: PlayButton;
  private totalSign!: TotalSign;
  private app: Application;
  private openedCount: number = 0;
  private totalWin: number = 0;
  private fog!: Fog;
  private dark!: Graphics;
  private darkAlpha: number = 0.35;
  private appTicker: Application["ticker"];
  private totalPopup!: TotalPopup;
  private bonusPopup!: BonusPopup;
  private hasBonusRightNow = false;
  private inputBlocker!: Graphics;
  private shakeTick?: any;
  private shakeBaseX = 0;
  private shakeBaseY = 0;

  constructor(app: Application, root: Container) {
    super();
    this.app = app;
    this.appTicker = app.ticker;
    this.root = root;

    let chestWidth = 150;
    const chestHeight = 150;
    let chestCentering = -45;

    const outerSpacing = 200;
    const innerSpacing = 60;

    const cols = 3;

    this.dark = new Graphics()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill(0x000000);

    this.dark.alpha = this.darkAlpha;

    this.addChild(this.dark);

    for (let i = 0; i < 6; i += 1) {
      let scale = 0.15;
      if (i < 3) {
        chestWidth = 135;
        scale = 0.12;
        chestCentering = -30;
      } else {
        chestWidth = 150;
        chestCentering = -45;
      }
      const chest = new Chest(app, scale);

      chest.setIdleState();

      const col = i % cols;
      const row = Math.floor(i / cols);

      chest.x =
        15 +
        chestCentering +
        outerSpacing +
        chestWidth / 2 +
        col * (chestWidth + innerSpacing + 50);
      chest.y = 210 + chestHeight / 2 + row * (chestHeight - 50);

      chest.setBasePosition();

      chest.on("opened", () => {
        this.onChestPicked(chest);
      });

      chest.on("animationEnd", (c: Chest, result) => {
        this.onChestAnimationDone(c, result);
      });

      this.addChild(chest);
      this.chests.push(chest);
    }

    this.fog = new Fog(this.app);
    this.fog.eventMode = "none";
    this.addChild(this.fog);

    this.playButton = new PlayButton(this.app);
    this.playButton.swing();
    this.playButton.setInitialPosition(
      this.app.screen.width / 2 + 140,
      this.app.screen.height / 2 - 270,
    );
    this.playButton.x = this.app.screen.width / 2 + 140;
    this.playButton.y = this.app.screen.height / 2 - 270;

    this.playButton.on("clicked", () => {
      this.startRound();
      this.totalSign.animateDown();
      sound.stop("fog");
      sound.play("bg-music", {
        loop: true,
        volume: 0.07,
      });
    });

    this.addChild(this.playButton);

    this.totalSign = new TotalSign(this.app);
    this.totalSign.swing();
    this.totalSign.setInitialPosition(
      this.app.screen.width / 2 + 140,
      this.app.screen.height / 2 - 270,
    );
    this.totalSign.x = this.app.screen.width / 2 + 140;
    this.totalSign.y = this.app.screen.height / 2 - 470;
    this.addChild(this.totalSign);

    this.totalPopup = new TotalPopup(
      this.app.screen.width,
      this.app.screen.height,
      this.app.ticker,
    );

    this.totalPopup.swing();

    this.totalPopup.visible = false;

    this.addChild(this.totalPopup);

    this.totalPopup.on("pointerdown", () => {
      this.totalPopup.visible = false;

      this.resetGame();
    });

    this.inputBlocker = new Graphics()
      .rect(0, 0, this.app.screen.width, this.app.screen.height)
      .fill(0x000000);

    this.inputBlocker.alpha = 0;
    this.inputBlocker.eventMode = "static";
    this.inputBlocker.visible = false;

    this.addChild(this.inputBlocker);

    this.bonusPopup = new BonusPopup(
      this.app.screen.width,
      this.app.screen.height,
      this.app.ticker,
    );

    this.bonusPopup.visible = false;

    this.addChild(this.bonusPopup);

    this.bonusPopup.on("pointerdown", () => {
      sound.play("click", { loop: false, volume: 0.1 });
      sound.play("bg-music", {
        loop: true,
        volume: 0.07,
      });
      sound.stop("clapping");
      this.bonusPopup.visible = false;
      this.hasBonusRightNow = false;
      this.totalSign.setTotal(this.totalWin);
      this.unfreezeInput();
      if (this.openedCount === this.chests.length) {
        this.showTotalPopup();
      } else {
        for (const c of this.chests) {
          if (!c.isOpened()) {
            c.enable();
          }
        }
      }
    });

    const startOverlay = new StartOverlay(
      this.app.screen.width,
      this.app.screen.height,
      () => {
        this.playButton.enable();
      },
    );

    this.addChild(startOverlay);

    sound.play("fog", {
      loop: true,
      volume: 0.1,
    });
  }

  private startScreenShake() {
    this.shakeBaseX = this.root.x;
    this.shakeBaseY = this.root.y;

    let t = 0;

    const tick = (ticker: any) => {
      t += ticker.deltaTime / 60;

      const pos = 5;
      const rot = 0.015;
      const scale = 0.012;

      this.root.x = this.shakeBaseX + (Math.random() - 0.5) * pos;

      this.root.y = this.shakeBaseY + (Math.random() - 0.5) * pos;

      this.root.rotation = (Math.random() - 0.5) * rot;

      this.root.scale.set(1 + (Math.random() - 0.5) * scale);
    };

    this.shakeTick = tick;
    this.appTicker.add(tick);
  }

  private stopScreenShake() {
    if (this.shakeTick) {
      this.appTicker.remove(this.shakeTick);
      this.shakeTick = undefined;
    }

    this.root.x = this.shakeBaseX;
    this.root.y = this.shakeBaseY;
    this.root.rotation = 0;
    this.root.scale.set(1);
  }

  private freezeInput() {
    this.inputBlocker.visible = true;
  }

  private unfreezeInput() {
    this.inputBlocker.visible = false;
  }

  private hideDark() {
    let t = 0;
    const duration = 1;

    const startAlpha = this.darkAlpha;
    const targetAlpha = 0;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      this.dark.alpha = startAlpha + (targetAlpha - startAlpha) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private showDark() {
    let t = 0;
    const duration = 1;

    const startAlpha = 0;
    const targetAlpha = this.darkAlpha;

    const tick = (...args: any[]) => {
      const delta = args[1] ?? 1;
      t += delta / 60;

      const p = Math.min(t / duration, 1);

      this.dark.alpha = startAlpha + (targetAlpha - startAlpha) * p;

      if (p >= 1) {
        this.appTicker.remove(tick);
      }
    };

    this.appTicker.add(tick);
  }

  private startRound() {
    this.playButton.disable();
    this.fog.fadeOut();
    this.hideDark();

    for (const chest of this.chests) {
      chest.activate();
    }
  }

  private endRound() {
    this.totalSign.resetSign();

    if (!this.hasBonusRightNow) {
      this.showTotalPopup();
    }
  }

  private resetGame() {
    this.totalWin = 0;
    this.openedCount = 0;
    sound.stop("bg-music");
    sound.play("fog", {
      loop: true,
      volume: 0.2,
    });

    for (const chest of this.chests) {
      chest.reset();
      chest.setIdleState();
    }
    this.totalSign.setTotal(0);

    this.fog.fadeIn();
    this.showDark();

    this.playButton.enable();
    this.playButton.resetButton();
    this.hasBonusRightNow = false;
  }

  private onChestPicked(pickedChest: Chest) {
    this.app.canvas.style.cursor = "default";
    for (const chest of this.chests) {
      if (chest !== pickedChest) {
        chest.disable();
      }
    }

    pickedChest.disable();
  }

  private onChestAnimationDone(_chest: Chest, result: ChestResult) {
    this.openedCount++;

    if (result === "Win") {
      this.totalWin += _chest.showWinValue();

      this.totalSign.setTotal(this.totalWin);
    }

    if (result === "Bonus") {
      this.hasBonusRightNow = true;

      const bonusValue = _chest.showWinValue();
      this.totalWin += bonusValue;

      const rocks = new RockRain(this.app);
      this.addChild(rocks);

      this.playBonusTimeline(bonusValue);
    }

    if (this.openedCount === this.chests.length) {
      this.endRound();
    } else {
      for (const c of this.chests) {
        if (!c.isOpened()) {
          c.enable();
        }
      }
    }
  }

  private playBonusTimeline(bonusValue: number) {
    this.freezeInput();

    this.startScreenShake();

    setTimeout(() => {
      this.stopScreenShake();

      this.bonusPopup.show(bonusValue);
    }, 2000);
  }

  private showTotalPopup() {
    this.totalPopup.show(this.totalWin);
    this.totalPopup.animateDown();
  }
}
