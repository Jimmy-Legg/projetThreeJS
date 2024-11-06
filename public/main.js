import * as THREE from 'three';

let scene, camera, renderer;
let spheres = [];
const gridSize = { x: 10, y: 20 };
const sphereSpacing = 1.2;
const cursorRadius = 1;

let raycaster, mouse;
const explosionStrength = .2;
const explosionRadius = 1.5;
const transitionSpeed = 0.1;

let isMouseDown = false;
let selectedSphere = null;
let pullStrength = 1.1;

// Add this function to generate a random pink color
function getRandomPinkColor() {
    const hue = 300 + Math.random() * 60; // Range from 300 to 360 (pink hues)
    const saturation = 70 + Math.random() * 30; // Range from 70% to 100%
    const lightness = 40 + Math.random() * 30; // Range from 40% to 70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Add these variables at the top of your file
let spinningTorus = null;
const normalSpinSpeed = 0.1;
const fastSpinSpeed = 0.5; // Reduced from 1.0 to 0.5 for slower spinning
let spinStartTime = 0;
const fastSpinDuration = 1000; // Increased from 500 to 1000 milliseconds

// Add these functions at the top of your file
function createDonutGeometry(radius, tubeRadius, radialSegments, tubularSegments) {
    const geometry = new THREE.TorusGeometry(radius, tubeRadius, radialSegments, tubularSegments);
    const donutMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD7BA }); // Light brown for the donut base
    const donut = new THREE.Mesh(geometry, donutMaterial);

    // Create sprinkles
    const sprinkleCount = 50;
    const sprinkleGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.1);
    const sprinkleGroup = new THREE.Group();

    for (let i = 0; i < sprinkleCount; i++) {
        const sprinkleMaterial = new THREE.MeshPhongMaterial({ color: Math.random() * 0xFFFFFF });
        const sprinkle = new THREE.Mesh(sprinkleGeometry, sprinkleMaterial);
        
        // Random position on the donut surface
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 2;
        sprinkle.position.set(
            (radius + tubeRadius * Math.cos(phi)) * Math.cos(theta),
            (radius + tubeRadius * Math.cos(phi)) * Math.sin(theta),
            tubeRadius * Math.sin(phi)
        );
        
        // Random rotation
        sprinkle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        
        sprinkleGroup.add(sprinkle);
    }

    // Create frosting
    const frostingGeometry = new THREE.TorusGeometry(radius, tubeRadius * 1.05, radialSegments, tubularSegments);
    const frostingMaterial = new THREE.MeshPhongMaterial({ 
        color: getRandomPinkColor(),
        transparent: true,
        opacity: 0.8
    });
    const frosting = new THREE.Mesh(frostingGeometry, frostingMaterial);

    // Combine all parts
    const donutGroup = new THREE.Group();
    donutGroup.add(donut);
    donutGroup.add(frosting);
    donutGroup.add(sprinkleGroup);

    return donutGroup;
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 1.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    for (let x = 0; x < gridSize.x; x++) {
        for (let y = 0; y < gridSize.y; y++) {
            const donut = createDonutGeometry(0.4, 0.2, 16, 100);
            donut.position.set(
                (x - gridSize.x / 2) * sphereSpacing,
                (y - gridSize.y / 2) * sphereSpacing,
                0
            );
            scene.add(donut);
            spheres.push(donut);

            // Store original and current vertices for each part of the donut
            donut.children.forEach(child => {
                if (child instanceof THREE.Mesh) {
                    child.userData.originalVertices = child.geometry.attributes.position.array.slice();
                    child.userData.currentVertices = child.geometry.attributes.position.array.slice();
                }
            });

            // Add rotation direction for each donut
            donut.userData.rotationDirection = {
                x: Math.random() - 0.5,
                y: Math.random() - 0.5,
                z: Math.random() - 0.5
            };
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

    const contentHeight = window.innerHeight * 6; 
    document.body.style.height = `${contentHeight}px`;
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseDown(event) {
    isMouseDown = true;
    updateSelectedDonut();
    if (selectedDonut) {
        spinningTorus = selectedDonut;
        spinStartTime = Date.now();
    }
}

function onMouseUp(event) {
    isMouseDown = false;
    if (spinningTorus) {
        const clickDuration = Date.now() - spinStartTime;
        if (clickDuration < 200) { // If it's a quick click
            // Start fast spinning
            spinStartTime = Date.now();
        } else {
            // Set random rotation for longer clicks/drags
            spinningTorus.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            spinningTorus = null;
        }
    }
    selectedDonut = null;
}

function updateSelectedDonut() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(spheres, true); // Set to true to check all descendants
    if (intersects.length > 0) {
        selectedDonut = intersects[0].object.parent; // Get the parent group (entire donut)
    } else {
        selectedDonut = null;
    }
}

function onScroll() {
    const scrollFraction = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const totalHeight = (gridSize.y - 1) * sphereSpacing;
    const scrollSpeed = 0.5; // Adjust this value to control scroll speed (lower = slower)
    camera.position.y = -scrollFraction * totalHeight * scrollSpeed;
    randomRotateDonutsOnScroll();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Remove the constant rotation of all donuts

    // Spin the selected donut if it exists
    if (spinningTorus) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - spinStartTime;
        
        if (elapsedTime < fastSpinDuration) {
            // Fast spin
            spinningTorus.rotation.y += fastSpinSpeed;
        } else {
            // Normal spin
            spinningTorus.rotation.y += normalSpinSpeed;
            
            if (!isMouseDown) {
                // Stop spinning after fast spin duration if mouse is not down
                spinningTorus = null;
            }
        }
    }

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

    spheres.forEach(donut => {
        const distance = donut.position.distanceTo(cursorPosition);
        if (distance <= cursorRadius) {
            const effectStrength = 1 - (distance / cursorRadius);
            explodeSphere(donut, cursorPosition, effectStrength);
        } else {
            implodeSphere(donut);
        }
        updateSphereVertices(donut);
    });

    renderer.render(scene, camera);
}

function pullSphere(sphere, cursorPosition) {
    const originalVertices = sphere.userData.originalVertices;
    const currentVertices = sphere.userData.currentVertices;
    const worldPosition = new THREE.Vector3();
    sphere.getWorldPosition(worldPosition);

    const direction = cursorPosition.clone().sub(worldPosition).normalize();
    const distance = worldPosition.distanceTo(cursorPosition);
    const maxStretch = 0.5 * pullStrength; // Incorporate pullStrength
    const stretchFactor = Math.min(distance / 2, maxStretch);

    for (let i = 0; i < currentVertices.length; i += 3) {
        const vertexPosition = new THREE.Vector3(
            originalVertices[i],
            originalVertices[i + 1],
            originalVertices[i + 2]
        );

        const dotProduct = vertexPosition.dot(direction);
        const stretchAmount = Math.max(0, dotProduct) * stretchFactor * pullStrength; // Use pullStrength

        const targetX = originalVertices[i] + direction.x * stretchAmount;
        const targetY = originalVertices[i + 1] + direction.y * stretchAmount;
        const targetZ = originalVertices[i + 2] + direction.z * stretchAmount;

        currentVertices[i] += (targetX - currentVertices[i]) * transitionSpeed;
        currentVertices[i + 1] += (targetY - currentVertices[i + 1]) * transitionSpeed;
        currentVertices[i + 2] += (targetZ - currentVertices[i + 2]) * transitionSpeed;
    }
}

function explodeSphere(donut, cursorPosition, effectStrength) {
    donut.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            const originalVertices = child.userData.originalVertices;
            const currentVertices = child.userData.currentVertices;
            const worldPosition = new THREE.Vector3();
            donut.getWorldPosition(worldPosition);

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
    });
}

function implodeSphere(donut) {
    donut.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            const originalVertices = child.userData.originalVertices;
            const currentVertices = child.userData.currentVertices;

            for (let i = 0; i < currentVertices.length; i += 3) {
                currentVertices[i] += (originalVertices[i] - currentVertices[i]) * transitionSpeed;
                currentVertices[i + 1] += (originalVertices[i + 1] - currentVertices[i + 1]) * transitionSpeed;
                currentVertices[i + 2] += (originalVertices[i + 2] - currentVertices[i + 2]) * transitionSpeed;
            }
        }
    });
}

function updateSphereVertices(donut) {
    donut.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
            const positions = child.geometry.attributes.position.array;
            const currentVertices = child.userData.currentVertices;

            for (let i = 0; i < positions.length; i++) {
                positions[i] = currentVertices[i];
            }

            child.geometry.attributes.position.needsUpdate = true;
        }
    });
}

function randomRotateDonutsOnScroll() {
    const rotationSpeed = 0.05; // Adjust this value to control rotation speed (lower = slower)
    spheres.forEach(donut => {
        donut.rotation.x += donut.userData.rotationDirection.x * rotationSpeed;
        donut.rotation.y += donut.userData.rotationDirection.y * rotationSpeed;
        donut.rotation.z += donut.userData.rotationDirection.z * rotationSpeed;
    });
}

init();
animate();
