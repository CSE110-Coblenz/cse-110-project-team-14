// export interface Item {
//     h: number | undefined;
//     w: number | undefined;
//     name: string;
//     english: string;
//     french: string;
//     phonetic: string;
//     image: string;
//     x: number;
//     y: number;
// }
import type { Item } from "../../../types"; 

export class StoreMainModel {
    private items: Item[] = [];
    private selected_item: Item | null = null;

    async load_items(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        this.items = await response.json();
    }
    get_items(): Item[] {
        return this.items;
    }
    
    select_item(item_name: string):void {
        this.selected_item = this.items.find(i => i.name === item_name) || null;
    }

    get_selected_item(): Item | null {
        return this.selected_item;
    }

}
