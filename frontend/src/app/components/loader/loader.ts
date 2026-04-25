import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { LoaderService } from '../../services/loader';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-loader',
  imports: [AsyncPipe, NgIf],
  templateUrl: './loader.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  loading$: Observable<boolean>;
  constructor(private loaderService: LoaderService) {
    this.loading$ = this.loaderService.loading$;
  }
}
