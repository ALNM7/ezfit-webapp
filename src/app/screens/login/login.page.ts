import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { NavController } from '@ionic/angular';
declare var $ :any;

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {


  public username: string = "";
  public password:string = "";
  public type: String = "password";
  public errors:any = {};
  
  constructor(
    private router: Router,
    private facadeService: FacadeService,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
  }

  public login(){
    //Validar
    this.errors = [];

    this.errors = this.facadeService.validarLogin(this.username, this.password);
    if(Object.keys(this.errors).length > 0){
      return false;
    }
    //Si pasa la validación ir a la página de home
    this.facadeService.login(this.username, this.password).subscribe(
      (response)=>{
        this.facadeService.saveUserData(response);
        this.navCtrl.navigateRoot('/tabs');
      }, (error)=>{
        alert("No se pudo iniciar sesión");
      }
    );
    return; 
    
  }

  public registrar(){
    this.navCtrl.navigateRoot('/register');
  }

  showPassword() {
    this.type = this.type === 'password' ? 'text' : 'password';
  }

}
