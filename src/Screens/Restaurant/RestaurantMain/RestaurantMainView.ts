import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals } from "../../../constants";
import type { Item } from '../../../types';
import { FrenchTTS } from "../../../utils/texttospeech";

export class RestaurantMainView {
  //Background / main group
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;
  private backgroundImage?: Konva.Image;

  //dock / images / character
  private dock: Konva.Rect;
  private englishVocab: Konva.Text;
  private frenchVocab: Konva.Text;
  private phonetic: Konva.Text;
  private itemImages: Record<string, Konva.Image> = {};
  private progressBarGroup!: Konva.Group;
  private progressBarBg!: Konva.Rect;
  private progressBarFill!: Konva.Rect;
  private progressHoverText!: Konva.Text;
  private progressTotals = { found: 0, total: 0 };

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
    this.onAssessment = onAssessment;
    this.onBackClick = onBackClick;

    // Background
    this.backgroundLayer = this.createbackgroundLayer();
    this.group.add(this.backgroundLayer);
    
    //Dock
    const { dock, englishText, frenchVocab, phonetic } = this.createDock();
    this.dock = dock;
    this.englishVocab = englishText;
    this.frenchVocab = frenchVocab;
    this.phonetic = phonetic;
    this.group.add(dock, englishText, frenchVocab, phonetic);

    // NAV BAR BUTTONS
    this.createNavigationButtons();
    this.createAssessmentButton();

    // Dictionary popup
    this.createDictionaryPopup();
    this.createProgressBar();
  }


  // -----------------------------
  // ITEM HANDLING
  // -----------------------------
  addItems(items: Item[], onItemClick: (itemName: string) => void): void {
    for (const item of items) {
      Konva.Image.fromURL(item.image, (imgNode) => {
        imgNode.setAttrs({
          x: item.x,
          y: item.y,
          width: 150,
          height: 150,
          name: item.name,
          image: imgNode.image(),
        });
        //dictionary implentation when clicking on item
                imgNode.on("click", () => {
                  if (!globals.dictionary[item.english]) {
                    globals.dictionary[item.english] = item.french;
                    console.log(globals.dictionary);
                  }
                  onItemClick(item.name);
                  FrenchTTS.speak(item.french, "fr-FR");
                });
        
                this.itemImages[item.name] = imgNode;
                this.group.add(imgNode);
                
                //puts dock on top of images, top layer
                this.dock.moveToTop();
                this.englishVocab.moveToTop();
                this.frenchVocab.moveToTop();
                this.phonetic.moveToTop();
        
                this.group.getLayer()?.draw();
      });
    }
  }
  private createbackgroundLayer(): Konva.Rect {
      return new Konva.Rect({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        fill: "#ffffff",
        stroke: "#000000",
        strokeWidth: 1,
      });
    }


  //Load background from png
  loadBackground(imageUrl: string): void {
    Konva.Image.fromURL(imageUrl, (imgNode) => {
      imgNode.setAttrs({
        x: 0,
        y: 0,
        width: STAGE_WIDTH,
        height: STAGE_HEIGHT,
        image: imgNode.image()
      });
  
      this.backgroundImage = imgNode;
  
      this.group.add(imgNode);
      imgNode.moveToBottom();
      this.backgroundLayer.moveToBottom();
  
      this.group.getLayer()?.draw();
    });
  }

  //creates dock
    private createDock() {
      const dockHeight = 75;
      const dockWidth = STAGE_WIDTH * 0.8;
      const dockX = (STAGE_WIDTH - dockWidth) / 2;
      const dockY = STAGE_HEIGHT - dockHeight - 40;
  
      const dock = new Konva.Rect({
        x: dockX,
        y: dockY,
        width: dockWidth,
        height: dockHeight,
        fill: "#fafafa",
        cornerRadius: 12,
        stroke: "#000000",
        strokeWidth: 2,
      });
  
      const sectionWidth = dockWidth / 3;
      const textY = dockY + 25;
  
      const englishText = new Konva.Text({
        x: dockX,
        y: textY,
        width: sectionWidth,
        align: "center",
        fontSize: 24,
        fontFamily: "Times New Roman",
        fill: "#000",
      });
  
      const frenchVocab = new Konva.Text({
        x: dockX + sectionWidth,
        y: textY,
        width: sectionWidth,
        align: "center",
        fontSize: 24,
        fontFamily: "Times New Roman",
        fill: "#000",
      });
  
      const phonetic = new Konva.Text({
        x: dockX + sectionWidth * 2,
        y: textY,
        width: sectionWidth,
        align: "center",
        fontSize: 20,
        fontFamily: "Times New Roman",
        fill: "#555",
      });
      
      return { dock, englishText, frenchVocab, phonetic };
    }

  updateTotalProgress(found: number, total: number) {
    this.progressTotals = { found, total };
    const ratio = total === 0 ? 0 : found / total;
    this.progressBarFill.width(this.progressBarBg.width() * ratio);
    this.group.getLayer()?.draw();
  }

  updateDock(item: Item): void {
    this.englishVocab.text(item.english);
    this.frenchVocab.text(item.french);
    this.phonetic.text(item.phonetic);
    this.group.getLayer()?.draw();
  }


  // -----------------------------
  // TOP NAV BAR BUTTONS
  // -----------------------------
  private createNavigationButtons(): void {
    const btnY = 24;

    const backBtn = this.createNavButton("Change Scenes", 30, btnY, () => this.onBackClick());
    this.group.add(backBtn);
    const dictBtn = this.createNavButton("Dictionary", 240, btnY, () =>
      this.showDictionaryPopup()
    );
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

  private createProgressBar() {
    const barWidth = 240;
    const barMargin = 80;
    this.progressBarGroup = new Konva.Group({
      x: STAGE_WIDTH - barWidth - barMargin,
      y: 20,
    });
    this.progressBarBg = new Konva.Rect({
      width: barWidth,
      height: 18,
      cornerRadius: 9,
      fill: "#1d4ed8",
      opacity: 0.25,
      listening: false,
    });
    this.progressBarFill = new Konva.Rect({
      width: 0,
      height: 18,
      cornerRadius: 9,
      fill: "#1d4ed8",
      listening: false,
    });
    this.progressHoverText = new Konva.Text({
      width: barWidth,
      height: 18,
      align: "center",
      verticalAlign: "middle",
      fontSize: 12,
      fontFamily: "Arial",
      fill: "#0f172a",
      visible: false,
      listening: false,
    });
    this.progressBarGroup.add(
      this.progressBarBg,
      this.progressBarFill,
      this.progressHoverText
    );
    this.progressBarGroup.on("mouseenter", () => {
      this.progressHoverText.text(
        `${this.progressTotals.found} / ${this.progressTotals.total} tasks`
      );
      this.progressHoverText.visible(true);
      this.group.getLayer()?.draw();
    });
    this.progressBarGroup.on("mouseleave", () => {
      this.progressHoverText.visible(false);
      this.group.getLayer()?.draw();
    });
    this.group.add(this.progressBarGroup);
  }
}
