import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HttpClient, provideHttpClient, withFetch } from '@angular/common/http';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

/**
 * Firebase configuration object containing necessary keys and identifiers
 * for connecting the application to the Firebase project.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCkX2htUNG8oh62bjaR9yizC6fs3vBX84c",
  authDomain: "portfolio-39f9d.firebaseapp.com",
  projectId: "portfolio-39f9d",
  storageBucket: "portfolio-39f9d.firebasestorage.app",
  messagingSenderId: "420353673541",
  appId: "1:420353673541:web:b192e5c98b82d1b954562c",
  measurementId: "G-Q0Q2QZHTRN"
};

/**
 * Factory function to create a TranslateHttpLoader that loads translation files
 * from the `./i18n/` folder with `.json` extension.
 *
 * @param http - HttpClient instance for performing HTTP requests.
 * @returns TranslateHttpLoader instance configured for loading translation files.
 */
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './i18n/', '.json');
}

/**
 * Main application configuration object providing core services, routing,
 * HTTP client, animations, internationalization, and Firebase integration.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideClientHydration(),

    provideHttpClient(withFetch()),

    provideAnimations(),

    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        },
        defaultLanguage: 'de'
      })
    ),

    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    provideFirestore(() => getFirestore())
  ]
};

