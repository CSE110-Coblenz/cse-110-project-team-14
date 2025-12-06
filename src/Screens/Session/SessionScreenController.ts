import { globals } from "../../constants";
import type { ScreenSwitcher } from "../../types";
import { SessionScreenView } from "./SessionScreenView";

export class SessionScreenController {
  private view: SessionScreenView;
  private screenSwitcher: ScreenSwitcher;
  private backgroundLoaded = false; // 🟢 prevent duplicate loads

  constructor(screenSwitcher: ScreenSwitcher) {
    this.screenSwitcher = screenSwitcher;
    this.view = new SessionScreenView();
  }

  start(): Promise<void> {
    // Load background one time when controller starts
    if (!this.backgroundLoaded) {
      this.view.loadBackground("Public/Background/EndSession.png"); // 🟢 CHANGE THIS PATH
      this.backgroundLoaded = true;
    }
    return Promise.resolve();
  }

  show(): void {
    // Compute stats from globals and update the view
    const start = globals.sessionStart ?? Date.now();
    const elapsed = Date.now() - start;
    const words = globals.progress?.numItems ?? 0;
    const minigame = globals.progress?.minigameScore ?? 0;
    const assessment = globals.progress?.assessmentScore ?? 0;
    const minigameTotal = globals.progress?.minigameTotal ?? 0;
    const assessmentTotal = globals.progress?.assessmentTotal ?? 0;

    this.view.update({
      elapsedMs: elapsed,
      wordsLearned: words,
      minigameScore: minigame,
      minigameTotal: minigameTotal,
      assessmentScore: assessment,
      assessmentTotal: assessmentTotal,
    });

    this.view.show();
  }

  hide(): void {
    this.view.hide();
  }

  getView() {
    return this.view;
  }

  private backToMenu(): void {
    this.screenSwitcher.switchToScreen({ type: "Intro" });
  }
}
