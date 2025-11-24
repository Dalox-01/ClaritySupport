'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, PerspectiveCamera, Sparkles } from '@react-three/drei';
import { AdditiveBlending, Color, ShaderMaterial, Vector2 } from 'three';

type PortalMaterial = ShaderMaterial & {
  uniforms: {
    uTime: { value: number };
    uPointer: { value: Vector2 };
    uColorA: { value: Color };
    uColorB: { value: Color };
  };
};

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying vec2 vUv;
  varying float vDistortion;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.0, 0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)));
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vUv = uv;
    vec3 pos = position;
    float time = uTime * 0.2;

    float noise = snoise(vec3(pos * 1.6 + time));
    float pointerInfluence = smoothstep(0.0, 1.2, length((uv - vec2(0.5)) * 2.0 - uPointer));
    float distortion = noise * (1.0 + pointerInfluence * 0.7);
    vDistortion = distortion;

    pos += normal * distortion * 0.35;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  varying vec2 vUv;
  varying float vDistortion;

  void main() {
    float intensity = smoothstep(-0.6, 0.8, vDistortion * 1.5);
    vec3 color = mix(uColorA, uColorB, intensity + vUv.y * 0.5);
    float alpha = smoothstep(0.0, 0.4, intensity + 0.2);
    gl_FragColor = vec4(color, alpha);
  }
`;

function PortalTorus() {
  const materialRef = useRef<PortalMaterial>(null);
  const pointer = useRef(new Vector2());

  useFrame(({ clock, pointer: pointerState }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

    pointer.current.lerp(new Vector2(pointerState.x, pointerState.y), 0.05);
    materialRef.current.uniforms.uPointer.value.copy(pointer.current);
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector2() },
      uColorA: { value: new Color('#0fffc1') },
      uColorB: { value: new Color('#7b5bff') },
    }),
    []
  );

  return (
    <Float
      speed={1.2}
      rotationIntensity={0.25}
      floatIntensity={0.8}
      floatingRange={[-0.35, 0.35]}
    >
      <mesh scale={2.2} rotation={[Math.PI / 2.8, 0.3, 0]}
        castShadow
        receiveShadow
      >
        <torusKnotGeometry args={[1.1, 0.34, 480, 18]} />
        <shaderMaterial
          ref={materialRef}
          args={[{ uniforms }]}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          blending={AdditiveBlending}
        />
      </mesh>
    </Float>
  );
}

function AuroraSheet() {
  const materialRef = useRef<PortalMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} scale={6}>
      <planeGeometry args={[8, 8, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;

          float wave(vec2 uv, float speed) {
            return sin(uv.x * 3.1415 * 2.0 + uTime * speed) * 0.15;
          }

          void main() {
            vUv = uv;
            float displacement = wave(uv, 0.6) + wave(uv.yx, -0.8);
            vec3 pos = position + normal * displacement;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          void main() {
            vec3 base = mix(vec3(0.02, 0.04, 0.1), vec3(0.02, 0.16, 0.18), vUv.x);
            base += vec3(0.15, 0.05, 0.2) * smoothstep(0.1, 0.9, vUv.y);
            gl_FragColor = vec4(base, 0.75);
          }
        `}
        transparent
      />
    </mesh>
  );
}

function GlyphParticles() {
  const materialRef = useRef<PortalMaterial>(null);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={600}
          array={Float32Array.from({ length: 600 * 3 }, () => (Math.random() - 0.5) * 6)}
          itemSize={3}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={`
          uniform float uTime;
          varying float vAlpha;
          void main() {
            vec3 pos = position;
            float theta = sin(uTime * 0.6 + pos.x) * 0.3;
            pos.xz *= mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
            pos.y += sin(uTime * 0.4 + pos.x * pos.z) * 0.12;
            vAlpha = smoothstep(3.0, 0.25, length(pos));
            gl_PointSize = 34.0 * vAlpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          varying float vAlpha;
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
            vec3 color = mix(vec3(0.34, 0.88, 0.86), vec3(0.71, 0.46, 1.0), gl_PointCoord.x);
            gl_FragColor = vec4(color, alpha);
          }
        `}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        uniforms={{ uTime: { value: 0 } }}
      />
    </points>
  );
}

interface HyperluminaSceneProps {
  className?: string;
}

export function HyperluminaScene({ className }: HyperluminaSceneProps) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 1.8]}>
        <color attach="background" args={[0x030308]} />
        <fog attach="fog" args={[0x030308, 6, 15]} />

        <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={58} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 3.2}
          enableDamping
          dampingFactor={0.08}
        />

        <ambientLight intensity={0.45} />
        <spotLight
          position={[3.5, 4.5, 4.5]}
          intensity={2.1}
          angle={0.7}
          penumbra={0.8}
          castShadow
        />

        <AuroraSheet />
        <PortalTorus />
        <GlyphParticles />

        <Sparkles
          count={180}
          speed={0.9}
          opacity={0.35}
          size={9}
          scale={[8, 4, 8]}
          color={new Color('#5cf4ff')}
        />
      </Canvas>
    </div>
  );
}


