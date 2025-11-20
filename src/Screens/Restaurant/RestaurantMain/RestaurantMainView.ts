import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";
import type { Item } from "../../../types";
//import type { View } from "../../types.ts";


/**
 * Renders the Restaurant game UI w/ Konva
 */
export class RestaurantMainView {
  private group: Konva.Group;
  private dockGroup = Konva.Group;
  private itemImages: Record<string, Konva.Image> = {};
  private dockText: Konva.Text;
  private dockPhonetic: Konva.Text;
  private background: Konva.Rect;
  

  constructor(onItemClick: (itemName: string) => void) {
    this.group = new Konva.Group({visable: false});
    
    //Temp Background
    this.background = new Konva.Rect({
      x:0,
      y:0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#d3eaf5ff",
    });
    this.group.add(this.background);

    //Dock
    const dockHeight = 100;
    const dock = new Konva.Rect({
      x:200,
      y: STAGE_HEIGHT - dockHeight,
      width: STAGE_WIDTH / 2,
      height: dockHeight,
      fill: "#5c471dff",
      stroke: "black",
      strokeWidth: 2,
    });
    this.group.add(dock);

    this.dockText = new Konva.Text({
      x:300,
      y: STAGE_HEIGHT - dockHeight + 20,
      fontSize: 24,
      fontFamily: "Arial",
      fill: "black",
      text: "Click an item",
    });
    this.group.add(this.dockText);

    this.dockPhonetic = new Konva.Text({
      x:350,
      y: STAGE_HEIGHT - dockHeight + 55,
      fontSize: 20,
      fontFamily: "Arial",
      fill: "black",
    });
    this.group.add(this.dockPhonetic);
  }

  addItems(items: Item[], onItemClick: (itemName: string) => void) : void {
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
        imgNode.on("click", () => onItemClick(item.name));
        this.itemImages[item.name] = imgNode;
        this.group.add(imgNode);
        this.group.getLayer()?.draw();
      });
    });
  }

  updateDock(item:Item): void {
    this.dockText.text(`${item.english} / ${item.french}`);
    this.dockPhonetic.text(`${item.phonetic}`);
    this.group.getLayer()?.draw();
  }


  show(): void {
    this.group.visible(true);
  }

  hide(): void {
    this.group.visible(false);
  }

  getGroup() : Konva.Group {
    return this.group;
  }

  //public render(): void {}
}