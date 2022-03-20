import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';


@Directive({
  selector: '[appDragdropfile]'
})
export class DragdropfileDirective {

  @HostBinding('class.fileover') fileOver: boolean = false;
  @Output() fileDropped = new EventEmitter();

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt:any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt:any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt:any) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
    let files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.fileDropped.emit(files);
    }
  }
}
