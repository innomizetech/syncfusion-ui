import { Component, HostListener, OnInit, ViewChild } from '@angular/core';

import { TreeGridComponent as TreeGrid, ToolbarService, PageService, ExcelExportService, PdfExportService, EditSettingsModel } from '@syncfusion/ej2-angular-treegrid';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';

import { Task, tasks } from './mockup-data';

@Component({
    selector: 'app-tree-grid',
    templateUrl: 'tree-grid.component.html',
    styleUrls: ['tree-grid.component.html'],
})
export class TreeGridComponent implements OnInit {
    @ViewChild('treegrid') public treegrid: TreeGrid;
    @ViewChild('alertDialog') public alertDialog: DialogComponent;

    public tasks: Task[] = [];
    public selectionSettings: object;
    public alertHeader: string = 'Copy with Header';
    public hidden: Boolean = false;
    public target: string = '.control-section';
    public alertWidth: string = '300px';
    public alertContent: string = 'Atleast one row should be selected to copy with header';
    public showCloseIcon: Boolean = false;
    public animationSettings: Object = { effect: 'None' };
    public toolbar: Object[];
    public alertDlgBtnClick = () => {
        this.alertDialog.hide();
    }
    public alertDlgButtons: Object[] = [{ click: this.alertDlgBtnClick.bind(this), buttonModel: { content: 'OK', isPrimary: true } }];
    public editing: EditSettingsModel;
    public contextMenuItems: string[] = [];

    get selectedRows() {
        return this.treegrid.getSelectedRows()
    }

    ngOnInit(): void {
        this.tasks = tasks;
        this.editing = { allowDeleting: true, allowEditing: true, mode: 'Row' };
        this.selectionSettings = { type: 'Multiple' };
        this.toolbar = [{ text: 'Copy', tooltipText: 'Copy', prefixIcon: 'e-copy', id: 'copy' },
        { text: 'Copy With Header', tooltipText: 'Copy With Header', prefixIcon: 'e-copy', id: 'copyHeader' }];
        this.contextMenuItems = ['Copy', 'Paste', 'Edit', 'Delete', 'Save', 'Cancel',];
    }


    @HostListener('window:keydown', ['$event'])
    onKeyPress(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && event.keyCode == 86) {
            this.handlePaste();
        }

        if ((event.ctrlKey || event.metaKey) && event.keyCode == 88) {
            this.handleCut();
        }
    }

    handleCut() {
        console.log('CTRL +  X');
    }

    handlePaste() {
        if (!this.selectedRows.length || !this.treegrid.clipboardModule['copyContent']) {
            return;
        }

        console.log('CTRL +  V');
    }
}