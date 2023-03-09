import { DOCUMENT } from '@angular/common';
import { ContentChild, Directive, ElementRef, HostListener, Inject } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DragableHandlerDirective } from './dragable-handler.directive';

@Directive({
  selector: '[Dragable]'
})
export class DragableDirective {
  private element: HTMLElement;

  private subscriptions: Subscription[] = [];
// 1 Added
@ContentChild(DragableHandlerDirective) handle: DragableHandlerDirective;



handleElement: HTMLElement;
  constructor(
    private elementRef: ElementRef,
    @Inject(DOCUMENT) private document: any
  ) {}


// 2 Modified
ngAfterViewInit(): void {
  this.element = this.elementRef.nativeElement as HTMLElement;
  this.handleElement = this.handle?.elementRef?.nativeElement || this.element;
  this.initDrag();
}

  initDrag(): void {
    // 1
    const dragStart$ = fromEvent<MouseEvent>(this.handleElement, "mousedown");
    const dragEnd$ = fromEvent<MouseEvent>(this.document, "mouseup");
    const drag$ = fromEvent<MouseEvent>(this.document, "mousemove").pipe(
      takeUntil(dragEnd$)
    );

    // 2
    let initialX: number,
      initialY: number,
      currentX = 0,
      currentY = 0;

    let dragSub: Subscription;

    // 3

    const dragStartSub = dragStart$.subscribe((event: MouseEvent) => {
      initialX = event.clientX - currentX;
      initialY = event.clientY - currentY;
      this.element.classList.add('free-dragging');

      // 4
      dragSub = drag$.subscribe((event: MouseEvent) => {
        event.preventDefault();

        currentX = event.clientX - initialX;
        currentY = event.clientY - initialY;

        this.element.style.transform =
          "translate3d(" + currentX + "px, " + currentY + "px, 0)";
      });
    });
    
    // 5
    const dragEndSub = dragEnd$.subscribe(() => {
      initialX = currentX;
      initialY = currentY;
      this.element.classList.remove('free-dragging');
      if (dragSub) {
        dragSub.unsubscribe();
      }
    });

    // 6
    this.subscriptions.push.apply(this.subscriptions, [
      dragStartSub,
      dragSub,
      dragEndSub,
    ]);

  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s?.unsubscribe());
  }

}