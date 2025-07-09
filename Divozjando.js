// --- CONFIGURACIÓN INICIAL ---
let AMP_MIN = 0.02;
let AMP_MAX = 0.05;
let AMP_TRIGGER = 0.02;

let mic;
let fft;
let amp = 0;

let colores = ['#B03030', '#3A4BA0', '#D9B400', '#D97600', '#222222'];

let cardumen;
let imagenes = [];
let escalaImagenes = [];

let cuadradosFijos = [];
let circuloFijo = null;
let medioCirculo = null;

let sonidoActivado = false;
let figuras = [];

let cruz;

function preload() {
  imagenes.push(loadImage("data/imagen1.png"));
  imagenes.push(loadImage("data/imagen2.png"));
}

function setup() {
  createCanvas(600, 600);
  mic = new p5.AudioIn();
  fft = new p5.FFT(0.8, 1024);
  userStartAudio();
  mic.start();
  fft.setInput(mic);

  cardumen = new CardumenLinea(random(width), random(height), 10);
  for (let i = 0; i < imagenes.length; i++) escalaImagenes[i] = 0.1;

  let tamFijo = 70;
  let espacio = 10;
  let margen = 10;
  let esquinas = ['supIzq', 'supDer', 'infIzq', 'infDer'];
  let esquina = random(esquinas);

  let x0, y0, x1, y1;
  if (esquina === 'supIzq') {
    x0 = margen; y0 = margen;
    x1 = x0 + tamFijo + espacio; y1 = y0;
  } else if (esquina === 'supDer') {
    x0 = width - (tamFijo * 2 + espacio) - margen; y0 = margen;
    x1 = x0 + tamFijo + espacio; y1 = y0;
  } else if (esquina === 'infIzq') {
    x0 = margen; y0 = height - tamFijo - margen;
    x1 = x0 + tamFijo + espacio; y1 = y0;
  } else {
    x0 = width - (tamFijo * 2 + espacio) - margen; y0 = height - tamFijo - margen;
    x1 = x0 + tamFijo + espacio; y1 = y0;
  }

  cuadradosFijos = [
    { x: x0, y: y0, tam: tamFijo, color: random(colores) },
    { x: x1, y: y1, tam: tamFijo, color: random(colores) }
  ];

  let esquinasCirculo = esquinas.filter(e => e !== esquina);
  let esquinaCirculo = random(esquinasCirculo);
  let tamCirculo = 160;
  let colorCirculo = random(colores);
  let radio = tamCirculo / 2;
  let circX, circY;
  if (esquinaCirculo === 'supIzq') {
    circX = 0 - radio; circY = 0 - radio;
  } else if (esquinaCirculo === 'supDer') {
    circX = width + radio; circY = 0 - radio;
  } else if (esquinaCirculo === 'infIzq') {
    circX = 0 - radio; circY = height + radio;
  } else {
    circX = width + radio; circY = height + radio;
  }
  circuloFijo = { x: circX, y: circY, tam: tamCirculo, color: colorCirculo };

  let bordes = ['arriba', 'abajo', 'izquierda', 'derecha'];
  let bordeElegido = random(bordes);
  let radioMedio = 50;
  let colorMedio = random(colores);
  let medioX, medioY;
  let fueraDelCanvas = radioMedio * 0.25;
  if (bordeElegido === 'arriba') {
    medioX = random(radioMedio, width - radioMedio); medioY = 0 - fueraDelCanvas;
  } else if (bordeElegido === 'abajo') {
    medioX = random(radioMedio, width - radioMedio); medioY = height + fueraDelCanvas;
  } else if (bordeElegido === 'izquierda') {
    medioX = 0 - fueraDelCanvas; medioY = random(radioMedio, height - radioMedio);
  } else {
    medioX = width + fueraDelCanvas; medioY = random(radioMedio, height - radioMedio);
  }
  medioCirculo = { x: medioX, y: medioY, tam: radioMedio * 2, color: colorMedio };

  for (let i = 0; i < 6; i++) {
    let tipo = random(['rectangulo', 'cuadrado']);
    let x = random(width * 0.1, width * 0.9);
    let y = random(height * 0.1, height * 0.9);
    let tam = random(30, 80);
    let color = random(colores);
    let rot = radians(random(-45, 45));
    figuras.push(new Figura(tipo, x, y, tam, color, rot));
  }

  let centroSeguro = 80;
  let posX = random(centroSeguro, width - centroSeguro);
  let posY = random(centroSeguro, height - centroSeguro);
  let colorCruz = random(colores);
  cruz = new Cruz(posX, posY, cardumen.lineas[0].largo, colorCruz);
}

function draw() {
  background('#FFFFFF');
  amp = mic.getLevel();
  fft.analyze();
  let graveEnergy = fft.getEnergy(100, 250);
  let agudoEnergy = fft.getEnergy(300, 2000);

  if (!sonidoActivado && amp > AMP_TRIGGER) sonidoActivado = true;

  if (sonidoActivado) {
    for (let c of cuadradosFijos) {
      push(); noStroke(); fill(c.color); rect(c.x, c.y, c.tam, c.tam); pop();
    }
    push(); noStroke(); fill(circuloFijo.color); ellipse(circuloFijo.x, circuloFijo.y, circuloFijo.tam); pop();
    push(); noStroke(); fill(medioCirculo.color); ellipse(medioCirculo.x, medioCirculo.y, medioCirculo.tam); pop();
    cardumen.actualizar(amp, graveEnergy, agudoEnergy);
    cardumen.dibujar();
    for (let f of figuras) f.dibujar();

    if (imagenes.length >= 2) {
      push(); imageMode(CENTER);
      let deform = map(amp, AMP_MIN, AMP_MAX, 0.2, 1.4, true);
      let escalaAncho = 0.2, escalaAlto = deform;
      translate(width / 2 - 50, 290); rotate(radians(15));
      image(imagenes[0], 0, 0, imagenes[0].width * escalaAncho, imagenes[0].height * escalaAlto); pop();
      push(); translate(width / 2 + 50, 340); rotate(radians(15));
      image(imagenes[1], 0, 0, imagenes[1].width * escalaAncho, imagenes[1].height * escalaAlto); pop();
    }

    cruz.dibujar();
  }
}

class Figura {
  constructor(tipo, x, y, tam, color, rot) {
    this.tipo = tipo;
    this.x = x; this.y = y;
    this.tam = tam; this.color = color; this.rot = rot;
    if (tipo === 'rectangulo') this.proporcion = random(0.3, 0.6);
  }
  dibujar() {
    push(); translate(this.x, this.y); rotate(this.rot); noStroke(); fill(this.color); rectMode(CENTER);
    if (this.tipo === 'rectangulo') rect(0, 0, this.tam, this.tam * this.proporcion);
    else rect(0, 0, this.tam, this.tam);
    pop();
  }
}

class Cruz {
  constructor(x, y, diametro, color) {
    this.x = x; this.y = y;
    this.diametro = diametro;
    this.color = color;
    this.hojaLargo = diametro * 3;
    this.hojaAncho = diametro * 0.05;
    this.guardaAncho = diametro * 0.6;
    this.guardaAlto = diametro * 0.08;
  }
  dibujar() {
    push();
    translate(this.x, this.y);
    let angulo = atan2(height / 2 - this.y, width / 2 - this.x);
    rotate(angulo);
    noStroke(); fill(this.color); rectMode(CENTER);
    rect(0, this.hojaLargo / 2 - 10, this.hojaAncho, this.hojaLargo);
    rect(0, 0, this.guardaAncho, this.guardaAlto);
    pop();
  }
}

class Linea {
  constructor(offsetX, offsetY, color) {
    this.baseX = offsetX;
    this.baseY = offsetY;
    this.x = offsetX;
    this.y = offsetY;
    this.largo = 120;
    this.color = color;
  }
  actualizarPosicion(cardumenX, cardumenY, tiempo) {
    this.x = cardumenX + this.baseX;
    this.y = cardumenY + this.baseY + sin(tiempo + this.baseX * 0.3) * 10;
  }
  dibujar() {
    push(); stroke(this.color); strokeWeight(5); strokeCap(SQUARE);
    line(this.x, this.y, this.x + this.largo, this.y); pop();
  }
}

class CardumenLinea {
  constructor(x, y, cantidad) {
    this.x = x; this.y = y; this.tiempo = 0;
    this.lineas = [];
    for (let i = 0; i < cantidad; i++) {
      let offsetX = i * 25;
      let offsetY = random(-20, 20);
      let color = random(colores);
      this.lineas.push(new Linea(offsetX, offsetY, color));
    }
    this.dirX = 1; this.dirY = 0; this.velocidad = 0;
  }
  actualizar(amp, graveEnergy, agudoEnergy) {
    this.tiempo += 0.05;
    if (amp < AMP_MIN) { this.velocidad = 0; return; }
    this.velocidad = agudoEnergy > graveEnergy ? map(agudoEnergy, 0, 255, 2, 12) : map(graveEnergy, 0, 255, 0.5, 2);
    let angle = map(agudoEnergy - graveEnergy, -255, 255, radians(-135), radians(135));
    this.dirX = cos(angle); this.dirY = sin(angle);
    this.x += this.dirX * this.velocidad;
    this.y += this.dirY * this.velocidad;
    if (this.x > width + 5 || this.x < -5 || this.y > height + 5 || this.y < -5) {
      this.x = width / 2 + random(-50, 50);
      this.y = height / 2 + random(-50, 50);
    }
  }
  dibujar() {
    for (let linea of this.lineas) {
      linea.actualizarPosicion(this.x, this.y, this.tiempo);
      linea.dibujar();
    }
  }
}
