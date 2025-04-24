import { Component } from '@angular/core';
import { IntroComponent } from "./sections/intro/intro.component";
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-portfolio',
  imports: [IntroComponent, CommonModule, HeaderComponent],
  templateUrl: './portfolio.component.html',
  styleUrl: './portfolio.component.sass'
})
export class PortfolioComponent {

}
