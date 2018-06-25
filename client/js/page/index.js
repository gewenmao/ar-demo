  THREEx.ArToolkitContext.baseURL = '../';
  //////////////////////////////////////////////////////////////////////////////////
  //    Init
  //////////////////////////////////////////////////////////////////////////////////

  // init renderer
  var renderer  = new THREE.WebGLRenderer({
    preserveDrawingBuffer: true, // https://stackoverflow.com/questions/26193702/three-js-how-can-i-make-a-2d-snapshot-of-a-scene-as-a-jpg-image
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color('lightgrey'), 0)
  // renderer.setSize( 640, 480 );

  renderer.setSize( 640, 480 );
  renderer.domElement.style.position = 'absolute'
  renderer.domElement.style.top = '0px'
  renderer.domElement.style.left = '0px'
  document.body.appendChild( renderer.domElement );

  // array of functions for the rendering loop
  var onRenderFcts= [];

  // init scene and camera
  var scene = new THREE.Scene();
    
  //////////////////////////////////////////////////////////////////////////////////
  //    Initialize a basic camera
  //////////////////////////////////////////////////////////////////////////////////

  // Create a camera
  var camera = new THREE.Camera();
  scene.add(camera);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  var arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam 
    sourceType : 'webcam',
    
    // // to read from an image
    // sourceType : 'image',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/images/img.jpg',    

    // to read from a video
    // sourceType : 'video',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',   
  })

  arToolkitSource.init(function onReady(){
    onResize()
  })
  
  // handle resize
  window.addEventListener('resize', function(){
    onResize()
  })
  function onResize(){
    arToolkitSource.onResize()  
    arToolkitSource.copySizeTo(renderer.domElement) 
    if( arToolkitContext.arController !== null ){
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas)  
    } 
  }
  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////
  

  // create atToolkitContext
  var arToolkitContext = new THREEx.ArToolkitContext({
    // cameraParametersUrl: THREEx.ArToolkitContext.baseURL + '../data/data/camera_para.dat',
    cameraParametersUrl: '/client/data/camera_para.dat',
    detectionMode: 'mono',
  })
  // initialize it
  arToolkitContext.init(function onCompleted(){
    // copy projection matrix to camera
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
  })

  // update artoolkit on every frame
  onRenderFcts.push(function(){
    if( arToolkitSource.ready === false ) return

    arToolkitContext.update( arToolkitSource.domElement )
    
    // update scene.visible if the marker is seen
    scene.visible = camera.visible
  })
    
  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////
  
  // init controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type : 'pattern',
    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.hiro',
    patternUrl : '/client/data/patt.hiro',
    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
    // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    changeMatrixMode: 'cameraTransformMatrix'
  })
  // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
  scene.visible = false

  //////////////////////////////////////////////////////////////////////////////////
  //    add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

  // add a torus knot 
  var geometry  = new THREE.CubeGeometry(1,1,1);
  var material  = new THREE.MeshNormalMaterial({
    transparent : true,
    opacity: 0.5,
    side: THREE.DoubleSide
  }); 
  var mesh  = new THREE.Mesh( geometry, material );
  mesh.position.y = geometry.parameters.height/2
  scene.add( mesh );
  
  var geometry  = new THREE.TorusKnotGeometry(0.3,0.1,64,16);
  var material  = new THREE.MeshNormalMaterial(); 
  var mesh  = new THREE.Mesh( geometry, material );
  mesh.position.y = 0.5
  scene.add( mesh );
  
  onRenderFcts.push(function(delta){
    mesh.rotation.x += Math.PI*delta
  })

  //////////////////////////////////////////////////////////////////////////////////
  //    render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////

  // render the scene
  onRenderFcts.push(function(){
    renderer.render( scene, camera );
  })

  // run the rendering loop
  var lastTimeMsec= null
  requestAnimationFrame(function animate(nowMsec){
    // keep looping
    requestAnimationFrame( animate );
    // measure time
    lastTimeMsec  = lastTimeMsec || nowMsec-1000/60
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec)
    lastTimeMsec  = nowMsec
    // call each update function
    onRenderFcts.forEach(function(onRenderFct){
      onRenderFct(deltaMsec/1000, nowMsec/1000)
    })
  })
  setTimeout(function() {
    // arToolkitContext.arController.canvas.toBlob(function(blob) {
    //   var a = document.createElement('a');
    //   a.textContent = 'Download';
    //   a.style.display = 'block';
    //   a.download = 'image.png';
    //   a.href = window.URL.createObjectURL(blob);
    //   console.log(a.href)
    //   a.click();
    // },'image/png', 1.0)

    // renderer.domElement.toBlob(function(blob) {
    //   var a = document.createElement('a');
    //   a.textContent = 'Download';
    //   a.style.display = 'block';
    //   a.download = 'image.png';
    //   a.href = window.URL.createObjectURL(blob);
    //   console.log(a.href)
    //   a.click();
    // },'image/png', 1.0)

    // console.log(arToolkitContext.arController.canvas.toDataURL("image/png"))

  }, 10000)
  


  function canvas2URL($canvas, callback) {
    $canvas.toBlob(function(blob) {
      var url = window.URL.createObjectURL(blob);
      callback(url);
    },'image/png', 1.0)
  }


  // function createImageBySrc(src, callback){
  //   var image = new Image();
  //   image.onload = function () {
  //       callback(image);
  //   };
  //   image.src = src;

  //   return image;
  // }

  // function canvasDrawImage($canvas, image) {
  //   var context = $canvas.getContext('2d');
  //   context.drawImage(image, 0, 0);
  //   context.save();
  // }

  function canvasDrawImage($canvas, account) {
    var images = [], count = 0;
    var context = $canvas.getContext('2d');

    return function() {
      var image = new Image();
      images.push(image);
      image.onload = function () {
        count = count + 1;
        if (count == account) {
          images.forEach(function(image) {
            context.drawImage(image, 0, 0);
          })
        }
      };

      return function(src) {
        image.src = src;
      }
    }
  }

  function canvas2canvas($from, canvasDrawImage) {
    canvas2URL($from, function(url) {
      canvasDrawImage(url);
    })
  }

  function renderCanvas() {
    var $canvas = $('<canvas class="photograph-canvas" width="640" height="480"></canvas>');
    var $box = $('<div class="photograph-box"></div>');
    var $closeBtn = $('<i class="icon iconfont icon-close"></i>');
    var $okBtn = $('<i class="icon iconfont icon-ok"></i>');
    var drawImage = canvasDrawImage($canvas[0], 2);

    canvas2canvas(arToolkitContext.arController.canvas, drawImage())
    canvas2canvas(renderer.domElement, drawImage());

    
    $box.append($canvas);
    $box.append($okBtn)
    $box.append($closeBtn)

    $('body').append($box);

    $closeBtn.on('click', function() {
      $box.remove();
    })

    $okBtn.on('click', function() {
      $canvas[0].toBlob(function(blob) {
        var a = document.createElement('a');
        a.textContent = 'Download';
        a.style.display = 'block';
        a.download = 'image.png';
        a.href = window.URL.createObjectURL(blob);
        a.click();
        $box.remove();
      },'image/png', 1.0)
    })

    return $box;
  }

  $('.photograph-btn').on('click', function() {
    renderCanvas();
  });

