import { AfterViewInit, ContentChild, Directive, ElementRef, Input, OnDestroy } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';

@Directive({
  selector: '[DragableHandler]'
})
export class DragableHandlerDirective{

  constructor(public elementRef: ElementRef<HTMLElement>) {} // Modified
}

