import React, { useEffect, useRef } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TextureLoader,
  MeshBasicMaterial,
  Mesh,
  WebGLRenderer,
  MathUtils,
  BoxGeometry,
  Texture,
  ImageLoader,
} from "three";
//@ts-ignore
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<PerspectiveCamera>();
  const sceneRef = useRef<Scene>();
  const rendererRef = useRef<WebGLRenderer>();
  const animateNumber = useRef<number>();
  const controlsRef = useRef<OrbitControls>();
  useEffect(() => {
    function getTexturesFromAtlasFile(atlasImgUrl: string, tilesNum: number) {
      const textures: any[] = [];

      for (let i = 0; i < tilesNum; i++) {
        textures[i] = new Texture();
      }

      new ImageLoader().load(atlasImgUrl, (image) => {
        const tileWidth = image.width;

        for (let i = 0; i < textures.length; i++) {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = tileWidth;
          canvas.width = tileWidth;
          context?.drawImage(
            image,
            0,
            tileWidth * i,
            tileWidth,
            tileWidth,
            0,
            0,
            tileWidth,
            tileWidth
          );
          textures[i].image = canvas;
          textures[i].needsUpdate = true;
        }
      });
      const backImage = textures[0];
      const downImage = textures[1];
      const fontImage = textures[2];
      const leftImage = textures[3];
      const rightImage = textures[4];
      const upImage = textures[5];
      return [rightImage, leftImage, upImage, downImage, fontImage, backImage];
    }
    const containerElement = containerRef.current;
    function onWindowResize() {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    }

    function animate() {
      if (animateNumber.current) {
        cancelAnimationFrame(animateNumber.current);
      }
      animateNumber.current = requestAnimationFrame(animate);
      update();
    }

    function update() {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const controls = controlsRef.current;
      if (camera && renderer && scene && controls) {
        controls.update(); // required when damping is enabled
        renderer.render(scene, camera);
      }
    }

    function clearOldView() {
      const camera = cameraRef.current;
      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const controls = controlsRef.current;
      if (camera && renderer && scene && controls && containerElement) {
        scene.clear();
        camera.clear();
        renderer.dispose();
        containerElement.innerHTML = "";
      }
    }

    if (containerElement) {
      if (rendererRef.current) {
        clearOldView();
      }
      // const previewUrl =
      //   "https://threejs.org/examples/textures/cube/sun_temple_stripe.jpg";
      const previewUrl =
        "https://nhathat.azureedge.net/vrdev360/394ad317-d5f3-440a-bcf3-b5b150e3c499/preview.jpg";
      const containerWidth = containerElement.offsetWidth;
      const containerHeight = containerElement.offsetHeight;
      const camera = new PerspectiveCamera(
        90,
        containerWidth / containerHeight,
        0.1,
        100
      );
      const renderer = new WebGLRenderer();
      rendererRef.current = renderer;
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(containerWidth, containerHeight);
      containerElement.appendChild(renderer.domElement);
      const scene = new Scene();
      sceneRef.current = scene;
      camera.position.z = 0.01;
      cameraRef.current = camera;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.enableDamping = true;
      controls.rotateSpeed = -0.25;
      controlsRef.current = controls;
      const textures = getTexturesFromAtlasFile(previewUrl, 6);

      const materials = [];

      for (let i = 0; i < 6; i++) {
        materials.push(new MeshBasicMaterial({ map: textures[i] }));
      }

      const skyBox = new Mesh(new BoxGeometry(1, 1, 1), materials);
      skyBox.geometry.scale(1, 1, -1);
      scene.add(skyBox);
      window.addEventListener("resize", onWindowResize);
    }
    animate();
    return () => {
      if (animateNumber.current) {
        cancelAnimationFrame(animateNumber.current);
      }
      window.removeEventListener("resize", onWindowResize);
    };
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
      }}
      ref={containerRef}
    ></div>
  );
}

export default App;
