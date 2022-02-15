import React, { useEffect, useRef } from "react";
import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, FreeCamera, Color3 } from "@babylonjs/core";
import "@babylonjs/loaders";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

function Canvas(props) {
  const refCanvas = useRef(null);
  const { antialias, engineOptions, adaptToDeviceRatio, sceneOptions, ...rest } = props;

  useEffect(() => {
    if (refCanvas.current) {
      let canvas = refCanvas.current;

    //also read this for scrollbar issue
    //https://stackoverflow.com/questions/26745292/canvas-toggle-filling-whole-page-removing-scrollbar
      document.body.style.overflow = 'hidden';
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      // canvas.width = window.innerWidth;
      // canvas.height = window.innerHeight;


      const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio);
      const scene = new Scene(engine, sceneOptions);
      //scene.debugLayer.show();

      scene.clearColor = new Color3.Black();

      const stage = new TestStage();

      // if (scene.isReady()) {
      //   console.log('scene.isReady() === true');
      //   stage.onSceneReady(scene);
      // } else {
      //   scene.onReadyObservable.addOnce(scene => stage.onSceneReady(scene));
      // }

      scene.onReadyObservable.addOnce(scene => {
        stage.onSceneReady(scene);
      });

      engine.runRenderLoop(() => {
        stage.onRender();
        scene.render();
      });

      const resize = () => {
        console.log(`---- resize ${new Date()}`);
        //console.log(`---- window.innerWidth ${window.innerWidth}`);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        scene.getEngine().resize();
      }

      resize();

      if (window) {
        window.addEventListener("resize", resize);
      }

      return () => {
        scene.getEngine().dispose();

        if (window) {
          window.removeEventListener("resize", resize);
        }
      };
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refCanvas]);

  return <canvas ref={refCanvas} {...rest} />;
};

export default Canvas;

class TestStage {
  #scene;
  #box;

  onSceneReady(scene) {
    this.#scene = scene;
    const canvas = scene.getEngine().getRenderingCanvas();

    const camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    //camera.attachControl(true);

    let light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    this.#box = MeshBuilder.CreateBox("box", { size: 1 }, scene);
    this.#box.position.y = 1;
    // const ground = MeshBuilder.CreateGround("ground", { width: 25, height: 50 }, scene);
    MeshBuilder.CreateGround("ground", { width: 25, height: 50 }, scene);
    //ground.position.y = 0;

    //console.log('onSceneReady(scene)', scene);
  };

  onRender() {
    if (this.#box !== undefined) {
      let deltaTimeInMillis = this.#scene.getEngine().getDeltaTime();
      // console.log(deltaTimeInMillis);
      const rpm = 10;
      this.#box.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    }
  };

}