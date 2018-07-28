import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FroalaViewModule } from 'angular2-froala-wysiwyg';
import { NgxPaginationModule } from 'ngx-pagination';

import { routes } from './routes';

import { ApiService } from './_service/api.service';
import { CartService } from './_service/cart.service';
import { NewsService } from './_service/news.service';
import { AuthService } from './_service/auth.service';
import { ViewSettingService } from './_service/view_serrings.service';
import { SearchService } from './_service/search.service';

import { OnlyNumberDirective } from './_directive/onlyNumber.directive';
import { PhoneValidationDirective } from './_directive/phone.directive';
import { DiscountPipe } from './_pipes/discount.pipe';

import { ProfileGuard } from './_component/pages/profile.component/profile.guard';

import { AppComponent } from './app.component';
import { HeaderComponent } from './_component/header.component/header.component';
import { MenuComponent } from './_component/menu.component/menu.component';
import { HideMenuComponent } from './_component/hide-menu.component/hide-menu.component';
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
import { RecoveryComponent } from './_component/pages/recovery.component/recovery.component';
import { RegistrationComponent } from './_component/pages/registration.component/registration.component';
import { AuthMenuComponent } from "./_component/auth.component/auth.component";
import { ProfileComponent } from './_component/pages/profile.component/profile.component';
import { ProductComponent } from './_component/product.component/product.component';
import { SearchComponent } from './_component/search.component/search.component';
import { SearchPageComponent } from './_component/pages/search_page.component/search.component';
import { PreloaderComponent } from './_component/preloader.component/preloader.component';
import { SocialNetworcsComponent } from './_component/soc_net.component/soc_net.component';
import { ProfileHistoryComponent } from './_component/pages/profile_history.component/profile_history.component';
import { BannerComponent } from './_component/banner.component/banner.component';

@NgModule({
  declarations: [
    OnlyNumberDirective,
    PhoneValidationDirective,
    DiscountPipe,

    AppComponent,
    HeaderComponent,
    HideMenuComponent,
    MenuComponent,
    HomeComponent,
    NewsComponent,
    AboutComponent,
    DeliveryComponent,
    ContactComponent,
    CartComponent,
    ErrorComponent,
    CatalogComponent,
    PortalComponent,
    ItemComponent,
    UserComponent,
    GrazComponent,
    AuthMenuComponent,
    RegistrationComponent,
    LoginComponent,
    RecoveryComponent,
    ProfileComponent,
    ProductComponent,
    SearchComponent,
    SearchPageComponent,
    PreloaderComponent,
    SocialNetworcsComponent,
    ProfileHistoryComponent,
    BannerComponent
  ],

  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    FroalaViewModule.forRoot(),
    NgxPaginationModule
  ],

  providers: [
    ApiService,
    CartService,
    NewsService,
    AuthService,
    ViewSettingService,
    SearchService,
    ProfileGuard
  ],

  bootstrap: [AppComponent]
})

export class AppModule { }