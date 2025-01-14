import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
//import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { gsap } from "gsap";
//import * as functions from './functions.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { Group, TextureLoader } from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry';


document.addEventListener('DOMContentLoaded', function() {

  //setup
  const scene = new THREE.Scene();


  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 25;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth - 18, window.innerHeight - 18);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  //light
  const ambientLight = new THREE.AmbientLight(0xffffff, 2); // Higher intensity for brighter illumination
  scene.add(ambientLight);
  
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2); // Sky and ground light
  scene.add(hemisphereLight);



  //Variables
  const boxSize = 5;
  let targetPosition = new THREE.Vector3();
  let currentLookAt = new THREE.Vector3(0, 0, 0);  // Camera focus point
  const boxes = [];
  let hoveredCube = null;
  let structure = 0;
  let relations = 1;
  let themes = 2;

  let mode = structure;
  let explore = false;


  let boundings = [];
  let clickedCube = null;
  let currentGroup = null;

    //buttons
    const structureButton = document.getElementById("structure");
    const relationsButton = document.getElementById("relations");


    //colours
    const statusColorMap = {};
    let nextPreferredColorIndex = 0;

    const preferredColors = [
      '#e06666', 
      '#f3b48b', 
      '#c6e2ff', 
      '#e5cac6',
      '#d9d2e9'  
    ];

    const white = 0xFFFFFF; 
    const red = 0xFF0000;
    const blue = 0x0000FF;
    const green = 0x00FF00;
    const black = 0x000000;
    const hoverColor = 0xF7E0C0


  

  // bigCube
    const bigCubeSize = 150; // Size of the big cube
    const bigCubeGeometry = new THREE.BoxGeometry(bigCubeSize, bigCubeSize, bigCubeSize);
    const bigCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true, transparent: true, opacity: 1 });
    const bigCube = new THREE.Mesh(bigCubeGeometry, bigCubeMaterial);
    scene.add(bigCube);  





//createBoxes
function createBox(name, description, status) {

  if (!statusColorMap[status]) {
    statusColorMap[status] = generateRandomColor();
  }

  const colour = statusColorMap[status];



  // let colour = white;

   const geometry = new THREE.BoxGeometry(boxSize, boxSize, 5);
   const material = new THREE.MeshStandardMaterial({ color: colour, transparent: true,opacity: 1, wireframe: true });
   const cube = new THREE.Mesh(geometry, material);


  cube.userData.group = null;
  cube.userData.children = [];
  cube.userData.parents = [];
  cube.userData.name = name;
  cube.userData.description = description;
  cube.userData.status = status;
  cube.userData.relations=[]
  cube.userData.level = 0;
  cube.userData.outline = null;
  cube.userData.boundBox = null;
  cube.userData.colour = colour;
  cube.userData.statusline = null;

  boxes.push(cube);
  return cube;
}




// enhanceBox
function enhanceBox(name, parentes = [], relations = [[]]) {
  let cube = boxes.find(box => box === name);

  //text
  const loader = new FontLoader();
  loader.load('src/courierPrime.json', function (font) {
    // Create text geometry
    const textGeometry = new TextGeometry(cube.userData.name, {
      font: font,
      size: boxSize / 2,
      height: 0.2,
      curveSegments: 12,
    });

    cube.geometry.dispose();
    cube.geometry = textGeometry;
    cube.material.transparent = false;
    cube.material.wireframe = false; 
    cube.geometry.center();
  
    //boundingBox
    const textBoundingBox = new THREE.Box3().setFromObject(cube);
    const size = new THREE.Vector3();
    textBoundingBox.getSize(size); 
    const boundingGeometry = new THREE.BoxGeometry(size.x *1.5, size.y *1.5, size.z *1.5);
    const boundingMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      wireframe: true,
      opacity: 0,
    }); 
    const boundBox = new THREE.Mesh(boundingGeometry, boundingMaterial);

    boundBox.position.copy(cube.position); 
    boundBox.userData = { isBoundingBox: true, parentCube: cube };
  
    scene.add(boundBox);
    boundings.push(boundBox);
    cube.userData.boundBox = boundBox;

  });

  //parents
    let parentReferences = [];
    parentes.forEach(parent => {
      if (parent) {
        parentReferences.push(parent);
      }
    })
    cube.userData.parents = parentReferences;


  //group
    const parentReferencesString = parentReferences.map(parent => parent?.userData?.name || 'extraElement').join(', ');
    cube.userData.group = parentReferencesString;


//z-level
  let zLevel = 0;
  if (parentReferences && parentReferences.length > 0) {
      // Find the maximum level among all parents
      const maxParentLevel = Math.max(
          ...parentReferences.map(parent => (parent?.userData?.level ?? 0))
      );
      zLevel = maxParentLevel + 25;
  }
  cube.userData.level = zLevel;




//children
    parentReferences = parentReferences ? (Array.isArray(parentReferences) ? parentReferences : [parentReferences]) : [];
      parentReferences.forEach(parent => {
      if (parent) {
        if (!parent.userData.children) {
          parent.userData.children = [];
        }
        parent.userData.children.push(cube);
        parent.add(cube); 
      }
    });


//relations
    if (Array.isArray(relations)) {
      relations.forEach(relation => {
          if (!Array.isArray(relation) || relation.length !== 2) {
              return;
          }
          const [entity, description] = relation;
          if (!entity || !description) {
              return;
          }
          cube.userData.relations.push([entity, description]);
          entity.userData.relations.push([cube, description]);
      });
  }


  //adding
  scene.add(cube);
  return cube;
    
}




  // Click detection and navigation
  const raycaster = new THREE.Raycaster();
  raycaster.params.Mesh.threshold = 1.5; // Adjust threshold (default is 0)
  const mouse = new THREE.Vector2();
  window.addEventListener('mousemove', onMouseMove, false);



//changeMode
// structure button
document.getElementById('structure').addEventListener('click', () => {
    mode = structure;
    structurePos();
    changeMode()
  });


// relations button
document.getElementById('relations').addEventListener('click', () => {
  mode = relations;
  relationsPos();
  changeMode()
  });


// relations button
document.getElementById('themes').addEventListener('click', () => {
  themesPos();
  mode = themes;
  changeMode()
  });

  //hellohello



//mousemove and hover
function onMouseMove(event) {

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
    //const intersects = raycaster.intersectObjects(boxes);

  const intersects = raycaster.intersectObjects(boundings);

  if (intersects.length > 0) {
    let cube = intersects[0].object;

    if (cube.userData.isBoundingBox) {
      cube = cube.userData.parentCube;
    }
    if (hoveredCube !== cube) {
      removeHover(hoveredCube);

      onHover(cube);
      hoveredCube = cube;
    }
  } else {
    // Remove hover effects if no cube is intersected
    removeHover(hoveredCube);
    hoveredCube = null;
  }
}




function onHover(cube) {
  if (cube && cube.visible) {
   if (mode === structure) {
     createOutline(cube);
     cube.material.color.set(black);
     cube.userData.children?.forEach(child => {
      if(child !== null){
       createOutline(child)
       child.material.color.set(black);
       createLine(cube, child);
      }
   });
     cube.userData.parents?.forEach(parent => {
       if(parent !== null){
        createOutline(parent)
        parent.material.color.set(black);
         createLine(cube, parent);
       }
   });

   const textContainer = document.getElementById('description-container');
   if (textContainer) {
    textContainer.innerText = cube.userData.name + ': ' + cube.userData.description; // Set the text content

     textContainer.style.display = 'block'; // Ensure it's visible
   }


   }


   if(mode === relations) {
     createOutline(cube);
     cube.material.color.set(black);


    cube.userData.relations?.forEach(([entity, description]) => {
      if (entity) {
        createOutline(entity);
        entity.material.color.set(black);
        createLine(cube, entity);
      }
    });
    const textContainer = document.getElementById('description-container');

    if (textContainer) {
      textContainer.innerHTML = ''; // Clear existing content
      cube.userData.relations?.forEach(([entity, description]) => {
        if(entity.visible){
        createOutline(entity);
        if (entity.visible && cube.visible) {
          createLine(cube, entity);
        }
  
        // Append each description as a separate line
        const descriptionElement = document.createElement('div');
        descriptionElement.innerText = cube.userData.name + ', ' + entity.userData.name + ': ' + description;

      
        textContainer.appendChild(descriptionElement);
      }
      });
  
      textContainer.style.display = 'block'; // Ensure it's visible
    }
  }
  if (mode === themes) {

    boxes.filter(child => child.userData.status === cube.userData.status).forEach(element => {
      element.material.color.set(black);
    })


    const boundingBox = new THREE.Box3();
    
    // Expand bounding box to encompass all cubes with the same status
    boxes.filter(child => child.userData.status === cube.userData.status)
         .forEach(state => boundingBox.expandByObject(state));
  
    // Calculate size and center of the bounding box
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);
  
    // Create a filled circular outline
    const radius = Math.max(size.x, size.y) * 0.6; // Adjust this factor as needed
    const segments = 64; // More segments for smoother circle
    const circleGeometry = new THREE.CircleGeometry(radius, segments);
  
    const circleMaterial = new THREE.MeshBasicMaterial({ 
      color: hoverColor, 
      transparent: false,
      opacity: 1,  // Slightly transparent
      side: THREE.DoubleSide 
    });
  
    const statusOutline = new THREE.Mesh(circleGeometry, circleMaterial);
    statusOutline.position.copy(center);
   // statusOutline.rotation.x = Math.PI / 2; // Rotate to face the camera
  
    // Add the outline to the scene
    scene.add(statusOutline);
    cube.userData.statusline = statusOutline;
  
    const textContainer = document.getElementById('description-container');
  
    if (textContainer) {
      textContainer.innerHTML = '';      
  
      const descriptionElement = document.createElement('div');
      descriptionElement.innerText = cube.userData.status;
  
      textContainer.appendChild(descriptionElement);
      textContainer.style.display = 'block'; // Ensure it's visible
    }
  }
  
  
  }
}



// helpers
// helpers
// helpers
// helpers
// helpers
// helpers
// helpers
// helpers
// helpers

// navigation helpers
function addGridHelper(scene) {
  const gridHelper = new THREE.GridHelper(50, 10);
  scene.add(gridHelper);
}
const axesHelper = new THREE.AxesHelper( 500 );
//scene.add( axesHelper );
//addGridHelper(scene);



function generateRandomColor() {
  // // Generate a random hex color
  // return '#' + Math.floor(Math.random() * 16777215).toString(16);

  let colour = null;
  // Assign preferred color if available
  if (nextPreferredColorIndex < preferredColors.length) {
    colour = preferredColors[nextPreferredColorIndex];
    nextPreferredColorIndex++;
  } else {
    // Fallback to generating a random color if preferred list is exhausted
    colour = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }

  return colour;
}




function manNavigation() {

  let isDragging = false;
  let prevMousePosition = { x: 0, y: 0 };
  
  const canvas = document.querySelector('canvas'); 
  
  canvas.addEventListener('wheel', (event) => {
    if (mode === structure && !explore) {
      camera.position.z += event.deltaY * 0.1; 
    }

    if (mode === relations && !explore) {
      camera.position.x -= event.deltaY * 0.1; 
    }

    if (mode === themes && !explore) {
      camera.position.z -= event.deltaY * 0.1; 
    }
  });
  
  canvas.addEventListener('mousedown', (event) => {
    if (mode === structure && !explore) {
      isDragging = true;
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }

    if (mode === relations && !explore) {
      isDragging = true;
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }
    if (mode === themes && !explore) {
      isDragging = true;
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }
  });
  
  canvas.addEventListener('mousemove', (event) => {
    if (mode === structure && !explore && isDragging) {
      const deltaX = (event.clientX - prevMousePosition.x) * 0.1; // Adjust drag sensitivity
      const deltaY = (event.clientY - prevMousePosition.y) * 0.1;
  
      // Modify camera's x and z positions based on drag
      camera.position.x -= deltaX;
      camera.position.y += deltaY;
  
      // Update previous mouse position
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }


    if (mode === relations && !explore && isDragging) {
      const deltaX = (event.clientX - prevMousePosition.x) * 0.1; // Adjust drag sensitivity
      const deltaY = (event.clientY - prevMousePosition.y) * 0.1;
  
      // Since the plane is rotated, modify the camera's z and y positions
      camera.position.z -= deltaX;
      camera.position.y += deltaY;
  
      // Update previous mouse position
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }

    if (mode === themes && !explore && isDragging) {
      const deltaX = (event.clientX - prevMousePosition.x) * 0.1; // Adjust drag sensitivity
      const deltaY = (event.clientY - prevMousePosition.y) * 0.1;
  
      // Modify camera's x and z positions based on drag
      camera.position.x += deltaX;
      camera.position.y += deltaY;
  
      // Update previous mouse position
      prevMousePosition.x = event.clientX;
      prevMousePosition.y = event.clientY;
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    if (mode === structure && !explore) isDragging = false;

    if (mode === relations && !explore) isDragging = false;

    if (mode === themes && !explore) isDragging = false;

  });
  
  canvas.addEventListener('mouseleave', () => {
    if (mode === structure && !explore) isDragging = false;

    if (mode === relations && !explore) isDragging = false;


    if (mode === themes && !explore) isDragging = false;

  });
};


function changeMode() {
  const targetPosition = new THREE.Vector3(0,0,0);
  const rot = new THREE.Euler();


  if (mode === structure) {
    targetPosition.z += bigCubeSize;
    rot.set(0, 0, 0); // 90 degrees in radians

    let hiddenBoxes = boxes.filter(box => !box.visible);
    let structureBoxes = hiddenBoxes.filter(box => (box.userData.children.length > 0 || box.userData.parents.length > 0))
    structureBoxes.forEach(cube => easeInBoxes(cube));

    let notstructureBoxes = boxes.filter(box => (box.userData.children.length < 1 && box.userData.parents.length < 1))
    notstructureBoxes.forEach(cube =>  easeOutBoxes(cube));

    manNavigation();


  }


  if (mode === relations) {
    targetPosition.x -= bigCubeSize;

    rot.set(Math.PI / 2, -Math.PI / 2, Math.PI / 2); // 90 degrees in radians

    boxes.forEach(box => easeInBoxes(box));
    boxes.filter(box => box.userData.relations.length < 1 ).forEach(box => box.visible = false); //&& box.userData.group !== "extraElement"


    manNavigation();
  }

  if (mode === themes) {

    targetPosition.z -= bigCubeSize;
    rot.set(0, Math.PI, 0);

    boxes.forEach(box => easeInBoxes(box));
    boxes.filter(box => box.userData.status === "helperElement" ).forEach(box => box.visible = false); //&& box.userData.group !== "extraElement"
    manNavigation();

  }



  gsap.to(camera.position, {
    duration: 1, // Transition duration in seconds
    x: targetPosition.x,
    y: targetPosition.y,
    z: targetPosition.z,
    ease: "power2.inOut" // Smooth easing function
  });

  gsap.to(camera.rotation, {
    duration: 1,
    x: rot.x,
    y: rot.y,
    z: rot.z,
    ease: "power2.inOut"
  });
}



// structure explore helpers
function showChildGroupsOverlay(children, parent) {
  // Example: Dynamically create an HTML overlay with the available groups
  
  const existingOverlay = document.querySelector('.overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }

  // boxes.forEach(box => {
  //   box.visible = false;
  // });
  
  const overlay = document.createElement('div');
  overlay.classList.add('overlay');

  const groupSelection = document.createElement('div');
  groupSelection.classList.add('group-selection');
  overlay.appendChild(groupSelection);

  let posGroups = [];
  children.forEach(child => {
    if (!posGroups.includes(child.userData.group)) {
      posGroups.push(child.userData.group);
    }
  });

  posGroups.forEach(group => {
    const groupButton = document.createElement('button');
    groupButton.textContent = `Parents: ${group}`;  // Display the group number or name
    // groupButton.removeEventListener('click', previousHandler);
    groupButton.addEventListener('click', () => {
      event.stopPropagation();
      closeOverlay(overlay);
      updateCurrentGroup(group);  // Pass the selected group
      navigateToChildren(currentGroup, parent);      // Close the overlay after selection
    });
    groupSelection.appendChild(groupButton);
  });

  document.body.appendChild(overlay);
}

function updateCurrentGroup(selectedChildGroup) {
  currentGroup = selectedChildGroup;  // This group is chosen by the user
}

function closeOverlay(overlay) {
  overlay.style.display = 'none';  // Immediate hide
  setTimeout(() => {
    overlay.remove();  // Ensure removal
  }, 100);  // Delay for cleanup (short duration)
}


function navigateToChildren(selectedGroup, parent) {
  const children = parent.userData.children.filter(child => child.userData.group === selectedGroup);
  if (children.length === 0) return;

  boxes.forEach(cube => cube.visible = false);
  parent.visible = true;
  children.forEach(child => child.visible = true);

  const boundingBox = new THREE.Box3();
  children.forEach(child => boundingBox.expandByObject(child));

  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  const size = boundingBox.getSize(new THREE.Vector3()).length();

  const distance = size / (2 * Math.tan((camera.fov * Math.PI) / 360));
  targetPosition.set(center.x, center.y, center.z + distance + 5); // Extra space
  currentLookAt.copy(center);
}

function navigateToParent(selectedGroup) {
  const parentesGroup = boxes.filter(child => child.userData.group === selectedGroup);
  if (parentesGroup.length === 0) return;

  boxes.forEach(cube => cube.visible = false);
  parent.visible = true;
  parentesGroup.forEach(child => child.visible = true);

  const boundingBox = new THREE.Box3();
  parentesGroup.forEach(child => boundingBox.expandByObject(child));

  const center = new THREE.Vector3();
  boundingBox.getCenter(center);
  const size = boundingBox.getSize(new THREE.Vector3()).length();

  const distance = size / (2 * Math.tan((camera.fov * Math.PI) / 360));
  targetPosition.set(center.x, center.y, center.z + distance + 5); // Extra space
  currentLookAt.copy(center);
}




//easing animations
function easeInBoxes(cube) {
  cube.visible = true;
  cube.material.opacity = 0;
  cube.material.transparent = true;

  const totalDuration = 1000; // total fade-in duration in milliseconds
  const stepDuration = 20; // the interval between opacity updates
  let currentOpacity = 0;
  
  const fadeInInterval = setInterval(() => {
    currentOpacity += stepDuration / totalDuration; // increase opacity based on step duration
    cube.material.opacity = currentOpacity;

    // Once the opacity reaches 1, clear the interval
    if (currentOpacity >= 1) {
      clearInterval(fadeInInterval);
    }
  }, stepDuration);
}

function easeOutBoxes(cube) {
  cube.visible = true;
  cube.material.opacity = 1; // Start fully visible
  cube.material.transparent = true;

  const totalDuration = 700; // Total fade-out duration in milliseconds
  const stepDuration = 20; // The interval between opacity updates
  let currentOpacity = 1; // Start at full opacity
  
  const fadeOutInterval = setInterval(() => {
    currentOpacity -= stepDuration / totalDuration; // Gradually decrease opacity
    cube.material.opacity = currentOpacity;

    // Once the opacity reaches 0, clear the interval
    if (currentOpacity <= 0) {
      clearInterval(fadeOutInterval);
      cube.visible = false; // Hide the cube when opacity is 0
    }
  }, stepDuration);
}



// hovering
function createLine(startCube, endCube, color = 0xF7E0C0) {
  const material = new THREE.LineBasicMaterial({ color });
  const geometry = new THREE.BufferGeometry().setFromPoints([
    startCube.position.clone(),
    endCube.position.clone()
  ]);
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  // Store the line in userData of the startCube for cleanup
  if (!startCube.userData.lines) {
    startCube.userData.lines = [];
  }
  startCube.userData.lines.push(line);
}

function removeLines(cube) {
  if (cube && cube.userData.lines) {
    cube.userData.lines.forEach(line => scene.remove(line));
    cube.userData.lines = null;
  }
}



function createOutline(cube, color = 0xF7E0C0) {
  if (cube && !cube.userData.outline) {
    const box = new THREE.Box3().setFromObject(cube);

    // Get the dimensions of the bounding box
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    let factorX, factorY;
    if (mode === structure) {
      factorX = size.x;
      factorY = size.y;
    } else if (mode === relations) {
      factorX = size.z;
      factorY = size.y;
    } else if (mode === themes) {
      factorX = size.x;
      factorY = size.z;
    }

    // Create a circle geometry (we'll scale it to make an oval)
    const circleGeometry = new THREE.CircleGeometry(1, 64);

    // Create outline material
    const outlineMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: false,
      opacity: 1,
      side: THREE.DoubleSide // Make sure the outline is visible from both sides
    });

    // Create mesh and scale it to form an oval
    const outlineMesh = new THREE.Mesh(circleGeometry, outlineMaterial);
    outlineMesh.scale.set(factorX / 1.7, factorY / 0.7, 1);
    outlineMesh.position.copy(cube.position);
    scene.add(outlineMesh);

    // Save the outline for later removal
    cube.userData.outline = outlineMesh;

    // Set rotation based on mode
    if (mode === structure) {
      outlineMesh.rotation.set(0, 0, 0);
    } else if (mode === relations) {
      outlineMesh.rotation.set(0, -(Math.PI / 2), 0);
    } else if (mode === themes) {
      outlineMesh.rotation.set(0, -Math.PI, 0);
    }
  }
}



function removeOutline(cube) {
  if (cube && cube.userData.outline) {
    scene.remove(cube.userData.outline);
    cube.userData.outline = null;
  }
}

function removeHover(cube) {
  if (cube) {
    removeOutline(cube);
    cube.material.color.set(cube.userData.colour);
    removeLines(cube);

    cube.userData.children?.forEach(child => {
      if(child){
        removeOutline(child)
        child.material.color.set(child.userData.colour);
        removeLines(child);
      }
  });
    cube.userData.parents?.forEach(parent => {
      if(parent){
        removeOutline(parent)
        parent.material.color.set(parent.userData.colour);
        removeLines(parent);
      }
  });

  cube.userData.relations?.forEach(([entity, description]) => {
    if (entity) {
      removeOutline(entity);
      entity.material.color.set(entity.userData.colour);
      removeLines(entity);
    }
  });

  boxes.filter(child => child.userData.status === cube.userData.status).forEach(element => {
    element.material.color.set(element.userData.colour);
  })


  //text container
    const textContainer = document.getElementById('description-container');
    if (textContainer) {
      textContainer.style.display = 'none';
      textContainer.innerText = ''; // Clear the content
    }


    if (cube && cube.userData.statusline) {
      scene.remove(cube.userData.statusline);
      cube.userData.statusline = null;
    }
  
  }
}



// positions

//structure


function structurePos() {
  setTimeout(() => {
    // Reset rotation for all cubes
    boxes.forEach(cube => {
      cube.rotation.set(0, 0, 0);
      if (cube.userData.boundBox) {
        cube.userData.boundBox.rotation.set(0, 0, 0);
      }
    });

    const levelSpacing = 25;   // Distance between levels (y-axis)
    const groupSpacing = 40;   // Distance between groups (x-axis)
    const boxSpacing = 5;      // Distance between boxes in clusters (x-axis)
    const zFrontFace = bigCubeSize / 2;

    const levels = {};

    let structureBoxes = boxes.filter(box => (box.userData.children.length > 0 || box.userData.parents.length > 0));
    let notStructureBoxes = boxes.filter(box => box.userData.group === "extraElement" && box.userData.children.length < 1);

    // Hide non-structural boxes
    notStructureBoxes.forEach(cube => { cube.visible = false; });

    // Group cubes by their level
    structureBoxes.forEach(cube => {
      const level = cube.userData.level;
      if (!levels[level]) levels[level] = [];
      levels[level].push(cube);
    });

    const totalLevels = Object.keys(levels).length;
    const totalHeight = (totalLevels - 1) * levelSpacing;
    const centerYOffset = totalHeight / 2;

    Object.keys(levels).forEach((yLevel, levelIndex) => {
      const cubesAtLevel = levels[yLevel];
      const clusters = {};

      // Group cubes by `group`
      cubesAtLevel.forEach(cube => {
        const cluster = cube.userData.group;
        if (!clusters[cluster]) clusters[cluster] = [];
        clusters[cluster].push(cube);
      });

      let totalWidth = 0;
      let maxClusterHeight = 0;

      // Calculate total width and max height for the level
      Object.values(clusters).forEach(cubesInCluster => {
        let clusterWidth = 0;
        let clusterHeight = 0;
        cubesInCluster.forEach(cube => {
          if (!cube.userData.boundBox.geometry.boundingBox) {
            cube.userData.boundBox.geometry.computeBoundingBox();
          }
          const boundBox = cube.userData.boundBox.geometry.boundingBox;
          clusterWidth += boundBox.max.x - boundBox.min.x + boxSpacing;
          clusterHeight = Math.max(clusterHeight, boundBox.max.y - boundBox.min.y);
        });
        totalWidth += clusterWidth;
        maxClusterHeight = Math.max(maxClusterHeight, clusterHeight);
      });

      totalWidth += (Object.keys(clusters).length - 1) * groupSpacing;
      const levelOffsetX = -totalWidth / 2;
      let currentX = levelOffsetX;

      Object.keys(clusters).forEach(clusterKey => {
        const cubesInCluster = clusters[clusterKey];
        let clusterWidth = 0;

        cubesInCluster.forEach((cube, i) => {
          if (!cube.userData.boundBox.geometry.boundingBox) {
            cube.userData.boundBox.geometry.computeBoundingBox();
          }
          const boundBox = cube.userData.boundBox.geometry.boundingBox;
          const cubeWidth = boundBox.max.x - boundBox.min.x;
          const cubeHeight = boundBox.max.y - boundBox.min.y;

          const x = currentX + clusterWidth + cubeWidth / 2;
          const y = centerYOffset - levelIndex * levelSpacing - (maxClusterHeight - cubeHeight) / 2;
          const z = zFrontFace;

          // Animate the cube's position
          gsap.to(cube.position, {
            duration: 1,
            x: x,
            y: y,
            z: z,
            ease: "power2.inOut",
            onUpdate: () => {
              if (cube.userData.boundBox) {
                cube.userData.boundBox.position.copy(cube.position);
              }
            }
          });

          clusterWidth += cubeWidth + boxSpacing;
        });

        currentX += clusterWidth + groupSpacing;
      });
    });
  }, 500);
}




function structureExplorePos() {
  // setTimeout(() => {
  const levelSpacing = 25; // Distance between levels on the z-axis
  const groupSpacing = 50; // Distance between groups within a level
  const boxSpacing = 15;    // Distance between boxes within a cluster

//rotation
boxes.forEach(cube => {
  cube.rotation.set(0, 0, 0);
  cube.userData.boundBox.rotation.set(0, 0, 0);

});


  const levels = {};


  // let structureBoxes = boxes.filter(box => box.userData.group !== "extraElement");
  
  // let notStructureBoxes = boxes.filter(box => box.userData.group === "extraElement");

  let structureBoxes = boxes.filter(box => box.userData.children.length > 0 || box.userData.parents.length > 0)//(box => box.userData.group !== "extraElement");
  
  let notStructureBoxes = boxes.filter(box => box.userData.group === "extraElement" && box.userData.children.length < 1);

  notStructureBoxes.forEach(cube => {cube.visible = false;});



  structureBoxes.forEach(cube => {
    const level = cube.userData.level;
    if (!levels[level]) levels[level] = [];
    levels[level].push(cube);
  });

  Object.keys(levels).forEach((zLevel, levelIndex) => {
    const cubesAtLevel = levels[zLevel];

    // Group cubes by their `group` value
    const clusters = {};
    cubesAtLevel.forEach(cube => {
      const cluster = cube.userData.group;
      if (!clusters[cluster]) clusters[cluster] = [];
      clusters[cluster].push(cube);
    });

    const totalWidth = Object.keys(clusters).length * groupSpacing;
      const levelOffsetX = -totalWidth / 2;

    Object.keys(clusters).forEach((clusterKey, clusterIndex) => {
      const cubesInCluster = clusters[clusterKey];

      const clusterOffsetX = levelOffsetX + clusterIndex * groupSpacing;

      const cols = Math.ceil(Math.sqrt(cubesInCluster.length));
      cubesInCluster.forEach((cube, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);

        const x = clusterOffsetX + col * boxSpacing;
        const y = row * boxSpacing;
        const z = -levelIndex * levelSpacing; // Place at the correct z-level



        gsap.to(cube.position, {
          duration: 1,
          x: x,
          y: y,
          z: z,
          ease: "power2.inOut",
          onUpdate: () => { 
              boxes.forEach(box => {
                box.userData.boundBox.position.copy(box.position);
              })   
           }
        });

        // Set the position of the cube
        // cube.position.set(x, y, z);
      });
    });
  });
// }, 500);
}



//relations
function relationsPos() {
  setTimeout(() => {
    // Rotate cubes
    boxes.forEach(cube => {
      cube.rotation.set(0, -(Math.PI / 2), 0);
      cube.userData.boundBox.rotation.set(0, -(Math.PI / 2), 0);
    });

    const minDistance = 30;     // Minimum distance between cubes to avoid overlap
    const maxAttempts = 100;    // Max retries to find a non-overlapping position
    const relationForce = 50;   // Force to pull related cubes closer
    const repulsionForce = 10;  // Force to push unrelated cubes apart

    let planeWidth = bigCubeSize;
    let planeHeight = bigCubeSize;
    const leftFaceX = -bigCubeSize / 2;

    const placedPositions = [];

    // Helper function to check for collisions
    function checkCollision(pos) {
      return placedPositions.some(placedPos => {
        const dx = pos.y - placedPos.y;
        const dy = pos.z - placedPos.z;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    }

    // Helper function to calculate forces
    function calculateForces(cube, pos) {
      let forceY = 0, forceZ = 0;
      boxes.forEach(otherCube => {
        if (cube !== otherCube) {
          const dy = pos.y - otherCube.position.y;
          const dz = pos.z - otherCube.position.z;
          const distance = Math.sqrt(dy * dy + dz * dz);
          const force = cube.userData.relations.includes(otherCube.userData.id) ? relationForce : -repulsionForce;
          forceY += (dy / distance) * force;
          forceZ += (dz / distance) * force;
        }
      });
      return { forceY, forceZ };
    }

    // Position cubes
    boxes.forEach(cube => {
      let validPosition = false;
      let attempts = 0;
      let pos = { x: leftFaceX, y: 0, z: 0 };

      while (!validPosition && attempts < maxAttempts) {
        const { forceY, forceZ } = calculateForces(cube, pos);
        pos.y += forceY * 0.1;
        pos.z += forceZ * 0.1;

        // Keep within expanded plane
        pos.y = Math.max(-planeHeight/2, Math.min(planeHeight/2, pos.y));
        pos.z = Math.max(-planeWidth/2, Math.min(planeWidth/2, pos.z));

        if (!checkCollision(pos)) {
          validPosition = true;
        } else {
          attempts++;
        }
      }

      if (!validPosition) {
        // Expand plane if needed
        planeWidth += 10;
        planeHeight += 10;
        pos.y = (Math.random() - 0.5) * planeHeight;
        pos.z = (Math.random() - 0.5) * planeWidth;
      }

      placedPositions.push(pos);

      gsap.to(cube.position, {
        duration: 1,
        x: pos.x,
        y: pos.y,
        z: pos.z,
        ease: "power2.inOut",
        onUpdate: () => {
          cube.userData.boundBox.position.copy(cube.position);
        }
      });
    });
  }, 500);
}







function relationsExplorePos() {
  // rotation reset
  boxes.forEach(cube => {
    cube.rotation.set(0, - (Math.PI / 2), 0);
    cube.userData.boundBox.rotation.set(0, - (Math.PI / 2), 0);
  });
 
    //const groupCenterObject = boxes.find(cube => cube.userData.group === currentGroup);

    const groupCenterObject = clickedCube;



    if (!groupCenterObject) return;
    groupCenterObject.position.set(0, 0, 0);  // Center position
    const relatedObjects = [];

    groupCenterObject.userData.relations.forEach(([relatedCube]) => {
      if (relatedCube !== groupCenterObject && !relatedObjects.includes(relatedCube)) {
        relatedObjects.push(relatedCube);
      }
    })

    const radius = 50;  // The radius of the circle around the center
    const angleIncrement = (2 * Math.PI) / relatedObjects.length;

    relatedObjects.forEach((relatedCube, index) => {
      const angle = angleIncrement * index;
      const x = 0;
      const z = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);

      gsap.to(relatedCube.position, {
        duration: 1,
        x: x,
        y: y,
        z: z,
        ease: "power2.inOut",
        onUpdate: () => {
          boxes.forEach(box => {
           box.userData.boundBox.position.copy(box.position);
          })   
        } 
      });
    });

    boxes.forEach(cube => {cube.visible = false});
    groupCenterObject.visible = true;
    relatedObjects.forEach(cube => cube.visible = true);
}



function themesPos() {
  setTimeout(() => {
    // Rotate cubes to face the correct direction
    let themesBoxes = boxes.filter(box => box.visible === true);

    boxes.forEach(cube => {
      cube.rotation.set(0, -Math.PI, 0);
      cube.userData.boundBox.rotation.set(0, -Math.PI, 0);
    });

    // Base constants
    const baseClusterSpacing = 30; // Spacing between cluster centers
    const baseBoxSpread = 10; // Initial spread within clusters
    const minClusterDistance = 10; // Minimum distance between cluster centers
    const faceZ = -bigCubeSize / 2;

    // Group cubes by status
    const statusClusters = {};
    themesBoxes.forEach(cube => {
      const status = cube.userData.status || "default";
      if (!statusClusters[status]) statusClusters[status] = [];
      statusClusters[status].push(cube);
    });

    const statusKeys = Object.keys(statusClusters);

    // Initialize cluster centers
    const clusterCenters = statusKeys.map((status, index) => {
      const angle = (index / statusKeys.length) * Math.PI * 2;
      const radius = baseClusterSpacing * Math.sqrt(statusKeys.length);
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        faceZ
      );
    });

    // Force-directed placement of cluster centers
    for (let iteration = 0; iteration < 100; iteration++) {
      statusKeys.forEach((status, i) => {
        let forceX = 0, forceY = 0;
        statusKeys.forEach((otherStatus, j) => {
          if (i !== j) {
            const dx = clusterCenters[i].x - clusterCenters[j].x;
            const dy = clusterCenters[i].y - clusterCenters[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = Math.max(0, minClusterDistance - distance) / distance;
            forceX += dx * force;
            forceY += dy * force;
          }
        });
        clusterCenters[i].x += forceX * 0.1;
        clusterCenters[i].y += forceY * 0.1;
      });
    }

    // Position cubes within clusters
    statusKeys.forEach((status, clusterIndex) => {
      const cubesInStatus = statusClusters[status];
      const clusterCenter = clusterCenters[clusterIndex];

      // Initialize positions within cluster
      cubesInStatus.forEach(cube => {
        cube.position.x = clusterCenter.x + (Math.random() - 0.5) * baseBoxSpread;
        cube.position.y = clusterCenter.y + (Math.random() - 0.5) * baseBoxSpread;
        cube.position.z = faceZ;
      });

      // Force-directed placement within cluster
      for (let iteration = 0; iteration < 50; iteration++) {
        cubesInStatus.forEach((cube, i) => {
          let forceX = 0, forceY = 0;
          
          cubesInStatus.forEach((otherCube, j) => {
            if (i !== j) {
              const dx = cube.position.x - otherCube.position.x;
              const dy = cube.position.y - otherCube.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy) || 1;
              const force = (30 - distance) / distance;
              forceX += dx * force;
              forceY += dy * force;
            }
          });

          // Add a centering force
          forceX += (clusterCenter.x - cube.position.x) * 0.1;
          forceY += (clusterCenter.y - cube.position.y) * 0.1;

          cube.position.x += forceX * 0.05;
          cube.position.y += forceY * 0.05;
        });
      }

      // Animate final positions
      cubesInStatus.forEach(cube => {
        gsap.to(cube.position, {
          duration: 1,
          x: cube.position.x,
          y: cube.position.y,
          z: cube.position.z,
          ease: "power2.inOut",
          onUpdate: () => {
            cube.userData.boundBox.position.copy(cube.position);
          }
        });
      });
    });

    // Update bounding boxes and outlines
    updateBoundingBoxes();
  }, 500);
}

function updateBoundingBoxes() {
  const statusClusters = {};
  boxes.forEach(cube => {
    if (cube.visible) {
      const status = cube.userData.status || "default";
      if (!statusClusters[status]) statusClusters[status] = [];
      statusClusters[status].push(cube);
    }
  });

  Object.entries(statusClusters).forEach(([status, cubes]) => {
    const boundingBox = new THREE.Box3();
    cubes.forEach(cube => boundingBox.expandByObject(cube));

    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    boundingBox.getCenter(center);
    boundingBox.getSize(size);

    // Create or update the outline
    let statusOutline = scene.getObjectByName(`statusOutline_${status}`);
    if (!statusOutline) {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
      const edges = new THREE.EdgesGeometry(boxGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0xF7E0C0, linewidth: 2 });
      statusOutline = new THREE.LineSegments(edges, lineMaterial);
      statusOutline.name = `statusOutline_${status}`;
      //scene.add(statusOutline);
    }

    // Update the outline position and scale
    statusOutline.position.copy(center);
    statusOutline.scale.set(size.x * 1.2, size.y * 1.2, size.z * 1.2);
  });
}


  // Animation loop
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    if(mode === structure && explore){ //mode === structure &&
      camera.position.lerp(targetPosition, 0.05);
    }

    boxes.filter(cube => cube.userData.name === "cA").forEach(cube => {cube.visible = false});

    renderer.render(scene, camera);
  }
  animate();





















  // Example
    // Example
      // Example
        // Example
          // Example
            // Example


//ca
const cA = createBox(
  "cA",
  "",
  "0"
);



// Creating concepts
const human_experience = createBox(
  "Human Experience",
  "The totality of concepts, emotions, relationships, and activities defining human life.",
  "Root Concept"
);

const social_concept = createBox(
  "Social Concept",
  "Concepts related to interactions and relationships between individuals or groups.",
  "Category of Human Experience"
);

const psychological_concept = createBox(
  "Psychological Concept",
  "Concepts concerning the mind, emotions, and individual behavior.",
  "Category of Human Experience"
);

const health_concept = createBox(
  "Health Concept",
  "Concepts related to the physical and mental well-being of individuals.",
  "Category of Human Experience"
);

const friendship = createBox(
  "Friendship",
  "A close and voluntary interpersonal relationship characterized by mutual affection, trust, and support.",
  "Social Concept"
);

const social_support = createBox(
  "Social Support",
  "Assistance and protection provided by others, contributing to an individual's well-being.",
  "Social Concept"
);

const mental_health = createBox(
  "Mental Health",
  "A person's condition regarding their psychological and emotional well-being.",
  "Health Concept"
);

const physical_health = createBox(
  "Physical Health",
  "The condition of a person's body, including the absence of illness and the fitness to perform daily activities.",
  "Health Concept"
);

const loneliness = createBox(
  "Loneliness",
  "A state of solitude or being alone, which can negatively impact mental and physical health.",
  "Psychological Concept"
);

const peer_rejection = createBox(
  "Peer Rejection",
  "The experience of being deliberately excluded by peers, often leading to negative psychological outcomes.",
  "Social Concept"
);

const self_esteem = createBox(
  "Self-Esteem",
  "An individual's subjective evaluation of their own worth.",
  "Psychological Concept"
);

const social_development = createBox(
  "Social Development",
  "The process by which individuals acquire the values, behaviors, and skills necessary to interact effectively within society.",
  "Developmental Process"
);

const dissolution_of_friendship = createBox(
  "Dissolution of Friendship",
  "The process through which a friendship ends, which can lead to emotional distress.",
  "Social Process"
);

// Enhancing concepts hierarchically and semantically
enhanceBox(human_experience, 
  [cA], 
  []
);

enhanceBox(social_concept, 
  [human_experience], 
  [
    [friendship, "Friendship is a type of social relationship"],
    [social_support, "Social support emerges from human interactions"],
    [peer_rejection, "Peer rejection is a social experience"],
    [dissolution_of_friendship, "Friendship dissolution is a social process"]
  ]
);

enhanceBox(psychological_concept, 
  [human_experience], 
  [
    [loneliness, "Loneliness affects the human psyche"],
    [self_esteem, "Self-esteem is a fundamental psychological aspect"]
  ]
);

enhanceBox(health_concept, 
  [human_experience], 
  [
    [mental_health, "Mental health is a key dimension of well-being"],
    [physical_health, "Physical health contributes to overall well-being"]
  ]
);

enhanceBox(friendship, 
  [social_concept], 
  [
    [social_support, "Friendship often involves providing social support"],
    [self_esteem, "Friendship can enhance self-esteem"],
    [dissolution_of_friendship, "Friendship can dissolve over time"]
  ]
);

enhanceBox(social_support, 
  [social_concept], 
  [
    [mental_health, "Social support contributes to mental health"],
    [physical_health, "Social support can improve physical health outcomes"]
  ]
);

enhanceBox(mental_health, 
  [health_concept], 
  [
    [loneliness, "Poor mental health can result from loneliness"],
    [self_esteem, "Self-esteem influences mental health"]
  ]
);

enhanceBox(physical_health, 
  [health_concept], 
  [
    [social_support, "Social support benefits physical health"],
    [mental_health, "Physical and mental health are interconnected"]
  ]
);

enhanceBox(loneliness, 
  [psychological_concept], 
  [
    [peer_rejection, "Peer rejection often results in loneliness"],
    [mental_health, "Loneliness negatively affects mental health"]
  ]
);

enhanceBox(peer_rejection, 
  [social_concept], 
  [
    [self_esteem, "Peer rejection can harm self-esteem"]
  ]
);

enhanceBox(self_esteem, 
  [psychological_concept], 
  [
    [friendship, "Friendship enhances self-esteem"],
    [social_development, "Self-esteem is crucial for social development"]
  ]
);

enhanceBox(social_development, 
  [social_concept], 
  [
    [self_esteem, "Self-esteem plays a role in social interactions"]
  ]
);

enhanceBox(dissolution_of_friendship, 
  [social_concept], 
  [
    [loneliness, "Friendship dissolution may lead to loneliness"]
  ]
);










enhanceBox(cA, [null],[[]])













setTimeout(() => {
  
  structurePos();
  changeMode();

}, 1000)

});
