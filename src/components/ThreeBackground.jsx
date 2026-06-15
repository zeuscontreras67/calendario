"use client";

import { useEffect, useRef } from "react";

// Fondo 3D decorativo: malla giratoria + campo de partículas con parallax de mouse.
// Carga Three.js desde CDN en runtime (no añade dependencias ni afecta el build).
export default function ThreeBackground() {
  const ref = useRef(null);

  useEffect(() => {
    let mounted = true;
    let cleanup = () => {};
    const SRC = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";

    function init(THREE) {
      const el = ref.current;
      if (!el || !THREE) return;

      let w = el.clientWidth || window.innerWidth;
      let h = el.clientHeight || window.innerHeight;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
      camera.position.z = 7;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      el.appendChild(renderer.domElement);

      // Grupo central: dos mallas wireframe concéntricas, en la zona superior
      const group = new THREE.Group();
      const outer = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.1, 1),
        new THREE.MeshBasicMaterial({ color: 0x6366f1, wireframe: true, transparent: true, opacity: 0.5 })
      );
      const inner = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.35, 0),
        new THREE.MeshBasicMaterial({ color: 0x818cf8, wireframe: true, transparent: true, opacity: 0.4 })
      );
      group.add(outer);
      group.add(inner);
      group.position.set(2.6, 2.6, 0); // arriba a la derecha, fuera del panel
      scene.add(group);

      // Campo de partículas (cubre toda la pantalla, incluidos los márgenes)
      const N = 650;
      const pos = new Float32Array(N * 3);
      for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 28;
      const pgeo = new THREE.BufferGeometry();
      pgeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const particles = new THREE.Points(
        pgeo,
        new THREE.PointsMaterial({ color: 0xa5b4fc, size: 0.05, transparent: true, opacity: 0.7 })
      );
      scene.add(particles);

      let mx = 0, my = 0;
      const onMove = (e) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      };
      const onResize = () => {
        w = el.clientWidth || window.innerWidth;
        h = el.clientHeight || window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("resize", onResize);

      let frame;
      const animate = () => {
        if (!mounted) return;
        frame = requestAnimationFrame(animate);
        outer.rotation.x += 0.0014;
        outer.rotation.y += 0.0019;
        inner.rotation.x -= 0.0022;
        inner.rotation.y -= 0.0016;
        particles.rotation.y += 0.0004;
        camera.position.x += (mx * 1.8 - camera.position.x) * 0.04;
        camera.position.y += (-my * 1.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        cancelAnimationFrame(frame);
        renderer.dispose();
        if (renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      };
    }

    if (window.THREE) {
      init(window.THREE);
    } else {
      let s = document.querySelector("script[data-three]");
      if (!s) {
        s = document.createElement("script");
        s.src = SRC;
        s.setAttribute("data-three", "");
        document.head.appendChild(s);
      }
      s.addEventListener("load", () => mounted && init(window.THREE));
    }

    return () => {
      mounted = false;
      cleanup();
    };
  }, []);

  return <div ref={ref} className="pointer-events-none fixed inset-0 -z-10 opacity-80" />;
}
