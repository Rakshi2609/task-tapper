import { ScheduledTask } from "./tasks/scheduled-task";
export declare class TaskRegistry {
    add(task: ScheduledTask): void;
    get(taskId: string): ScheduledTask | undefined;
    remove(task: ScheduledTask): void;
    all(): ScheduledTask[];
    has(taskId: string): boolean;
    killAll(): void;
}
