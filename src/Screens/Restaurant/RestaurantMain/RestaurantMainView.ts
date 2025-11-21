import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals} from "../../../constants";
import type { Item } from '../../../types';

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
  private onAssessment: () => void;

  constructor(
    onItemClick: (itemName: string) => void,
    onAssessment: () => void
  ) {
    this.group = new Konva.Group({ visible: false });
    this.onAssessment = onAssessment;

    // Background
    this.backgroundLayer = this.createbackgroundLayer();
    this.group.add(this.backgroundLayer);

    // Dock
    const { dock, englishText, frenchVocab, phonetic } = this.createDock();
  this.dock = dock;
  this.englishVocab = englishText;
  this.frenchVocab = frenchVocab;
  this.phonetic = phonetic;
  this.group.add(dock, englishText, frenchVocab, phonetic);

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

  updateDock(item: Item): void {
    this.englishVocab.text(item.english);
    this.frenchVocab.text(item.french);
    this.phonetic.text(item.phonetic);
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
