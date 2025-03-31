import * as THREE from "three";
import fragment from "../shader/fragment.glsl";
import vertex from "../shader/vertexParticles.glsl";

import imageVertex from "../shader/imageFragment.glsl";
import imageFragment from "../shader/imageVertex.glsl";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

//Laungages Icons
import SWIFTUIIcon from "/assets/images/laungages/SwiftUI.png";
import PHPIcon from "/assets/images/laungages/PHP.png";
import THREEJSIcon from "/assets/images/laungages/Threejs.png";
import REACTIcon from "/assets/images/laungages/React.png";
import LARAVELIicon from "/assets/images/laungages/Laravel.png";
import NODEJSIcon from "/assets/images/laungages/Nodejs.png";
import AIICON from "/assets/images/laungages/AI.png";
import MLICON from "/assets/images/laungages/ML.png";
import NextJSIcon from "/assets/images/laungages/Nextjs.png";
import SQLIcon from "/assets/images/laungages/SQL.png";
import PYTHONIcon from "/assets/images/laungages/Python.png";
import DEVOPSIcon from "/assets/images/laungages/Devops.png";
import TYPESCRIPTIcon from "/assets/images/laungages/Typescript.png";

//Hide scrollbars
const htmlDiv = document.getElementById("html");
htmlDiv.style.paddingRight = htmlDiv.offsetWidth - htmlDiv.clientWidth + "px";

export default class Sketch {
  constructor(options) {
    this.scene = new THREE.Scene();

    this.container = options.dom;
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.setClearColor(0x141414, 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.raycaster = new THREE.Raycaster();

    this.loader = new GLTFLoader();

    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    this.time = 0;

    this.isPlaying = true;

    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath("/draco/gltf/");
    this.loader = new GLTFLoader();
    this.loader.setDRACOLoader(this.dracoLoader);

    this.loader.load("/assets/model/dna.gltf", (gltf) => {
      this.geometry = gltf.scene.children[0].geometry;
      this.geometry.center();

      this.addObjects();
      this.resize();
      this.setupResize();
      this.render();
    });

    this.moveValue = this.getBrowser() == "Safari" ? 0.002 : 0.001;

    //Eventlistener for rotationg DNA
    this.isShowingProjectIndividualPage = false;
    let lastKnownScrollPosition = 0;
    let deltaY = 0;

    window.addEventListener("scroll", (e) => {
      let ticking = false;
      if (
        !ticking &&
        this.dna &&
        !this.isShowingProjectIndividualPage &&
        this.isFullyLoaded
      ) {
        // event throtteling
        window.requestAnimationFrame(() => {
          deltaY = window.scrollY - lastKnownScrollPosition;
          lastKnownScrollPosition = window.scrollY;
          ticking = false;

          this.dna.rotation.y += deltaY * this.moveValue;
          this.dna2.rotation.y += deltaY * this.moveValue;

          this.dna.position.y += deltaY * this.moveValue;
          this.dna2.position.y += deltaY * this.moveValue;
        });
        ticking = true;
      }
    });

    this.mouse = new THREE.Vector2();
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = (e.clientX / this.width) * 2 - 1;
      this.mouse.y = -(e.clientY / this.height) * 2 + 1;

      if (this.dna) {
        this.dna.rotation.x += this.mouse.y * 0.0003;
        this.dna2.rotation.x += this.mouse.y * 0.0003;
      }
    });

    //No scrolling
    document.body.style.overflow = "hidden";

    window.addEventListener("load", () => {
      setTimeout(() => {
        const loadingPage = document.querySelector(".loading-page");
        loadingPage.style.opacity = 0;
        this.startCameraAnimmation();
        this.setupAnimations();
      }, 1000);
    });
  }

  handleScroll(scrollPos) {
    const positionFactor = 0.00002;
    const rotationFactor = 0.02;
    console.log(scrollPos);
    // Do something with the scroll position
    this.dna.rotation.y += rotationFactor;
    this.dna2.rotation.y += rotationFactor;
    const scrollableEnd =
      document.documentElement.scrollHeight - window.innerHeight;

    if (window.scrollY >= scrollableEnd || window.scrollY <= 0) {
    } else {
      console.log(scrollPos * this.moveValue);
      this.dna.position.y += scrollPos * positionFactor;
      this.dna2.position.y += scrollPos * positionFactor;
    }
  }

  startCameraAnimmation() {
    setTimeout(() => {
      window.scrollTo(0, 0); // For Safari
    }, 5);
    // document.documentElement.scollTop = 0; // For Chrome, Firefox, IE and Opera
    this.camera.position.set(-1.5, 8, 2);
    this.camera.rotation.set(-0.9, 0, 4);

    gsap.to(this.camera.position, {
      x: -1.5,
      y: 3,
      z: 4,
      duration: 2,
      ease: "power3.inOut",
    });
    gsap.to(this.camera.rotation, {
      x: 0,
      y: 0,
      z: 0,
      duration: 2,
      ease: "power3.inOut",
      onComplete: () => {
        //Make body scrolable again
        document.body.style.overflow = "visible";
        this.isFullyLoaded = true;

        this.dna2.visible = true;
      },
    });
  }

  setupResize() {
    window.addEventListener("resize", this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  addObjects() {
    let that = this;
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: "#extension GL_OES_standard_derivatives : enable",
      },
      side: THREE.DoubleSide,
      uniforms: {
        time: { value: 0 },
        uColor1: { value: new THREE.Color(0x0c0317) },
        uColor2: { value: new THREE.Color(0x170624) },
        uColor3: { value: new THREE.Color(0x07112e) },
        resolution: { value: new THREE.Vector4() },
      },
      // wireframe: true,
      transparent: true,
      vertexShader: vertex,
      fragmentShader: fragment,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.number = this.geometry.attributes.position.array.length;
    let randoms = new Float32Array(this.number / 3);
    let colorRandoms = new Float32Array(this.number / 3);

    let row = 100;
    for (let i = 0; i < this.number / 3; i++) {
      randoms.set([Math.random()], i);
      colorRandoms.set([Math.random() * Math.random()], i);
    }
    this.geometry.setAttribute(
      "randoms",
      new THREE.BufferAttribute(randoms, 1)
    );
    this.geometry.setAttribute(
      "colorRandoms",
      new THREE.BufferAttribute(colorRandoms, 1)
    );

    this.dna = new THREE.Points(this.geometry, this.material);
    this.dna2 = new THREE.Points(this.geometry, this.material);
    this.dna2.position.set(-4, -16, 0);
    this.dna2.rotation.x = Math.PI;

    this.scene.add(this.dna);
    this.dna2.visible = false;
    this.scene.add(this.dna2);

    //Stars
    this.starsGeometry = new THREE.BufferGeometry();
    this.starsCount = 500;

    this.posArray = new Float32Array(this.starsCount * 3);
    // xyz, xyz, xyz, xyz

    for (let i = 0; i < this.starsCount * 3; i++) {
      this.posArray[i] = (Math.random() + 0.5) * 10 - 10;
    }

    this.starsMaterial = new THREE.PointsMaterial({
      size: 0.006,
      color: 0xa9a9a9,
    });

    this.starsGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.posArray, 3)
    );
    this.starsMesh = new THREE.Points(this.starsGeometry, this.starsMaterial);
    this.scene.add(this.starsMesh);
  }

  render() {
    this.time += 0.05;

    this.dna.rotation.y += 0.001;
    this.dna2.rotation.y += 0.001;
    this.starsMesh.rotation.y = this.time / 25;
    this.material.uniforms.time.value = this.time;

    requestAnimationFrame(this.render.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  //Handle amimations
  setupAnimations() {
    //Projects Images
    if (this.width <= 1000) {
    } else {
      this.initProjectsEffect().then(() => {
        this.isLoaded = true;
        if (this.isMouseOver) this.onMouseOver(this.tempItemIndex);
        this.tempItemIndex = null;
        this.createPlaneForImage();
        this.createProjectsEventsListeners();
      });
    }

    this.setupAnimationsForTitle();
    this.setupScrollToExplore();
    this.setupAboutMe();
    this.createSkillsView();
    this.handleEmailSend();
    this.setupEventListenerForProjectImages();
  }

  //Setup projects Images
  initProjectsEffect() {
    let promises = [];

    this.items = this.getItemsElements();

    const THREEtextureLoader = new THREE.TextureLoader();
    this.items.forEach((item, index) => {
      // create textures
      promises.push(
        this.loadTexture(
          THREEtextureLoader,
          item.img ? item.img.src : null,
          index
        )
      );
    });

    return new Promise((resolve, reject) => {
      // resolve textures promises
      Promise.all(promises).then((promises) => {
        // all textures are loaded
        promises.forEach((promise, index) => {
          // assign texture to item
          this.items[index].texture = promise.texture;
        });
        resolve();
      });
    });
  }

  loadTexture(loader, url, index) {
    // https://threejs.org/docs/#api/en/loaders/TextureLoader
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({ texture: null, index });
        return;
      }
      // load a resource
      loader.load(
        // resource URL
        url,

        // onLoad callback
        (texture) => {
          resolve({ texture, index });
        },

        // onProgress callback currently not supported
        undefined,

        // onError callback
        (error) => {
          console.error("An error happened.", error);
          reject(error);
        }
      );
    });
  }

  createPlaneForImage() {
    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    this.projectsGeometry = new THREE.PlaneGeometry(2.5, 2.5, 8, 8);
    this.uniforms = {
      uTexture: {
        //texture data
        value: null,
      },
      uOffset: {
        //distortion strength
        value: new THREE.Vector2(0.0, 0.0),
      },
      uAlpha: {
        //opacity
        value: 0,
      },
      uTime: {
        //opacity
        value: 0,
      },
    };
    this.projectsMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: imageFragment,
      fragmentShader: imageVertex,
      transparent: true,
    });
    this.projectsPlane = new THREE.Mesh(
      this.projectsGeometry,
      this.projectsMaterial
    );
    this.projectsPlane.position.set(this.mouse.x, this.mouse.y, 0);
    this.trails = [];
    for (let i = 0; i < 4; i++) {
      let plane = this.projectsPlane.clone();
      this.trails.push(plane);
      this.scene.add(plane);
    }
  }

  get viewSize() {
    let distance = this.camera.position.z;
    let vFov = (this.camera.fov * Math.PI) / 180;
    let height = 2 * Math.tan(vFov / 2) * distance;
    let width = height * (this.width / this.height);
    return { width, height, vFov };
  }

  createProjectsEventsListeners() {
    this.test = 0.15;

    this.items.forEach((item, index) => {
      item.element.addEventListener(
        "mouseover",
        this._onMouseOver.bind(this, index),
        false
      );

      item.element.addEventListener(
        "mouseleave",
        this._onMouseLeave.bind(this),
        false
      );
    });

    document.addEventListener("mousemove", this._onMouseMove.bind(this), false);
  }

  //Mouse Over
  _onMouseOver(index, event) {
    if (this.width > 700) {
      this.onMouseOver(index, event);
    }
  }

  onMouseOver(index, e) {
    if (!this.isLoaded) return;
    this.onMouseEnter();
    if (this.currentItem && this.currentItem.index === index) return;
    this.onTargetChange(index);
  }

  onTargetChange(index) {
    // item target changed
    this.currentItem = this.items[index];
    if (!this.currentItem.texture) return;

    //update texture
    this.uniforms.uTexture.value = this.currentItem.texture;

    // compute image ratio
    let imageRatio =
      this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight;

    // scale plane to fit image dimensions
    this.scale = new THREE.Vector3(imageRatio, 1.5, 1.5);
    this.projectsPlane.scale.copy(this.scale);
  }

  onMouseEnter() {
    if (!this.currentItem || !this.isMouseOver) {
      this.isMouseOver = true;
      // show plane
      gsap.to(this.uniforms.uAlpha, 0.5, {
        value: 1,
        ease: Power4.easeOut,
      });
    }
  }

  //Mouse Move
  _onMouseMove(event) {
    if (this.width > 700) {
      // get normalized mouse position on viewport
      this.mouse.x = (event.clientX / this.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.height) * 2 + 1;

      this.onMouseMove(event);
    }
  }

  onMouseMove(event) {
    // project mouse position to world coordinates
    let x = this.mouse.x.map(
      -1,
      1,
      -this.viewSize.width / 2,
      this.viewSize.width / 2
    );
    let y = this.mouse.y.map(
      -1,
      1,
      -this.viewSize.height / 2,
      this.viewSize.height / 2
    );

    // update plane position
    this.position = new THREE.Vector3(x - 1.5, y + 3, 0);
    gsap.to(this.projectsPlane.position, 1, {
      x: x - 1.5,
      y: y + 3,
      ease: Power4.easeOut,
      onUpdate: this.onPositionUpdate.bind(this),
    });

    this.trails.forEach((trail, index) => {
      let duration = 0.5 * 4 - 0.5 * index;
      TweenLite.to(trail.position, duration, {
        x: x - 1.5,
        y: y + 3,
        ease: Power4.easeOut,
      });
    });
  }

  onPositionUpdate() {
    // compute offset
    let offset = this.projectsPlane.position
      .clone()
      .sub(this.position) // velocity
      .multiplyScalar(-0.25);
    this.uniforms.uOffset.value = offset;
  }

  //Mouse Leave
  _onMouseLeave(event) {
    if (this.width > 700) {
      this.isMouseOver = false;
      this.onMouseLeave(event);
    }
  }

  onMouseLeave(event) {
    gsap.to(this.uniforms.uAlpha, 0.5, {
      value: 0,
      ease: Power4.easeOut,
    });
  }

  getItemsElements() {
    // this.itemsWrapper = null

    // convert NodeList to Array
    this.items = [...document.querySelectorAll(".projects-link")];

    //create Array of items including element, image and index
    return this.items.map((item, index) => ({
      element: item,
      img: item.querySelector("img") || null,
      index: index,
    }));
  }

  //Normal JavaScript
  setupAnimationsForTitle() {
    //Animation on reveal
    const mainHeadline = document.getElementById("main-headline");
    const titlesDiv = document.getElementById("titles-div");
    const overallAnimationDiv = document.getElementById(
      "overall-animation-div"
    );
    const scrollToExploreDiv = document.getElementsByClassName(
      "scroll-to-explore-div"
    );
    this.timeline = gsap.timeline();

    this.timeline.to(mainHeadline, {
      delay: 0.5,
      duration: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
    });
    this.timeline.to(
      overallAnimationDiv,
      { duration: 1, clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)" },
      "-=1"
    );
    this.timeline.to(scrollToExploreDiv, { duration: 1, opacity: 1 }, "-=0.2");

    //Contant change of title
    this.titlesCount = 1;
    this.titlesInnerDiv = document.getElementById("titles-innerdiv");
    this.headlineTexts = document.getElementsByClassName("headline-text");
    this.titleDash = document.getElementById("title-dash");
    const headlineTexts = document.getElementsByClassName("headline-text");
    //Set height of titlesDiv
    titlesDiv.style.height = headlineTexts[0].offsetHeight + "px";
    this.lastTransformValue = 0;

    setInterval(() => {
      if (this.titlesCount != 5) {
        const headlineOffsetHeight =
          headlineTexts[this.titlesCount - 1].offsetHeight;

        this.titlesInnerDiv.style.transform = `translate(0, ${
          -headlineOffsetHeight + this.lastTransformValue
        }px)`;
        this.titleDash.style.transform = `rotate(-${
          180 * this.titlesCount
        }deg)`;

        //Set height of titlesDiv
        titlesDiv.style.height =
          headlineTexts[this.titlesCount].offsetHeight + "px";

        this.lastTransformValue =
          -headlineOffsetHeight + this.lastTransformValue;
        this.titlesCount++;
      } else {
        this.titlesInnerDiv.style.transform = "translate(0, 0px)";
        this.titleDash.style.transform = `rotate(0deg)`;
        this.titlesCount = 1;
        this.lastTransformValue = 0;
        //Set height of titlesDiv
        titlesDiv.style.height = headlineTexts[0].offsetHeight + "px";
      }
    }, 2000);

    //My projects Headline
    const myProjectsHeadline = document.getElementById("my-projects-headline");
    gsap.to(myProjectsHeadline, {
      duration: 1,
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
      scrollTrigger: {
        trigger: myProjectsHeadline,
        start: "bottom bottom",
      },
    });
  }

  setupScrollToExplore() {
    this.scrollToExploreText = document.getElementById(
      "scroll-to-explore-text"
    );
    this.scrollToExploreIndicator = document.getElementById(
      "scroll-to-explore-indicator"
    );

    gsap.to(this.scrollToExploreText, {
      scrollTrigger: {
        trigger: "#scroll-to-explore-indicator",
        start: "bottom bottom",
        scrub: 0.1,
      },
      duration: 1,
      opacity: 0,
    });
    gsap.to(this.scrollToExploreIndicator, {
      scrollTrigger: {
        trigger: "#scroll-to-explore-indicator",
        start: "bottom bottom",
        scrub: 0.1,
      },
      duration: 1,
      height: 0,
    });
  }

  setupAboutMe() {
    this.scrollToExploreText = document.querySelector(".about-me-indicator");

    gsap.to(this.scrollToExploreText, {
      scrollTrigger: {
        trigger: this.scrollToExploreText,
        start: "bottom bottom",
        scrub: 0.1,
      },
      duration: 1,
      width: "120px",
    });
  }

  createProjectPageImage() {
    const textureLoader = new THREE.TextureLoader();

    this.projectPageImageGeo = new THREE.PlaneGeometry(3.6, 3.6);
    this.projectPageImageMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uAlpha: { value: 0 },
        uTexture: { value: textureLoader.load(projectsImage2) },
      },
      fragmentShader: `
      uniform sampler2D uTexture;
      uniform float uAlpha;
      varying vec2 vUv;
     
      void main() {
        vec3 color = texture2D(uTexture,vUv).rgb;
        gl_FragColor = vec4(color,uAlpha);
      }
     `,
      vertexShader: `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      }
      `,
      transparent: true,
    });

    this.projectPageImageMesh = new THREE.Mesh(
      this.projectPageImageGeo,
      this.projectPageImageMaterial
    );
    this.projectPageImageMesh.position.set(-4.4, 3.5, 0);
    this.scene.add(this.projectPageImageMesh);
  }

  //Create skills horizontal view
  createSkillsView() {
    const skills = [
      Array("TypeScript", TYPESCRIPTIcon),
      Array("React", REACTIcon),
      Array("NextJS", NextJSIcon),
      Array("Node.js", NODEJSIcon),
      Array("SQL", SQLIcon),
      Array("DevOps", DEVOPSIcon),
      Array("Machine Learning", MLICON),
      Array("Artificial Intelligence", AIICON),
      Array("Python", PYTHONIcon),
      Array("Three.js", THREEJSIcon),
      Array("SwiftUI", SWIFTUIIcon),
      Array("React Native", REACTIcon),
      Array("PHP", PHPIcon),
      Array("Laravel", LARAVELIicon),
    ];
    const skillsDiv = document.getElementById("skills-div");

    this.previousStartValue = 0;
    //Setup HTML
    for (var i = 0; i < skills.length; i++) {
      const skill = skills[i];

      const skillOuterDiv = document.createElement("div");
      skillOuterDiv.className = "skill-outer-div";

      const skillDiv = document.createElement("div");
      skillDiv.className = "skill-div";
      skillDiv.id = `${i}`;

      // Indicators
      const skillBlueIndicator = document.createElement("div");
      skillBlueIndicator.className = "skill-blue-indicator-div";

      const skillRedIndicator = document.createElement("div");
      skillRedIndicator.className = "skill-red-indicator-div";

      //Image
      const centerCover = document.createElement("div");
      centerCover.className = "skill-center-cover";

      const headline = document.createElement("p");
      headline.innerHTML = skill[0];
      headline.className = "skill-headline";

      const imageCover = document.createElement("div");
      imageCover.className = "skill-img-cover";

      const image = document.createElement("img");
      image.src = skill[1];
      image.alt = skill[0];
      image.className = "skill-img";
      image.style.filter = "brightness(0) invert(1)"; // Makes the image white

      //Add Elements
      skillDiv.appendChild(skillBlueIndicator);

      centerCover.appendChild(headline);
      imageCover.appendChild(image);

      centerCover.appendChild(imageCover);
      skillDiv.appendChild(centerCover);

      skillDiv.appendChild(skillRedIndicator);
      skillsDiv.appendChild(skillDiv);

      //Displace divs
      if (i % 2 == 1) {
        skillDiv.style.marginBottom = "180px";
        skillOuterDiv.style.backgroundColor = "green";
      } else {
        skillDiv.style.marginTop = "180px";
        skillOuterDiv.style.backgroundColor = "red";
      }
    }

    //ScrollTrigger
    const panels = gsap.utils.toArray("#skills-div .skill-div");

    gsap.registerPlugin(ScrollTrigger);

    this.horizontalScroll = gsap.to(panels, {
      x: () => -(skillsDiv.scrollWidth - this.width) - 20 + "px",
      ease: "none",
      scrollTrigger: {
        trigger: "#skills-div",
        scrub: 1,
        pin: true,
        end: () => "+=" + (skillsDiv.offsetWidth - this.width + 200) * 30,
      },
    });
    this.setupSplits();
  }

  setupSplits() {
    const quotes = document.querySelectorAll(".skill-div");

    quotes.forEach((quote) => {
      if (quote.id == "0") {
        return;
      }
      // Reset if needed
      if (quote.anim) {
        quote.anim.progress(1).kill();
      }

      // Set up the anim
      quote.anim = gsap.to(quote, {
        scrollTrigger: {
          trigger: quote,
          toggleActions: "restart pause resume reverse",
          start: `left ${75}%`,
          containerAnimation: this.horizontalScroll,
          scrub: 1,
        },
        duration: 1,
        ease: "circ.out",
        scale: this.width <= 700 ? 1.25 : 1.5,
      });
    });
  }

  handleEmailSend() {
    const sendButton = document.getElementById("send-message-button");
    const loader = document.querySelector(".loader");

    sendButton.addEventListener("click", () => {
      this.name = document.getElementById("name-input").value;
      this.email = document.getElementById("email-input").value;
      this.content = document.getElementById("content-input").value;

      if (
        this.validateEmail(this.email) &&
        this.name !== "" &&
        this.content !== ""
      ) {
        this.sendMail();

        sendButton.innerHTML = "";
        loader.style.opacity = 1;

        setTimeout(() => {
          loader.style.opacity = 0;
          sendButton.innerHTML = "Message is sent";

          setTimeout(() => {
            sendButton.innerHTML = "Send message";
            document.getElementById("name-input").value = "";
            document.getElementById("email-input").value = "";
            document.getElementById("content-input").value = "";
          }, 2000);
        }, 2500);
      } else {
        sendButton.innerHTML = "Fill out form";

        setTimeout(() => {
          sendButton.innerHTML = "Send message";
        }, 3000);
      }
    });
  }

  validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
  }

  sendMail() {
    var params = {
      name: this.name,
      email: this.email,
      message: this.content,
    };

    const serviceId = "service_ttuoguf";
    const templateId = "template_hpo53f9";

    emailjs.send(serviceId, templateId, params).then((res) => {
      //Message sent
    });
  }

  getBrowser() {
    if (navigator.userAgent.indexOf("Chrome") != -1) {
      return "Chrome";
    } else if (navigator.userAgent.indexOf("Opera") != -1) {
      return "Opera";
    } else if (navigator.userAgent.indexOf("MSIE") != -1) {
      return "IE";
    } else if (navigator.userAgent.indexOf("Firefox") != -1) {
      return "Firefox";
    } else if (navigator.userAgent.indexOf("Safari") != -1) {
      return "Safari";
    } else {
      return "unknown";
    }
  }

  setupEventListenerForProjectImages() {
    const projectImages = document.getElementsByClassName("projects-img");

    for (var i = 0; i < projectImages.length; i++) {
      const projectImage = projectImages[i];

      projectImage.addEventListener("click", () => {
        if (projectImage.style.objectFit == "contain") {
          projectImage.style.objectFit = "cover";
        } else {
          projectImage.style.objectFit = "contain";
        }
      });
    }
  }
}

new Sketch({
  dom: document.getElementById("container"),
});

Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return ((this - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
};
