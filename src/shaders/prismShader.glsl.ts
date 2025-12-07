// Holographic prism shader - vertex shader
export const prismVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Holographic prism shader - fragment shader
export const prismFragmentShader = `
  uniform float time;
  uniform float opacity;
  uniform vec3 glowColor;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec2 vUv;
  
  void main() {
    // Fresnel effect for holographic edge glow
    vec3 viewDirection = normalize(-vPosition);
    float fresnel = pow(1.0 - dot(viewDirection, vNormal), 3.0);
    
    // Animated rainbow effect
    float hue = vUv.y * 2.0 + time * 0.5;
    vec3 rainbow = vec3(
      sin(hue) * 0.5 + 0.5,
      sin(hue + 2.094) * 0.5 + 0.5,
      sin(hue + 4.189) * 0.5 + 0.5
    );
    
    // Soft glow
    vec3 glow = glowColor * (fresnel * 0.8 + 0.2);
    
    // Combine effects with translucency
    vec3 finalColor = mix(glow, rainbow, fresnel * 0.3);
    
    // Scan line effect
    float scanline = sin(vUv.y * 50.0 + time * 2.0) * 0.1 + 0.9;
    finalColor *= scanline;
    
    // Pulse effect
    float pulse = sin(time * 2.0) * 0.1 + 0.9;
    
    gl_FragColor = vec4(finalColor, opacity * pulse * (0.6 + fresnel * 0.4));
  }
`;

// Material uniforms
export interface PrismUniforms {
  time: { value: number };
  opacity: { value: number };
  glowColor: { value: [number, number, number] };
}

export const createPrismUniforms = (): PrismUniforms => ({
  time: { value: 0 },
  opacity: { value: 0.8 },
  glowColor: { value: [0.3, 0.6, 1.0] }, // Soft blue glow
});
