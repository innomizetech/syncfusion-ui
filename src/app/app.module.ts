import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SyncfusionModule } from './syncfusion/syncfusion.module'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SyncfusionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
