import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  {
    path: 'splash',
    loadComponent: () => import('./features/onboarding/splash/splash.component').then(m => m.SplashComponent),
  },
  {
    path: 'welcome',
    loadComponent: () => import('./features/onboarding/welcome/welcome.component').then(m => m.WelcomeComponent),
  },
  {
    path: 'onboarding/language',
    loadComponent: () => import('./features/onboarding/language-selection/language-selection.component').then(m => m.LanguageSelectionComponent),
  },
  {
    path: 'onboarding/purpose',
    loadComponent: () => import('./features/onboarding/purpose-selection/purpose-selection.component').then(m => m.PurposeSelectionComponent),
  },
  {
    path: 'onboarding/interests',
    loadComponent: () => import('./features/onboarding/interest-selection/interest-selection.component').then(m => m.InterestSelectionComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'situations',
    loadComponent: () => import('./features/situations/situations.component').then(m => m.SituationsComponent),
  },
  {
    path: 'situations/:id',
    loadComponent: () => import('./features/situations/situation-detail/situation-detail.component').then(m => m.SituationDetailComponent),
  },
  {
    path: 'phrases/:id',
    loadComponent: () => import('./features/phrases/phrase-detail/phrase-detail.component').then(m => m.PhraseDetailComponent),
  },
  {
    path: 'learn',
    loadComponent: () => import('./features/learn/learn.component').then(m => m.LearnComponent),
  },
  {
    path: 'learn/:id',
    loadComponent: () => import('./features/learn/lesson-detail/lesson-detail.component').then(m => m.LessonDetailComponent),
  },
  {
    path: 'conversation',
    loadComponent: () => import('./features/conversation/conversation.component').then(m => m.ConversationComponent),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent),
  },
  {
    path: 'calendar/:id',
    loadComponent: () => import('./features/calendar/event-detail/event-detail.component').then(m => m.EventDetailComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'saved',
    loadComponent: () => import('./features/profile/saved-phrases/saved-phrases.component').then(m => m.SavedPhrasesComponent),
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent),
  },
  { path: '**', redirectTo: 'home' },
];
