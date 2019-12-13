import {Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import * as SimpleMDE from 'simplemde';
import {markdownToHtml, renderMathJax, renderTOC} from '../markdown/markdownToHtml';
import {Router} from '@angular/router';

/**
 * 返回simple类型顶部工具栏
 *
 * @author 吴家荣 <jiarongwu.se@foxmail.com>
 *
 */
function getFullToolbar() {
  return [
    'heading-1', 'heading-2', 'heading-3', 'bold', 'italic',
    '|',
    'quote', 'code', 'link', 'image',
    '|',
    'unordered-list', 'ordered-list',
    '|',
    'preview', 'side-by-side', 'fullscreen',
    '|',
    'guide'
  ];
}

/**
 * 返回simple类型顶部工具栏
 *
 * @author 吴家荣 <jiarongwu.se@foxmail.com>
 *
 */
function getSimpleToolbar() {
  return [
    'heading-1', 'heading-2', 'heading-3', 'bold', 'italic',
    '|',
    'quote', 'code', 'link', 'image',
    '|',
    'unordered-list', 'ordered-list',
    '|',
    'preview',
    '|',
    'guide'
  ];
}

function previewRender(router: Router, markdown: string, preview: HTMLElement) {
  preview.classList.add('markdown-body');
  // 缓存之前的 markdown 文本，防止滚动时重复调用 markdownToHtml 导致页面卡顿
  if ((preview as any).prevMarkdown !== markdown) {
    preview.innerHTML = markdownToHtml(markdown);
    renderTOC(preview, router);
    renderMathJax(preview);
    (preview as any).prevMarkdown = markdown;
  }
  return preview.innerHTML;
}

@Component({
  selector: 'app-markdown-editor',
  templateUrl: './md-editor.component.html',
  styleUrls: ['./md-editor.component.less']
})
export class MdEditorComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:variable-name
  _content = '';

  @Input()
  get content() {
    return this._content;
  }

  set content(val) {
    if (typeof val !== 'string') {
      val = '';
    }
    if (val === this._content) {
      return;
    }
    this._content = val;
    if (this.editor) {
      this.editor.value(this._content);
      this.refresh();
    }
    this.contentChange.emit(this._content);
  }

  @Input()
  type = '';

  @Input()
  uploadUrl = '/api/users/image';

  @Input()
  uploadFieldName = 'image';

  @Input()
  jsonFieldName = 'downloadUrl';

  @Output()
  contentChange: EventEmitter<string> = new EventEmitter<string>();

  private editor: any;

  @ViewChild('simpleMDE', { static: true })
  mdeEle!: ElementRef<HTMLTextAreaElement>;

  constructor(
    @Inject(DOCUMENT) private doc: Document,
    private router: Router,
  ) {}

  private configEditor() {
    this.editor.codemirror.on('change', this.handleMdeChange.bind(this));
  }

  private configInlineAttachment(mde: SimpleMDE) {
    const { uploadUrl, uploadFieldName, jsonFieldName } = this;
    // inlineAttachment.editors.codemirror4.attach(mde.codemirror, {
    //   uploadUrl,
    //   uploadFieldName,
    //   jsonFieldName,
    //   beforeFileUpload(xhr: XMLHttpRequest) {
    //     // xhr.setRequestHeader(CSRF_HEADER_NAME, String(csrfToken));
    //     return true;
    //   }
    // });
  }

  private handleMdeChange(instance: any, changeObj: { origin: string }) {
    const value = this.editor.value();
    if (changeObj.origin !== 'setValue') {
      this._content = value;
      this.contentChange.emit(this._content);
    }
  }

  private initEditor() {
    this.type = this.type || '';
    const types = this.type.split(' ');
    if (types.includes('small')) {
      this.mdeEle.nativeElement.classList.add('mdeditor-height-small');
    } else if (types.includes('large')) {
      this.mdeEle.nativeElement.classList.add('mdeditor-height-large');
    } else {
      this.mdeEle.nativeElement.classList.add('mdeditor-height-median');
    }
    const options = {
      autoDownloadFontAwesome: false,
      spellChecker: false,
      tabSize: 2,
      // toolbar: types.includes('full') ? getFullToolbar() : getSimpleToolbar(),
      // SimpleToolbar 的话，按下 F9 或 F11 会有 bug
      toolbar: getFullToolbar(),
      element: this.mdeEle.nativeElement,
      previewRender: previewRender.bind(null, this.router),
    };
    const editor = this.editor = new SimpleMDE(options);
    this.configInlineAttachment(editor);
    editor.value(this.content);
    // 显示文字
    this.refresh();
  }

  refresh() {
    window.setTimeout(() => this.editor.codemirror.refresh(), 300);
  }

  ngOnInit() {
    this.initEditor();
    this.configEditor();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    document.getElementsByTagName('html').item(0).style.overflow = '';
  }
}
