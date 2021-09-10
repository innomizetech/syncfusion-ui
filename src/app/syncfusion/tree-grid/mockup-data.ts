import * as faker from 'faker';
import { v4 as uuid } from 'uuid';

export interface Task {
    taskID: string;
    name: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    duration: number;
    priority: string;
    approved: boolean;
    subtasks?: Task[];
}

const getRandomPriority = () => {
    const type = ['High', 'Medium', 'Low'];
    return type[Math.floor(Math.random() * 3)];
};

const generateTasks = (): Task[] => {
    return Array(200)
        .fill(null)
        .map((item, idx) => ({
            taskID: uuid(),
            name: faker.name.findName(),
            startDate: faker.date.past(),
            endDate: faker.date.future(),
            progress: faker.datatype.number({ min: 0, max: 100 }),
            duration: faker.datatype.number({ min: 0, max: 20 }),
            priority: getRandomPriority(),
            approved: faker.datatype.boolean(),
        }));
};

const populateTasks = (tasks: Task[]) => {
    let currentIndex = 1;

    return tasks.reduce((accumulator, currentValue) => {
        currentValue.subtasks = tasks.splice(currentIndex, Math.floor(Math.random() * 5));

        currentIndex += 1;

        return [...accumulator, currentValue];
    }, []);
};

export const tasks: Task[] = populateTasks(generateTasks());
