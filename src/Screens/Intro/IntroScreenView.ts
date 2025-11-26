import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals } from "../../constants";
import type { View } from "../../types";

export class IntroScreenView implements View {
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;

  private loginGroup: Konva.Group;
  private menuGroup: Konva.Group;

  private classroomButton: Konva.Group;
  private restaurantButton: Konva.Group;
  private storeButton: Konva.Group;

  private nameInput: HTMLInputElement;
  private onLoginSuccess: () => void;
  private onClassroomClick: () => void;
  private onRestaurantClick: () => void;
  private onStoreClick: () => void;

  constructor(
    onLoginSuccess: () => void,
    onClassroomClick: () => void,
    onRestaurantClick: () => void,
    onStoreClick: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.onLoginSuccess = onLoginSuccess;
    this.onClassroomClick = onClassroomClick;
    this.onRestaurantClick = onRestaurantClick;
    this.onStoreClick = onStoreClick;

    // Background layer
    this.backgroundLayer = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d0f0ff", // light blue
    });
    this.group.add(this.backgroundLayer);

    // Create hidden HTML input for name (must exist before building login UI)
    this.nameInput = document.createElement("input");
    this.nameInput.type = "text";
    this.nameInput.placeholder = "Enter your name";
    this.nameInput.style.position = "absolute";
    this.nameInput.style.left = "50%";
    this.nameInput.style.top = "50%";
    this.nameInput.style.transform = "translate(-50%, -50%)";
    this.nameInput.style.width = "280px";
    this.nameInput.style.height = "40px";
    this.nameInput.style.fontSize = "18px";
    this.nameInput.style.padding = "5px";
    this.nameInput.style.border = "2px solid #000";
    this.nameInput.style.borderRadius = "8px";
    this.nameInput.style.zIndex = "1000";
    this.nameInput.style.opacity = "0.01";
    document.body.appendChild(this.nameInput);

    // Create login group (initially visible)
    this.loginGroup = this.createLoginScreen();
    this.group.add(this.loginGroup);

    // Create menu group (initially hidden, shown after login)
    this.menuGroup = new Konva.Group({ visible: false });
    this.group.add(this.menuGroup);

    // Create buttons for menu
    this.classroomButton = this.createButton(
      "Classroom",
      STAGE_WIDTH / 2 - 75,
      200,
      this.onClassroomClick
    );
    this.restaurantButton = this.createButton(
      "Restaurant",
      STAGE_WIDTH / 2 - 75,
      300,
      this.onRestaurantClick
    );
    this.storeButton = this.createButton(
      "Store",
      STAGE_WIDTH / 2 - 75,
      400,
      this.onStoreClick
    );

    this.menuGroup.add(
      this.classroomButton,
      this.restaurantButton,
      this.storeButton
    );

    // (moved) hidden input created earlier in constructor
  }

  private createLoginScreen(): Konva.Group {
    const loginGroup = new Konva.Group();

    // Title
    const title = new Konva.Text({
      x: 0,
      y: STAGE_HEIGHT / 2 - 150,
      width: STAGE_WIDTH,
      align: "center",
      text: "Placeholder game title",
      fontSize: 32,
      fontFamily: "Arial",
      fontStyle: "bold",
      fill: "#000",
    });
    loginGroup.add(title);

    // Subtitle
    const subtitle = new Konva.Text({
      x: 0,
      y: STAGE_HEIGHT / 2 - 80,
      width: STAGE_WIDTH,
      align: "center",
      text: "enter your name to start",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#555",
    });
    loginGroup.add(subtitle);

    // Input box (visual representation)
    const inputBox = new Konva.Rect({
      x: STAGE_WIDTH / 2 - 150,
      y: STAGE_HEIGHT / 2 - 20,
      width: 300,
      height: 50,
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 8,
    });
    loginGroup.add(inputBox);

    // Input label text
    const inputLabel = new Konva.Text({
      x: STAGE_WIDTH / 2 - 140,
      y: STAGE_HEIGHT / 2 - 10,
      width: 280,
      height: 50,
      verticalAlign: "middle",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#666",
      text: "Name",
    });
    loginGroup.add(inputLabel);

    // Submit button
    const submitBtn = this.createButton(
      "Start Game",
      STAGE_WIDTH / 2 - 75,
      STAGE_HEIGHT / 2 + 60,
      () => this.handleLoginSubmit()
    );
    loginGroup.add(submitBtn);

    // Make the input box clickable to focus the real input
    inputBox.on("click", () => {
      this.nameInput.focus();
    });

    // Update visual input when user types (listen on the hidden input)
    this.nameInput.addEventListener("input", () => {
      inputLabel.text(this.nameInput.value || "Name");  
      loginGroup.getLayer()?.batchDraw();
    });

    // Allow pressing Enter to submit
    this.nameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        this.handleLoginSubmit();
      }
    });

    return loginGroup;
  }

  private handleLoginSubmit(): void {
    const name = this.nameInput.value.trim();
    if (!name) {
      alert("Please enter a name");
      this.nameInput.focus();
      return;
    }
    // Store player name in globals
    globals.playerName = name;
    console.log("Player name set to:", globals.playerName); 
    try {
      localStorage.setItem("playerName", globals.playerName);
    } catch (e) {
      // ignore storage errors
    }
    // Hide login, show menu
    this.loginGroup.visible(false);
    this.menuGroup.visible(true);
    this.loginGroup.getLayer()?.batchDraw();

    // Notify controller
    this.onLoginSuccess();
  } 

  private createButton(
    text: string,
    x: number,
    y: number,
    onClick: () => void
  ): Konva.Group {
    const buttonGroup = new Konva.Group();

    const rect = new Konva.Rect({
      x,
      y,
      width: 150,
      height: 50,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 8,
    });

    const label = new Konva.Text({
      x,
      y: y + 12,
      width: 150,
      align: "center",
      text,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000",
    });

    rect.on("click", onClick);
    label.on("click", onClick);

    buttonGroup.add(rect, label);
    return buttonGroup;
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

  // Add this method inside IntroScreenView
loadBackground(imageUrl: string): void {
  Konva.Image.fromURL(imageUrl, (imgNode) => {
    imgNode.setAttrs({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      image: imgNode.image(),
    });

    this.group.add(imgNode);
    imgNode.moveToBottom();
    this.backgroundLayer.moveToBottom();
    this.group.getLayer()?.draw();
  });
}

}
