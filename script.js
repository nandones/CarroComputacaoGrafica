// Configuração básica da cena, câmera e renderizador
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Ativa sombras
document.body.appendChild(renderer.domElement);

// Luz ambiente - mais intensa para maior brilho geral
var ambientLight = new THREE.AmbientLight(0x555555); // Ajustado para 0x555555
scene.add(ambientLight);

// Luz direcional - simulando o Sol
var directionalLight = new THREE.DirectionalLight(0xffffff, 1.5); // Luz mais forte para simular o Sol
directionalLight.position.set(10, 10, -15); // Mesma posição do modelo do Sol
directionalLight.castShadow = true; // Habilita sombras
directionalLight.shadow.mapSize.width = 2048; // Resolução da sombra
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;

// Ajuste do volume da câmera de sombra para capturar sombras detalhadas
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

// Adiciona a luz direcional à cena
scene.add(directionalLight);

// Luz pontual para iluminação mais localizada
var pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(5, 10, 5);
pointLight.castShadow = true;
scene.add(pointLight);

// Função para criar as estrelas
function criarEstrelas(qtdEstrelas) {
    var geometriaEstrelas = new THREE.BufferGeometry();
    var posicoes = [];

    for (var i = 0; i < qtdEstrelas; i++) {
        // Gera posições aleatórias para as estrelas em uma esfera ao redor da cena
        var x = (Math.random() - 0.5) * 500; // Valores entre -250 e 250
        var y = (Math.random() - 0.5) * 500;
        var z = (Math.random() - 0.5) * 500;
        posicoes.push(x, y, z);
    }

    geometriaEstrelas.setAttribute('position', new THREE.Float32BufferAttribute(posicoes, 3));

    // Material das estrelas
    var materialEstrelas = new THREE.PointsMaterial({
        color: 0xffffff,  // Cor branca para estrelas
        size: 0.7,        // Tamanho dos pontos
        sizeAttenuation: true, // Faz o tamanho diminuir com a distância
    });

    // Criação do sistema de pontos (estrelas)
    var estrelas = new THREE.Points(geometriaEstrelas, materialEstrelas);

    scene.add(estrelas);
}

// Adiciona 1000 estrelas à cena
criarEstrelas(1000);

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
    scene.add(sol); // Adiciona o sol à cena    
});

var lua;
loader.load('lua3D/scene.gltf', function(gltf) {
    lua = gltf.scene;
    lua.position.set(4, 7, 0); // Posição inicial no céu
    lua.scale.set(0.0005, 0.0005, 0.0005); // Ajuste de escala
    lua.traverse(function(child) {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(lua); // Adiciona o lua à cena    
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
    scene.add(terra); // Adiciona o terra à cena    
});

// Curva do helicóptero
var curvaHelicoptero = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-10, 3, 0),
    new THREE.Vector3(-7, 3, -7),
    new THREE.Vector3(0, 3, -10),
    new THREE.Vector3(7, 3, -7), 
    new THREE.Vector3(10, 3, 0), 
    new THREE.Vector3(7, 3, 7),  
    new THREE.Vector3(0, 3, 10), 
    new THREE.Vector3(-7, 3, 7), 
    new THREE.Vector3(-10, 3, 0),
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
    if(terra){
        terra.rotation.y += 0.003;
    }
    moverMoto();
    moverHelicoptero();
    controls.update(); // Atualiza os controles da câmera
    renderer.render(scene, camera);
}

animate();