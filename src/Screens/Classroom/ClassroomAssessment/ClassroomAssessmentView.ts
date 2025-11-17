import Konva from "konva";
import "konva/lib/filters/Blur";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Rect } from "konva/lib/shapes/Rect";
import type { Text } from "konva/lib/shapes/Text";
import type { Stage } from "konva/lib/Stage";

import { IMAGE_DIMENSIONS } from "../../../constants";
import type { Item, Person } from "../../../types";

const CLASSROOM_BACKGROUND = "/Background/classroomScene.png";

type ItemSelectHandler = (item: Item) => void;

/**
 * Mirrors the Konva-based classroom view from the working copy.
 * Items render on a background group, and clicking the character opens
 * a modal dialogue overlay that blurs the scene.
 */
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
  private readonly switchButton: Konva.Group;
  private readonly resetButton: Konva.Group;
  private readonly minigameButton: Konva.Group;
  private readonly overlayScrim: Rect;
  private readonly speechBubble: Rect;
  private readonly speechText: Text;
  private readonly leftArrow: Konva.Group;
  private readonly rightArrow: Konva.Group;
  private readonly overlayCharacter: KonvaImage;
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

  this.backgroundGroup = new Konva.Group({ visible: false });
  this.dialogueOverlay = new Konva.Group({ visible: false });

  this.addBackground();

  this.bottomPanel = new Konva.Rect({
    x: 30,
    y: stage.height() - 150,
    width: stage.width() - 60,
    height: 120,
    fill: "#FFFFFF",
    stroke: "#1B1B1B",
    strokeWidth: 2,
    cornerRadius: 16,
    listening: false,
  });
  this.backgroundGroup.add(this.bottomPanel);

  this.frenchText = new Konva.Text({
    x: this.bottomPanel.x() + 20,
    y: this.bottomPanel.y() + 16,
    width: this.bottomPanel.width() - 40,
    align: "center",
    fontSize: 26,
    fontFamily: "Arial",
    fontStyle: "bold",
    fill: "#1D3557",
    text: "",
    listening: false,
  });
  this.backgroundGroup.add(this.frenchText);

  this.phoneticText = new Konva.Text({
    x: this.bottomPanel.x() + 20,
    y: this.bottomPanel.y() + 50,
    width: this.bottomPanel.width() - 40,
    align: "center",
    fontSize: 22,
    fontFamily: "Arial",
    fontStyle: "italic",
    fill: "#475569",
    text: "",
    listening: false,
  });
  this.backgroundGroup.add(this.phoneticText);

  this.englishText = new Konva.Text({
    x: this.bottomPanel.x() + 20,
    y: this.bottomPanel.y() + 84,
    width: this.bottomPanel.width() - 40,
    align: "center",
    fontSize: 24,
    fontFamily: "Arial",
    fill: "#0F172A",
    text: "Tap an item to learn the word.",
    listening: false,
  });
  this.backgroundGroup.add(this.englishText);

  this.progressText = new Konva.Text({
    x: stage.width() - 200,
    y: 20,
    width: 170,
    align: "right",
    fontSize: 22,
    fontFamily: "Arial",
    fill: "#0F172A",
    text: "0 / 0 found",
    listening: false,
  });
  this.backgroundGroup.add(this.progressText);

  // --- Buttons ---
  this.switchButton = this.createButton("Switch to Restaurant", 30, 24, () =>
    this.switchHandler?.()
  );
  this.backgroundGroup.add(this.switchButton);

  this.resetButton = this.createButton("Reset Count", 210, 24, () =>
    this.resetHandler?.()
  );
  this.backgroundGroup.add(this.resetButton);

  this.minigameButton = this.createButton("Go to Minigame", 390, 24, () =>
    this.minigameHandler?.()
  );
  this.backgroundGroup.add(this.minigameButton);
  // --- End Buttons ---

  this.overlayScrim = new Konva.Rect({
    x: 0,
    y: 0,
    width: stage.width(),
    height: stage.height(),
    fill: "rgba(15,23,42,0.45)",
  });
  this.overlayScrim.on("click tap", () => this.closeDialogue());

  const placeholder = new window.Image();
  this.overlayCharacter = new Konva.Image({
    image: placeholder,
    listening: true,
    opacity: 0,
  });
  this.overlayCharacter.position({
    x: stage.width() * 0.08,
    y: stage.height() * 0.2,
  });
  this.overlayCharacter.size({ width: 220, height: 220 });
  this.overlayCharacter.on("click tap", (evt) => this.stopOverlayPropagation(evt));

  const bubbleWidth = stage.width() * 0.55;
  const bubbleHeight = stage.height() * 0.45;
  this.speechBubble = new Konva.Rect({
    x: stage.width() * 0.35,
    y: stage.height() * 0.2,
    width: bubbleWidth,
    height: bubbleHeight,
    fill: "#FFFFFF",
    cornerRadius: 32,
    shadowColor: "rgba(15,23,42,0.25)",
    shadowBlur: 20,
    shadowOffsetY: 10,
  });
  this.speechBubble.on("click tap", (evt) => this.stopOverlayPropagation(evt));

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
  this.speechText.on("click tap", (evt) => this.stopOverlayPropagation(evt));

  this.leftArrow = this.createArrowControl("left", () => this.showPreviousDialogue());
  this.rightArrow = this.createArrowControl("right", () => this.showNextDialogue());

  this.dialogueOverlay.add(this.overlayScrim);
  this.dialogueOverlay.add(this.overlayCharacter);
  this.dialogueOverlay.add(this.speechBubble);
  this.dialogueOverlay.add(this.speechText);
  this.dialogueOverlay.add(this.leftArrow);
  this.dialogueOverlay.add(this.rightArrow);

  this.layer.add(this.backgroundGroup);
  this.layer.add(this.dialogueOverlay);
}

// --- Setter for minigame button ---
setOnSwitchToMinigame(handler: () => void): void {
  this.minigameHandler = handler;
}


  getGroup(): Group {
    return this.backgroundGroup;
  }

  show(): void {
    this.backgroundGroup.visible(true);
    this.layer.batchDraw();
  }

  hide(): void {
    this.backgroundGroup.visible(false);
    this.closeDialogue();
    this.layer.batchDraw();
  }

  async renderScene(items: Item[], person: Person, onSelect: ItemSelectHandler): Promise<void> {
    this.personData = person;
    this.dialogueLines = person.dialogue ?? [];
    this.resetPanel();
    this.clearScene();

    const spacing = this.stage.width() / (items.length + 2);
    const targetY = this.stage.height() * 0.2;

    const itemPromises = items.map(async (item, index) => {
      const node = await this.createVocabularyImage(item.image, {
        x: spacing * (index + 1),
        y: targetY,
      });
      node.on("click tap", () => onSelect(item));
      node.on("mouseenter", () => this.setCursor("pointer"));
      node.on("mouseleave", () => this.setCursor("default"));
      this.backgroundGroup.add(node);
      this.itemImages.push(node);
    });

    const personNodePromise = this.createVocabularyImage(person.image, {
      x: spacing * (items.length + 1),
      y: targetY,
    }).then((node) => {
      node.on("click tap", () => this.openDialogue());
      node.on("mouseenter", () => this.setCursor("pointer"));
      node.on("mouseleave", () => this.setCursor("default"));
      this.personIcon = node;
      this.backgroundGroup.add(node);
    });

    const overlayPortraitPromise = this.loadImage(person.image).then((img) => {
      this.overlayCharacter.image(img);
      this.overlayCharacter.opacity(1);
    });

    await Promise.all([...itemPromises, personNodePromise, overlayPortraitPromise]);
    this.layer.batchDraw();
  }

  setOnSwitchToRestaurant(handler: () => void): void {
    this.switchHandler = handler;
  }

  setOnReset(handler: () => void): void {
    this.resetHandler = handler;
  }

  updatePanel(item: Item): void {
    this.englishText.text(item.english);
    this.frenchText.text(item.french);
    this.phoneticText.text(item.phonetic);
    this.layer.batchDraw();
  }

  resetPanel(): void {
    this.englishText.text("Tap an item to learn the word.");
    this.frenchText.text("");
    this.phoneticText.text("");
    this.layer.batchDraw();
  }

  updateProgress(found: number, total: number): void {
    this.progressText.text(`${found} / ${total} found`);
    this.layer.batchDraw();
  }

  private openDialogue(): void {
    if (!this.personData || this.dialogueLines.length === 0) {
      return;
    }
    this.currentDialogueIndex = 0;
    this.updateDialogueText();
    this.applyBlur();
    this.personIcon?.visible(false);
    this.dialogueOverlay.visible(true);
    this.layer.batchDraw();
  }

  private closeDialogue(): void {
    if (!this.dialogueOverlay.visible()) {
      return;
    }
    this.dialogueOverlay.visible(false);
    this.personIcon?.visible(true);
    this.removeBlur();
    this.layer.batchDraw();
  }

  private showNextDialogue(): void {
    if (this.currentDialogueIndex >= this.dialogueLines.length - 1) {
      return;
    }
    this.currentDialogueIndex += 1;
    this.updateDialogueText();
  }

  private showPreviousDialogue(): void {
    if (this.currentDialogueIndex <= 0) {
      return;
    }
    this.currentDialogueIndex -= 1;
    this.updateDialogueText();
  }

  private updateDialogueText(): void {
    const line = this.dialogueLines[this.currentDialogueIndex] ?? "";
    this.speechText.text(line);
    const atStart = this.currentDialogueIndex === 0;
    const atEnd = this.currentDialogueIndex === this.dialogueLines.length - 1;
    this.setArrowState(this.leftArrow, !atStart);
    this.setArrowState(this.rightArrow, !atEnd);
    this.layer.batchDraw();
  }

  private clearScene(): void {
    this.itemImages.forEach((img) => img.destroy());
    this.itemImages = [];
    this.personIcon?.destroy();
    this.personIcon = undefined;
  }

  private createVocabularyImage(src: string, position: { x: number; y: number }): Promise<KonvaImage> {
    return this.loadImage(src).then(
      (img) =>
        new Konva.Image({
          x: position.x - IMAGE_DIMENSIONS.width / 2,
          y: position.y,
          width: IMAGE_DIMENSIONS.width,
          height: IMAGE_DIMENSIONS.height,
          image: img,
        })
    );
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Failed to load image asset: ${src}`));
      image.src = src;
    });
  }

  private addBackground(): void {
    const image = new window.Image();
    image.onload = () => {
      const background = new Konva.Image({
        image,
        x: 0,
        y: 0,
        width: this.stage.width(),
        height: this.stage.height(),
        listening: false,
      });
      this.backgroundGroup.add(background);
      background.moveToBottom();
      this.layer.batchDraw();
    };
    image.onerror = () => {
      const fallback = new Konva.Rect({
        x: 0,
        y: 0,
        width: this.stage.width(),
        height: this.stage.height(),
        fill: "#7EC8FF",
        listening: false,
      });
      this.backgroundGroup.add(fallback);
      fallback.moveToBottom();
      this.layer.batchDraw();
    };
    image.src = CLASSROOM_BACKGROUND;
  }

  private createButton(label: string, x: number, y: number, handler: () => void): Konva.Group {
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
    group.add(rect);
    group.add(text);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    group.on("click tap", handler);
    return group;
  }

  private createArrowControl(direction: "left" | "right", onClick: () => void): Konva.Group {
    const group = new Konva.Group({
      x:
        direction === "left"
          ? this.speechBubble.x() + 40
          : this.speechBubble.x() + this.speechBubble.width() - 40,
      y: this.speechBubble.y() + this.speechBubble.height() - 40,
    });
    const circle = new Konva.Circle({
      radius: 26,
      fill: "rgba(29,78,216,0.9)",
    });
    const triangle = new Konva.RegularPolygon({
      x: 0,
      y: 0,
      sides: 3,
      radius: 16,
      fill: "#FFFFFF",
      rotation: direction === "left" ? -90 : 90,
      listening: false,
    });
    group.add(circle);
    group.add(triangle);
    group.on("click tap", onClick);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    return group;
  }

  private setArrowState(arrow: Konva.Group, enabled: boolean): void {
    arrow.opacity(enabled ? 1 : 0.3);
    arrow.listening(enabled);
  }

  private applyBlur(): void {
    this.backgroundGroup.cache({ pixelRatio: 1 });
    this.backgroundGroup.filters([Konva.Filters.Blur]);
    this.backgroundGroup.blurRadius(8);
  }

  private removeBlur(): void {
    this.backgroundGroup.filters([]);
    this.backgroundGroup.blurRadius(0);
    this.backgroundGroup.clearCache();
  }

  private stopOverlayPropagation(evt: KonvaEventObject<Event>): void {
    evt.cancelBubble = true;
  }

  private setCursor(cursor: string): void {
    this.stage.container().style.cursor = cursor;
  }
}
