import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { CreatePost } from './pages/create-post/create-post';
import { PostDetail } from './pages/post-detail/post-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'create', component: CreatePost },
  { path: 'post/:id', component: PostDetail },
  { path: '**', redirectTo: '' },
];
