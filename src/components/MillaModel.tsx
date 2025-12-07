// Milla 3D Model Component
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { prismVertexShader, prismFragmentShader, createPrismUniforms } from '../shaders/prismShader.glsl';
import type { LipSyncData } from '../services/lipSync';

interface MillaModelProps {
  lipSyncData: LipSyncData;
  opacity: number;
  scale?: number;
}

export const MillaModel: React.FC<MillaModelProps> = ({ opacity, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Create holographic material uniforms
  const uniforms = useMemo(() => createPrismUniforms(), []);

  // Update uniforms each frame
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      materialRef.current.uniforms.opacity.value = opacity;
    }

    // Subtle breathing animation
    if (groupRef.current) {
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      groupRef.current.scale.setScalar(scale * (1 + breathe));
      
      // Subtle floating
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  // Create a simple humanoid upper body geometry
  const geometry = useMemo(() => {
    const group = new THREE.Group();

    // Head
    const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const head = new THREE.Mesh(headGeometry);
    head.position.y = 1.4;
    group.add(head);

    // Neck
    const neckGeometry = new THREE.CylinderGeometry(0.12, 0.15, 0.2, 16);
    const neck = new THREE.Mesh(neckGeometry);
    neck.position.y = 1.2;
    group.add(neck);

    // Torso
    const torsoGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.8, 16);
    const torso = new THREE.Mesh(torsoGeometry);
    torso.position.y = 0.7;
    group.add(torso);

    // Shoulders
    const shoulderGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const leftShoulder = new THREE.Mesh(shoulderGeometry);
    leftShoulder.position.set(-0.35, 1.0, 0);
    group.add(leftShoulder);
    
    const rightShoulder = new THREE.Mesh(shoulderGeometry);
    rightShoulder.position.set(0.35, 1.0, 0);
    group.add(rightShoulder);

    // Arms
    const armGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 16);
    const leftArm = new THREE.Mesh(armGeometry);
    leftArm.position.set(-0.35, 0.65, 0);
    leftArm.rotation.z = 0.2;
    group.add(leftArm);
    
    const rightArm = new THREE.Mesh(armGeometry);
    rightArm.position.set(0.35, 0.65, 0);
    rightArm.rotation.z = -0.2;
    group.add(rightArm);

    // Hands (resting)
    const handGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const leftHand = new THREE.Mesh(handGeometry);
    leftHand.position.set(-0.4, 0.35, 0);
    group.add(leftHand);
    
    const rightHand = new THREE.Mesh(handGeometry);
    rightHand.position.set(0.4, 0.35, 0);
    group.add(rightHand);

    // Hair (red)
    const hairGeometry = new THREE.SphereGeometry(0.32, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hair = new THREE.Mesh(hairGeometry);
    hair.position.y = 1.5;
    group.add(hair);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    const leftEye = new THREE.Mesh(eyeGeometry);
    leftEye.position.set(-0.1, 1.45, 0.25);
    group.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry);
    rightEye.position.set(0.1, 1.45, 0.25);
    group.add(rightEye);

    return group;
  }, []);

  return (
    <group ref={groupRef}>
      <primitive object={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={prismVertexShader}
          fragmentShader={prismFragmentShader}
          uniforms={uniforms as any}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </primitive>
    </group>
  );
};
