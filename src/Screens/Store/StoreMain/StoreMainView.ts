import Konva from "konva";
import { STAGE_HEIGHT, STAGE_WIDTH, globals } from "../../../constants"; // import globals
import type { Item } from "../../../types";
import { FrenchTTS } from "../../../utils/texttospeech";

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

  private itemImages: Record<string, Konva.Image> = {};

  private clerkImage?: Konva.Image;


  private dictionaryPopupGroup?: Konva.Group;
  private dictionaryText?: Konva.Text;
 

  //popup for character
  private popupGroup?: Konva.Group;
  private popupText?: Konva.Text; 
  private popupDialogueIndex = 0; // tracks current line
  private currentDialogue: string[] = []; 

  private onStartClick: () => void;
  private onBackClick!: () => void;
  private dialogueCompleteHandler?: () => void;
  private dialogueCompleted = false;
  private progressBarGroup!: Konva.Group;
  private progressBarBg!: Konva.Rect;
  private progressBarFill!: Konva.Rect;
  private progressHoverText!: Konva.Text;
  private progressTotals = { found: 0, total: 0 };


constructor(
  onItemClick: (itemName: string) => void,
  onStartClick: () => void,
  onBackClick: () => void
) {
  this.group = new Konva.Group({ visible: false });
  this.onStartClick = onStartClick;   // <-- store the second callback
  this.onBackClick = onBackClick;     // <-- store the back button callback

  this.backgroundLayer = this.createbackgroundLayer();
  this.group.add(this.backgroundLayer);

  const { dock, englishText, frenchVocab, phonetic } = this.createDock();
  this.dock = dock;
  this.englishVocab = englishText;
  this.frenchVocab = frenchVocab;
  this.phonetic = phonetic;
  

  this.group.add(dock, frenchVocab, englishText, phonetic);
  // dock.moveToTop();
  // englishText.moveToTop();
  // frenchVocab.moveToTop();
  // phonetic.moveToTop();

  this.createRestaurantButton(); // <-- new button
  this.createPopup(); 
  this.createDictionaryButton();
  this.createDictionaryPopup();
  this.createBackButton();
  this.createProgressBar();
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
      x: dockX + sectionWidth,
      y: textY,
      width: sectionWidth,
      align: "center",
      fontSize: 24,
      fontFamily: "Times New Roman",
      fill: "#000",
    });

    const frenchVocab = new Konva.Text({
      x: dockX,
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
          width: 90,
          height: 90,
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
          // Speak French word and definition
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
        // Speak first dialogue line in French (async)
        setTimeout(async () => {
          const response = await fetch("Public/ItemImage/Store/dialogue.json");
          const data = await response.json();
          const lines = data["clerk"]?.greeting || [];
        }, 300);
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
      width: 0,
      height: 0,
      fill: "#ffffff",
      stroke: "#000",
      strokeWidth: 2
    });
  
    const label = new Konva.Text({
      x: btnX,
      y: btnY + 10,
      width: 100,
      align: "center",
      text: "",
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

private createBackButton(): void {
  const buttonWidth = 180;
  const buttonHeight = 50;
  const btnX = 30;     // Left side like classroom
  const btnY = 24;     // Top bar position

  const group = new Konva.Group({ x: btnX, y: btnY });

  const rect = new Konva.Rect({
    width: buttonWidth,
    height: buttonHeight,
    cornerRadius: 14,
    fill: "#1D4ED8",           // Classroom blue
    stroke: "#0F172A",
    strokeWidth: 2,
    shadowColor: "rgba(0,0,0,0.3)",
    shadowBlur: 8,
    shadowOffsetY: 3,
  });

    const text = new Konva.Text({
      width: buttonWidth,
      height: buttonHeight,
      align: "center",
      verticalAlign: "middle",
      text: "Change Scenes",
    fontSize: 20,
    fontFamily: "Arial",
    fill: "#FFFFFF",
    fontStyle: "bold",
    listening: false
  });

  // Wire click handler
  group.on("click tap", () => this.onBackClick());
  group.on("mouseenter", () => document.body.style.cursor = "pointer");
  group.on("mouseleave", () => document.body.style.cursor = "default");

  group.add(rect, text);
  this.group.add(group);

  group.moveToTop(); // ensure visible above everything
}



  //popup for character dialogue
  private createPopup(): void {
    const popupWidth = 250;
    const popupHeight = 150;
    const x = 775;
    const y = 200;
  
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

    const advanceDialogue = () => {
      if (!this.currentDialogue.length) return;

      this.popupDialogueIndex++;

      if (this.popupDialogueIndex >= this.currentDialogue.length) {
        this.currentDialogue = [];
        this.popupDialogueIndex = 0;
        group.visible(false);
        if (!this.dialogueCompleted) {
          this.dialogueCompleted = true;
          this.dialogueCompleteHandler?.();
        }
      } else {
        text.text(this.currentDialogue[this.popupDialogueIndex]);
        FrenchTTS.speak(this.currentDialogue[this.popupDialogueIndex], "en-US");
      }

      group.moveToTop();
      this.group.getLayer()?.draw();
    };

    group.on("click", advanceDialogue);
  
  
    //allowing the background of the dialogue to change to next sentence too
    background.on("click", advanceDialogue);
  

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
  
    // resolve player name from globals or localStorage
    this.currentDialogue = data[characterName]?.greeting || ["(No dialogue found)"];
    this.popupDialogueIndex = 0;
    this.dialogueCompleted = false;
  
    this.popupText?.text(this.currentDialogue[this.popupDialogueIndex]);
    this.popupGroup?.visible(true);
    this.popupGroup?.moveToTop();
    // Speak first dialogue line
    if (this.currentDialogue.length > 0) FrenchTTS.speak(this.currentDialogue[0], "en-US");

    this.group.getLayer()?.draw();
  }

  setOnDialogueComplete(handler: () => void) {
    this.dialogueCompleteHandler = handler;
  }

  updateTotalProgress(found: number, total: number) {
    this.progressTotals = { found, total };
    const ratio = total === 0 ? 0 : found / total;
    this.progressBarFill.width(this.progressBarBg.width() * ratio);
    this.group.getLayer()?.draw();
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
  

  //dictionary button
  private createDictionaryButton(): void {
    const buttonWidth = 180;
    const buttonHeight = 50;
    const btnX = 300;
    const btnY = 24;

    const group = new Konva.Group({ x: btnX, y: btnY });

    const rect = new Konva.Rect({
      width: buttonWidth,
      height: buttonHeight,
      cornerRadius: 14,
      fill: "#1D4ED8",
      stroke: "#0F172A",
      strokeWidth: 2,
      shadowColor: "rgba(0,0,0,0.3)",
      shadowBlur: 8,
      shadowOffsetY: 3,
    });

    const text = new Konva.Text({
      width: buttonWidth,
      height: buttonHeight,
      align: "center",
      verticalAlign: "middle",
      text: "Dictionary",
      fontSize: 20,
      fontFamily: "Arial",
      fill: "#FFFFFF",
      fontStyle: "bold",
      listening: false,
    });

    group.on("click tap", () => this.showDictionaryPopup());
    group.on("mouseenter", () => (document.body.style.cursor = "pointer"));
    group.on("mouseleave", () => (document.body.style.cursor = "default"));

    group.add(rect, text);
    this.group.add(group);
    group.moveToTop();
  }


  private createDictionaryPopup(): void {
    const popupWidth = 300;
    const popupHeight = 300;
    const x = STAGE_WIDTH / 2 - popupWidth / 2;
    const y = STAGE_HEIGHT / 2 - popupHeight / 2;
  
    // Group with clipping
    const group = new Konva.Group({
      x,
      y,
      visible: false,
      clip: {
        x: 0,
        y: 0,
        width: popupWidth,
        height: popupHeight,
      }
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
  
      scrollOffset -= dy; // moving wheel down should move text up
  
      const minY = Math.min(popupHeight - 40 - text.height(), 0); // bottom limit
      const maxY = 20; // top limit
  
      if (scrollOffset < minY) scrollOffset = minY;
      if (scrollOffset > maxY) scrollOffset = maxY;
  
      this.dictionaryText.y(scrollOffset);
      this.group.getLayer()?.draw();
    };
  
    // Wheel event
    group.on("wheel", (e) => {
      e.evt.preventDefault(); // prevent page scroll
      updateScroll(e.evt.deltaY);
    });
  
    group.name("dictionaryPopup");
  
    // Click outside to closea
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
  
    // Reset scroll position
    this.dictionaryText.y(20);
  
    this.dictionaryPopupGroup.visible(true);
    this.dictionaryPopupGroup.moveToTop();
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
