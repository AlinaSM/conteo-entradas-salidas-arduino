#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <Servo.h>

LiquidCrystal_I2C lcd (0x27, 16, 2);
Servo servoMotor;

const int nivelLuz = 995;

//Declarando los pines de los dispositivos
const int pinLDR = A0;
const int pinBuzzer = 4;
const int btnAlarma = 7;
const int pinPIRAfuera = A2; 
const int pinPIRAdentro= 2; 
const int pinRelay = 12;
const int tiempoActivo = 3000;
const int anguloCerrado = 85;
const int anguloAbierto = 180;

bool hayMovimientoAdentro = false;
bool estadoAnteriorAdentro = false;

bool hayMovimientoAfuera = false;
bool estadoAnteriorAfuera = false;


bool alarmaActivada = false;
bool esDia = true;

//Cambio de estado en el boton del alarma
int  estado = 0;
int  estadoAnterior = 0;
int  estadoActual; 
int  contador = 0;

void setup() {
  Serial.begin(9600);
  
  pinMode(btnAlarma, OUTPUT);
  pinMode(pinBuzzer, OUTPUT);
  pinMode(pinRelay, OUTPUT);
  
  pinMode(pinPIRAfuera, INPUT);
  pinMode(pinPIRAdentro, INPUT);

  servoMotor.attach(9);
  servoMotor.write(anguloCerrado);

  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.setCursor(0,0);
  lcd.print("Alarma Desactivada");

}


void mensajeLCD(bool estadoAlarma){
      lcd.clear();
      if(estadoAlarma){
        lcd.print("Alarma Activa");
      }else{
        lcd.print("Alarma Desactivada");
      }
}


void estadoAlarma( int pin ){
  estadoActual = digitalRead(pin);
  
  if( estadoAnterior != estadoActual){
    contador++;
    int validarPar = contador % 2;

    if(validarPar != 1){
      alarmaActivada = !alarmaActivada;     
      mensajeLCD(alarmaActivada);
    }
    estadoAnterior = estadoActual;
  }

}




void estadoDelDia( int sensor ){
  int valor = analogRead(sensor);
  
  if( valor >= nivelLuz ){
      esDia = false;
  }else{
    esDia = true;
  }
  //Serial.println(valor);
}
//pinPIRAdentro
void estadoMovimiento( int sensor, bool afuera ){
  int valor = digitalRead(sensor);
   if(afuera){
     if(valor == HIGH){
      hayMovimientoAfuera = true;
     }else{
      hayMovimientoAfuera = false;
     }
   }else{
    if(valor == HIGH){
      hayMovimientoAdentro = true;
     }else{
      hayMovimientoAdentro = false;
     }
   }
  // Serial.println(valor);
}

void loop() {
  
  estadoDelDia(pinLDR);
  estadoAlarma( btnAlarma);
  estadoMovimiento(pinPIRAfuera, true);
  estadoMovimiento(pinPIRAdentro, false);


//estadoAnteriorAfuera
  if(esDia && !alarmaActivada && hayMovimientoAfuera && !estadoAnteriorAfuera){
    Serial.println("entrada");
    servoMotor.write(anguloAbierto);
    delay(tiempoActivo);
    servoMotor.write(anguloCerrado);
    
  }
  if(esDia && alarmaActivada && hayMovimientoAfuera  && !estadoAnteriorAfuera){
    //Serial.println("DIA: Sonar buzzer hasta desactivar alarma");
    
    do{
      tone(pinBuzzer, 100);
      estadoAlarma( btnAlarma);
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
  }

  if(!esDia && !alarmaActivada && hayMovimientoAfuera  && !estadoAnteriorAfuera){
    Serial.println("entrada");
    servoMotor.write(anguloAbierto);
    digitalWrite(pinRelay, HIGH);
    delay(tiempoActivo);
    servoMotor.write(anguloCerrado);
    digitalWrite(pinRelay, LOW);
  }
  if(!esDia && alarmaActivada && hayMovimientoAfuera && !estadoAnteriorAfuera){
    //Serial.println("NOCHE: sonar buzzer y encender el foco hasta desactivar el alarma");
    
    do{
      tone(pinBuzzer, 100);
      digitalWrite(pinRelay, HIGH);
      estadoAlarma( btnAlarma); 
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
    digitalWrite(pinRelay, LOW);
    
  }

  if(esDia && !alarmaActivada && hayMovimientoAdentro && !estadoAnteriorAdentro  ){
    
    Serial.println("salida");
    servoMotor.write(anguloAbierto);
    delay(tiempoActivo);
    servoMotor.write(anguloCerrado);
  }
  if(esDia && alarmaActivada && hayMovimientoAdentro  && !estadoAnteriorAdentro){
    do{
      tone(pinBuzzer, 100);
      estadoAlarma( btnAlarma);
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
  }
  if(!esDia && !alarmaActivada && hayMovimientoAdentro  && !estadoAnteriorAdentro){
    Serial.println("salida");
    servoMotor.write(anguloAbierto);
    digitalWrite(pinRelay, HIGH);
    delay(tiempoActivo);
    servoMotor.write(anguloCerrado);
    digitalWrite(pinRelay, LOW);
  }
  if(!esDia && alarmaActivada && hayMovimientoAdentro && !estadoAnteriorAdentro){
    do{
      tone(pinBuzzer, 100);
      digitalWrite(pinRelay, HIGH);
      estadoAlarma( btnAlarma); 
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
    digitalWrite(pinRelay, LOW);
  }
    
  estadoAnteriorAdentro = hayMovimientoAdentro;
  estadoAnteriorAfuera = hayMovimientoAfuera;
}
