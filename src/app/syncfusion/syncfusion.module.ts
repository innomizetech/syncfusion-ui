import { NgModule } from '@angular/core';

import { SortService, TreeGridAllModule } from '@syncfusion/ej2-angular-treegrid';
import { DialogModule } from '@syncfusion/ej2-angular-popups';

import { TreeGridComponent } from './tree-grid/tree-grid.component'

@NgModule({
    imports: [TreeGridAllModule, DialogModule],
    declarations: [TreeGridComponent],
    exports: [TreeGridComponent],
    providers: [SortService]
})
export class SyncfusionModule { }
