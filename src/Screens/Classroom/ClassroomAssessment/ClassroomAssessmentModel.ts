import type { Item, Person } from "../../../types";

const CLASSROOM_SCENE_PATH = "/data/classroomScene.json";

interface ClassroomScenePayload {
  items: Item[];
  person: Person;
}

/**
 * Loads the classroom scene configuration (items + conversational character).
 */
export class ClassroomAssessmentModel {
  private items: Item[] = [];
  private person: Person | null = null;
  private selectedItem: Item | null = null;

  async loadScene(): Promise<void> {
    if (this.items.length > 0 && this.person) {
      return;
    }
    const response = await fetch(CLASSROOM_SCENE_PATH);
    if (!response.ok) {
      throw new Error("Failed to load classroom scene data.");
    }
    const payload = (await response.json()) as ClassroomScenePayload;
    this.items = payload.items;
    this.person = payload.person;
  }

  getItems(): Item[] {
    return this.items;
  }

  getPerson(): Person {
    if (!this.person) {
      throw new Error("Classroom person not loaded.");
    }
    return this.person;
  }

  selectItem(name: string): void {
    this.selectedItem = this.items.find((item) => item.name === name) ?? null;
  }

  getSelectedItem(): Item | null {
    return this.selectedItem;
  }
}
