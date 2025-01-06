export class Category {
    constructor(id, name, color, description = '') {
        this.id = id;
        this.name = name;
        this.color = color;
        this.description = description;
    }

    static fromJSON(json) {
        return new Category(
            json.id,
            json.name,
            json.color,
            json.description
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            description: this.description
        };
    }
}