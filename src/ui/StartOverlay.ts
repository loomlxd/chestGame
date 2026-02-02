import { Container, Graphics, Text } from "pixi.js";

export class StartOverlay extends Container {
  constructor(width: number, height: number, onStart: () => void) {
    super();
    this.eventMode = "static";
    this.cursor = "pointer";

    const bg = new Graphics()
      .rect(0, 0, width, height)
      .fill(0x000000);

    bg.alpha = 0.7;
    this.addChild(bg);

    const text = new Text("CLICK ANYWHERE TO START", {
      fill: "#ffffff",
      fontSize: 36,
      fontWeight: "700",
      letterSpacing: 2,
      dropShadow: {
        color: "#000000",
        alpha: 0.8,
        blur: 6,
        distance: 3,
        angle: Math.PI / 2,
      },
    });

    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = height / 2 - 30;

    this.addChild(text);

    this.on("pointerdown", () => {
      onStart();
      this.destroy();
    });
  }
}