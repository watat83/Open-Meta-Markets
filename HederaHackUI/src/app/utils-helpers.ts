// globals.ts
import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';
import {
  DomSanitizer,
  SafeResourceUrl,
  SafeUrl
} from '@angular/platform-browser';
import { Router, NavigationEnd } from "@angular/router";
import { Location } from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class Globals {
  constructor(
    private http: HttpClient,
    private _domSanitizer: DomSanitizer,
    private _router: Router,
    private _location: Location
  ) { }

  searchString(
    myTerms: any[],
    myTermsProp: string,
    myData: any[],
    myDataProp: string
  ): any {
    let finalArr: any = [];
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < myData.length; j++) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < myTerms.length; i++) {
        if (
          myData[j][myDataProp]
            .toLowerCase()
            .includes(myTerms[i][myTermsProp].toLowerCase())
        ) {
          finalArr.push(myTerms[i]);
        }
      }
    }
    finalArr = [...new Set(finalArr)]; // Make sure the array contains unique values
    // finalArr.map(res => res.json());
    return finalArr;
  }

  sortData(data: any, filter: string) {
    return data.sort(
      (
        a: { [x: string]: { toLowerCase: () => number } },
        b: { [x: string]: { toLowerCase: () => number } }
      ) => (a[filter] > b[filter] ? 1 : -1)
    );
  }

  loadScript(src: string): void {
    const body = document.body as HTMLDivElement;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = src;
    script.async = true;
    script.defer = true;
    body.appendChild(script);
  }

  loadExternalScripts(array: any[]): void {
    let isFound = false;
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; ++i) {
      const script = scripts[i];
      if (
        script.getAttribute('src') != null &&
        script.getAttribute('src')!.includes('loader')
      ) {
        isFound = true;
      }
    }

    if (!isFound) {
      const dynamicScripts = array;

      for (let i = 0; i < dynamicScripts.length; i++) {
        const node = document.createElement('script');
        node.src = dynamicScripts[i];
        node.type = 'text/javascript';
        node.async = false;
        node.charset = 'utf-8';
        document.getElementsByTagName('head')[0].appendChild(node);
      }
    }
  }

  getTimeAndFormatAMPM(): string {
    let hours: any = new Date().getHours();
    let minutes: any = new Date().getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  sanitizeUrl(url: string): any {
    return this._domSanitizer.bypassSecurityTrustResourceUrl(url);
  }

  arrayIntersect(a: any[], b: any[]) {
    return a.filter(n => !b.some(n2 => n == n2));
  }
  findStringInArrayOfObjects(a: any[], field: string, char: string) {
    const data = a.find(s => s[field] === char);
    return data;
  }
  sortBy(data: any, filter: any, order: string = 'DESC') {
    if (order === 'DESC') {
      return data.sort((a: any, b: any) => {
        if (a[filter] instanceof String && b[filter] instanceof String) {
          return a[filter].toLowerCase() < b[filter].toLowerCase() ? 1 : -1;
        } else {
          return a[filter] < b[filter] ? 1 : -1;
        }
      });
    } else {
      return data.sort((a: any, b: any) => {
        if (a[filter] instanceof String && b[filter] instanceof String) {
          return a[filter].toLowerCase() > b[filter].toLowerCase() ? 1 : -1;
        } else {
          return a[filter] > b[filter] ? 1 : -1;
        }
      });
    }
  }
  sortByNestedProperty(nestedPropChain: any, arr: any, order = 'ASC') {
    nestedPropChain = nestedPropChain.split('.');
    var len = nestedPropChain.length;

    if (order === 'ASC') {
      arr.sort(function (a: any, b: any) {
        var i = 0;
        while (i < len) {
          a = a[nestedPropChain[i]];
          b = b[nestedPropChain[i]];
          i++;
        }
        if (a < b) {
          return -1;
        } else if (a > b) {
          return 1;
        } else {
          return 0;
        }
      });
      return arr;
    } else if (order === 'DESC') {
      arr.sort(function (a: any, b: any) {
        var i = 0;
        while (i < len) {
          a = a[nestedPropChain[i]];
          b = b[nestedPropChain[i]];
          i++;
        }
        if (a < b) {
          return 1;
        } else if (a > b) {
          return -1;
        } else {
          return 0;
        }
      });
      return arr;
    }
  }
  search(row: any) {
    return Object.keys(this).every(
      key =>
        row[key] &&
        row[key] != null &&
        row[key].toLowerCase() === key.toLowerCase()
    );
  }
  filter(array: any, field: any, value: any) {
    let filtered = array.filter((e: any) => {
      return e[field] === value;
    });
    return filtered;
  }

  findMinMax(arr: any, field: any) {
    if (field === undefined || field == null || field === '') {
      let min = arr[0],
        max = arr[0];

      for (let i = 1, len = arr.length; i < len; i++) {
        let v = arr[i];
        min = v < min ? v : min;
        max = v > max ? v : max;
      }
      return [min, max];
    } else {
      let min = arr[0][field],
        max = arr[0][field];

      for (let i = 1, len = arr.length; i < len; i++) {
        let v = arr[i][field];
        min = v < min ? v : min;
        max = v > max ? v : max;
      }
      return [min, max];
    }
  }
  findMax(arr: any, field: any) {
    arr.reduce((m: any, x: any) => (m[field] > x[field] ? m : x));
  }
  findMin(arr: any, field: any) {
    arr.reduce((m: any, x: any) => (m[field] < x[field] ? m : x));
  }

  groupBy2(array: any[], key: string) {
    return array.reduce((r: any, a: any) => {
      (r[a[String(key)]] = r[a[String(key)]] || []).push(a);
      return r;
    }, {});
  }

  sum(arr: any, field: any) {
    return arr.reduce((a: any, b: any) => {
      return a + b[field];
    }, 0);
  }

  async refreshComponent() {
    this._router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this._router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        this._router.navigated = false;
        window.scrollTo(0, 0);
      }
    });
    await this._router.navigate([this._router.url]);
  }

  async urlChanged(urlPath: any) {
    urlPath = await this._location.onUrlChange((path: any) => {
      urlPath = path;
      return urlPath;
    });
  }
}
