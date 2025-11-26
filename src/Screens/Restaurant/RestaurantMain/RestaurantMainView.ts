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

  // Dictionary popup
  private dictionaryPopupGroup?: Konva.Group;
  private dictionaryText?: Konva.Text;

  constructor(
    onItemClick: (itemName: string) => void,
    onAssessment: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.dockGroup = new Konva.Group();
    this.onAssessment = onAssessment;

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

    // Assessment button
    const buttonWidth = 180;
    const buttonHeight = 50;
    const buttonX = STAGE_WIDTH - buttonWidth - 40;
    const buttonY = 40;

    const button = new Konva.Rect({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      fill: "#8bc34aff",
      cornerRadius: 10,
      stroke: "black",
      strokeWidth: 2,
    });

    const buttonText = new Konva.Text({
      x: buttonX + 20,
      y: buttonY + 12,
      text: "Start Assessment",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "black",
    });

    const handler = () => this.onAssessment();
    button.on("click", handler);
    buttonText.on("click", handler);

    this.group.add(button, buttonText);

    // Create dictionary button & popup
    this.createDictionaryButton();
    this.createDictionaryPopup();
  }

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

  // ------------------ Dictionary Implementation ------------------
  private createDictionaryButton(): void {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonX = 40; // left side
    const buttonY = 40;

    const button = new Konva.Rect({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      fill: "#2196f3",
      cornerRadius: 10,
      stroke: "black",
      strokeWidth: 2,
    });

    const buttonText = new Konva.Text({
      x: buttonX,
      y: buttonY + (buttonHeight - 20) / 2,
      width: buttonWidth,
      align: "center",
      text: "Dictionary",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "white",
    });

    const handler = () => this.showDictionaryPopup();
    button.on("click", handler);
    buttonText.on("click", handler);

    this.group.add(button, buttonText);
  }

  private createDictionaryPopup(): void {
    const popupWidth = 300;
    const popupHeight = 300;
    const x = STAGE_WIDTH / 2 - popupWidth / 2;
    const y = STAGE_HEIGHT / 2 - popupHeight / 2;

    const group = new Konva.Group({
      x,
      y,
      visible: false,
      clip: {
        x: 0,
        y: 0,
        width: popupWidth,
        height: popupHeight,
      },
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
      align: "left",
      wrap: "word",
    });

    group.add(background, text);
    this.group.add(group);

    this.dictionaryPopupGroup = group;
    this.dictionaryText = text;

    // Scroll state
    let scrollOffset = 0;
    const updateScroll = (dy: number) => {
      if (!this.dictionaryText) return;

      scrollOffset -= dy;

      const minY = Math.min(popupHeight - 40 - text.height(), 0);
      const maxY = 20;

      if (scrollOffset < minY) scrollOffset = minY;
      if (scrollOffset > maxY) scrollOffset = maxY;

      this.dictionaryText.y(scrollOffset);
      this.group.getLayer()?.draw();
    };

    group.on("wheel", (e) => {
      e.evt.preventDefault();
      updateScroll(e.evt.deltaY);
    });

    group.name("dictionaryPopup");

    // Click outside to close
    this.group.on("mousedown", (e) => {
      if (!this.dictionaryPopupGroup?.visible()) return;
      if (!e.target.hasName("dictionaryPopup")) {
        this.dictionaryPopupGroup.visible(false);
        this.group.getLayer()?.draw();
      }
    });
  }

  private showDictionaryPopup(): void {
    if (!this.dictionaryPopupGroup || !this.dictionaryText) return;

    const entries = Object.entries(globals.dictionary);
    const textContent = entries.map(([english, french]) => `${english} / ${french}`).join("\n");

    this.dictionaryText.text(textContent || "No Words Found!");
    this.dictionaryText.y(20); // reset scroll
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
