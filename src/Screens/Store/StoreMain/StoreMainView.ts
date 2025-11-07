import Konva from "konva";
import type { Item } from "./StoreMainModel";
import { STAGE_WIDTH, STAGE_HEIGHT, globals } from "../../../constants"; // import globals
import type { Person, DialogueNode } from "../../../types";

export class StoreMainView {
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;
  private englishVocab: Konva.Text;
  private frenchVocab: Konva.Text;
  private phonetic: Konva.Text;
  private itemImages: Record<string, Konva.Image> = {};
  private dock: Konva.Rect;
  private clerkImage?: Konva.Image;

  constructor(onItemClick: (itemName: string) => void) {
    this.group = new Konva.Group({ visible: false });

    this.backgroundLayer = this.createbackgroundLayer();
    this.group.add(this.backgroundLayer);

    const { dock, englishText, frenchVocab, phonetic } = this.createDock();
    this.dock = dock;
    this.englishVocab = englishText;
    this.frenchVocab = frenchVocab;
    this.phonetic = phonetic;

    this.group.add(dock, englishText, frenchVocab, phonetic);
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



  showItem(items: Item[], onItemClick: (itemName: string) => void): void {
    for (const item of items) {
      Konva.Image.fromURL(item.image, (imgNode) => {
        imgNode.setAttrs({
          x: item.x,
          y: item.y,
          width: 75,
          height: 75,
          name: item.name,
          image: imgNode.image(),
        });

        imgNode.on("click", () => {
          // Add item to dictionary (English → French) if not already added
          if (!globals.dictionary[item.english]) {
            globals.dictionary[item.english] = item.french;
            console.log(globals.dictionary);

          }

          // Call external click callback
          onItemClick(item.name);
        });

        this.itemImages[item.name] = imgNode;
        this.group.add(imgNode);
        this.group.getLayer()?.draw();
      });
    }
  }

  showClerk(imageUrl: string, x: number, y: number, width: number, height: number): void {
    Konva.Image.fromURL(imageUrl, (imgNode) => {
      imgNode.setAttrs({
        x,
        y,
        width,
        height,
        image: imgNode.image(),
      });
      this.clerkImage = imgNode;
      this.group.add(imgNode);
      this.group.getLayer()?.draw();
    });
  }

  updateDock(item: Item): void {
    this.englishVocab.text(item.english);
    this.frenchVocab.text(item.french);
    this.phonetic.text(item.phonetic);
    this.group.getLayer()?.draw();
  }

  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
