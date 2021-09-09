import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import {
    TreeGridComponent as TreeGrid,
    EditSettingsModel,
    RowDDService,
    SelectionService,
} from '@syncfusion/ej2-angular-treegrid';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { Task, tasks } from './mockup-data';

@Component({
    selector: 'app-tree-grid',
    templateUrl: 'tree-grid.component.html',
    styleUrls: ['./tree-grid.component.scss'],
    providers: [RowDDService, SelectionService],
})
export class TreeGridComponent implements OnInit {
    @ViewChild('treegrid') public treegrid: TreeGrid;

    public tasks: Task[] = [];
    public selectionSettings: object;
    public contextMenuItems: Object[] = [];
    public copiedRows: any = [];
    public copiedRecords: any[] = [];
    public isCut: boolean;
    public editing: EditSettingsModel;

    get selectedRows(): any[] {
        return this.treegrid.getSelectedRows();
    }

    get selectedRecords(): any[] {
        return this.treegrid.getSelectedRecords();
    }

    getDataUid(item) {
        return item.getAttribute('data-uid');
    }

    ngOnInit(): void {
        this.tasks = tasks;
        this.selectionSettings = { type: 'Multiple' };
        this.editing = {
            allowAdding: true,
            allowDeleting: true,
            allowEditing: true,
            mode: 'Row',
        };
        this.contextMenuItems = [
            'AddRow',
            'Edit',
            'Delete',
            { text: 'Copy', target: '.e-content', id: 'context-menu-copy-item' },
            { text: 'Cut', target: '.e-content', id: 'context-menu-cut-item' },
            { text: 'Paste', target: '.e-content', id: 'context-menu-paste-item' },
        ];
    }

    onSelected() {
        const selectedRows = this.selectedRows;

        this.copiedRows.forEach((item: any) => {
            if (!selectedRows.map((row) => this.getDataUid(row)).includes(this.getDataUid(item))) {
                Array.from(item.children).forEach((child: any) => {
                    child.style.background = null;
                });
            }
        });
    }

    contextMenuClick(args) {
        switch (args.item.id) {
            case 'context-menu-copy-item':
                return this.handleCopy();
            case 'context-menu-cut-item':
                return this.handleCut();
            case 'context-menu-paste-item':
                return this.handlePaste();
                ``;
        }
    }

    @HostListener('window:keydown', ['$event'])
    onKeyPress(event) {
        if (event.ctrlKey || event.metaKey) {
            switch (event.keyCode) {
                case 67:
                    return this.handleCopy();
                case 86:
                    return this.handlePaste();
                case 88:
                    return this.handleCut();
            }
        }
    }

    getCopiedRecords() {
        const parents = this.selectedRecords.reduce((accumulator, currentValue) => {
            if (currentValue.subtasks) {
                return [...accumulator, ...currentValue.subtasks];
            }

            return accumulator;
        }, []);

        return this.selectedRecords.filter((item) => !parents.map((item) => item.taskID).includes(item.taskID));
    }

    handleCopy(isCut?: boolean) {
        this.copiedRows = [...this.selectedRows];
        this.copiedRecords = this.getCopiedRecords();
        this.isCut = isCut;

        this.selectedRows.forEach((row) => {
            Array.from(row.children).forEach((child: any) => {
                child.style.background = isCut ? '#f47ca5' : '#8a87db';
            });
        });

        this.treegrid.copy();
    }

    handleCut() {
        this.handleCopy(true);
    }

    handlePaste() {
        if (!this.selectedRows.length || !this.treegrid.clipboardModule['copyContent']) {
            return;
        }

        const filterRecords: any = this.selectedRecords.filter(
            (record: any) => !_.map(this.copiedRecords, 'taskID').includes(record.taskID),
        );

        let cloneTasks = _.clone(this.tasks);

        for (const record of filterRecords) {
            const path = this.findPath(record.subtasks ? record.taskID : record.parentItem.taskID);

            _.set(cloneTasks, `${path}.subtasks`, [
                ..._.get(cloneTasks, `${path}.subtasks`),
                ...this.copiedRecords.map((record) => this.populateTask(record)),
            ]);
        }

        if (this.isCut) {
            for (const record of this.copiedRecords) {
                if (!record.parentItem) {
                    cloneTasks = cloneTasks.filter((item) => item.taskID !== record.taskID);

                    continue;
                }

                const path = this.findPath(record.parentItem.taskID);

                _.set(
                    cloneTasks,
                    `${path}.subtasks`,
                    _.get(cloneTasks, `${path}.subtasks`).filter((item) => item.taskID !== record.taskID),
                );
            }
        }

        this.tasks = [...cloneTasks];
    }

    findPath(taskID) {
        const findInTree = (id, tree, path = '') => {
            if (tree.taskID === id) {
                return { success: true, path };
            }

            if (!tree.subtasks) {
                return;
            }

            for (const [index, task] of tree.subtasks.entries()) {
                if (task.taskID === id) {
                    return { success: true, path: `${path}.subtasks[${index}]` };
                }

                const result = findInTree(id, task, path + '.subtasks' + '[' + index + ']');

                if (result) {
                    return result;
                }
            }

            return { success: false };
        };

        for (const [index, task] of this.tasks.entries()) {
            const { success = null, path } = findInTree(taskID, task);

            if (success) {
                return `[${index}]${path}`;
            }
        }
    }

    populateTask(record): Task {
        return {
            taskID: uuid(),
            name: record.name,
            startDate: record.startDate,
            endDate: record.endDate,
            progress: record.progress,
            duration: record.duration,
            priority: record.priority,
            approved: record.approved,
            subtasks: record.subtasks,
        };
    }
}
