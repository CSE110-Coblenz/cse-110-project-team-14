import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Rect } from "konva/lib/shapes/Rect";
import type { Text } from "konva/lib/shapes/Text";
import type { Stage } from "konva/lib/Stage";

import { IMAGE_DIMENSIONS } from "../../../constants";
import type { Item, Person } from "../../../types";

const CLASSROOM_BACKGROUND = "/Background/classroomScene.png";

type ItemSelectHandler = (item: Item) => void;

export class ClassroomAssessmentView {
  private readonly stage: Stage;
  private readonly layer: Layer;

  private readonly backgroundGroup: Group;
  private readonly dialogueOverlay: Group;

  private readonly bottomPanel: Rect;
  private readonly frenchText: Text;
  private readonly phoneticText: Text;
  private readonly englishText: Text;
  private readonly progressText: Text;

  private readonly switchButton: Group;
  private readonly resetButton: Group;
  private readonly minigameButton: Group;

  private readonly overlayScrim: Rect;
  private readonly overlayCharacter: KonvaImage;
  private readonly speechBubble: Rect;
  private readonly speechText: Text;
  private readonly leftArrow: Group;
  private readonly rightArrow: Group;

  private itemImages: KonvaImage[] = [];
  private personIcon?: KonvaImage;
  private personData?: Person;
  private dialogueLines: string[] = [];
  private currentDialogueIndex = 0;

  private switchHandler?: () => void;
  private resetHandler?: () => void;
  private minigameHandler?: () => void;

  constructor(stage: Stage, layer: Layer) {
    this.stage = stage;
    this.layer = layer;

    // Groups
    this.backgroundGroup = new Konva.Group({ visible: false });
    this.dialogueOverlay = new Konva.Group({ visible: false });

    this.layer.add(this.backgroundGroup);
    this.layer.add(this.dialogueOverlay);

    this.addBackground();
    this.bottomPanel = this.createBottomPanel();
    this.backgroundGroup.add(this.bottomPanel);

    // Text panels
    this.frenchText = this.createText(26, "bold", "#1D3557", this.bottomPanel.y() + 16);
    this.phoneticText = this.createText(22, "italic", "#475569", this.bottomPanel.y() + 50);
    this.englishText = this.createText(24, "normal", "#0F172A", this.bottomPanel.y() + 84, "Tap an item to learn the word.");
    this.progressText = this.createText(22, "normal", "#0F172A", 20, "0 / 0 found", "right");

    this.backgroundGroup.add(this.frenchText, this.phoneticText, this.englishText, this.progressText);

    // Buttons
    this.switchButton = this.createButton("Switch to Restaurant", 30, 24, () => this.switchHandler?.());
    this.resetButton = this.createButton("Reset", 210, 24, () => this.resetHandler?.());
    this.minigameButton = this.createButton("Go to Minigame", 390, 24, () => this.minigameHandler?.());
    this.backgroundGroup.add(this.switchButton, this.resetButton, this.minigameButton);

    // Dialogue overlay
    this.overlayScrim = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width(),
      height: stage.height(),
      fill: "rgba(0,0,0,0.45)",
    });
    this.overlayScrim.on("click tap", () => this.closeDialogue());

    this.overlayCharacter = new Konva.Image({
      x: stage.width() * 0.08,
      y: stage.height() * 0.2,
      width: 220,
      height: 220,
      opacity: 0,
      image: new Image(),
    });
    this.overlayCharacter.on("click tap", (evt) => evt.cancelBubble = true);

    const bubbleWidth = stage.width() * 0.55;
    const bubbleHeight = stage.height() * 0.45;
    this.speechBubble = new Konva.Rect({
      x: stage.width() * 0.35,
      y: stage.height() * 0.2,
      width: bubbleWidth,
      height: bubbleHeight,
      fill: "#FFFFFF",
      cornerRadius: 32,
      shadowColor: "rgba(0,0,0,0.25)",
      shadowBlur: 20,
      shadowOffsetY: 10,
    });
    this.speechBubble.on("click tap", (evt) => evt.cancelBubble = true);

    this.speechText = new Konva.Text({
      x: this.speechBubble.x() + 32,
      y: this.speechBubble.y() + 32,
      width: this.speechBubble.width() - 64,
      fontSize: 24,
      fontFamily: "Arial",
      lineHeight: 1.3,
      fill: "#0F172A",
      text: "",
    });
    this.speechText.on("click tap", (evt) => evt.cancelBubble = true);

    this.leftArrow = this.createArrowControl("left", () => this.showPreviousDialogue());
    this.rightArrow = this.createArrowControl("right", () => this.showNextDialogue());

    this.dialogueOverlay.add(this.overlayScrim, this.overlayCharacter, this.speechBubble, this.speechText, this.leftArrow, this.rightArrow);
  }

  /** Render all items and person asynchronously */
  async renderScene(items: Item[], person: Person, onItemClick: ItemSelectHandler) {
    this.personData = person;
    this.dialogueLines = person.dialogue ?? [];
    this.resetPanel();
    this.clearScene();

    const spacing = this.stage.width() / (items.length + 2);
    const targetY = this.stage.height() * 0.2;

    await Promise.all(items.map(async (item, i) => {
      const img = await this.loadImage(item.image);
      const node = new Konva.Image({
        x: spacing * (i + 1) - IMAGE_DIMENSIONS.width / 2,
        y: targetY,
        width: IMAGE_DIMENSIONS.width,
        height: IMAGE_DIMENSIONS.height,
        image: img,
        draggable: true,
      });
      node.on("click tap", () => onItemClick(item));
      node.on("mouseenter", () => this.setCursor("pointer"));
      node.on("mouseleave", () => this.setCursor("default"));
      this.backgroundGroup.add(node);
      this.itemImages.push(node);
    }));

    const personImg = await this.loadImage(person.image);
    const personNode = new Konva.Image({
      x: spacing * (items.length + 1) - IMAGE_DIMENSIONS.width / 2,
      y: targetY,
      width: IMAGE_DIMENSIONS.width,
      height: IMAGE_DIMENSIONS.height,
      image: personImg,
    });
    personNode.on("click tap", () => this.openDialogue());
    personNode.on("mouseenter", () => this.setCursor("pointer"));
    personNode.on("mouseleave", () => this.setCursor("default"));
    this.personIcon = personNode;
    this.backgroundGroup.add(personNode);

    // Overlay portrait
    this.overlayCharacter.image(personImg);
    this.overlayCharacter.opacity(1);

    this.layer.batchDraw();
  }

  /** Setters for buttons */
  setOnSwitchToRestaurant(handler: () => void) { this.switchHandler = handler; }
  setOnReset(handler: () => void) { this.resetHandler = handler; }
  setOnSwitchToMinigame(handler: () => void) { this.minigameHandler = handler; }

  /** Panel updates */
  updatePanel(item: Item) {
    this.frenchText.text(item.french);
    this.phoneticText.text(item.phonetic);
    this.englishText.text(item.english);
    this.layer.batchDraw();
  }

  resetPanel() {
    this.frenchText.text("");
    this.phoneticText.text("");
    this.englishText.text("Tap an item to learn the word.");
    this.layer.batchDraw();
  }

  updateProgress(found: number, total: number) {
    this.progressText.text(`${found} / ${total} found`);
    this.layer.batchDraw();
  }

  show() { this.backgroundGroup.visible(true); this.layer.batchDraw(); }
  hide() { this.backgroundGroup.visible(false); this.closeDialogue(); this.layer.batchDraw(); }

  /** Dialogue logic */
  private openDialogue() {
    if (!this.personData || this.dialogueLines.length === 0) return;
    this.currentDialogueIndex = 0;
    this.updateDialogueText();
    this.applyBlur();
    this.personIcon?.visible(false);
    this.dialogueOverlay.visible(true);
    this.layer.batchDraw();
  }

  private closeDialogue() {
    this.dialogueOverlay.visible(false);
    this.personIcon?.visible(true);
    this.removeBlur();
    this.layer.batchDraw();
  }

  private showNextDialogue() {
    if (this.currentDialogueIndex >= this.dialogueLines.length - 1) return;
    this.currentDialogueIndex++;
    this.updateDialogueText();
  }

  private showPreviousDialogue() {
    if (this.currentDialogueIndex <= 0) return;
    this.currentDialogueIndex--;
    this.updateDialogueText();
  }

  private updateDialogueText() {
    this.speechText.text(this.dialogueLines[this.currentDialogueIndex] ?? "");
    this.setArrowState(this.leftArrow, this.currentDialogueIndex > 0);
    this.setArrowState(this.rightArrow, this.currentDialogueIndex < this.dialogueLines.length - 1);
    this.layer.batchDraw();
  }

  private clearScene() {
    this.itemImages.forEach(i => i.destroy());
    this.itemImages = [];
    this.personIcon?.destroy();
    this.personIcon = undefined;
  }

  /** Helpers */
  private addBackground() {
    const img = new Image();
    img.onload = () => {
      const bg = new Konva.Image({
        image: img,
        width: this.stage.width(),
        height: this.stage.height(),
        listening: false,
      });
      this.backgroundGroup.add(bg);
      bg.moveToBottom();
      this.layer.batchDraw();
    };
    img.src = CLASSROOM_BACKGROUND;
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  private createBottomPanel(): Rect {
    return new Konva.Rect({
      x: 30,
      y: this.stage.height() - 150,
      width: this.stage.width() - 60,
      height: 120,
      fill: "#FFF",
      stroke: "#1B1B1B",
      strokeWidth: 2,
      cornerRadius: 16,
      listening: false,
    });
  }

  private createText(fontSize: number, fontStyle: string, fill: string, y: number, text = "", align: "center" | "right" = "center"): Text {
    return new Konva.Text({
      x: 50,
      y,
      width: this.stage.width() - 100,
      fontSize,
      fontFamily: "Arial",
      fontStyle,
      fill,
      align,
      text,
      listening: false,
    });
  }

  private createButton(label: string, x: number, y: number, handler: () => void): Group {
    const group = new Konva.Group({ x, y });
    const rect = new Konva.Rect({
      width: 160,
      height: 36,
      cornerRadius: 12,
      fill: "#1D4ED8",
      stroke: "#0F172A",
      strokeWidth: 1,
      shadowColor: "rgba(0,0,0,0.2)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });
    const text = new Konva.Text({
      width: rect.width(),
      height: rect.height(),
      align: "center",
      verticalAlign: "middle",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      text: label,
      listening: false,
    });
    group.add(rect, text);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    group.on("click tap", handler);
    return group;
  }

  private createArrowControl(direction: "left" | "right", onClick: () => void): Group {
    const group = new Konva.Group({
      x: direction === "left" ? this.speechBubble.x() + 40 : this.speechBubble.x() + this.speechBubble.width() - 40,
      y: this.speechBubble.y() + this.speechBubble.height() - 40,
    });
    const circle = new Konva.Circle({ radius: 26, fill: "rgba(29,78,216,0.9)" });
    const triangle = new Konva.RegularPolygon({
      x: 0,
      y: 0,
      sides: 3,
      radius: 16,
      fill: "#FFF",
      rotation: direction === "left" ? -90 : 90,
      listening: false,
    });
    group.add(circle, triangle);
    group.on("click tap", onClick);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    return group;
  }

  private setArrowState(arrow: Group, enabled: boolean) {
    arrow.opacity(enabled ? 1 : 0.3);
    arrow.listening(enabled);
  }

  private applyBlur() {
    this.backgroundGroup.cache({ pixelRatio: 1 });
    this.backgroundGroup.filters([Konva.Filters.Blur]);
    this.backgroundGroup.blurRadius(8);
  }

  private removeBlur() {
    this.backgroundGroup.filters([]);
    this.backgroundGroup.blurRadius(0);
    this.backgroundGroup.clearCache();
  }

  private setCursor(cursor: string) {
    this.stage.container().style.cursor = cursor;
  }

  getGroup(): Group {
    return this.backgroundGroup;
  }
}
