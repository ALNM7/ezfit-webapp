import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {

  public foodData: any;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    this.foodData = nav?.extras?.state?.['foodData'];
    console.log("Datos recibidos:", this.foodData);
  }

}
