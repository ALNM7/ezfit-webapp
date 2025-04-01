import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidatorService } from './tools/validator.service';
import { ErrorsService } from './tools/errors.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FacadeService } from './facade.service';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient,
    private validatorService: ValidatorService,
    private errorService: ErrorsService,
    private facadeService: FacadeService
  ) { }

  public esquemaUser(){
    return {
      'name': '',
      'email': '',
      'password': '',
    }
  }
   //Validación para el formulario
   public validarAlumno(data: any, editar: boolean){
    console.log("Validando alumno... ", data);
    let error: any = [];

    if(!this.validatorService.required(data["name"])){
      error["name"] = this.errorService.required;
    }

    if(!this.validatorService.required(data["email"])){
      error["email"] = this.errorService.required;
    }else if(!this.validatorService.max(data["email"], 40)){
      error["email"] = this.errorService.max(40);
    }else if (!this.validatorService.email(data['email'])) {
      error['email'] = this.errorService.email;
    }

    if(!editar){
      if(!this.validatorService.required(data["password"])){
        error["password"] = this.errorService.required;
      }
    }


    //Return arreglo
    return error;
  }

  //Aquí van los servicios HTTP
  //Servicio para registrar un nuevo alumno
  public registrarAlumno (data: any): Observable <any>{
    return this.http.post<any>(`${environment.url_api}/user/`,data, httpOptions);
  }

  public analyzeFood(data: FormData): Observable<any> {
    const token = this.facadeService.getSessionToken(); // Obtener el token
  
    if (!token) {
      console.error('Error: No se encontró el token de autenticación.');
      return new Observable(observer => {
        observer.error('Token de autenticación no encontrado.');
      });
    }
  
    const httpOptionsWithAuth = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`, // Prueba con "Bearer" en lugar de "Token"
      }),
    };
  
    return this.http.post<any>(`${environment.url_api}/food-analysis/`, data, httpOptionsWithAuth);
  }

}
