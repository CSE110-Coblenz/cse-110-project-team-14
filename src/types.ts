import type { Group } from 'konva/lib/Group';


export interface View {
    getGroup(): Group;
    show(): void;
    hide(): void;
}

/**
 * Screen types for navigation
 *
 * - "menu": Main menu screen
 * - "game": Gameplay screen
 * - "result": Results screen with final score
 *   - score: Final score to display on results screen
 */
export type Screen =
	| { type: "Restaurant" }
	| { type: "Classroom" }
	| { type: "Store"};


export interface ScreenSwitcher {
    switchToScreen(screenName: string): void;
}

export abstract class ScreenController {
	abstract getView(): View;

	show(): void {
		this.getView().show();
	}

	hide(): void {
		this.getView().hide();
	}
}

export abstract class Scene {
    getItems(): void {
        // From where?
    }
    nextScene(): Scene | null {
        return null;
    }

    // Think this through!!

}