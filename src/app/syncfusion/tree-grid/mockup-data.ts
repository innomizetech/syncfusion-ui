import * as faker from 'faker'
import { v4 as uuid } from 'uuid';

export interface Task {
    taskID: number;
    taskName: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    duration: number;
    approved: boolean;
    priority: string;
    subtasks?: Task[];
}

const generateTasks = (): Task[] => {
    return Array(1000).fill(null).map((item, idx) => ({
        taskID: uuid(),
        taskName: faker.name.findName(),
        startDate: faker.date.past(),
        endDate: faker.date.recent(),
        progress: faker.datatype.number({ min: 0, max: 100 }),
        duration: faker.datatype.number({ min: 0, max: 20 }),
        priority: faker.name.findName(),
        approved: faker.datatype.boolean()
    }))
}


const populateTasks = (tasks: Task[]) => {
    let currentIndex = 1;

    return tasks.reduce((accumulator, currentValue) => {
        currentValue.subtasks = tasks.splice(currentIndex, 2)

        currentIndex += 1;

        return [...accumulator, currentValue]
    }, [])
}

export const tasks: Task[] = populateTasks(generateTasks())
