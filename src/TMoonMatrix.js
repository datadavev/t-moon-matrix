import { html, css, LitElement } from 'lit';
import {DateTime} from 'luxon';
import {getMoonIllumination} from './suncalc.js';

export class TMoonMatrix extends LitElement {
  static get styles() {
    return css`
      :host {
        color: var(--t-moon-matrix-text-color, #000);
        font-size: var(--t-moon-matrix-font-size, 14px);
        font-family: var(--t-moon-matrix-font-family, monospace);
        font-weight: var(--t-moon-matrix-font-weight, normal);
      }
      table {
        overflow: hidden;
        border: solid 0px gray;
        border-spacing: 0;
      }
      td,
      th {
        position: relative;
        padding-left: 2px;
        padding-right: 2px;
      }
      tr:hover {
        background-color: var(--t-zones-highlight, #dce9fc);
      }
      td:hover::after,
      th:hover::after {
        content: '';
        position: absolute;
        background-color: var(--t-zones-highlight, #dce9fc);
        left: 0;
        top: -5000px;
        height: 10000px;
        width: 100%;
        z-index: -1;
      }
    `;
  }

  static get properties() {
    return {
      year: { type: Number },
    };
  }

  constructor() {
    super();
    const cdate = DateTime.now();
    this.year = cdate.year;
  }

  // eslint-disable-next-line class-methods-use-this
  phaseChar(frac) {
    if (frac < 0.07) {
        return "🌑";
    }
    if (frac < 0.19){
        return "🌒";
    }
    if (frac < 0.31){
        return "🌓";
    }
    if (frac < 0.45){
        return "🌔";
    }
    if (frac < 0.55){
        return "🌕";
    }
    if (frac < 0.69){
        return "🌖";
    }
    if (frac < 0.81){
        return "🌗";
    }
    if (frac < 0.93){
        return "🌘";
    }
    return "🌑";
  }

  render() {
    const mrows = [];
    let row = [html`<td>${this.year}&nbsp;</td>`];
    for (let iday=1; iday <=31; iday +=1) {
      row.push(html`<td>${iday}</td>`);
    }
    mrows.push(html`<tr>${row}</tr>`);
    for (let imonth=1; imonth<=12; imonth += 1) {
      let cdate = DateTime.fromObject({year: this.year, month:imonth, day:1, hour:18});
      row = [html`<td>${cdate.toFormat('LLL')}&nbsp;</td>`];
      for (let iday=1; iday < 32; iday += 1) {
        cdate = cdate.set({day:iday});
        if (cdate.month === imonth) {
          const illum = getMoonIllumination(cdate);
          row.push(html`<td>${this.phaseChar(illum.phase)}</td>`);
        } else {
          row.push(html`<td></td>`);
        }
      }
      mrows.push(html`<tr>${row}</tr>`);
    }
    return html`
      <table>
        <tbody>
          ${mrows}
        </tbody>
      </table>
    `;
  }
}
