import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContactData } from '../../../core/models/contact-data.interface';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  /** Instance of HttpClient injected via Angular's dependency injection */
  private http = inject(HttpClient);
  
  /** 
   * Configuration object for sending contact form data.
   * - `endPoint`: URL to which the form data is posted.
   * - `options`: HTTP headers and response settings.
   */
  private post = {
    endPoint: 'https://simon-heistermann.de/api/sendMail.php',
    options: {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      }),
      responseType: 'json' as const
    },
  };

  /**
   * Flag to determine whether the service is running in mail test mode.
   * If true, email sending is simulated and not actually performed.
   */
  mailTest = false;

  constructor() { }

  /**
   * Sends contact form data to the configured backend.
   * If `mailTest` is enabled, simulates a successful submission.
   *
   * @param contactData - The contact form data to send.
   * @returns Observable that emits the server response or a test success message.
   */
  sendContactData(contactData: ContactData): Observable<any> {
    if (this.mailTest) {
      console.log('Test mode: Form would be submitted:', contactData);
      return new Observable(observer => {
        observer.next({success: true});
        observer.complete();
      });
    }
    return this.http.post(
      this.post.endPoint, 
      contactData,
      this.post.options
    );
  }

  /**
   * Checks if a submission is considered spam based on the `website` field value.
   *
   * @param websiteValue - The hidden honeypot field value used for spam detection.
   * @returns True if the value is non-empty (likely spam), false otherwise.
   */
  isSpamEntry(websiteValue: string): boolean {
    return !!websiteValue;
  }
}

