import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
 { path: 'reset-password', component: ResetPasswordComponent },
 { path: '', redirectTo: '/login', pathMatch: 'full' }, // Ana sayfa redirect'i
 { path: '**', redirectTo: '/login' } // 404 durumunda login'e yönlendir
];

@NgModule({
 imports: [RouterModule.forRoot(routes)],
 exports: [RouterModule]
})
export class AppRoutingModule { }