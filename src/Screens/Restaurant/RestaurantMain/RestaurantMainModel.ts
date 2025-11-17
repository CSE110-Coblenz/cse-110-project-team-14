import {Item} from '../../../types';


export class RestaurantMainModel {
    private items: Item[] = [];
    private selected_item: Item | null = null;


    /**
     * Load items from Json file
     */
    async load_items(jsonPath: string): Promise<void> {
        const response = await fetch(jsonPath);
        this.items = await response.json();
    }

    /**
     * Get all the items
     */
    get_items(): Item[] {
        return this.items;
    }


    /**
     * SET the selected item
     */
    select_item(item_name: string):void {
        this.selected_item = this.items.find(i => i.name === item_name) || null;
    }

    /**
     * GET the selected item
     */
    get_selected_item(): Item | null {
        return this.selected_item;
    }

}
