import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals } from "../../../constants";
import type { Item } from '../../../types';
import { FrenchTTS } from "../../../utils/texttospeech";

export class RestaurantMainView {
  private group: Konva.Group;
  private dockGroup: Konva.Group;
  private itemImages: Record<string, Konva.Image> = {};
  private dockText: Konva.Text;
  private dockPhonetic: Konva.Text;
  private background: Konva.Rect;
  private onAssessment: () => void;
  private onBackClick!: () => void;

  private dictionaryPopupGroup?: Konva.Group;
  private dictionaryText?: Konva.Text;

  constructor(
    onItemClick: (itemName: string) => void,
    onAssessment: () => void,
    onBackClick: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.dockGroup = new Konva.Group();
    this.onAssessment = onAssessment;
    this.onBackClick = onBackClick;

    // Background
    this.background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d3eaf5ff",
    });
    this.group.add(this.background);

    // Dock
    const dockHeight = 100;
    const dock = new Konva.Rect({
      x: 200,
      y: STAGE_HEIGHT - dockHeight,
      width: STAGE_WIDTH / 2,
      height: dockHeight,
      fill: "#5c471dff",
      stroke: "black",
      strokeWidth: 2,
    });
    this.dockGroup.add(dock);

    this.dockText = new Konva.Text({
      x: 300,
      y: STAGE_HEIGHT - dockHeight + 20,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "black",
      text: "Click an item",
    });
    this.dockGroup.add(this.dockText);

    this.dockPhonetic = new Konva.Text({
      x: 350,
      y: STAGE_HEIGHT - dockHeight + 55,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "black",
    });
    this.dockGroup.add(this.dockPhonetic);

    this.group.add(this.dockGroup);

    // NAV BAR BUTTONS
    this.createNavigationButtons();
    this.createAssessmentButton();

    // Dictionary popup
    this.createDictionaryPopup();
  }

  // -----------------------------
  // TOP NAV BAR BUTTONS
  // -----------------------------
  private createNavigationButtons(): void {
    const btnY = 24;

    const backBtn = this.createNavButton("Back to Intro", 30, btnY, () => this.onBackClick());
    this.group.add(backBtn);

    const dictBtn = this.createNavButton("Dictionary", 240, btnY, () => this.showDictionaryPopup());
    this.group.add(dictBtn);
  }

  private createNavButton(label: string, x: number, y: number, handler: () => void): Konva.Group {
    const width = 180;
    const height = 50;

    const group = new Konva.Group({ x, y });

    const rect = new Konva.Rect({
      width,
      height,
      cornerRadius: 14,
      fill: "#1D4ED8", // blue nav style
      stroke: "#0F172A",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });

    const text = new Konva.Text({
      width,
      height,
      align: "center",
      verticalAlign: "middle",
      text: label,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      fontStyle: "bold",
      listening: false,
    });

    group.add(rect, text);
    group.on("click tap", handler);
    group.on("mouseenter", () => document.body.style.cursor = "pointer");
    group.on("mouseleave", () => document.body.style.cursor = "default");

    return group;
  }

  // -----------------------------
  // UPDATED GREEN ASSESSMENT BUTTON
  // -----------------------------
  private createAssessmentButton(): void {
    const width = 200;
    const height = 50;
    const x = STAGE_WIDTH - width - 40; // aligns with right edge
    const y = 24;                       // same line as nav

    const group = new Konva.Group({ x, y });

    const rect = new Konva.Rect({
      width,
      height,
      cornerRadius: 14,
      fill: "#4CAF50",          // improved green
      stroke: "#2E7D32",        // darker outline
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });

    const text = new Konva.Text({
      width,
      height,
      text: "Start Assessment",
      align: "center",
      verticalAlign: "middle",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      fontStyle: "bold",
      listening: false,
    });

    group.add(rect, text);
    group.on("click tap", () => this.onAssessment());
    group.on("mouseenter", () => document.body.style.cursor = "pointer");
    group.on("mouseleave", () => document.body.style.cursor = "default");

    this.group.add(group);
    group.moveToTop();
  }

  // -----------------------------
  // ITEM HANDLING
  // -----------------------------
  addItems(items: Item[], onItemClick: (itemName: string) => void): void {
    items.forEach((item) => {
      Konva.Image.fromURL(item.image, (imgNode) => {
        imgNode.setAttrs({
          x: item.x,
          y: item.y,
          width: 200,
          height: 200,
          name: item.name,
          image: imgNode.image()
        });

        imgNode.on("click", () => {
          if (!globals.dictionary[item.english]) {
            globals.dictionary[item.english] = item.french;
            console.log(globals.dictionary);
          }
          onItemClick(item.name);
          FrenchTTS.speak(`${item.french} ,,, ${item.english}`);
        });

        this.itemImages[item.name] = imgNode;
        this.group.add(imgNode);
        this.group.getLayer()?.batchDraw();
      });
    });
  }

  updateDock(item: Item): void {
    this.dockText.text(`${item.english} / ${item.french}`);
    this.dockPhonetic.text(`${item.phonetic}`);
    this.group.getLayer()?.batchDraw();
  }

  // -----------------------------
  // DICTIONARY POPUP
  // -----------------------------
  private createDictionaryPopup(): void {
    const popupWidth = 300;
    const popupHeight = 300;
    const x = STAGE_WIDTH / 2 - popupWidth / 2;
    const y = STAGE_HEIGHT / 2 - popupHeight / 2;

    const group = new Konva.Group({
      x,
      y,
      visible: false,
      clip: { x: 0, y: 0, width: popupWidth, height: popupHeight }
    });

    const background = new Konva.Rect({
      width: popupWidth,
      height: popupHeight,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 10,
    });

    const text = new Konva.Text({
      x: 20,
      y: 20,
      width: popupWidth - 40,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000",
      wrap: "word",
      align: "left",
    });

    group.add(background, text);
    this.group.add(group);
    this.dictionaryPopupGroup = group;
    this.dictionaryText = text;

    let scrollOffset = 0;
    group.on("wheel", (e) => {
      e.evt.preventDefault();
      scrollOffset -= e.evt.deltaY;
      const minY = Math.min(popupHeight - 40 - text.height(), 0);
      const maxY = 20;
      scrollOffset = Math.max(minY, Math.min(scrollOffset, maxY));
      this.dictionaryText!.y(scrollOffset);
      this.group.getLayer()?.draw();
    });

    this.group.on("mousedown", (e) => {
      if (!this.dictionaryPopupGroup?.visible()) return;
      this.dictionaryPopupGroup.visible(false);
      this.group.getLayer()?.draw();
    });
  }

  private showDictionaryPopup(): void {
    if (!this.dictionaryPopupGroup || !this.dictionaryText) return;

    const entries = Object.entries(globals.dictionary);
    const text = entries.map(([eng, fr]) => `${eng} / ${fr}`).join("\n");
    this.dictionaryText.text(text || "No Words Found!");
    this.dictionaryText.y(20);

    this.dictionaryPopupGroup.visible(true);
    this.dictionaryPopupGroup.moveToTop();
    this.group.getLayer()?.draw();
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
}