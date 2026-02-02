import { Application, Assets, Sprite, Container } from "pixi.js";
import { sound } from "@pixi/sound";
import { Game } from "./core/Game";

async function bootstrap() {
  const app = new Application({
    resizeTo: document.getElementById("app") as HTMLElement,
  });
  await app.init({
    width: 1200,
    height: 700,
    backgroundAlpha: 0,
  });

  const gameRoot = new Container();

  document.getElementById("app")?.appendChild(app.canvas);

  Assets.addBundle("chests", {
    closed: "/assets/chest/closed.png",
    open: "/assets/chest/opened.png",
  });

  Assets.addBundle("sign", {
    sign: "/assets/sign/sign.png",
  });

  Assets.addBundle("fog", {
    fog: "/assets/fog/fog.png",
  });

  Assets.addBundle("bg", { bg: "/assets/ui/background.png" });
  Assets.addBundle("rock", {
    rock: "/assets/rock/rock.png",
  });

  await Assets.loadBundle("rock");

  await Assets.loadBundle("fog");

  await Assets.loadBundle("sign");

  await Assets.loadBundle("chests");

  await Assets.loadBundle("bg");

  sound.add("fog", {
    url: "/assets/sounds/fog.mp3",
    preload: true,
  });

  sound.add("hover", {
    url: "/assets/sounds/hover.mp3",
    preload: true,
  });

  sound.add("wood", {
    url: "/assets/sounds/wood.mp3",
    preload: true,
  });

  sound.add("bg-music", {
    url: "/assets/sounds/bg-music.mp3",
    preload: true,
  });

  sound.add("open", {
    url: "/assets/sounds/open.mp3",
    preload: true,
  });

  sound.add("click", {
    url: "/assets/sounds/click.mp3",
    preload: true,
  });

  sound.add("win", {
    url: "/assets/sounds/win.mp3",
    preload: true,
  });

  sound.add("bonus", {
    url: "/assets/sounds/bonus.mp3",
    preload: true,
  });
  sound.add("rocks", {
    url: "/assets/sounds/rocks.mp3",
    preload: true,
  });
  sound.add("earthquake", {
    url: "/assets/sounds/earthquake.mp3",
    preload: true,
  });
  sound.add("clapping", {
    url: "/assets/sounds/clapping.mp3",
    preload: true,
  });

  const background = Sprite.from("bg");
  background.width = 1200;
  background.height = 700;

  gameRoot.addChild(background);

  app.stage.addChild(gameRoot);

  const game = new Game(app, gameRoot);
  game.start();
}

bootstrap();
