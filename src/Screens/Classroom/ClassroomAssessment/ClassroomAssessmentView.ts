import Konva from "konva";
import type { Group } from "konva/lib/Group";
import type { Layer } from "konva/lib/Layer";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Rect } from "konva/lib/shapes/Rect";
import type { Text } from "konva/lib/shapes/Text";
import type { Stage } from "konva/lib/Stage";

import { IMAGE_DIMENSIONS, getPlayerName, globals } from "../../../constants";
import type { Item, Person } from "../../../types";
import { FrenchTTS } from "../../../utils/texttospeech";

const CLASSROOM_BACKGROUND = "/Background/classroom.png";

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
  private readonly backButton: Group;

  private readonly overlayScrim: Rect;
  private readonly overlayCharacter: KonvaImage;
  private readonly speechBubble: Rect;
  private readonly speechText: Text;
  private readonly leftArrow: Group;
  private readonly rightArrow: Group;
  private readonly dictionaryButton: Group;
  private readonly leftArrowCircle: Konva.Circle;
  private readonly rightArrowCircle: Konva.Circle;
  private readonly arrowInstruction: Text;

  private itemImages: KonvaImage[] = [];
  private personIcon?: KonvaImage;
  private personData?: Person;
  private dialogueLines: string[] = [];
  private currentDialogueIndex = 0;
  private dialogueCompleted = false;

  private switchHandler?: () => void;
  private resetHandler?: () => void;
  private minigameHandler?: () => void;
  private dialogueCompleteHandler?: () => void;
  private backHandler?: () => void;
  private dictionaryPopupGroup?: Konva.Group;
  private dictionaryText?: Konva.Text;

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
    this.frenchText = this.createText(
      26,
      "bold",
      "#1D3557",
      this.bottomPanel.y() + 16
    );
    this.phoneticText = this.createText(
      22,
      "italic",
      "#475569",
      this.bottomPanel.y() + 50
    );
    this.englishText = this.createText(
      24,
      "normal",
      "#0F172A",
      this.bottomPanel.y() + 84,
      "Tap an item to learn the word."
    );
    this.progressText = this.createText(
      22,
      "normal",
      "#0F172A",
      20,
      "0 / 0 found",
      "right"
    );

    this.backgroundGroup.add(
      this.frenchText,
      this.phoneticText,
      this.englishText,
      this.progressText
    );

    // Buttons
    this.switchButton = this.createButton("Switch to Store", 30, 24, () =>
      this.switchHandler?.()
    );
    this.resetButton = this.createButton("Reset", 210, 24, () =>
      this.resetHandler?.()
    );
    this.minigameButton = this.createButton("Go to Minigame", 390, 24, () =>
      this.minigameHandler?.()
    );
    this.dictionaryButton = this.createButton("Dictionary", 570, 24, () =>
      this.showDictionaryPopup()
    );
    this.backButton = this.createButton("Back to Intro", 750, 24, () =>
      this.backHandler?.()
    );
    this.backgroundGroup.add(
      this.switchButton,
      this.resetButton,
      this.minigameButton,
      this.dictionaryButton,
      this.backButton
    );
    this.createDictionaryPopup();

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
    this.overlayCharacter.on("click tap", (evt) => (evt.cancelBubble = true));

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
    this.speechBubble.on("click tap", (evt) => (evt.cancelBubble = true));

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
    this.speechText.on("click tap", (evt) => (evt.cancelBubble = true));

    const leftArrowConfig = this.createArrowControl("left", () =>
      this.showPreviousDialogue()
    );
    this.leftArrow = leftArrowConfig.group;
    this.leftArrowCircle = leftArrowConfig.circle;

    const rightArrowConfig = this.createArrowControl("right", () =>
      this.showNextDialogue()
    );
    this.rightArrow = rightArrowConfig.group;
    this.rightArrowCircle = rightArrowConfig.circle;

    this.arrowInstruction = new Konva.Text({
      x: this.rightArrow.x() - 160,
      y: this.rightArrow.y() - 60,
      width: 150,
      align: "center",
      text: "Press green to complete",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#94a3b8",
      visible: false,
      listening: false,
    });

    this.dialogueOverlay.add(
      this.overlayScrim,
      this.overlayCharacter,
      this.speechBubble,
      this.speechText,
      this.leftArrow,
      this.rightArrow,
      this.arrowInstruction
    );

    // Debug: show mouse coordinates
    const coordText = new Konva.Text({
      x: 10,
      y: 10,
      text: "",
      fontSize: 16,
      fontFamily: "Arial",
      listening: false, // don't block clicks
    });
    this.stage.on("mousemove", () => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      coordText.text(`x: ${Math.round(pos.x)}, y: ${Math.round(pos.y)}`);
      this.layer.batchDraw();
    });

    this.layer.add(coordText);
  }

  /** Dictionary popup */
  private createDictionaryPopup(): void {
    const width = 300;
    const height = 300;
    const x = this.stage.width() / 2 - width / 2;
    const y = this.stage.height() / 2 - height / 2;

    const group = new Konva.Group({
      x,
      y,
      visible: false,
      clip: { x: 0, y: 0, width, height },
    });
    const background = new Konva.Rect({
      width,
      height,
      fill: "#fff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 10,
    });
    const text = new Konva.Text({
      x: 20,
      y: 20,
      width: width - 40,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000",
      align: "left",
      wrap: "word",
      text: "",
    });

    group.add(background, text);
    this.backgroundGroup.add(group);
    this.dictionaryPopupGroup = group;
    this.dictionaryText = text;

    let scrollOffset = 0;
    const updateScroll = (dy: number) => {
      if (!this.dictionaryText) return;
      scrollOffset -= dy;
      const minY = Math.min(height - 40 - text.height(), 0);
      const maxY = 20;
      scrollOffset = Math.max(minY, Math.min(scrollOffset, maxY));
      this.dictionaryText.y(scrollOffset);
      this.layer.batchDraw();
    };

    group.on("wheel", (e) => {
      e.evt.preventDefault();
      updateScroll(e.evt.deltaY);
    });

    this.backgroundGroup.on("mousedown", (e) => {
      if (!this.dictionaryPopupGroup?.visible()) return;
      if (!e.target.isAncestorOf(this.dictionaryPopupGroup)) {
        this.dictionaryPopupGroup.visible(false);
        this.layer.batchDraw();
      }
    });
  }

  private showDictionaryPopup(): void {
    if (!this.dictionaryPopupGroup || !this.dictionaryText) return;

    const entries = Object.entries(globals.dictionary);
    this.dictionaryText.text(
      entries.map(([eng, fr]) => `${eng} / ${fr}`).join("\n") ||
        "No words found"
    );
    this.dictionaryText.y(20);
    this.dictionaryPopupGroup.visible(true);
    this.dictionaryPopupGroup.moveToTop();
    this.layer.batchDraw();
  }

  async renderScene(
    items: Item[],
    person: Person,
    onItemClick: ItemSelectHandler
  ) {
    this.personData = person;
    // Keep raw dialogue lines (substitution happens when dialogue opens)
    this.dialogueLines = person.dialogue ?? [];
    this.resetPanel();
    this.clearScene();

    // Render items
    await Promise.all(
      items.map(async (item) => {
        const img = await this.loadImage(item.image);

        const node = new Konva.Image({
          x: item.x,
          y: item.y,
          width: item.width ?? IMAGE_DIMENSIONS.width, // fallback to default
          height: item.height ?? IMAGE_DIMENSIONS.height,
          image: img,
          draggable: true,
        });

        // Debug: log drag position
        this.attachDragPositionLogger(node, item.english);

        node.on("click tap", () => {
          if (!globals.dictionary[item.english]) {
            globals.dictionary[item.english] = item.french;
            console.log("Dictionary updated:", globals.dictionary);
          }
          onItemClick(item);
          FrenchTTS.speak(`${item.french} ,,, ${item.english}`);
        });

        node.on("mouseenter", () => this.setCursor("pointer"));
        node.on("mouseleave", () => this.setCursor("default"));

        this.backgroundGroup.add(node);
        this.itemImages.push(node);
      })
    );

    // Render person
    const personImg = await this.loadImage(person.image);
    const personNode = new Konva.Image({
      x: person.x,
      y: person.y,
      width: person.width ?? IMAGE_DIMENSIONS.width,
      height: person.height ?? IMAGE_DIMENSIONS.height * 1.4,
      image: personImg,
      draggable: true,
    });
    // Debug: log drag position Person
    this.attachDragPositionLogger(personNode, "person");

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
  setOnSwitchToRestaurant(handler: () => void) {
    this.switchHandler = handler;
  }
  setOnReset(handler: () => void) {
    this.resetHandler = handler;
  }
  setOnSwitchToMinigame(handler: () => void) {
    this.minigameHandler = handler;
  }
  setOnDialogueComplete(handler: () => void) {
    this.dialogueCompleteHandler = handler;
  }

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

  showDialogueCompleted() {
    this.dialogueCompleted = true;
    this.arrowInstruction.visible(false);
    this.setArrowColor(this.rightArrowCircle, "rgba(22,163,74,0.9)");
    this.layer.batchDraw();
  }

  show() {
    this.backgroundGroup.visible(true);
    this.layer.batchDraw();
  }
  hide() {
    this.backgroundGroup.visible(false);
    this.closeDialogue();
    this.layer.batchDraw();
  }

  /** Dialogue logic */
  private openDialogue() {
    const raw = this.personData?.dialogue ?? [];
    if (!this.personData || raw.length === 0) return;
    // Re-process raw dialogue lines with current player name in case name was entered
    const player = getPlayerName();
    this.dialogueLines = raw.map((line) => {
      let out = player ? line.replace(/_{2,}/g, player) : line;
      if (/Very nice to meet you\s*$/i.test(out) && player) {
        out = out.replace(/\s*$/, "") + " " + player;
      }
      return out;
    });
    this.currentDialogueIndex = 0;
    this.dialogueCompleted = false;
    this.arrowInstruction.visible(false);
    this.setArrowColor(this.rightArrowCircle, "rgba(29,78,216,0.9)");
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
    this.arrowInstruction.visible(false);
    this.layer.batchDraw();
  }

  private showNextDialogue() {
    if (this.currentDialogueIndex >= this.dialogueLines.length - 1) {
      if (!this.dialogueCompleted) {
        this.dialogueCompleted = true;
        this.arrowInstruction.visible(false);
        this.setArrowColor(this.rightArrowCircle, "rgba(22,163,74,0.9)");
        this.dialogueCompleteHandler?.();
      } else {
        this.closeDialogue();
      }
      this.layer.batchDraw();
      return;
    }
    this.currentDialogueIndex++;
    this.dialogueCompleted = false;
    this.updateDialogueText();
  }

  private showPreviousDialogue() {
    if (this.currentDialogueIndex <= 0) return;
    this.currentDialogueIndex--;
    this.dialogueCompleted = false;
    this.updateDialogueText();
  }

  private updateDialogueText() {
    this.speechText.text(this.dialogueLines[this.currentDialogueIndex] ?? "");
    this.setArrowState(this.leftArrow, this.currentDialogueIndex > 0);
    this.setArrowState(this.rightArrow, true);
    const atEnd = this.currentDialogueIndex >= this.dialogueLines.length - 1;
    this.updateCompletionIndicators(atEnd);
    this.layer.batchDraw();
    // Speak current dialogue line
    if (this.dialogueLines[this.currentDialogueIndex])
      FrenchTTS.speak(this.dialogueLines[this.currentDialogueIndex]);
  }

  private clearScene() {
    this.itemImages.forEach((i) => i.destroy());
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

  private attachDragPositionLogger(node: KonvaImage, label?: string) {
    node.on("dragend", () => {
      const { x, y } = node.position(); // same as { x: node.x(), y: node.y() }
      console.log(
        `${label ?? "node"} dragged to x=${Math.round(x)}, y=${Math.round(y)}`
      );
    });
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

  private createText(
    fontSize: number,
    fontStyle: string,
    fill: string,
    y: number,
    text = "",
    align: "center" | "right" = "center"
  ): Text {
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

  private createButton(
    label: string,
    x: number,
    y: number,
    handler: () => void
  ): Group {
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

  private createArrowControl(
    direction: "left" | "right",
    onClick: () => void
  ): { group: Group; circle: Konva.Circle } {
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
      fill: "#FFF",
      rotation: direction === "left" ? -90 : 90,
      listening: false,
    });
    group.add(circle, triangle);
    group.on("click tap", onClick);
    group.on("mouseenter", () => this.setCursor("pointer"));
    group.on("mouseleave", () => this.setCursor("default"));
    return { group, circle };
  }

  private setArrowState(arrow: Group, enabled: boolean) {
    arrow.opacity(enabled ? 1 : 0.3);
    arrow.listening(enabled);
  }

  private updateCompletionIndicators(atEnd: boolean) {
    if (this.dialogueCompleted) {
      this.arrowInstruction.visible(false);
      this.setArrowColor(this.rightArrowCircle, "rgba(22,163,74,0.9)");
      return;
    }

    if (atEnd) {
      this.arrowInstruction.visible(true);
      this.setArrowColor(this.rightArrowCircle, "rgba(34,197,94,0.9)");
    } else {
      this.arrowInstruction.visible(false);
      this.setArrowColor(this.rightArrowCircle, "rgba(29,78,216,0.9)");
    }
  }

  private setArrowColor(circle: Konva.Circle, color: string) {
    circle.fill(color);
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
