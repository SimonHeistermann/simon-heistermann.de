import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  constructor() { }

  isMobile(threshold: number = 400): boolean {
    return window.innerWidth < threshold;
  }
}
