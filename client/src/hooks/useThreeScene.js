import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

export default function useThreeScene(containerRef, options = {}) {
  const {
    cameraPosition = [0, 0, 5],
    fov = 50,
    antialias = true,
    alpha = true,
    autoAnimate = true,
    onMount,
    onUnmount,
  } = options;

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  const setup = useCallback(() => {
    const container = containerRef.current;
    if (!container) return false;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      fov,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(...cameraPosition);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias,
      alpha,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    clockRef.current.start();
    return true;
  }, [containerRef, cameraPosition, fov, antialias, alpha]);

  const animate = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

    const elapsed = clockRef.current.getElapsedTime();

    rendererRef.current.render(sceneRef.current, cameraRef.current);

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const success = setup();
    if (!success) return;

    if (autoAnimate) {
      animate();
    }

    if (onMount) {
      onMount({
        scene: sceneRef.current,
        camera: cameraRef.current,
        renderer: rendererRef.current,
      });
    }

    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !cameraRef.current || !rendererRef.current) return;

      cameraRef.current.aspect = container.clientWidth / container.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrameRef.current);

      if (onUnmount) {
        onUnmount({
          scene: sceneRef.current,
          camera: cameraRef.current,
          renderer: rendererRef.current,
        });
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        const container = containerRef.current;
        if (container && rendererRef.current.domElement.parentNode === container) {
          container.removeChild(rendererRef.current.domElement);
        }
      }

      if (sceneRef.current) {
        sceneRef.current.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }
    };
  }, [setup, animate, autoAnimate, onMount, onUnmount, containerRef]);

  const addMesh = useCallback((mesh) => {
    if (sceneRef.current) {
      sceneRef.current.add(mesh);
    }
  }, []);

  const removeMesh = useCallback((mesh) => {
    if (sceneRef.current) {
      sceneRef.current.remove(mesh);
    }
  }, []);

  const resetCamera = useCallback((position = [0, 0, 5]) => {
    if (cameraRef.current) {
      cameraRef.current.position.set(...position);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, []);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    clock: clockRef.current,
    addMesh,
    removeMesh,
    resetCamera,
  };
}
