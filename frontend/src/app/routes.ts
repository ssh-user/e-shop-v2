import { Routes } from '@angular/router';

import { ProfileGuard } from './_component/pages/profile.component/profile.guard'

import { HomeComponent } from './_component/pages/home.component/home.component';
import { NewsComponent } from './_component/pages/news.component/news.component';
import { AboutComponent } from './_component/pages/about.component/about.component';
import { DeliveryComponent } from './_component/pages/delivery.component/delivery.component';
import { ContactComponent } from './_component/pages/contact.component/contact.component';
import { CartComponent } from './_component/pages/cart.component/cart.component';
import { ErrorComponent } from './_component/pages/error.component/error.component';
import { CatalogComponent } from './_component/pages/catalog.component/catalog.component';
import { PortalComponent } from './_component/pages/portal.component/portal.component';
import { ItemComponent } from './_component/pages/item.component/item.component';
import { UserComponent } from './_component/pages/user.component/user.component';
import { GrazComponent } from './_component/pages/graz.component/graz.component';
import { LoginComponent } from './_component/pages/login.component/login.component';
import { RegistrationComponent } from './_component/pages/registration.component/registration.component';
import { RecoveryComponent } from './_component/pages/recovery.component/recovery.component';
import { ProfileComponent } from './_component/pages/profile.component/profile.component';
import { SearchPageComponent } from './_component/pages/search_page.component/search.component';
import { ProfileHistoryComponent } from './_component/pages/profile_history.component/profile_history.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'home', redirectTo: '/' },
    { path: 'cart', component: CartComponent },
    { path: 'portal/:id', component: PortalComponent },
    { path: 'catalog/:id', component: CatalogComponent },
    { path: 'item/:id', component: ItemComponent },
    { path: 'news', component: NewsComponent },
    { path: 'about', component: AboutComponent },
    { path: 'delivery', component: DeliveryComponent },
    { path: 'contact', component: ContactComponent },
    { path: 'user', component: UserComponent },
    { path: 'profile', component: ProfileComponent, canActivate: [ProfileGuard] },
    { path: 'history', component: ProfileHistoryComponent, canActivate: [ProfileGuard] },
    { path: 'graz', component: GrazComponent },
    { path: 'login', component: LoginComponent },
    { path: 'reg', component: RegistrationComponent },
    { path: 'recovery', component: RecoveryComponent },
    { path: 'search', component: SearchPageComponent },
    { path: 'error/:id', component: ErrorComponent },
    { path: '**', component: ErrorComponent }
];
