import { Application, Container } from "pixi.js";
import { MainScene } from "../scenese/MainScene";

export class Game {
  private app: Application;
  private root: Container;

  constructor(app: Application, root: Container) {
    this.app = app;
    this.root = root;
  }

  start() {
    const scene = new MainScene(this.app, this.root);
    this.root.addChild(scene);
  }
}
