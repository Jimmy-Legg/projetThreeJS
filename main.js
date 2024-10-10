import * as THREE from 'three';

let scene, camera, renderer;
let spheres = [];
const gridSize = { x: 10, y: 20 }; // Dimensions of the vertical sphere wall
const sphereSpacing = 1.2; // Space between spheres
const cursorRadius = 1; // Radius around the cursor that affects spheres

let raycaster, mouse;
const explosionStrength = 0.2;
const explosionRadius = 1.5;
const transitionSpeed = 0.1;

let isMouseDown = false;
let selectedSphere = null;
let pullStrength = 0.5;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 1.5);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create vertical wall of spheres with color gradient
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
            // Calculate color based on position
            const hue = (y / gridSize.y) * 360; // Hue varies vertically
            const lightness = 50 + (x / gridSize.x) * 30; // Lightness varies horizontally
            const color = new THREE.Color(`hsl(${hue}, 100%, ${lightness}%)`);

            const material = new THREE.MeshPhongMaterial({ color: color });
            const sphere = new THREE.Mesh(geometry.clone(), material);
            sphere.position.set(
                (x - gridSize.x / 2) * sphereSpacing,
                (y - gridSize.y / 2) * sphereSpacing,
                0
            );
            scene.add(sphere);
            spheres.push(sphere);

            sphere.userData.originalVertices = sphere.geometry.attributes.position.array.slice();
            sphere.userData.currentVertices = sphere.geometry.attributes.position.array.slice();
        }
    }

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', onWindowResize);

    // Set up scrollable content
    const contentHeight = window.innerHeight * 4; // Increased for slower scroll
    document.body.style.height = `${contentHeight}px`;
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    isMouseDown = true;
    updateSelectedSphere();
}

function onMouseUp(event) {
    isMouseDown = false;
    selectedSphere = null;
}

function updateSelectedSphere() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);
    if (intersects.length > 0) {
        selectedSphere = intersects[0].object;
    } else {
        selectedSphere = null;
    }
}

function onScroll() {
    const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const totalHeight = (gridSize.y - 1) * sphereSpacing;
    const scrollSpeed = 0.5; // Adjust this value to control scroll speed (lower = slower)
    camera.position.y = -scrollFraction * totalHeight * scrollSpeed;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres);

    let cursorPosition;
    if (intersects.length > 0) {
        cursorPosition = intersects[0].point;
    } else {
        const planeNormal = new THREE.Vector3(0, 0, 1);
        const planeConstant = 0;
        const plane = new THREE.Plane(planeNormal, planeConstant);
        cursorPosition = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, cursorPosition);
    }

    spheres.forEach(sphere => {
        if (sphere === selectedSphere && isMouseDown) {
            pullSphere(sphere, cursorPosition);
        } else {
            const distance = sphere.position.distanceTo(cursorPosition);
            if (distance <= cursorRadius) {
                const effectStrength = 1 - (distance / cursorRadius);
                explodeSphere(sphere, cursorPosition, effectStrength);
            } else {
                implodeSphere(sphere);
            }
        }
        updateSphereVertices(sphere);
    });

    renderer.render(scene, camera);
}

function pullSphere(sphere, cursorPosition) {
    const originalVertices = sphere.userData.originalVertices;
    const currentVertices = sphere.userData.currentVertices;
    const worldPosition = new THREE.Vector3();
    sphere.getWorldPosition(worldPosition);

    for (let i = 0; i < currentVertices.length; i += 3) {
        const vertexPosition = new THREE.Vector3(
            originalVertices[i],
            originalVertices[i + 1],
            originalVertices[i + 2]
        ).add(worldPosition);

        const direction = cursorPosition.clone().sub(worldPosition).normalize();
        const distance = vertexPosition.distanceTo(cursorPosition);
        const pullFactor = Math.max(0, 1 - distance / explosionRadius);

        const targetX = originalVertices[i] + direction.x * pullStrength * pullFactor;
        const targetY = originalVertices[i + 1] + direction.y * pullStrength * pullFactor;
        const targetZ = originalVertices[i + 2] + direction.z * pullStrength * pullFactor;

        currentVertices[i] += (targetX - currentVertices[i]) * transitionSpeed;
        currentVertices[i + 1] += (targetY - currentVertices[i + 1]) * transitionSpeed;
        currentVertices[i + 2] += (targetZ - currentVertices[i + 2]) * transitionSpeed;
    }
}

function explodeSphere(sphere, cursorPosition, effectStrength) {
    const originalVertices = sphere.userData.originalVertices;
    const currentVertices = sphere.userData.currentVertices;
    const worldPosition = new THREE.Vector3();
    sphere.getWorldPosition(worldPosition);

    for (let i = 0; i < currentVertices.length; i += 3) {
        const vertexPosition = new THREE.Vector3(
            originalVertices[i],
            originalVertices[i + 1],
            originalVertices[i + 2]
        ).add(worldPosition);

        const distance = vertexPosition.distanceTo(cursorPosition);
        if (distance <= explosionRadius) {
            const explosionFactor = (1 - (distance / explosionRadius)) * effectStrength;
            const direction = vertexPosition.sub(worldPosition).normalize();

            const targetX = originalVertices[i] + direction.x * explosionStrength * explosionFactor;
            const targetY = originalVertices[i + 1] + direction.y * explosionStrength * explosionFactor;
            const targetZ = originalVertices[i + 2] + direction.z * explosionStrength * explosionFactor;

            currentVertices[i] += (targetX - currentVertices[i]) * transitionSpeed;
            currentVertices[i + 1] += (targetY - currentVertices[i + 1]) * transitionSpeed;
            currentVertices[i + 2] += (targetZ - currentVertices[i + 2]) * transitionSpeed;
        }
    }
}

function implodeSphere(sphere) {
    const originalVertices = sphere.userData.originalVertices;
    const currentVertices = sphere.userData.currentVertices;

    for (let i = 0; i < currentVertices.length; i += 3) {
        currentVertices[i] += (originalVertices[i] - currentVertices[i]) * transitionSpeed;
        currentVertices[i + 1] += (originalVertices[i + 1] - currentVertices[i + 1]) * transitionSpeed;
        currentVertices[i + 2] += (originalVertices[i + 2] - currentVertices[i + 2]) * transitionSpeed;
    }
}

function updateSphereVertices(sphere) {
    const positions = sphere.geometry.attributes.position.array;
    const currentVertices = sphere.userData.currentVertices;

    for (let i = 0; i < positions.length; i++) {
        positions[i] = currentVertices[i];
    }

    sphere.geometry.attributes.position.needsUpdate = true;
}

init();
animate();