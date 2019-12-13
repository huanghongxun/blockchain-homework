import * as showdown from 'showdown';
import xssFilter from './showdown-xss-filter';
import * as highlight from 'showdown-highlight';
import { Router } from '@angular/router';

declare const MathJax: any;

function getHn(el: Element) {
  return Number.parseInt(el.tagName.slice(1), 10);
}

export function renderMathJax(el: HTMLElement) {
  if ((window as any).MathJax) {
    MathJax.Hub.Typeset(el);
  } else {
    console.warn('MathJax 没有加载，无法正常渲染公式');
  }
}

function _renderTOC(el: HTMLElement, router: Router) {
  // 获得 markdownId
  if (el.getAttribute('markdownId') === null) {
    const id = Math.max(
      0,
      ...Array.from(document.querySelectorAll('div[markdownId]'))
        .map(m => Number.parseInt(m.getAttribute('markdownId'), 10)),
    );
    el.setAttribute('markdownId', String(id + 1));
  }
  const markdownId = el.getAttribute('markdownId');

  // h1 ~ h6
  const hnElements = Array.from(el.children).filter<HTMLElement>(
    (elem: Element): elem is HTMLElement =>
      /^H[1-6]$/.test(elem.tagName) && elem.textContent !== null && elem.textContent.trim().length > 0,
  );
  // 不包括 ?parameter 和 #fragment，不考虑 secondary outlet
  const [curUrl] = router.url.split('#')[0].split('?');
  const queryParamsHandling = 'preserve';

  let TOCHtml = '';
  if (hnElements.length > 0) {
    // 生成 TOC 列表的 markdown，通过 markdownToHtml 防 XSS
    let count = 0;
    const TOCMarkdown = hnElements.map((oneEl) => {
      if (oneEl.textContent === null) {
        return '';
      }
      const fragment = `${markdownId}-${count++}-${oneEl.textContent.replace(/[\s#?&]/g, '').slice(0, 20)}`;
      oneEl.id = fragment;
      const url = router.createUrlTree([curUrl], { fragment, queryParamsHandling }).toString();
      return `- [${oneEl.textContent}](${url})`;
    })
      .join('\n');

    // 生成 TOC 列表模板
    const wrapper = document.createElement('div');
    wrapper.innerHTML = markdownToHtml(TOCMarkdown.trim());
    const ul = wrapper.firstElementChild;
    ul.classList.add('toc');
    hnElements.forEach((oneEl, i) => {
      ul.children[i].classList.add('toc-item');
      ul.children[i].classList.add(`toc-item-h${getHn(oneEl)}`);
    });
    TOCHtml = ul.outerHTML;
  }

  // 替换 <p>[TOC]</p>
  Array.from(el.querySelectorAll('p'))
    .filter(p => p.firstChild && p.firstChild.nodeType === p.TEXT_NODE && p.textContent && p.textContent.trim().toUpperCase() === '[TOC]')
    .forEach((p) => {
      p.innerHTML = TOCHtml;
    });

  // 纠正用户自己写的 #fragment: [text](#fragment) -> [text](url#fragment)
  Array.from<HTMLAnchorElement>(el.querySelectorAll('a[href^="#"]'))
    .forEach((a) => {
      a.href = router.createUrlTree([curUrl], { fragment: a.getAttribute('href').slice(1), queryParamsHandling }).toString();
    });
}

export function renderTOC(el: HTMLElement, router: Router) {
  try {
    _renderTOC(el, router);
  } catch (e) {
    // 出错时不妨碍 markdown 渲染
    Promise.reject(e);
  }
}

export function markdownToHtml(markdown: string): string {
  const converter = new showdown.Converter({
    extensions: [xssFilter, highlight],
    tables: true,
    tasklists: true,
  });
  return converter.makeHtml(markdown);
}
