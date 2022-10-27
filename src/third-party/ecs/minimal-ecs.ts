type Entity = number
abstract class Component { }
abstract class System {
    public abstract componentsRequired: Set<Function>
    public abstract update(entities: Set<Entity>): void
    public ecs: ECS
}
type ComponentClass<T extends Component> = new (...args: any[]) => T
class ComponentContainer {
    private map = new Map<Function, Component>();
    public add(component: Component): void {
        this.map.set(component.constructor, component);
    }
    public get<T extends Component>(componentClass: ComponentClass<T>): T | undefined {
        return this.map.get(componentClass) as T | undefined;
    }
    public has(componentClass: Function): boolean {
        return this.map.has(componentClass);
    }
    public hasAll(componentClasses: Iterable<Function>): boolean {
        for (let cls of componentClasses) {
            if (!this.map.has(cls)) {
                return false;
            }
        }
        return true;
    }
    public delete(componentClass: Function): void {
        this.map.delete(componentClass);
    }
}
class ECS {
    private nextEntityID = 0;
    private entitiesToDestroy = new Array<Entity>();
    private entities = new Map<Entity, ComponentContainer>();
    private systems = new Map<System, Set<Entity>>();
    public addEntity(): Entity {
        let entity = this.nextEntityID;
        this.nextEntityID++;
        this.entities.set(entity, new ComponentContainer());
        return entity;
    }
    public removeEntity(entity: Entity): void {
        this.entitiesToDestroy.push(entity);
    }
    private destroyEntity(entity: Entity): void {
        this.entities.delete(entity);
        for (let entities of this.systems.values()) {
            entities.delete(entity);  // no-op if doesn't have it
        }
    }
    public addComponent(entity: Entity, component: Component): void {
        this.entities.get(entity).add(component);
        this.checkE(entity);
    }
    public getComponents(entity: Entity): ComponentContainer {
        return this.entities.get(entity);
    }
    public removeComponent(entity: Entity, componentClass: Function): void {
        this.entities.get(entity).delete(componentClass);
        this.checkE(entity);
    }
    private checkE(entity: Entity): void {
        for (let system of this.systems.keys()) {
            this.checkES(entity, system);
        }
    }
    private checkES(entity: Entity, system: System): void {
        let have = this.entities.get(entity);
        let need = system.componentsRequired;
        if (have.hasAll(need)) {
            this.systems.get(system).add(entity); // no-op if already has it
        } else {
            this.systems.get(system).delete(entity); // no-op if doesn't have it
        }
    }
    public addSystem(system: System): void {
        if (system.componentsRequired.size == 0) {
            console.warn("System " + system + " not added: empty components list.")
            return;
        }
        system.ecs = this;
        this.systems.set(system, new Set());
        for (let entity of this.entities.keys()) {
            this.checkES(entity, system);
        }
    }
    public removeSystem(system: System): void {
        this.systems.delete(system);
    }
    public update(): void {
        for (let [system, entities] of this.systems.entries()) {
            system.update(entities)
        }
        while (this.entitiesToDestroy.length > 0) {
            this.destroyEntity(this.entitiesToDestroy.pop());
        }
    }
}

export { type Entity, Component, System, ECS }