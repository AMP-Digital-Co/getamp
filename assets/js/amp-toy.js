/* AMP Digital — amp-toy.js
   3D logo toy (Who We Are on index.html, hero on 404.html). ES module; three.js comes from the
   import map in the page. Loaded on demand by main.js. Edit this file, not amp-toy.min.js. */
import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

const holder = document.getElementById('amp-toy');

function fallback() {
  holder.innerHTML = '<div style="position:absolute;inset:0;display:grid;place-items:center;"><img src="assets/img/amp-logo.png" alt="" style="width:70%;opacity:.9;"></div>';
}

try {
  function getSize() {
    const r = holder.getBoundingClientRect();
    return { w: r.width || 300, h: r.height || 300 };
  }
  let { w: cW, h: cH } = getSize();

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, cW / cH, 0.1, 1000);
  camera.position.set(0, 0, 11);

  // Transparent canvas — inherits the section background seamlessly.
  // (v2's bloom composer breaks alpha, so we render direct + gamma-correct in shader.)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(cW, cH);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;
  holder.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.5));
  const kl = new THREE.DirectionalLight(0xffffff, 1.0);
  kl.position.set(3, 5, 8); scene.add(kl);
  const fl = new THREE.DirectionalLight(0xccbbff, 0.35);
  fl.position.set(-5, 2, 4); scene.add(fl);
  const bl = new THREE.PointLight(0xff4488, 0.5, 20);
  bl.position.set(0, -3, -5); scene.add(bl);
  const tl = new THREE.PointLight(0xff6633, 0.25, 20);
  tl.position.set(0, 6, 2); scene.add(tl);

  // AMP logo SVG
  const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1116 386" width="1116" height="386">
    <g transform="translate(0,386) scale(0.1,-0.1)" fill="#000000" stroke="none">
      <path d="M1757 3829 c-8 -19 -98 -214 -199 -434 -102 -220 -197 -425 -211
-455 -13 -30 -94 -206 -180 -390 -85 -184 -166 -360 -180 -390 -13 -30 -54
-118 -89 -195 -36 -77 -77 -165 -91 -195 -13 -30 -107 -233 -207 -450 -100
-217 -195 -422 -210 -455 -15 -33 -44 -96 -65 -140 -58 -124 -202 -438 -257
-560 -28 -60 -54 -114 -59 -120 -5 -5 -9 -17 -9 -27 0 -17 72 -18 1776 -18
l1775 0 -7 22 c-4 12 -40 94 -80 181 -41 87 -74 160 -74 162 0 1 -25 55 -55
119 -30 64 -104 225 -166 358 -61 134 -133 290 -160 347 -27 57 -49 105 -49
106 0 2 -21 47 -46 102 -25 54 -127 274 -226 488 -99 215 -197 428 -219 473
-21 46 -39 85 -39 87 0 2 -25 56 -56 121 -31 66 -105 227 -166 359 -61 132
-128 278 -149 323 -21 46 -39 85 -39 87 0 1 -25 56 -56 121 -31 66 -85 182
-121 259 -35 76 -66 141 -68 143 -2 2 -10 -11 -18 -29z M4250 1895 l0 -1885
1525 0 1525 0 0 1885 c0 1037 -2 1885 -4 1885 -3 0 -66 -94 -261 -395 -86
-132 -357 -550 -428 -660 -178 -274 -226 -348 -318 -490 -58 -88 -192 -296
-299 -462 -107 -167 -198 -303 -201 -303 -6 0 -111 157 -484 725 -76 116 -208
316 -293 445 -85 129 -198 300 -250 380 -284 433 -502 760 -507 760 -3 0 -5
-848 -5 -1885z M8187 3773 c-4 -3 -7 -854 -7 -1890 l0 -1883 495 0 495 0 2
568 3 567 390 6 c388 7 457 12 610 49 223 52 437 172 600 334 182 182 308 414
361 663 32 152 34 386 4 534 -50 245 -160 454 -335 637 -105 111 -184 172
-308 242 -178 99 -352 149 -582 169 -132 12 -1717 15 -1728 4z"/>
    </g>
  </svg>`;

  const logoGroup = new THREE.Group();
  scene.add(logoGroup);

  const svgData = new SVGLoader().parse(svgMarkup);
  const extrudeSettings = {
    depth: 180, bevelEnabled: true, bevelThickness: 10,
    bevelSize: 7, bevelOffset: 0, bevelSegments: 16, curveSegments: 32
  };

  const geos = [];
  for (const path of svgData.paths) {
    for (const shape of SVGLoader.createShapes(path)) {
      geos.push(new THREE.ExtrudeGeometry(shape, extrudeSettings));
    }
  }

  function mergeGeos(gs) {
    let vc = 0;
    for (const g of gs) vc += g.attributes.position.count;
    const pos = new Float32Array(vc * 3);
    const nrm = new Float32Array(vc * 3);
    const idx = [];
    let vo = 0;
    for (const g of gs) {
      const p = g.attributes.position, n = g.attributes.normal;
      for (let i = 0; i < p.count * 3; i++) {
        pos[vo * 3 + i] = p.array[i];
        nrm[vo * 3 + i] = n ? n.array[i] : 0;
      }
      if (g.index) for (let i = 0; i < g.index.count; i++) idx.push(g.index.array[i] + vo);
      vo += p.count;
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    m.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    if (idx.length) m.setIndex(idx);
    m.computeVertexNormals();
    return m;
  }

  const geo = mergeGeos(geos);
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  geo.translate(-(bb.max.x + bb.min.x) / 2, -(bb.max.y + bb.min.y) / 2, -(bb.max.z + bb.min.z) / 2);
  const sc = 6.5 / Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
  geo.scale(sc, sc, sc);
  geo.rotateX(Math.PI);
  geo.computeBoundingBox();
  const fb = geo.boundingBox;

  // Float shader — gradient base + procedural matcap environment
  const material = new THREE.ShaderMaterial({
    uniforms: {
      colorA: { value: new THREE.Color('#ff5030') },
      colorB: { value: new THREE.Color('#ff1470') },
      emissive: { value: 0.18 },
      light1: { value: new THREE.Vector3(0.3, 0.5, 0.8).normalize() },
      light2: { value: new THREE.Vector3(-0.4, 0.3, 0.5).normalize() },
      viewPos: { value: camera.position },
      xMin: { value: fb.min.x },
      xMax: { value: fb.max.x }
    },
    vertexShader: `
      varying vec3 vWorld;
      varying vec3 vNorm;
      varying vec3 vViewNorm;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vNorm = normalize(normalMatrix * normal);
        vViewNorm = normalize((viewMatrix * modelMatrix * vec4(normal, 0.0)).xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: `
      uniform vec3 colorA, colorB;
      uniform float emissive;
      uniform vec3 light1, light2, viewPos;
      uniform float xMin, xMax;
      varying vec3 vWorld, vNorm, vViewNorm;

      vec3 matcapEnv(vec2 muv) {
        float topLeft = smoothstep(0.0, 1.0, (1.0 - muv.y) * (1.0 - muv.x)) * 0.8;
        float midTone = smoothstep(0.3, 0.7, muv.y * muv.x) * 0.5;
        vec3 warmLight = vec3(1.2, 0.95, 0.7);
        vec3 neutral = vec3(1.0, 1.0, 1.0);
        vec3 coolShadow = vec3(0.6, 0.75, 1.0);
        vec3 env = mix(coolShadow, neutral, midTone);
        env = mix(env, warmLight, topLeft);
        return env;
      }

      void main() {
        float gt = clamp((vWorld.x - xMin) / (xMax - xMin), 0.0, 1.0);
        vec3 base = mix(colorA, colorB, gt);

        float d1 = max(dot(vNorm, light1), 0.0);
        float d2 = max(dot(vNorm, light2), 0.0);
        float diff = 0.28 + 0.52 * d1 + 0.22 * d2;

        vec2 muv = vViewNorm.xy * 0.5 + 0.5;
        base *= mix(vec3(1.0), matcapEnv(muv), 0.25);

        vec3 V = normalize(viewPos - vWorld);
        float s1 = pow(max(dot(vNorm, normalize(light1 + V)), 0.0), 40.0);
        float s2 = pow(max(dot(vNorm, normalize(light2 + V)), 0.0), 40.0);
        float spec = s1 * 0.65 + s2 * 0.25;

        float fresnel = pow(1.0 - max(dot(V, vNorm), 0.0), 3.5) * 0.55;

        vec3 color = base * diff
                   + vec3(1.0, 0.96, 0.92) * spec * 0.55
                   + base * fresnel
                   + base * emissive;

        color = color / (color + vec3(0.75));
        // linear -> sRGB (direct render, no composer output pass)
        color = pow(color, vec3(0.4545));
        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  logoGroup.add(new THREE.Mesh(geo, material));

  // Soft shadow blob below the logo (radial gradient via UVs)
  const shadowGeo = new THREE.CircleGeometry(3.0, 32);
  const shadowMat = new THREE.ShaderMaterial({
    uniforms: {
      offsetX: { value: 0.0 },
      offsetY: { value: 0.0 }
    },
    vertexShader: `
      uniform float offsetX, offsetY;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        pos.x += offsetX;
        pos.y += offsetY;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      void main() {
        float dist = length(vUv - vec2(0.5)) * 2.0;
        float alpha = smoothstep(1.0, 0.0, dist) * 0.35;
        gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
      }
    `,
    transparent: true,
    depthWrite: false
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.y = -2.2;
  shadowMesh.position.z = -0.5;
  shadowMesh.scale.y = 0.35;
  logoGroup.add(shadowMesh);

  // Float interaction: tilt toward cursor, click for a full ease-out spin
  let targetRotX = 0, targetRotY = 0;
  let rotYOffset = 0;
  const lerpFactor = 0.05;
  const maxTilt = 0.35;

  // Track the cursor from anywhere on screen (not just over the toy):
  // tilt grows with distance from the toy's center and saturates at maxTilt.
  window.addEventListener('mousemove', e => {
    const rect = holder.getBoundingClientRect();
    if (rect.bottom < -80 || rect.top > innerHeight + 80) return; // toy off-screen
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (rect.width * 1.4)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (rect.height * 1.4)));
    targetRotY = dx * maxTilt;
    targetRotX = dy * maxTilt;
  });

  let spinning = false, spinStart = 0, spinStartY = 0, spinDir = 1;
  const spinDuration = 1.5;
  holder.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    spinDir = -spinDir;
    spinStart = performance.now();
    spinStartY = logoGroup.rotation.y;
  });

  const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

  const ro = new ResizeObserver(() => {
    const { w: nW, h: nH } = getSize();
    if (nW === cW && nH === cH) return;
    cW = nW; cH = nH;
    camera.aspect = cW / cH;
    camera.updateProjectionMatrix();
    renderer.setSize(cW, cH);
  });
  ro.observe(holder);

  const clock = new THREE.Clock();
  // Pause the WebGL loop entirely while the toy is off-screen
  let toyVisible = true;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(es => { toyVisible = es[0].isIntersecting; }).observe(holder);
  }
  (function animate() {
    requestAnimationFrame(animate);
    if (!toyVisible) return;
    const t = clock.getElapsedTime();
    material.uniforms.viewPos.value.copy(camera.position);

    if (spinning) {
      const elapsed = (performance.now() - spinStart) / 1000;
      if (elapsed < spinDuration) {
        logoGroup.rotation.y = spinStartY + easeOutCubic(elapsed / spinDuration) * Math.PI * 2 * spinDir;
      } else {
        logoGroup.rotation.y = spinStartY + Math.PI * 2 * spinDir;
        rotYOffset += Math.PI * 2 * spinDir;
        spinning = false;
      }
    }

    logoGroup.rotation.x += (targetRotX - logoGroup.rotation.x) * lerpFactor;
    if (!spinning) {
      logoGroup.rotation.y += ((targetRotY + rotYOffset) - logoGroup.rotation.y) * lerpFactor;
    }

    // Gentle floating bob
    logoGroup.position.y = Math.sin((t / 4.0) * Math.PI * 2) * 0.1;

    // Shadow trails the tilt
    shadowMat.uniforms.offsetX.value = -(logoGroup.rotation.y - rotYOffset) * 0.5;
    shadowMat.uniforms.offsetY.value = logoGroup.rotation.x * 0.3;

    renderer.render(scene, camera);
  })();
} catch (err) {
  console.warn('WebGL toy failed, using static fallback:', err);
  fallback();
}
