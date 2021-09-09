import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { isEmpty } from 'lodash';

import {
    TreeGridComponent as TreeGrid,
    EditSettingsModel,
    RowDDService,
    SelectionService,
    InfiniteScrollService,
} from '@syncfusion/ej2-angular-treegrid';
import * as _ from 'lodash';
import { v4 as uuid } from 'uuid';

import { Task, tasks } from './mockup-data';

@Component({
    selector: 'app-tree-grid',
    templateUrl: 'tree-grid.component.html',
    styleUrls: ['./tree-grid.component.scss'],
    providers: [RowDDService, SelectionService, InfiniteScrollService],
    encapsulation: ViewEncapsulation.None,
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
    public allowSorting: boolean = false;
    public allowFiltering: boolean = false;
    public frozenColumnIndex: number = 0;
    public customAttributes: any;
    public pageSettings: Object;
    public infiniteScrollSettings: Object;

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
        this.generateContextMenuItems();
        this.customAttributes = { class: 'customcss' };
        this.editing = {
            allowAdding: true,
            allowDeleting: true,
            allowEditing: true,
            mode: 'Row',
        };
    }

    generateContextMenuItems(action?: string, state: boolean = false) {
        this.contextMenuItems = [
            { text: 'Add', target: '.e-content', id: 'context-menu-add-item', iconCss: '' },
            'Edit',
            'Delete',
            { text: 'Copy', target: '.e-content', id: 'context-menu-copy-item' },
            { text: 'Cut', target: '.e-content', id: 'context-menu-cut-item' },
            { text: 'Paste as Sibling', target: '.e-content', id: 'context-menu-paste-sibling-item' },
            { text: 'Paste as Child', target: '.e-content', id: 'context-menu-paste-child-item' },
            {
                text: `${action === 'filter' && state ? 'Disable' : 'Enable'} Filtering`,
                target: '.e-headercontent',
                id: 'filter',
            },
            {
                text: `${action === 'sort' && state ? 'Disable' : 'Enable'} Sorting`,
                target: '.e-headercontent',
                id: 'sort',
            },
            {
                text: `${action === 'freeze' && state ? 'Disable' : 'Enable'} Freeze`,
                target: '.e-headercontent',
                id: 'freeze',
            },
            { text: 'Change Style', target: '.e-headercontent', id: 'changeStyle' },
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
            case 'context-menu-add-item':
                return this.treegrid.editModule.addRecord();
            case 'context-menu-copy-item':
                return this.handleCopy();
            case 'context-menu-cut-item':
                return this.handleCut();
            case 'context-menu-paste-sibling-item':
                return this.handlePaste(false);
            case 'context-menu-paste-child-item':
                return this.handlePaste(true);
            case 'filter':
                this.allowFiltering = !this.allowFiltering;
                this.generateContextMenuItems('filter', this.allowFiltering);
                break;
            case 'sort':
                this.allowSorting = !this.allowSorting;
                this.generateContextMenuItems('sort', this.allowSorting);
                break;
            case 'freeze':
                if (this.frozenColumnIndex) {
                    this.frozenColumnIndex = 0;
                    this.generateContextMenuItems('freeze', false);
                } else {
                    this.frozenColumnIndex = args['column']['index'] + 1;
                    this.generateContextMenuItems('freeze', !!this.frozenColumnIndex);
                }
                break;
            case 'changeStyle':
                const filedName = args['column']['field'];
                if (!isEmpty(this.treegrid.getColumnByField(filedName)?.customAttributes)) {
                    this.treegrid.getColumnByField(filedName).customAttributes = {};
                } else {
                    this.treegrid.getColumnByField(filedName).customAttributes = this.customAttributes;
                }

                this.treegrid.refreshColumns();
                break;
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

    handlePaste(isPasteAsChild: boolean) {
        if (!this.selectedRows.length || !this.treegrid.clipboardModule['copyContent']) {
            return;
        }

        const filterRecords: any = this.selectedRecords.filter(
            (record: any) => !_.map(this.copiedRecords, 'taskID').includes(record.taskID),
        );

        let cloneTasks = _.clone(this.tasks);

        for (const record of filterRecords) {
            const path = this.findPath(isPasteAsChild ? record.taskID : record.parentItem.taskID);

            _.set(cloneTasks, `${path}.subtasks`, [
                ...(_.get(cloneTasks, `${path}.subtasks`) || []),
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
                return { path, success: true };
            }

            if (tree.subtasks) {
                let result = { success: false, path: null };

                for (const [index, task] of tree.subtasks.entries()) {
                    result = findInTree(id, task, path + '.subtasks' + '[' + index + ']');

                    if (result.success) {
                        return result;
                    }
                }

                return result;
            }

            return { success: false, path: null };
        };

        for (const [index, task] of this.tasks.entries()) {
            const { success, path } = findInTree(taskID, task);

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

    actionComplete(agrs) {
        if (agrs.action === 'add') {
            console.log('Added');
            console.log('Added data:', agrs.data);
        }
        if (agrs.action === 'edit') {
            console.log('Edited');
            console.log('Edited data:', agrs.data);
        }
        if (!agrs.action && agrs.requestType === 'delete') {
            console.log('Deleted');
            console.log('Deleted data:', agrs.data);
        }
    }
}
