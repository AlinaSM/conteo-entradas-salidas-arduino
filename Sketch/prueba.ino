#include <LiquidCrystal_I2C.h>
#include <Wire.h>
#include <Servo.h>

LiquidCrystal_I2C lcd (0x27, 16, 2);
Servo servoMotor;

const int nivelLuz = 1010;

//Declarando los pines de los dispositivos
const int pinLDR = A0;
const int pinBuzzer = 4;
const int btnAlarma = 7;
const int pinPIRExterior = 2; 
const int pinPIRInterior = 3; 
const int pinRelay = 12;
const int tiempoActivo = 2500;

bool hayMovimientoAfuera = false;
bool hayMovimientoAdentro = false;
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
  
  pinMode(pinPIRExterior, INPUT);

  servoMotor.attach(9);
  servoMotor.write(90);

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
  Serial.println(valor);
}

void estadoMovimiento( int sensor, bool interior ){
  int valor = digitalRead(sensor);

  if(!interior){
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
   
   
}

void loop() {
  
  estadoDelDia(pinLDR);
  estadoAlarma( btnAlarma);
  estadoMovimiento(pinPIRExterior, false);
  estadoMovimiento(pinPIRInterior, true);

  if(esDia && !alarmaActivada && hayMovimientoAfuera){
    //Serial.println("DIA: Abrir puerta por 10 seg.");
    Serial.println('entrada');

    servoMotor.write(180);
    delay(tiempoActivo);
    servoMotor.write(90);
    
  }
  if(esDia && alarmaActivada && hayMovimientoAfuera){
    //Serial.println("DIA: Sonar buzzer hasta desactivar alarma");
    
    do{
      tone(pinBuzzer, 100);
      estadoAlarma( btnAlarma);
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
  }

  if(!esDia && !alarmaActivada && hayMovimientoAfuera){
    //Serial.println("NOCHE: Abrir puerta por 10 seg y encender el foco.");
    Serial.println('entrada');

    servoMotor.write(180);
    digitalWrite(pinRelay, HIGH);
    delay(tiempoActivo);
    servoMotor.write(90);
    digitalWrite(pinRelay, LOW);
  }
  if(!esDia && alarmaActivada && hayMovimientoAfuera){
    //Serial.println("NOCHE: sonar buzzer y encender el foco hasta desactivar el alarma");
    
    do{
      tone(pinBuzzer, 100);
      digitalWrite(pinRelay, HIGH);
      estadoAlarma( btnAlarma); 
    }while(alarmaActivada);
    
    noTone(pinBuzzer);
    digitalWrite(pinRelay, LOW);
    
  }

  if( hayMovimientoAdentro ){
    Serial.println('salida');

    servoMotor.write(180);
    delay(tiempoActivo);
    servoMotor.write(90);
  }

}