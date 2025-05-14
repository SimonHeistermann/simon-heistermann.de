import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactData } from '../../../core/models/contact-data.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private http = inject(HttpClient);
  
  private post = {
    endPoint: 'https://simon-heistermann.de/sendMail.php',
    body: (payload: any) => JSON.stringify(payload),
    options: {
      headers: {
        'Content-Type': 'text/plain',
        responseType: 'text',
      },
    },
  };

  mailTest = true;

  constructor() { }

  sendContactData(contactData: ContactData): Observable<any> {
    if (this.mailTest) {
      console.log('Testmodus: Formular würde gesendet werden:', contactData);
      return new Observable(observer => {
        observer.next('Test success');
        observer.complete();
      });
    }
    return this.http.post(
      this.post.endPoint, 
      this.post.body(contactData)
    );
  }

  isSpamEntry(websiteValue: string): boolean {
    return !!websiteValue;
  }
}
