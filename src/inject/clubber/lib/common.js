// TOY_ID = "rtrtw8";


class ClubberMiddleware{

  constructor( tag ){
    this.audioDevices = [];
    this.lastObjectUrl = null;
    this.clubberized = null;
    this.data = {};
    this.needsCorrection = false;
    this.thresholdLevel = 1;
    this.shaders = [];
    this.currentShaders = [];
    this.currentShaderIndex = 2;
    this.debugBands = false;
    this.transitionStart = 0;
    this.currentTime = 0;
    this.isRunning = false;
    this.transitionTime = 2000;

  }

  init(){
      this.getTags();
      this.initGl();
      this.initClubberObject();
      this.initConfigStructures();
      this.setAudioListener();
      this.setVideoListener();
      this.addKeypressListener();
      this.enumerateDevices();
      this.configShadersAndTemplates();
      this.initUniforms();
      this.initShaders();
      this.initCorrection();
      this.initOpacity();
      // this.threshold();
  }

  getTags(){
    this.info = document.getElementById("info");
    this.audio = document.querySelector("video");
    this.audio.crossOrigin = "anonymous";
    this.canvas = document.querySelector("canvas");
    this.smoothing = document.getElementById("smoothing");

  }

  initGl(){
    this.gl = twgl.getWebGLContext(this.canvas);
    this.ext = this.gl.getExtension("OES_standard_derivatives");
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.enable(this.gl.BLEND);
    this.gl.clearColor(0, 0, 0, 1);
  }

  initClubberObject(){
    this.clubber;
    try {
      this.clubber = new Clubber({thresholdFactor:0, size: 4096});
    } catch(exc) {
      console.warn("Can't handle 4096 for fft size, degrading to 2048");
      this.clubber = new Clubber({thresholdFactor:0, size: 2048});
    }
  }

  initConfigStructures(){
    this.templates = ["0123", "0123", "0123", "0123"];
    this.smoothArrays = [
      [0.08,0.09,0.1,0.1],
      [0.08,0.09,0.1,0.1],
      [0.08,0.09,0.1,0.1],
      [0.08,0.09,0.1,0.1]
    ];

    this.adaptArrays = [
      [1,1,1,1],
      [1,1,1,1],
      [1,1,1,1],
      [1,1,1,1]
    ];

    this.rangeArrays = [
      [1, 32, 64, 128],
      [32, 48, 64, 128],
      [48, 64, 64, 128],
      [64, 96,  64, 128]
    ];


  }

  startListening(){
    this.clubber.listen(this.audio);

  }

  initClubber (query) {
    var param;
    for(i=0; i<4; i++){
      var o = {"s": this.smoothArrays, "r": this.rangeArrays, "a": this.adaptArrays}
      Object.keys(o).forEach( (k)=> {
        var arrs = o[k];
        param = this.getParameterByName(k+i, query);
        if(param) {
          var arr = arrs[i];
          param.split(",").forEach(function(s,i){
            if( i < arr.length) arr[i] = parseFloat(s);
          });
        }
      });

      param = this.getParameterByName("t"+i, query);
      if(param && param.length > i) {
        this.templates[i] = param;
      }
    }
    this.data.bands = [];
    for(var i=0; i<4; i++){
      this.data.bands.push( this.clubber.band({
        from: this.rangeArrays[i][0], to: this.rangeArrays[i][1], low: this.rangeArrays[i][2], high: this.rangeArrays[i][3],
        smooth: this.smoothArrays[i], adapt: this.adaptArrays[i], template: this.templates[i]
      }));
    }
  }
  initOpacity(){

    var cookieOpacity = this.getCookieValue("3xO");
    var urlOpacity = this.getParameterByName("3xO");
    var newOpacity = 1;

    if( typeof( cookieOpacity ) !== "undefined"){
      newOpacity = cookieOpacity;

    }
    if( urlOpacity !== ""){
      newOpacity = urlOpacity;
    }
    this.setVideoOpacity(newOpacity);
  }
  initShaders(){




    this.shaderIds.forEach( (id)=> {
      var shader = new Shader( this.gl, {
        source: this.load(chrome.extension.getURL("src/inject/clubber/assets/shaders/" + id + ".fs")),
        uniforms: this.uniforms,
        correct: this.needsCorrection
      });
      shader.id = id;
      this.shaders.push(shader);
    });

    var cookieShader = this.getCookieValue("3xS");
    var urlShader = this.getParameterByName("3xS");
    let newShader = this.currentShaderIndex;

    if( cookieShader !== ""){
      newShader = cookieShader;

    }
    if( this.getShadeId( urlShader) != -1 ){
      newShader = this.getShadeId( urlShader);
    }

    this.currentShaders.push(this.shaders[newShader]);
  }

  initCorrection(){
    this.correctArray = [0, 1, 1, 1];
    var arr = [0, 1, 1, 1];
    if(arr = this.getParameterByName("correct")) {
      arr.split(",").forEach(function (v, i) {this.correctArray[i] = parseFloat(v);});
      this.needsCorrection = true;
    }
  }

  initUniforms(){
    this.uniforms = {
      iMusic: new Float32Array(16),
      iResolution: [this.gl.canvas.width, this.gl.canvas.height,0],
      // iChannel0: twgl.createTexture(gl, {src: noise}),
      iChannelResolution: [256,256,0],
      iCorrect: this.correctArray
    };
  }
  setAudioListener(){

    this.audio.onerror = function () {
      console.log(audio.currentSrc);

      alert(
        this.audio.currentSrc.match("blob:")  ?
        "Bad audio file"
        :
        "API limit reached, you could try again later.\n"
      );

    }
  }

  setVideoListener(){
    $(this.audio).on('loadstart', ()=>{
      this.setVideoOpacity( this.opacity );
    });
  }

  getShadeId(shaderId){
    var newIndex;
    var result = this.shaders.filter(( obj, index )=> {
                    if(obj.id === shaderId){
                      newIndex = index;

                    }
                    return obj.id == shaderId;
                  });

    if( result.length > 0 ){
      return newIndex;

    }else{
      return -1;
    }
  }

  getParameterByName(name, search) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"), results = regex.exec(search || location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }




  setUrlParam(paramName, paramValue) {

    var url = window.location.href;
    var hash = location.hash;
    url = url.replace(hash, '');
    if (url.indexOf(paramName + "=") >= 0)
    {
      var prefix = url.substring(0, url.indexOf(paramName));
      var suffix = url.substring(url.indexOf(paramName));
      suffix = suffix.substring(suffix.indexOf("=") + 1);
      suffix = (suffix.indexOf("&") >= 0) ? suffix.substring(suffix.indexOf("&")) : "";
      url = prefix + paramName + "=" + paramValue + suffix;
    }
    else
    {
      if (url.indexOf("?") < 0)
      url += "?" + paramName + "=" + paramValue;
      else
      url += "&" + paramName + "=" + paramValue;
    }
    history.pushState(null, null, url);

  }

  enumerateDevices () {
    var self = this;
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    navigator.mediaDevices.enumerateDevices()
    .then((devices)=> {

      devices.forEach((device) => {
        if(device.kind !== "audioinput") return;
        this.audioDevices.push(device.deviceId);
      });
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });

  }

  configShadersAndTemplates(){
    this.shaderIds = ["4dsGzH","MsjSW3","4tlSzl", "MdlXRS","lslXDn","XsXXDn","MlXSWX"];
    this.templates = ["0234", "0234", "0234", "0234"];
    this.shaderIds.forEach((s, i) => {
      var p = this.getParameterByName("sh"+i);
      if (p) this.shaderIds[i] = p;
    })
  }

  threshold(){
    var id=(this.thresholdLevel++)% 3;
    this.smoothing.innerHTML = ["low", "mid", "high"][id];
    this.smoothing.style.opacity = 0.2 + 0.3 * id;
    this.clubber.smoothing = [0.66, 0.8, 0.92][id];
  }

  incrementVideoOpacity(){
    var opacity = parseFloat( $(this.audio).css('opacity'));
    var newOpacity = (opacity < 1) ? opacity + 0.1 : opacity;
    if( newOpacity === 1){
      this.stop();
    }
    this.setVideoOpacity(newOpacity);

  }

  decrementVideoOpacity(){

    var opacity = parseFloat( $(this.audio).css('opacity'));
    if ( opacity === 1) {
      this.start();
    }
    var newOpacity = (opacity > 0) ? opacity - 0.1 : opacity;
    this.setVideoOpacity(newOpacity);
  }

  removeVideoOpacity(){
    this.setVideoOpacity(0);

  }

  resetVideoOpacity(){
    this.setVideoOpacity(1);

  }

  setVideoOpacity( opacity ){
    document.cookie = "treePerOpacity="+opacity;
    this.opacity = opacity;

    $(this.audio).css('opacity', opacity);
    this.setUrlParam( "3xO" , opacity);

  }

  getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
  }


  emptyCurrentShader(){
    while( this.currentShaders.length > 1) this.currentShaders.pop();
  }

  updateShader(){

    this.setUrlParam( "3xS" , this.shaders[this.currentShaderIndex].id);

    var shader = this.shaders[this.currentShaderIndex];
    shader.startTime = this.currentTime/1000;
    this.currentShaders.unshift(shader);
    this.transitionStart = this.currentTime;
  }
  nextShader() {
    if( this.currentShaderIndex < this.shaders.length){
      this.currentShaderIndex++;
    }
    this.updateShader();
  }

  previousShader(){
    if( this.currentShaderIndex > 0){
      this.currentShaderIndex--;
    }
    this.updateShader();

  }

  start(){
    this.isRunning = true;
    this.startListening();
    this.render(0);

  }

  stop(){
    this.isRunning = false;

  }
  render(time) {
    this.currentTime = time;

    if(this.isRunning){

      window.requestAnimationFrame( this.render.bind(this));
    }
    this.clubber.update(time);
    for(var i = 0; i< 4; i++)
      this.data.bands[i](this.uniforms.iMusic, 4*i);
    this.data.time = time/1000;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    twgl.resizeCanvasToDisplaySize(this.gl.canvas);
    this.uniforms.iResolution = [this.gl.canvas.width, this.gl.canvas.height,0];
    this.uniforms.iCorrect = this.correctArray;
    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    if(this.currentShaders.length > 1){
      var delta = time - this.transitionStart;
      if(delta > this.transitionTime) {
        this.currentShaders = [this.currentShaders.shift()];
        this.currentShaders[0].transition=1;
      } else {
        var tr = Math.pow(delta/this.transitionTime, 1.6);
        this.currentShaders.forEach( (shader, i) => {
          shader.transition = i ? 1-tr:tr;
          shader.render(this.data, true);
        });
        return;
      }
    }
    this.currentShaders[0].render(this.data, true);
    if(this.debugBands) this.debugShader.render(this.data, true);
  }

  addKeypressListener(){
    window.addEventListener("keyup", this.handleKeypress.bind(this));

  }
  handleKeypress(e){
    var v = parseInt(e.key);
    if(isNaN(v)){
      if(e.key === "v" || e.key === "V") debugBands = !debugBands;
      if(e.key ==="+" || e.key ==="]" ) this.incrementVideoOpacity();

      if(e.key ==="-" || e.key ==="[" ) this.decrementVideoOpacity();

      if(e.key ==="b" || e.key ==="B" ) this.previousShader();

      if(e.key ==="n" || e.key ==="N" ) this.nextShader();

      return;
    };
    //
    // if(!v){
    //   threshold();
    //   return;
    // }
  }

  load (url, cb) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url);
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
        if(cb) {
          cb(this.status);
        }
      };
      xhr.onerror = function () {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

}

// function change () {
//   var url = localStorage.getItem("soundcloud-track");
//   var sa = ["Enter a soundcloud track url"];
//   function trunc(s,n){
//       return (s.length > n) ? s.substr(0, n-1) + '...' : s;
//   };
//   if(audioDevices.length){
//     sa.push("\nYou can also select live audio input by index:\n\n");
//     audioDevices.forEach(function (d,i) {
//       sa.push((2 * i) + " - " + trunc(d,24));
//       sa.push((2 * i + 1) + " - (muted)" + trunc(d,24));
//     });
//   }
//   url = prompt(sa.join("\n"), url);
//   var nurl = parseInt(url);
//   var devId = audioDevices[Math.floor(nurl/2)];
//   if(devId) {
//     navigator.mediaDevices.getUserMedia({audio: { deviceId: { exact: devId } }})
//     .then(function(stream) {
//       play(stream);
//       clubber.muted = nurl & 1 ? true : false;
//     })
//   } else if (url) soundcloud(url);
// }


//
// function shadertoy(url) {
//   url = url.split("?")[0].split("/").pop();
//   return load("http://www.shadertoy.com/api/v1/shaders/" + url + "?key="+TOY_ID)
//   .then(function(text){
//     var obj = JSON.parse(text);
//     if(obj.Shader){
//       return obj.Shader.renderpass[0].code;
//     }
//   });
// }

// var noise = document.querySelector("#noise");

//
// noise.addEventListener("load", function () {
//   twgl.setTextureFromElement(gl, uniforms.iChannel0, this);
// })



// var debugShader = new Shader(gl, {
//     source: load("/clubber/assets/shaders/debug.fs"),
//     uniforms: uniforms,
//     correct: needsCorrection
//   });
//
// debugShader.transition = 0.5;
