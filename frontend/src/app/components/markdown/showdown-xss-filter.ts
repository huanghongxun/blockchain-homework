import { FilterXSS } from 'xss';

const checkBox = `<input type="checkbox" disabled style="margin: 0 0.35em 0.25em -1.6em; vertical-align: middle;">`;
const checkBoxChecked = `<input type="checkbox" disabled style="margin: 0 0.35em 0.25em -1.6em; vertical-align: middle;" checked>`;

const filterXSS = new FilterXSS({
  onTag(tag, html, options) {
    if (tag === 'input' && (html === checkBox || html === checkBoxChecked)) {
      return html;
    }
  },
  onTagAttr(tag, name, val) {
    if (tag === 'li' && name === 'style' && val === 'list-style-type: none;') {
      return 'style="list-style-type: none;"';
    } else if ((tag === 'td' || tag === 'th') && name === 'style' && val.match(/^text-align:(center|right);$/)) {
      return `${name}="${val}"`;
    }
  },
});

export default function xssFilter(converter: any) {
  return [{
    type: 'output',
    filter(text: string) {
      return filterXSS.process(text);
    },
  }];
}
