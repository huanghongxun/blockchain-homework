import { Component, Input, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { markdownToHtml, renderTOC, renderMathJax } from './markdownToHtml';
import { Router } from '@angular/router';

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  styleUrls: ['./markdown.component.less']
})
export class MarkdownComponent implements AfterViewInit {
  // tslint:disable-next-line:variable-name
  private _content = '';
  @Input()
  set content(value: string) {
    if (typeof value !== 'string') {
      value = '';
    }
    this._content = value;
    this.setMarkdown();
  }
  get content() {
    return this._content;
  }

  @ViewChild('markdownArea', { static: false })
  markdown!: ElementRef<HTMLDivElement>;
  @Input()
  showBorder = true;
  @Input()
  hasPaddingTop: boolean | null = null;

  loading = true;

  constructor(
    private router: Router,
    private changeDetector: ChangeDetectorRef,
  ) {}

  private setMarkdown() {
    if (!this.markdown) {
      return;
    }
    const nativeElement = this.markdown.nativeElement as HTMLElement;
    nativeElement.innerHTML = markdownToHtml(this.content);
    renderTOC(nativeElement, this.router);
    renderMathJax(nativeElement);
    if (this.hasPaddingTop == null) {
      this.hasPaddingTop = !nativeElement.firstElementChild || !nativeElement.firstElementChild.tagName.match(/^H[1-6]$/);
    }
    this.loading = false;
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit() {
    this.setMarkdown();
  }
}
