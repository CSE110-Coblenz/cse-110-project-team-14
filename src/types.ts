import type { Group } from 'konva/lib/Group';
import { globals } from './constants.js';

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
    | { type: "Intro" }
	| { type: "Restaurant" }
	| { type: "Classroom" }
	| { type: "Store"}
    | { type: "StoreMinigame" }
    | { type: "StoreAssessment" }
    | { type: "ClassroomAssessment" }
    | { type: "RestaurantAssessment" }
    | { type: "Outro" };


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

// export interface Item {
//     name: string;
//     isCorrect: boolean;
//     itemImageSrc: string;
//     x?: number;  // optional
//     y?: number;  // optional
    
// }
export interface Item {
    name: string;
    english: string;
    french: string;
    phonetic: string;
    image: string;
    x: number;
    y: number;
}


export interface Assessment {
    questions: string;
    answers: string[];
    correctAnswerIndex: number;
}


// export interface Person {
//     name: string;
//     role: string;
//     dialogue: string[];
// }

export interface DialogueNode {
    id: string;
    speaker: string;
    text: string;
    action?: "expectItem";         // currently only supporting item expectation
    expectedItem?: string;
    onCorrect?: string;            // next dialogue ID if correct
    onWrong?: string;              // next dialogue ID if wrong
    next?: string | null;          // next dialogue ID for simple progression
}

export interface Person {
    name: string;
    role: string;
    dialogue: Record<string, DialogueNode>;
}

export interface Minigame {
    instructions: string;
    items: Item[];
    isPlayed() : boolean;
}

export abstract class Scene {
    getItems(): Item[] {
        // From where?
        return [];
    }
    nextScene(): Scene | null {
        return null;
    }

    assessment(): Assessment | null {
        return null;
    }
    
    getDictionary(): Record<string, string> | null {
        return globals.dictionary;
    }

    getProgress(): typeof globals.progress {
        return globals.progress;
    }

    person(): Person | null {
        return null;
    }

}

export class ProgressBar {
    private progress: typeof globals.progress;
    
    constructor() {
        this.progress = globals.progress;
    }
    getProgress() {
        return this.progress;
    }

    updateProgress(numItems: number, minigameScore: number, assessmentScore: number) {
        this.progress.numItems += numItems;
        this.progress.minigameScore += minigameScore;
        this.progress.assessmentScore += assessmentScore;
    }

    calculatePercentage(totalItems: number, totalMinigameScore: number, totalAssessmentScore: number): number {
        const itemPercentage = (this.progress.numItems / totalItems) * 100;
        const minigamePercentage = (this.progress.minigameScore / totalMinigameScore) * 100;
        const assessmentPercentage = (this.progress.assessmentScore / totalAssessmentScore) * 100;
        
        // Average the three percentages
        return (itemPercentage + minigamePercentage + assessmentPercentage) / 3;
    }
}

export abstract class Interactable {
    audioSrc: string;
    imgSrc: string;

    constructor(audioSrc: string, imgSrc: string) {
        this.audioSrc = audioSrc;
        this.imgSrc = imgSrc;
    }

    abstract whenClicked(): void;

}