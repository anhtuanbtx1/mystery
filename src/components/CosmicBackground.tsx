'use client';

import React, { useEffect, useRef, useState } from 'react';

type Sparkle = {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
};

type Rune = {
  char: string;
  left: string;
  animationDelay: string;
  animationDuration: string;
};

const RUNE_CHARS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛏ', 'ᛒ', 'ᛗ', 'ᛚ'];

const CARD_CONFIGS = [
  { top: '10%', left: '-18px', baseRot: -16, driftX: 34, driftY: -26, dur: '22s', scale: 0.88, blur: '1.4px', opacity: 0.52 },
  { top: '24%', right: '2%', baseRot: 18, driftX: -30, driftY: 18, dur: '26s', scale: 0.78, blur: '1.8px', opacity: 0.46 },
  { top: '44%', left: '7%', baseRot: -12, driftX: -24, driftY: 28, dur: '24s', scale: 0.92, blur: '1.3px', opacity: 0.56 },
  { bottom: '14%', left: '12%', baseRot: 32, driftX: 28, driftY: -20, dur: '28s', scale: 0.84, blur: '1.7px', opacity: 0.5 },
  { bottom: '10%', right: '-22px', baseRot: -20, driftX: -36, driftY: -24, dur: '25s', scale: 0.9, blur: '1.5px', opacity: 0.53 }
];

const defaultShaderSource = `#version 300 es
precision highp float;
out vec4 O;
uniform vec2 resolution;
uniform float time;
uniform vec3 tintA;
uniform vec3 tintB;
#define FC gl_FragCoord.xy
#define T time
#define R resolution
#define MN min(R.x,R.y)
// Returns a pseudo random number for a given point (white noise)
float rnd(vec2 p) {
  p=fract(p*vec2(12.9898,78.233));
  p+=dot(p,p+34.56);
  return fract(p.x*p.y);
}
// Returns a pseudo random number for a given point (value noise)
float noise(in vec2 p) {
  vec2 i=floor(p), f=fract(p), u=f*f*(3.-2.*f);
  float
  a=rnd(i),
  b=rnd(i+vec2(1,0)),
  c=rnd(i+vec2(0,1)),
  d=rnd(i+1.);
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);
}
// Returns a pseudo random number for a given point (fractal noise)
float fbm(vec2 p) {
  float t=.0, a=1.; mat2 m=mat2(1.,-.5,.2,1.2);
  for (int i=0; i<5; i++) {
    t+=a*noise(p);
    p*=2.*m;
    a*=.5;
  }
  return t;
}
float clouds(vec2 p) {
  float d=1., t=.0;
  for (float i=.0; i<3.; i++) {
    float a=d*fbm(i*10.+p.x*.2+.2*(1.+i)*p.y+d+i*i+p);
    t=mix(t,d,a);
    d=a;
    p*=2./(i+1.);
  }
  return t;
}
void main(void) {
  vec2 uv=(FC-.5*R)/MN,st=uv*vec2(2,1);
  vec3 col=vec3(0.0);
  float bg=clouds(vec2(st.x+T*.5,-st.y));
  uv*=1.-.3*(sin(T*.2)*.5+.5);
  for (float i=1.; i<12.; i++) {
    uv+=.1*cos(i*vec2(.1+.01*i, .8)+i*i+T*.5+.1*uv.x);
    vec2 p=uv;
    float d=length(p);
    col+=.00125/d*(cos(sin(i)*vec3(1,2,3))+1.);
    float b=noise(i+p+bg*1.731);
    col+=.002*b/length(max(p,vec2(b*p.x*.02,p.y)));
    vec3 warmBase = mix(tintB, tintA, bg);
    vec3 amberGlow = vec3(0.78, 0.42, 0.18) * bg * 0.18;
    col = mix(col, warmBase + amberGlow, d);
  }
  O=vec4(col,1);
}`;

// --- Shader Classes ---

class WebGLRenderer {
  public canvas: HTMLCanvasElement;
  public gl: WebGL2RenderingContext;
  public program: WebGLProgram | null = null;
  public vs: WebGLShader | null = null;
  public fs: WebGLShader | null = null;
  public buffer: WebGLBuffer | null = null;
  public scale: number;
  public shaderSource: string;
  public mouseMove = [0, 0];
  public mouseCoords = [0, 0];
  public pointerCoords: number[] = [0, 0];
  public nbrOfPointers = 0;

  private vertexSrc = `#version 300 es
precision highp float;
in vec4 position;
void main(){gl_Position=position;}`;

  private vertices = [-1, 1, -1, -1, 1, 1, 1, -1];

  constructor(canvas: HTMLCanvasElement, scale: number) {
    this.canvas = canvas;
    this.scale = scale;
    this.gl = canvas.getContext('webgl2')!;
    this.gl.viewport(0, 0, canvas.width * scale, canvas.height * scale);
    this.shaderSource = defaultShaderSource;
  }

  updateShader(source: string) {
    this.reset();
    this.shaderSource = source;
    this.setup();
    this.init();
  }

  updateMove(deltas: number[]) { this.mouseMove = deltas; }
  updateMouse(coords: number[]) { this.mouseCoords = coords; }
  updatePointerCoords(coords: number[]) { this.pointerCoords = coords; }
  updatePointerCount(nbr: number) { this.nbrOfPointers = nbr; }

  updateScale(scale: number) {
    this.scale = scale;
    this.gl.viewport(0, 0, this.canvas.width * scale, this.canvas.height * scale);
  }

  compile(shader: WebGLShader, source: string) {
    const gl = this.gl;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    }
  }

  test(source: string) {
    let result = null;
    const gl = this.gl;
    const shader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      result = gl.getShaderInfoLog(shader);
    }
    gl.deleteShader(shader);
    return result;
  }

  reset() {
    const gl = this.gl;
    if (this.program && !gl.getProgramParameter(this.program, gl.DELETE_STATUS)) {
      if (this.vs) { gl.detachShader(this.program, this.vs); gl.deleteShader(this.vs); }
      if (this.fs) { gl.detachShader(this.program, this.fs); gl.deleteShader(this.fs); }
      gl.deleteProgram(this.program);
    }
  }

  setup() {
    const gl = this.gl;
    this.vs = gl.createShader(gl.VERTEX_SHADER)!;
    this.fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    this.compile(this.vs, this.vertexSrc);
    this.compile(this.fs, this.shaderSource);
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.vs);
    gl.attachShader(this.program, this.fs);
    gl.linkProgram(this.program);
  }

  init() {
    const gl = this.gl;
    const program = this.program!;
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    (program as any).resolution = gl.getUniformLocation(program, 'resolution');
    (program as any).time = gl.getUniformLocation(program, 'time');
    (program as any).tintA = gl.getUniformLocation(program, 'tintA');
    (program as any).tintB = gl.getUniformLocation(program, 'tintB');
    (program as any).move = gl.getUniformLocation(program, 'move');
    (program as any).touch = gl.getUniformLocation(program, 'touch');
    (program as any).pointerCount = gl.getUniformLocation(program, 'pointerCount');
    (program as any).pointers = gl.getUniformLocation(program, 'pointers');
  }

  render(now = 0) {
    const gl = this.gl;
    const program = this.program;
    if (!program || gl.getProgramParameter(program, gl.DELETE_STATUS)) return;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
    gl.uniform2f((program as any).resolution, this.canvas.width, this.canvas.height);
    gl.uniform1f((program as any).time, now * 1e-3);
    gl.uniform3f((program as any).tintA, 0.52, 0.26, 0.11);
    gl.uniform3f((program as any).tintB, 0.08, 0.035, 0.02);
    gl.uniform2f((program as any).move, this.mouseMove[0], this.mouseMove[1]);
    gl.uniform2f((program as any).touch, this.mouseCoords[0], this.mouseCoords[1]);
    gl.uniform1i((program as any).pointerCount, this.nbrOfPointers);
    gl.uniform2fv((program as any).pointers, this.pointerCoords);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}

class PointerHandler {
  public scale: number;
  public active = false;
  public pointers = new Map<number, number[]>();
  public lastCoords = [0, 0];
  public moves = [0, 0];

  constructor(element: HTMLCanvasElement, scale: number) {
    this.scale = scale;
    const map = (element: HTMLCanvasElement, scale: number, x: number, y: number) => 
      [x * scale, element.height - y * scale];

    element.addEventListener('pointerdown', (e) => {
      this.active = true;
      this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
    });

    element.addEventListener('pointerup', (e) => {
      if (this.count === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointerleave', (e) => {
      if (this.count === 1) this.lastCoords = this.first;
      this.pointers.delete(e.pointerId);
      this.active = this.pointers.size > 0;
    });

    element.addEventListener('pointermove', (e) => {
      if (!this.active) return;
      this.lastCoords = [e.clientX, e.clientY];
      this.pointers.set(e.pointerId, map(element, this.getScale(), e.clientX, e.clientY));
      this.moves = [this.moves[0] + e.movementX, this.moves[1] + e.movementY];
    });
  }

  getScale() { return this.scale; }
  updateScale(scale: number) { this.scale = scale; }
  get count() { return this.pointers.size; }
  get move() { return this.moves; }
  get coords() { return this.pointers.size > 0 ? Array.from(this.pointers.values()).flat() : [0, 0]; }
  get first() { return this.pointers.values().next().value || this.lastCoords; }
}

const useShaderBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const pointersRef = useRef<PointerHandler | null>(null);

  const resize = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    if (rendererRef.current) rendererRef.current.updateScale(dpr);
  };

  const loop = (now: number) => {
    if (!rendererRef.current || !pointersRef.current) return;
    rendererRef.current.updateMouse(pointersRef.current.first);
    rendererRef.current.updatePointerCount(pointersRef.current.count);
    rendererRef.current.updatePointerCoords(pointersRef.current.coords);
    rendererRef.current.updateMove(pointersRef.current.move);
    rendererRef.current.render(now);
    animationFrameRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const dpr = Math.max(1, 0.5 * window.devicePixelRatio);
    
    rendererRef.current = new WebGLRenderer(canvas, dpr);
    pointersRef.current = new PointerHandler(canvas, dpr);
    
    rendererRef.current.setup();
    rendererRef.current.init();
    
    resize();
    if (rendererRef.current.test(defaultShaderSource) === null) {
      rendererRef.current.updateShader(defaultShaderSource);
    }
    
    loop(0);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (rendererRef.current) rendererRef.current.reset();
    };
  }, []);

  return canvasRef;
};

// --- Main Component ---

export default function CosmicBackground() {
  const cardsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useShaderBackground();

  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [runes, setRunes] = useState<Rune[]>([]);

  useEffect(() => {
    const nextSparkles: Sparkle[] = Array.from({ length: 42 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 6}s`,
      animationDuration: `${4 + Math.random() * 5}s`,
    }));
    setSparkles(nextSparkles);

    const nextRunes: Rune[] = Array.from({ length: 16 }).map(() => ({
      char: RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)],
      left: `${5 + Math.random() * 90}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${8 + Math.random() * 8}s`,
    }));
    setRunes(nextRunes);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;


      if (cardsRef.current) {
        const bgCards = cardsRef.current.querySelectorAll('.bg-card');
        bgCards.forEach((card, i) => {
          const k = i % 2 === 0 ? -18 : 14;
          (card as HTMLElement).style.setProperty('--mx', `${x * k}px`);
          (card as HTMLElement).style.setProperty('--my', `${y * k}px`);
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: 1200 }}>
      {/* 1. WebGL Shader Cosmic Background (Replaces Nebula, Static Stars, and Shooting Stars) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-contain pointer-events-auto touch-none opacity-85 saturate-150"
        style={{ filter: 'contrast(1.08) brightness(0.58) sepia(0.28)' }}
      />


      {/* 3. Sparkles (client-only) */}
      <div className="layer z-[3] pointer-events-none" suppressHydrationWarning>
        {sparkles.map((s, i) => (
          <div
            key={`sparkle-${i}`}
            className="sparkle bg-[rgba(255,240,208,.95)] rounded-full absolute w-[2px] h-[2px]"
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.animationDelay,
              animationDuration: s.animationDuration,
              boxShadow: '0 0 10px rgba(232,201,122,.9)',
            }}
          />
        ))}
      </div>

      {/* 4. Runes (client-only) */}
      <div className="layer z-[4] top-auto bottom-0 h-[36vh] overflow-hidden pointer-events-none" suppressHydrationWarning>
        {runes.map((r, i) => (
          <div
            key={`rune-${i}`}
            className="rune absolute font-display text-[16px] text-[rgba(185,162,232,.45)]"
            style={{
              left: r.left,
              animationDelay: r.animationDelay,
              animationDuration: r.animationDuration,
              textShadow: '0 0 8px rgba(185,162,232,.25)',
            }}
          >
            {r.char}
          </div>
        ))}
      </div>

      {/* 5. Floating cards */}
      <div ref={cardsRef} className="layer z-[5] overflow-hidden pointer-events-none">
        {CARD_CONFIGS.map((c, i) => {
          const styleProps: any = {
            ...c,
            '--dur': c.dur,
            '--scale': c.scale,
            '--base-rot': `${c.baseRot}deg`,
            '--mx': '0px',
            '--my': '0px',
            '--dx': `${c.driftX}px`,
            '--dy': `${c.driftY}px`,
            animationDelay: `${-i * 4}s`,
            backgroundImage: "url('/assets/card-back.svg')",
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            boxShadow: 'var(--shadow-lg), var(--edge-gold)',
          };

          return (
            <div
              key={`bg-card-${i}`}
              className="bg-card absolute w-[128px] h-[218px] rounded-[18px]"
              style={{ ...styleProps, opacity: c.opacity, filter: `blur(${c.blur})` }}
            />
          );
        })}
      </div>
    </div>
  );
}