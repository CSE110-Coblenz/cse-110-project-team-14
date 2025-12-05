import Konva from "konva";
import type { Item } from "../../../types"; 
import { STAGE_WIDTH, STAGE_HEIGHT, globals } from "../../../constants"; // import globals
import type { Person, DialogueNode } from "../../../types";
import type { ProgressCounts } from "../../../utils/ProgressTracker";

export class StoreMainView {
  //Background / main group
  private group: Konva.Group;
  private backgroundLayer: Konva.Rect;
  private backgroundImage?: Konva.Image;

  //dock / images / character
  private dock: Konva.Rect;
  private englishVocab: Konva.Text;
  private frenchVocab: Konva.Text;
  private phonetic: Konva.Text;
  private progressText: Konva.Text;

  private itemImages: Record<string, Konva.Image> = {};

  private clerkImage?: Konva.Image;
 

  //popup for character
  private popupGroup?: Konva.Group;
  private popupText?: Konva.Text; 
  private popupDialogueIndex = 0; // tracks current line
  private currentDialogue: string[] = []; 

  private onStartClick: () => void;


  constructor(
    onItemClick: (itemName: string) => void,
    onStartClick: () => void
  ) {
  this.group = new Konva.Group({ visible: false });
  this.onStartClick = onStartClick;   // <-- store the second callback

  this.backgroundLayer = this.createbackgroundLayer();
  this.group.add(this.backgroundLayer);

  const { dock, englishText, frenchVocab, phonetic } = this.createDock();
  this.dock = dock;
  this.englishVocab = englishText;
  this.frenchVocab = frenchVocab;
  this.phonetic = phonetic;
  

  this.group.add(dock, englishText, frenchVocab, phonetic);
  this.progressText = new Konva.Text({
    x: 40,
    y: 30,
    fontSize: 20,
    fontFamily: "Arial",
    fill: "#0F172A",
    text: "Items 0 / 0 | People 0 / 0 | Minigame 0 / 0",
  });
  this.group.add(this.progressText);
  // dock.moveToTop();
  // englishText.moveToTop();
  // frenchVocab.moveToTop();
  // phonetic.moveToTop();

  this.createRestaurantButton(); // <-- new button
  this.createPopup(); 
}

//bacground layer (if background doens't load)
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
  //show items from json file
  showItem(items: Item[], onItemClick: (itemName: string) => void): void {
    for (const item of items) {
      Konva.Image.fromURL(item.image, (imgNode) => {
        imgNode.setAttrs({
          x: item.x,
          y: item.y,
          width: 60,
          height: 60,
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
  //updateDock when new item clicked
  updateDock(item: Item): void {
    this.englishVocab.text(item.english);
    this.frenchVocab.text(item.french);
    this.phonetic.text(item.phonetic);
    this.group.getLayer()?.draw();
  }

  //display character
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
  
      //when clicked on, show dialogue from json function called 
      imgNode.on("click", () => {
        this.showDialogue("clerk");
      });
  
      this.group.getLayer()?.draw();
       this.popupGroup?.moveToTop();
    });
  }
  
  //suppose to be scene switcher (doesn't currently work)
  private createRestaurantButton(): void {
    const btnX = STAGE_WIDTH - 240;
    const btnY = 50;
  
    const button = new Konva.Rect({
      x: btnX,
      y: btnY,
      width: 100,
      height: 30,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2
    });
  
    const label = new Konva.Text({
      x: btnX,
      y: btnY + 10,
      width: 100,
      align: "center",
      text: "Restaurant",
      fontSize: 16,
      fontFamily: "Arial",
      fill: "#000000"
    });
  
    // Both text & button respond to click
    const handler = () => this.onStartClick();
    button.on("click", handler);
    label.on("click", handler);
  
    this.group.add(button, label);
  }

  //popup for character dialogue
  private createPopup(): void {
    const popupWidth = 250;
    const popupHeight = 150;
    const x = 375;
    const y = 100;
  
    const group = new Konva.Group({
      x,
      y,
      visible: false
    });
  
    // Background of the popup
    const background = new Konva.Rect({
      width: popupWidth,
      height: popupHeight,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2,
      cornerRadius: 10
    });
  
    // Text inside popup
    const text = new Konva.Text({
      x: 20,
      y: 20,
      width: popupWidth - 40,
      height: popupHeight - 60, 
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#000",
      align: "left",
    });
  
    //switches to next line when clicked 
    const nextLine = new Konva.Text({
      x: 0,
      y: popupHeight - 35,
      width: popupWidth - 20,
      fontSize: 14,
      fontFamily: "Arial",
      fill: "#555",
      align: "right",
    });

    group.on("click", () => {
      if (!this.currentDialogue.length) return;
  
      this.popupDialogueIndex++;
  
      if (this.popupDialogueIndex >= this.currentDialogue.length) {
        this.currentDialogue = [];
        this.popupDialogueIndex = 0;
        group.visible(false); 
      } else {
        text.text(this.currentDialogue[this.popupDialogueIndex]);
      }
  
      group.moveToTop(); 
      this.group.getLayer()?.draw();
    });
  
  
    //allowing the background of the dialogue to change to next sentence too
    background.on("click", () => {
      if (!this.currentDialogue.length) return;
  
      this.popupDialogueIndex++;
  
      if (this.popupDialogueIndex >= this.currentDialogue.length) {
        this.currentDialogue = [];
        this.popupDialogueIndex = 0;
      } else {
        text.text(this.currentDialogue[this.popupDialogueIndex]);
      }
  
      group.moveToTop(); 
      this.group.getLayer()?.draw();
    });
  

    group.add(background, text, nextLine);
    this.group.add(group);
    group.moveToTop();

    this.popupGroup = group;
    this.popupText = text;
  }
  
  //show dialgoue from json file
  async showDialogue(characterName: string): Promise<void> {
    const response = await fetch("Public/ItemImage/Store/dialogue.json");
    const data = await response.json();
  
    this.currentDialogue = data[characterName]?.greeting || ["(No dialogue found)"];
    this.popupDialogueIndex = 0;
  
    this.popupText?.text(this.currentDialogue[this.popupDialogueIndex]);
    this.popupGroup?.visible(true);
    this.popupGroup?.moveToTop();
  
    this.group.getLayer()?.draw();
  }

  updateProgress(counts: ProgressCounts) {
    const { items, people, minigames } = counts;
    this.progressText.text(
      `Items ${items.found} / ${items.total} | People ${people.found} / ${people.total} | Minigame ${minigames.found} / ${minigames.total}`
    );
    this.group.getLayer()?.draw();
  }
  
  
  //for scene switching
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
