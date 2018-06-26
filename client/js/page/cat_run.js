//   THREEx.ArToolkitContext.baseURL = '';

//   // github
  var baseURL = '/';
  if ( window.location.origin.indexOf('github') != -1) {
    baseURL = '/ar-demo/';
  }


  var renderer = new THREE.WebGLRenderer( {
    preserveDrawingBuffer: true,
    alpha: true,
    antialias: true 
  } );
  renderer.setClearColor(new THREE.Color('lightgrey'), 0)
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;
  
  var  scene = new THREE.Scene();
  // scene.background = new THREE.Color( 0xa0a0a0 );
  // scene.fog = new THREE.Fog( 0xa0a0a0, 200, 1000 );
  
  var camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.set( 100, 200, 300 );

  scene.add(camera);

  var hpLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
  hpLight.position.set( 0, 200, 0 );
  scene.add(hpLight);

  var dtLight = new THREE.DirectionalLight( 0xffffff );
  dtLight.position.set( 0, 200, 100 );
  dtLight.castShadow = true;
  dtLight.shadow.camera.top = 180;
  dtLight.shadow.camera.bottom = -100;
  dtLight.shadow.camera.left = -120;
  dtLight.shadow.camera.right = 120;
  scene.add(dtLight);

  var clock = new THREE.Clock();



  var mixers = [];


  document.body.appendChild( renderer.domElement );

  window.addEventListener( 'resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }, false );

  var loader = new THREE.FBXLoader();
  loader.load( baseURL + 'client/data/cat.fbx', function ( object ) {
    object.mixer = new THREE.AnimationMixer( object );
    mixers.push( object.mixer );
    var action = object.mixer.clipAction( object.animations[ 0 ] );
    action.play();
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    object.position.set( 100, 150, -200 );
    scene.add( object );
  } );

  requestAnimationFrame(function animate() {
    requestAnimationFrame( animate );
    if ( mixers.length > 0 ) {
      for ( var i = 0; i < mixers.length; i ++ ) {
        mixers[ i ].update( clock.getDelta() );
      }
    }
    renderer.render( scene, camera );
  })

