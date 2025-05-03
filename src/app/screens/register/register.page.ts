import { Component, OnInit, Input} from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FacadeService } from 'src/app/services/facade.service';
import { Location } from '@angular/common';
import { NavController } from '@ionic/angular';



declare var $:any;


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {

  @Input() datos_user: any = {};
  showPassword: boolean = false;
  public user:any= {};
  public token: string = "";
  public errors:any={};
  public editar:boolean = false;
  public idUser: Number = 0;
  public type: String = "password";
  constructor(
    private userService: UserService,
    private location : Location,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private facadeService: FacadeService,
    private navCtrl: NavController,

 
  ) { }

  ngOnInit(): void {


     //El primer if valida si existe un parámetro en la URL
     if(this.activatedRoute.snapshot.params['id'] != undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      console.log("ID User: ", this.idUser);
      //Al iniciar la vista asignamos los datos del user
      this.user = this.datos_user;
    }else{
      this.user = this.userService.esquemaUser();
      this.token = this.facadeService.getSessionToken();
    }
    //Imprimir datos en consola
    console.log("Admin: ", this.user);
    
  }


  public registrar(){
    //Validar
    this.errors = [];

    this.errors = this.userService.validarAlumno(this.user, this.editar)
    if (Object.keys(this.errors).length > 0) {
      return false;
  }
      //Aquí si todo es correcto vamos a registrar - aquí se manda a consumir el servicio
      this.userService.registrarAlumno(this.user).subscribe(
        (response)=>{
          alert("Usuario registrado correctamente");
          console.log("Usuario registrado: ", response);
          this.router.navigate(["/"]);
        }, (error)=>{
          alert("No se pudo registrar usuario");
        }
      );
    return; 
    }


    public goBack(){
      this.navCtrl.navigateRoot('/');
    }

    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }

    mostrarpassword() {
      this.type = this.type === 'password' ? 'text' : 'password';
    }


  }


