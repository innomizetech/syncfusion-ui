import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SortService, TreeGridAllModule } from '@syncfusion/ej2-angular-treegrid';
import { DialogModule } from '@syncfusion/ej2-angular-popups';

import { TreeGridComponent } from './tree-grid/tree-grid.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
    imports: [TreeGridAllModule, DialogModule, FormsModule, CommonModule, ReactiveFormsModule],
    declarations: [TreeGridComponent],
    exports: [TreeGridComponent],
    providers: [SortService],
})
export class SyncfusionModule {}
