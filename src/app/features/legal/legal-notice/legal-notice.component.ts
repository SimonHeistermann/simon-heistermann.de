import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { TranslationService } from '../../../core/services/translation-service/translation.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { MouseFollowerComponent } from '../../../shared/components/mouse-follower/mouse-follower.component';

@Component({
  selector: 'app-legal-notice',
  standalone: true,
  imports: [CommonModule, TranslateModule, HeaderComponent, MouseFollowerComponent],
  templateUrl: './legal-notice.component.html',
  styleUrl: './legal-notice.component.sass'
})
export class LegalNoticeComponent implements OnInit, OnDestroy {
  currentLang: string = 'de';
  private langSubscription!: Subscription;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.langSubscription = this.translationService.currentLang$.subscribe((lang: string) => {
      this.currentLang = lang;
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
