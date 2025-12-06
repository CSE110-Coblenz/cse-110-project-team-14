import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals } from "../../constants";
import type { View } from "../../types";

export class IntroScreenView implements View {
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;

  private loginGroup: Konva.Group;
  private menuGroup: Konva.Group;
  private endScreenGroup: Konva.Group; // 🟢 new screen

  private classroomButton: Konva.Group;
  private restaurantButton: Konva.Group;
  private storeButton: Konva.Group;
  private endGameButton: Konva.Group;

  private menuBackgroundImage?: Konva.Image;
  private endScreenBackground?: Konva.Image; // 🟢 new bg

  private nameInput: HTMLInputElement;

  private onLoginSuccess: () => void;
  private onClassroomClick: () => void;
  private onRestaurantClick: () => void;
  private onStoreClick: () => void;
  private onEndGameClick: () => void;

  constructor(
    onLoginSuccess: () => void,
    onClassroomClick: () => void,
    onRestaurantClick: () => void,
    onStoreClick: () => void,
    onEndGameClick: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.onLoginSuccess = onLoginSuccess;
    this.onClassroomClick = onClassroomClick;
    this.onRestaurantClick = onRestaurantClick;
    this.onStoreClick = onStoreClick;
    this.onEndGameClick = onEndGameClick;

    // Base color fallback background
    this.backgroundLayer = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d0f0ff",
    });
    this.group.add(this.backgroundLayer);

    // HTML Name Input
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Enter your name";
    Object.assign(this.nameInput.style, {
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      width: "300px",
      height: "55px",
      fontSize: "20px",
      padding: "8px",
      borderRadius: "10px",
      zIndex: "1000",
      opacity: "0.01",
      border: "3px solid #000",
    });
    document.body.appendChild(this.nameInput);

    // LOGIN SCREEN
    this.loginGroup = this.createLoginScreen();
    this.group.add(this.loginGroup);

    // MENU SCREEN
    this.menuGroup = new Konva.Group({ visible: false });
    this.group.add(this.menuGroup);

    // END SESSION SCREEN 🟢
    this.endScreenGroup = new Konva.Group({ visible: false });
    this.group.add(this.endScreenGroup);

    // MENU BUTTONS
    this.classroomButton = this.createButton("Classroom", STAGE_WIDTH / 2 - 130, 240, this.onClassroomClick);
    this.restaurantButton = this.createButton("Restaurant", STAGE_WIDTH / 2 - 130, 360, this.onRestaurantClick);
    this.storeButton = this.createButton("Store", STAGE_WIDTH / 2 - 130, 480, this.onStoreClick);

    this.menuGroup.add(this.classroomButton, this.restaurantButton, this.storeButton);

    // END SESSION BUTTON on MENU (TOP-LEFT)
    this.endGameButton = this.createButton("End Session", 30, 30, () => this.handleEndSession());
    const endRect = this.endGameButton.findOne("Rect") as Konva.Rect;
    const endLabel = this.endGameButton.findOne("Text") as Konva.Text;
    endRect.width(200);
    endRect.height(55);
    endLabel.width(200);
    endLabel.height(55);
    endLabel.fontSize(22);
    this.menuGroup.add(this.endGameButton);

    // END SCREEN UI TEXT
    const endText = new Konva.Text({
      x: 0,
      y: STAGE_HEIGHT / 2 - 50,
      width: STAGE_WIDTH,
      align: "center",
      text: "Session Ended\nMerci d'avoir joué!",
      fontSize: 42,
      fontFamily: "Georgia",
      fontStyle: "bold",
      fill: "#ffffff",
      shadowColor: "black",
      shadowBlur: 10,
      shadowOffsetY: 4,
      shadowOpacity: 0.4,
    });
    this.endScreenGroup.add(endText);
  }

  // LOGIN SCREEN CREATION
  private createLoginScreen(): Konva.Group {
    const loginGroup = new Konva.Group();

    const title = new Konva.Text({
      x: 0,
      y: STAGE_HEIGHT / 2 - 260,
      width: STAGE_WIDTH,
      align: "center",
      text: "UCSD Student in Paris",
      fontSize: 48,
      fontFamily: "Georgia",
      fontStyle: "bold",
      fill: "#00205B",
      shadowColor: "black",
      shadowBlur: 10,
      shadowOffsetY: 4,
      shadowOpacity: 0.35,
    });
    loginGroup.add(title);

    const inputGroup = new Konva.Group({
      x: STAGE_WIDTH / 2 - 170,
      y: STAGE_HEIGHT / 2 - 20,
      width: 340,
      height: 60,
    });

    const inputBox = new Konva.Rect({
      width: 340,
      height: 60,
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 3,
      cornerRadius: 12,
    });

    const inputLabel = new Konva.Text({
      width: 340,
      height: 60,
      align: "center",
      verticalAlign: "middle",
      text: "Name",
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#666",
    });

    inputGroup.add(inputBox, inputLabel);
    loginGroup.add(inputGroup);
    inputGroup.on("click tap", () => this.nameInput.focus());

    this.nameInput.addEventListener("input", () => {
      inputLabel.text(this.nameInput.value || "Name");
      loginGroup.getLayer()?.batchDraw();
    });

    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.handleLoginSubmit();
    });

    const submitBtn = this.createButton("Start Game", STAGE_WIDTH / 2 - 130, STAGE_HEIGHT / 2 + 80, () =>
      this.handleLoginSubmit()
    );
    loginGroup.add(submitBtn);

    return loginGroup;
  }

  private handleLoginSubmit(): void {
    const name = this.nameInput.value.trim();
    if (!name) {
      alert("Please enter a name");
      this.nameInput.focus();
      return;
    }

    globals.playerName = name;
    try {
      localStorage.setItem("playerName", name);
    } catch {}

    this.nameInput.style.display = "none"; // 🟢 prevent click blocking

    this.loginGroup.visible(false);
    this.menuGroup.visible(true);
    this.group.getLayer()?.batchDraw();

    this.onLoginSuccess();
    window.dispatchEvent(new CustomEvent("playerNameUpdated", { detail: name }));
  }

  // MENU -> END SESSION SCREEN
  private handleEndSession(): void {
    this.menuGroup.visible(false);
    this.endScreenGroup.visible(true);
    this.group.getLayer()?.batchDraw();
    this.onEndGameClick();
  }

  // BUTTON FACTORY
  private createButton(text: string, x: number, y: number, onClick: () => void): Konva.Group {
    const WIDTH = 260;
    const HEIGHT = 80;

    const group = new Konva.Group({ x, y, width: WIDTH, height: HEIGHT });

    const rect = new Konva.Rect({
      width: WIDTH,
      height: HEIGHT,
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 3,
      cornerRadius: 16,
      shadowColor: "black",
      shadowBlur: 10,
      shadowOpacity: 0.35,
      shadowOffsetY: 5,
    });

    const label = new Konva.Text({
      width: WIDTH,
      height: HEIGHT,
      text,
      align: "center",
      verticalAlign: "middle",
      fontSize: 28,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#000",
    });

    group.on("mouseenter", () => {
      document.body.style.cursor = "pointer";
      rect.fill("#f8f8f8");
      label.fontSize(30);
      group.getLayer()?.batchDraw();
    });

    group.on("mouseleave", () => {
      document.body.style.cursor = "default";
      rect.fill("#fff");
      rect.shadowBlur(10);
      label.fontSize(28);
      group.getLayer()?.batchDraw();
    });

    group.on("click tap", onClick);

    group.add(rect, label);
    return group;
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.batchDraw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.batchDraw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }

  // LOGIN BACKGROUND
  loadBackground(imageUrl: string): void {
    Konva.Image.fromURL(imageUrl, (img) => {
      img.position({ x: 0, y: 0 });
      img.width(STAGE_WIDTH);
      img.height(STAGE_HEIGHT);
      this.group.add(img);
      img.moveToBottom();
      this.backgroundLayer.moveToBottom();
      this.group.getLayer()?.batchDraw();
    });
  }

  // MENU BACKGROUND
  loadMenuBackground(imageUrl: string): void {
    Konva.Image.fromURL(imageUrl, (img) => {
      img.position({ x: 0, y: 0 });
      img.width(STAGE_WIDTH);
      img.height(STAGE_HEIGHT);

      if (this.menuBackgroundImage) this.menuBackgroundImage.destroy();
      this.menuBackgroundImage = img;

      this.menuGroup.add(img);
      img.moveToBottom();
      this.menuGroup.getLayer()?.batchDraw();
    });
  }

  // END SCREEN BACKGROUND 🟢
  loadEndScreenBackground(imageUrl: string): void {
    Konva.Image.fromURL(imageUrl, (img) => {
      img.position({ x: 0, y: 0 });
      img.width(STAGE_WIDTH);
      img.height(STAGE_HEIGHT);

      if (this.endScreenBackground) this.endScreenBackground.destroy();
      this.endScreenBackground = img;

      this.endScreenGroup.add(img);
      img.moveToBottom();
      this.endScreenGroup.getLayer()?.batchDraw();
    });
  }
}
