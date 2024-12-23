// Configuração básica da cena, câmera e renderizador
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Ativa sombras
document.body.appendChild(renderer.domElement);

// Luzes
var ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

var pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// Curva para a pista
var pontos = [
    new THREE.Vector3(-20, 0, -10), // Ponto 1 - mais longe no eixo X e Z
    new THREE.Vector3(-10, 5, 0),   // Ponto 2 - aumentado no eixo X
    new THREE.Vector3(0, 2, 10),    // Ponto 3 - mais longe no eixo Z
    new THREE.Vector3(10, 2, 20),   // Ponto 4 - mais longe no eixo X e Z
    new THREE.Vector3(20, 2, 10),   // Ponto 5 - aumentado no eixo X
    new THREE.Vector3(10, 2, 0),    // Ponto 6 - mais longe no eixo Z negativo
    new THREE.Vector3(0, 2, -10),   // Ponto 7 - mais longe no eixo Z negativo
    new THREE.Vector3(-10, 1, -20), // Ponto 8 - mais longe no eixo X e Z negativo
  ];

var curva = new THREE.CatmullRomCurve3(pontos, true);
var extrudeSettings = {
    steps: 200,
    bevelEnabled: false,
    extrudePath: curva,
};

var pistaForma = new THREE.Shape();
pistaForma.moveTo(-0.5, -0.1);
pistaForma.lineTo(0.5, -0.1);
pistaForma.lineTo(0.5, 0.1);
pistaForma.lineTo(-0.5, 0.1);
pistaForma.lineTo(-0.5, -0.1);

var geometriaPista = new THREE.ExtrudeGeometry(pistaForma, extrudeSettings);
var materialPista = new THREE.MeshLambertMaterial({ color: 0xff6400 });
var pista = new THREE.Mesh(geometriaPista, materialPista);
pista.castShadow = true;
pista.receiveShadow = true;
scene.add(pista);

// Carregar o modelo 3D da moto
var loader = new THREE.GLTFLoader();
var moto; // Variável para armazenar o modelo carregado

loader.load('moto3D/scene.gltf', function(gltf) {
    moto = gltf.scene;
    moto.position.set(-10, 1, -5); // Definindo a posição inicial da moto
    moto.scale.set(0.5, 0.5, 0.5); // Ajuste de escala
    moto.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(moto); // Adiciona a moto à cena
});

// Variável progresso agora declarada corretamente
var progresso = 0;

// Movimento da moto na pista
function moverMoto() {
  if (!moto) return; // Verifica se o modelo foi carregado

  progresso += 0.002;
  if (progresso > 1) progresso = 0;

  var posicao = curva.getPointAt(progresso); // Posição da moto na curva
  var tangente = curva.getTangentAt(progresso); // Tangente da curva no ponto

  // Atualiza a posição da moto
  moto.position.copy(posicao);

  // Ajusta a orientação da moto para seguir a tangente
  var matrizRotacao = new THREE.Matrix4();
  
  // O eixo "up" da moto (direção vertical) deve ser o eixo Y
  var eixoUp = new THREE.Vector3(0, 1, 0);
  
  // A frente da moto deve se alinhar com a tangente
  matrizRotacao.lookAt(posicao.clone().add(tangente), posicao, eixoUp);
  
  // Aplica a rotação correta com a matriz de rotação
  moto.quaternion.setFromRotationMatrix(matrizRotacao);
}

var helicoptero;
loader.load('helicopter3D/scene.gltf', function(gltf) {
    helicoptero = gltf.scene;
    helicoptero.position.set(0, 5, 0); // Posição inicial no céu
    helicoptero.scale.set(0.1, 0.1, 0.1); // Ajuste de escala
    helicoptero.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(helicoptero); // Adiciona o helicóptero à cena
});

var sol;
loader.load('sol3D/scene.gltf', function(gltf) {
    sol = gltf.scene;
    sol.position.set(10, 10, -30); // Posição inicial no céu
    sol.scale.set(1, 1, 1); // Ajuste de escala
    sol.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(sol); // Adiciona o helicóptero à cena    
});

var terra;
loader.load('terra3D/scene.gltf', function(gltf) {
    terra = gltf.scene;
    terra.position.set(0, 0, 0); // Posição inicial no céu
    terra.scale.set(0.05, 0.05, 0.05); // Ajuste de escala
    terra.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(terra); // Adiciona o helicóptero à cena    
});

// Curva do helicóptero
var curvaHelicoptero = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 3, 0),       // Ponto inicial mais baixo
    new THREE.Vector3(5, 4, -5),      // Mais perto, e mais baixo que a moto
    new THREE.Vector3(5, 4, 10),      // Mais baixo que a rampa
    new THREE.Vector3(-5, 3, 5),     // Mais baixo que a rampa
    new THREE.Vector3(-10, 3, 0),      // Retorno ao ponto inicial
  ], true);

var progressoHelicoptero = 0;

// Movimento do helicóptero
function moverHelicoptero() {
  if (!helicoptero) return;
  progressoHelicoptero += 0.001;
  if (progressoHelicoptero > 1) progressoHelicoptero = 0;

  var posicao = curvaHelicoptero.getPointAt(progressoHelicoptero);
  var tangente = curvaHelicoptero.getTangentAt(progressoHelicoptero);

  helicoptero.position.copy(posicao);

  var matrizRotacao = new THREE.Matrix4();
  matrizRotacao.lookAt(posicao.clone().add(tangente), posicao, new THREE.Vector3(0, 1, 0));
  helicoptero.quaternion.setFromRotationMatrix(matrizRotacao);
}

// Configurações da câmera
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

// Adiciona OrbitControls
var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Suaviza o movimento
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false; // Impede movimento vertical puro com o botão direito do mouse
controls.minDistance = 5; // Distância mínima de zoom
controls.maxDistance = 50; // Distância máxima de zoom
controls.maxPolarAngle = Math.PI / 2; // Impede rotação abaixo do horizonte

// Renderização
function animate() {
    requestAnimationFrame(animate);
    moverMoto();
    moverHelicoptero();
    controls.update(); // Atualiza os controles da câmera
    renderer.render(scene, camera);
}

animate();