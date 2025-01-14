import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
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
    //createOutline(cube);
    //cube.material.color.set(black);

    const boundingBox = new THREE.Box3();
    
      // Expand bounding box to encompass all cubes with the same status
      boxes.filter(child => child.userData.status === cube.userData.status)
           .forEach(state => boundingBox.expandByObject(state));
    
      // Calculate size and center of the bounding box
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      boundingBox.getCenter(center);
      boundingBox.getSize(size);
    
      // Create a visual representation of the bounding box using LineSegments
      const boxGeometry = new THREE.BoxGeometry(size.x * 1.4, size.y * 1.4, size.z * 1.4);
      const edges = new THREE.EdgesGeometry(boxGeometry);
      const lineMaterial = new THREE.LineBasicMaterial({ hoverColor, linewidth: 4 });
    
      const statusOutline = new THREE.LineSegments(edges, lineMaterial);
      statusOutline.position.copy(center);
      
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
const axesHelper = new THREE.AxesHelper( 500 ); scene.add( axesHelper );
addGridHelper(scene);



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
    const box =  new THREE.Box3().setFromObject(cube);

    let factor = 0
    // Get the dimensions of the bounding box
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    if(mode === structure){
      factor = size.x
    }
    else if(mode === relations){
      factor = size.z
    }
    else if(mode === themes){
      factor = size.x
    }
    const outlineGeometry = new THREE.CircleGeometry(factor / 1.8);

    const outlineMaterial = new THREE.MeshBasicMaterial({
      color,
      transparent: false,
      opacity: 1,
    });

    const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
    outlineMesh.position.copy(cube.position);
    scene.add(outlineMesh);

    // Save the outline for later removal
    cube.userData.outline = outlineMesh;

    if (mode === structure){
      outlineMesh.rotation.set(0, 0, 0);
    }
    else if(mode === relations){
      outlineMesh.rotation.set(0, - (Math.PI / 2), 0);
    }
    else if(mode === themes){
      outlineMesh.rotation.set(0, - Math.PI, 0);
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

// structure
function structurePos() {
  setTimeout(() => {


//rotation
    boxes.forEach(cube => {
      cube.rotation.set(0, 0, 0);
      cube.userData.boundBox.rotation.set(0, 0, 0);
    });
  

//levelSpacing
    const levelSpacing = 25; // Distance between levels (y-axis)
    const groupSpacing = 60; // Distance between groups within a level (x-axis)
    const boxSpacing = 20;    // Distance between boxes within a cluster (x-axis)

    // Set z-position to the front face of the big cube
    const zFrontFace = bigCubeSize / 2;

    const levels = {};


    let structureBoxes = boxes.filter(box => (box.userData.children.length > 0 || box.userData.parents.length > 0))//(box => box.userData.group !== "extraElement");
  
    let notStructureBoxes = boxes.filter(box => box.userData.group === "extraElement" && box.userData.children.length < 1);
    notStructureBoxes.forEach(cube => {cube.visible = false;});


    structureBoxes.forEach(cube => {
      const level = cube.userData.level;
      if (!levels[level]) levels[level] = [];
      levels[level].push(cube);
    });


    // Calculate the total height of all levels to center along the y-axis
    const totalLevels = Object.keys(levels).length;
    const totalHeight = (totalLevels - 1) * levelSpacing;
    const centerYOffset = totalHeight / 2;

    Object.keys(levels).forEach((yLevel, levelIndex) => {
      const cubesAtLevel = levels[yLevel];

      // Group cubes by their `group` value
      const clusters = {};
      cubesAtLevel.forEach(cube => {
        const cluster = cube.userData.group;
        if (!clusters[cluster]) clusters[cluster] = [];
        clusters[cluster].push(cube);
      });

      // Calculate total width of all clusters, including box spacing
      let totalWidth = 0;
      Object.values(clusters).forEach((cubesInCluster) => {
        const clusterWidth = (cubesInCluster.length - 1) * boxSpacing;
        totalWidth += clusterWidth + groupSpacing;
      });
      totalWidth -= groupSpacing; // Remove the last unnecessary group spacing

      const levelOffsetX = -totalWidth / 2;

      let currentX = levelOffsetX;

      Object.keys(clusters).forEach((clusterKey) => {
        const cubesInCluster = clusters[clusterKey];

        cubesInCluster.forEach((cube, i) => {
          const x = currentX + i * boxSpacing;               // Spread along the x-axis
          const y = centerYOffset - levelIndex * levelSpacing; // Spread along the y-axis
          const z = zFrontFace;                                 // Fixed on the front face

        // cube.userData.boundBox.set(x,y,z)
        
          // Animate the cube's position
          gsap.to(cube.position, {
            duration: 1,
            x: x,
            y: y,
            z: z,
            ease: "power2.inOut",
            onUpdate: () => {
              // Update bounding box after the position is updated

              boxes.forEach(box => {
                box.userData.boundBox.position.copy(box.position);
              })   
            }
          });
        });

        // Update currentX for the next cluster
        currentX += (cubesInCluster.length - 1) * boxSpacing + groupSpacing;
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
  
  // roteteCubes
  boxes.forEach(cube => {
    cube.rotation.set(0, - (Math.PI / 2), 0);
    cube.userData.boundBox.rotation.set(0, - (Math.PI / 2), 0);

  });


  const groupSpacing = 50;    // Spacing between groups
  const cloudSpread = 40;     // Spread of cubes within each group
  const minDistance = 30;     // Minimum distance between cubes to avoid overlap
  const maxAttempts = 50;     // Max retries to find a non-overlapping position   // Assuming the big cube has a size of 100 units

  // Group cubes by their `group` value
  const clusters = {};
  boxes.forEach(cube => {
    const cluster = cube.userData.group;
    if (!clusters[cluster]) clusters[cluster] = [];
    clusters[cluster].push(cube);
  });

  // Arrange groups in a grid layout
  const groupKeys = Object.keys(clusters);
  const numCols = Math.ceil(Math.sqrt(groupKeys.length));
  const numRows = Math.ceil(groupKeys.length / numCols);

  // Calculate total width and height of the grid to center the layout
  const totalWidth = (numCols - 1) * groupSpacing;
  const totalHeight = (numRows - 1) * groupSpacing;

  // Offsets to center the grid on the left face
  const centerZOffset = -totalWidth / 2;
  const centerYOffset = totalHeight / 2;
  const leftFaceX = -bigCubeSize / 2; // Position along the left face

  groupKeys.forEach((clusterKey, index) => {
    // Calculate grid position for each group (using z and y instead of x and y)
    const col = index % numCols;
    const row = Math.floor(index / numCols);
    const groupZ = centerZOffset + col * groupSpacing;   // Spread groups along the z-axis
    const groupY = centerYOffset - row * groupSpacing;   // Spread groups along the y-axis

    const cubesInCluster = clusters[clusterKey];

    // Position cubes within each group with collision avoidance
    const placedPositions = []; // Store placed positions to check for collisions

    cubesInCluster.forEach(cube => {
      let validPosition = false;
      let randomZ, randomY, randomX;
      let attempts = 0;

      while (!validPosition && attempts < maxAttempts) {
        randomZ = groupZ + (Math.random() - 0.5) * cloudSpread;  // Random spread along z-axis //(Math.random() - 0.5) 
        randomY = groupY + (Math.random() - 0.5) * cloudSpread;  // Random spread along y-axis
        randomX = leftFaceX;                                      // Align on the left face

        // Ensure cubes do not overlap within the group
        validPosition = placedPositions.every(pos => {
          const dx = pos.x - randomX;
          const dy = pos.y - randomY;
          const dz = pos.z - randomZ;
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          return distance >= minDistance;
        });

        attempts++;
      }



      gsap.to(cube.position, {
        duration: 1,            // Animation duration in seconds
        x: randomX,
        y: randomY,
        z: randomZ,
        ease: "power2.inOut", 
        onUpdate: () => {
          boxes.forEach(box => {
            box.userData.boundBox.position.copy(box.position);
          })   
        }  // Smooth easing function
      });

      // Save the new position to avoid overlaps
      placedPositions.push({ x: randomX, y: randomY, z: randomZ });
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









// function themesPos() {
//   setTimeout(() => {
//     // Rotate cubes to face the correct direction
//     let themesBoxes = boxes.filter(box => box.visible === true);

//     boxes.forEach(cube => {
//       cube.rotation.set(0, -Math.PI, 0);
//       cube.userData.boundBox.rotation.set(0, -(Math.PI / 2), 0);
//     });

//     const statusSpacing = 100;   // Spacing between status clusters
//     const boxSpread = 80;       // Spread of boxes within each cluster
//     const minDistance = 50;     // Minimum distance between boxes
//     const maxAttempts = 100;     // Max retries to avoid overlap

//     // Group cubes by status
//     const statusClusters = {};
//     themesBoxes.forEach(cube => {
//       const status = cube.userData.status || "default";
//       if (!statusClusters[status]) statusClusters[status] = [];
//       statusClusters[status].push(cube);
//     });

//     const statusKeys = Object.keys(statusClusters);
//     const numCols = Math.ceil(Math.sqrt(statusKeys.length));
//     const numRows = Math.ceil(statusKeys.length / numCols);

//     const totalWidth = (numCols - 1) * statusSpacing;
//     const totalHeight = (numRows - 1) * statusSpacing;
//     const centerXOffset = -totalWidth / 2;
//     const centerYOffset = totalHeight / 2;
//     const faceZ = -bigCubeSize / 2;

//     statusKeys.forEach((statusKey, index) => {
//       const colIndex = index % numCols;
//       const rowIndex = Math.floor(index / numCols);
//       const groupX = centerXOffset + colIndex * statusSpacing;
//       const groupY = centerYOffset - rowIndex * statusSpacing;

//       const cubesInStatus = statusClusters[statusKey];
//       const placedPositions = [];

//       cubesInStatus.forEach(cube => {
//         let validPosition = false;
//         let randomX, randomY, randomZ;
//         let attempts = 0;

//         while (!validPosition && attempts < maxAttempts) {
//           randomX = groupX + (1.2*(Math.random() - 0.9)) * boxSpread;
//           randomY = groupY + (1.2*(Math.random() - 0.9)) * boxSpread;
//           randomZ = faceZ;

//           validPosition = placedPositions.every(pos => {
//             const dx = pos.x - randomX;
//             const dy = pos.y - randomY;
//             const dz = pos.z - randomZ;
//             return Math.sqrt(dx * dx + dy * dy + dz * dz) >= minDistance;
//           });

//           attempts++;
//         }

//         // Animate box placement
//         gsap.to(cube.position, {
//           duration: 1,
//           x: randomX,
//           y: randomY,
//           z: randomZ,
//           ease: "power2.inOut",
//           onUpdate: () => cube.userData.boundBox.position.copy(cube.position)
//         });

//         placedPositions.push({ x: randomX, y: randomY, z: randomZ });
//       });
//     });
//   }, 500);
// }



function themesPos() {
  setTimeout(() => {
    // Rotate cubes to face the correct direction
    let themesBoxes = boxes.filter(box => box.visible === true);

    boxes.forEach(cube => {
      cube.rotation.set(0, -Math.PI, 0);
      cube.userData.boundBox.rotation.set(0, -Math.PI , 0);
    });

    // Base constants
    const baseStatusSpacing = 120;
    const baseBoxSpread = 60;
    const minDistance = 60;
    const maxAttempts = 100;
    const faceZ = -bigCubeSize / 2;

    // Group cubes by status
    const statusClusters = {};
    themesBoxes.forEach(cube => {
      const status = cube.userData.status || "default";
      if (!statusClusters[status]) statusClusters[status] = [];
      statusClusters[status].push(cube);
    });

    // Compute layout grid dimensions
    const statusKeys = Object.keys(statusClusters);
    const numCols = Math.ceil(Math.sqrt(statusKeys.length));
    const numRows = Math.ceil(statusKeys.length / numCols);

    // Compute total width and height for centering
    const clusterSizes = statusKeys.map(status => statusClusters[status].length);
    const maxClusterSize = Math.max(...clusterSizes);
    const statusSpacing = Math.max(baseStatusSpacing, maxClusterSize * 0.6); // *10

    const totalWidth = (numCols - 1) * statusSpacing;
    const totalHeight = (numRows - 1) * statusSpacing;
    const centerXOffset = -totalWidth / 2;
    const centerYOffset = totalHeight / 2;

    statusKeys.forEach((statusKey, index) => {
      const colIndex = index % numCols;
      const rowIndex = Math.floor(index / numCols);
      const groupX = centerXOffset + colIndex * statusSpacing;
      const groupY = centerYOffset - rowIndex * statusSpacing;

      const cubesInStatus = statusClusters[statusKey];
      const placedPositions = [];

      cubesInStatus.forEach(cube => {
        let validPosition = false;
        let randomX, randomY, randomZ;
        let attempts = 0;

        while (!validPosition && attempts < maxAttempts) {
          randomX = groupX + (Math.random() - 0.5) * baseBoxSpread;
          randomY = groupY + (Math.random() - 0.5) * baseBoxSpread;
          randomZ = faceZ;

          validPosition = placedPositions.every(pos => {
            const dx = pos.x - randomX;
            const dy = pos.y - randomY;
            const dz = pos.z - randomZ;
            return Math.sqrt(dx * dx + dy * dy + dz * dz) >= minDistance;
          });

          attempts++;
        }

        // Animate box placement
        gsap.to(cube.position, {
          duration: 1,
          x: randomX,
          y: randomY,
          z: randomZ,
          ease: "power2.inOut",
          onUpdate: () => {
            boxes.forEach(box => {
             box.userData.boundBox.position.copy(box.position);
            })   
          } //cube.userData.boundBox.position.copy(cube.position)
        });

        placedPositions.push({ x: randomX, y: randomY, z: randomZ });
      });
    });
  }, 500);
}







// function themesPos() {
//   setTimeout(() => {
//     // Rotate cubes to face the correct direction
//     boxes.forEach(cube => {
//       cube.rotation.set(0, -Math.PI, 0);
//       cube.userData.boundBox.rotation.set(0, -(Math.PI / 2), 0);
//     });

//     const statusSpacing = 100;  // Space between status clusters
//     const cubeSize = 10;        // Space between individual cubes in a cluster
//     const faceZ = -bigCubeSize / 2; // Fixed Z-position on the cube face

//     // Group cubes by status
//     const statusClusters = {};
//     boxes.forEach(cube => {
//       const status = cube.userData.status || "default";
//       if (!statusClusters[status]) statusClusters[status] = [];
//       statusClusters[status].push(cube);
//     });

//     const statusKeys = Object.keys(statusClusters);
//     const numCols = Math.ceil(Math.sqrt(statusKeys.length)); // Grid columns for status clusters
//     const numRows = Math.ceil(statusKeys.length / numCols);

//     const totalWidth = (numCols - 1) * statusSpacing;
//     const totalHeight = (numRows - 1) * statusSpacing;
//     const centerXOffset = -totalWidth / 2;
//     const centerYOffset = totalHeight / 2;

//     statusKeys.forEach((statusKey, index) => {
//       const colIndex = index % numCols;
//       const rowIndex = Math.floor(index / numCols);
//       const groupX = centerXOffset + colIndex * statusSpacing;
//       const groupY = centerYOffset - rowIndex * statusSpacing;

//       const cubesInStatus = statusClusters[statusKey];
//       const gridCols = Math.ceil(Math.sqrt(cubesInStatus.length)); // Grid columns for individual cubes
//       const gridRows = Math.ceil(cubesInStatus.length / gridCols);

//       cubesInStatus.forEach((cube, cubeIndex) => {
//         const cubeColIndex = cubeIndex % gridCols;
//         const cubeRowIndex = Math.floor(cubeIndex / gridCols);

//         const cubeX = groupX + cubeColIndex * cubeSize - (gridCols * cubeSize) / 2;
//         const cubeY = groupY - cubeRowIndex * cubeSize + (gridRows * cubeSize) / 2;
//         const cubeZ = faceZ;

//         // Animate cube to grid position
//         gsap.to(cube.position, {
//           duration: 1,
//           x: cubeX,
//           y: cubeY,
//           z: cubeZ,
//           ease: "power2.inOut",
//           onUpdate: () => cube.userData.boundBox.position.copy(cube.position)
//         });
//       });
//     });
//   }, 500);
// }










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


  // Example boxes
// Parent level 0






// const cA = createBox(null);  // Top-level box (Primordial Deities)
// scene.add(cA);



//ca
const cA = createBox(
  "cA",
  "",
  "0"
);









const chaos = createBox(
  "Chaos",
  "The primeval void from which everything in existence sprang. Represents the initial state of emptiness before creation.",
  "Immortal"
);

const gaia = createBox(
  "Gaia",
  "Personification of the Earth and the mother of all life. She gave birth to the Titans, giants, and other primordial beings.",
  "Immortal"
);

const uranus = createBox(
  "Uranus",
  "Personification of the sky and the heavens. Known for fathering the Titans with Gaia.",
  "Immortal"
);

const cronus = createBox(
  "Cronus",
  "The youngest of the Titans who overthrew his father Uranus. Known as the god of time and the harvest.",
  "Immortal"
);

const rhea = createBox(
  "Rhea",
  "Titaness of fertility, motherhood, and generation. Known as the mother of the Olympian gods.",
  "Immortal"
);

const nyx = createBox(
  "Nyx",
  "Primordial goddess of the night. Known for her power and mysterious nature.",
  "Immortal"
);

const erebus = createBox(
  "Erebus",
  "Primordial deity representing darkness and shadow. One of the first entities to emerge from Chaos.",
  "Immortal"
);

const tartarus = createBox(
  "Tartarus",
  "Primordial deity and the deep abyss used as a dungeon for the Titans and a place of punishment.",
  "Immortal"
);

const pontus = createBox(
  "Pontus",
  "Primordial god of the sea. Represents the seas before Poseidon.",
  "Immortal"
);

const zeus = createBox(
  "Zeus", 
  "King of the gods, ruler of Mount Olympus, and god of the sky, weather, law, and order. Known for his thunderbolt and numerous affairs with mortals and goddesses.", 
  "Immortal"
);

const hera = createBox(
  "Hera", 
  "Queen of the gods and goddess of marriage, women, childbirth, and family. Known for her jealousy and protection of married women.", 
  "Immortal"
);

const poseidon = createBox(
  "Poseidon", 
  "God of the sea, earthquakes, storms, and horses. Known for his volatile temperament and rivalry with other gods.", 
  "Immortal"
);

const hades = createBox(
  "Hades", 
  "God of the underworld and the dead. Rules over the souls of the departed and guards the treasures of the earth.", 
  "Immortal"
);

const athena = createBox(
  "Athena", 
  "Goddess of wisdom, war, strategy, and crafts. Known for her intelligence, fairness, and role as a protector of cities.", 
  "Immortal"
);

const aphrodite = createBox(
  "Aphrodite", 
  "Goddess of love, beauty, pleasure, and desire. Born from the sea foam and known for her irresistible charm.", 
  "Immortal"
);

const heracles = createBox(
  "Heracles", 
  "Demigod hero known for his extraordinary strength and courage. Famous for completing the Twelve Labors.", 
  "Demigod"
);

// const achilles = createBox(
//   "Achilles", 
//   "Greek hero of the Trojan War, renowned for his strength, bravery, and near invincibility, except for his heel.", 
//   "Mortal"
// );

const odysseus = createBox(
  "Odysseus", 
  "King of Ithaca, famed for his cunning intellect and resourcefulness. Hero of the Odyssey and the Trojan War.", 
  "Mortal"
);

const nereus = createBox(
  "Nereus",
  "Primordial sea god known as the 'Old Man of the Sea.' Renowned for his truthfulness and gift of prophecy.",
  "Immortal"
);

const circe = createBox(
  "Circe",
  "Enchantress and sorceress, known for her ability to transform men into animals. Encountered by Odysseus during his travels.",
  "Mortal"
);

const apollo = createBox(
  "Apollo",
  "God of the sun, music, poetry, prophecy, and healing. Known for his beauty and wisdom.",
  "Immortal"
);

const ares = createBox(
  "Ares",
  "God of war and violence. Known for his bloodlust and quick temper.",
  "Immortal"
);


//news

const typhon = createBox(
  "Typhon",
  "A monstrous giant and one of the deadliest creatures in Greek mythology. Known as the father of many fearsome monsters.",
  "Giant"
);

const echidna = createBox(
  "Echidna",
  "Half-woman, half-snake creature known as the 'Mother of Monsters.' She bore many of the most terrifying creatures in Greek mythology.",
  "Giant"
);


const hydra = createBox(
  "Hydra",
  "Serpent-like water monster with multiple heads; when one is cut off, two grow in its place. Defeated by Heracles.",
  "Beast"
);

const chimera = createBox(
  "Chimera",
  "Fire-breathing creature with the body of a lion, a goat's head protruding from its back, and a serpent as a tail.",
  "Beast"
);

const hecate = createBox(
  "Hecate",
  "Goddess of magic, witchcraft, ghosts, and necromancy. Often depicted holding two torches and associated with crossroads.",
  "Immortal"
);

// const selene = createBox(
//   "Selene",
//   "Goddess of the Moon, often depicted driving a chariot across the night sky.",
//   "Immortal"
// );

const eos = createBox(
  "Eos",
  "Goddess of the dawn who opens the gates of heaven each morning for the sun to rise.",
  "Immortal"
);

// const hyperion = createBox(
//   "Hyperion",
//   "One of the twelve Titans and personification of heavenly light. Father of Helios, Selene, and Eos.",
//   "Immortal"
// );

const helios = createBox(
  "Helios",
  "Titan god of the Sun, who drives his chariot across the sky each day.",
  "Immortal"
);

const nemesis = createBox(
  "Nemesis",
  "Goddess of retribution and revenge, punishing those who succumb to hubris and arrogance.",
  "Immortal"
);

//new helper
const narcissus = createBox(
  "narcissus",
  "",
  "helperElement"
);







// helpers



// const alcmene = createBox(
//   "alcmene",
//   "",
//   "helperElement"
// );

// const peleus = createBox(
//   "peleus",
//   "",
//   "helperElement"
// );

// const thetis = createBox(
//   "thetis",
//   "",
//   "helperElement"
// );

// const laertes = createBox(
//   "laertes",
//   "",
//   "helperElement"
// );

// const anticleia = createBox(
//   "anticleia",
//   "",
//   "helperElement"
// );

// const helios = createBox(
//   "helios",
//   "",
//   "helperElement"
// );

// const leto = createBox(
//   "leto",
//   "",
//   "helperElement"
// );






const hector = createBox(
  "hector",
  "",
  "helperElement"
);


const eurystheus = createBox(
  "eurystheus",
  "",
  "helperElement"
);

const patroclus = createBox(
  "patroclus",
  "",
  "helperElement"
);

const agamemnon = createBox(
  "agamemnon",
  "",
  "helperElement"
);
const cerberus = createBox(
  "cerberus",
  "",
  "helperElement"
);

const pygmalion = createBox(
  "pygmalion",
  "",
  "helperElement"
);

const arachne = createBox(
  "arachne",
  "",
  "helperElement"
);

const orpheus = createBox(
  "orpheus",
  "",
  "helperElement"
);

const persephone = createBox(
  "persephone",
  "",
  "helperElement"
);

const paris = createBox(
  "paris",
  "",
  "helperElement"
);

const daphne = createBox(
  "daphne",
  "",
  "helperElement"
);

const asclepius = createBox(
  "asclepius",
  "",
  "helperElement"
);



enhanceBox(cA, [null],[[]])


enhanceBox(chaos, [cA], [
  [gaia, "Brought forth Gaia, who personifies the Earth and gives structure to the cosmos."],
  [nyx, "Generated Nyx, the goddess of night, who embodies the darkness of the void."]
]);

enhanceBox(gaia, [chaos], [
  [uranus, "Worked with Uranus to create the first generations of Titans and orchestrated his downfall when he imprisoned their children."],
  [tartarus, "Conspired with Tartarus to imprison the giants and other rebellious beings."]
]);

enhanceBox(uranus, [gaia], [
  [cronus, "Was overthrown and castrated by his son Cronus, fulfilling a prophecy foretold by Gaia."]
]);

enhanceBox(cronus, [uranus, gaia], [
  [zeus, "Was defeated by Zeus in the Titanomachy, the great war between the Titans and the Olympian gods."],
  [rhea, "Tricked by Rhea into swallowing a stone instead of Zeus, which led to his eventual downfall."]
]);

enhanceBox(rhea, [uranus, gaia], [
  [zeus, "Saved Zeus from being swallowed by Cronus by hiding him on Crete and later helped him overthrow Cronus."]
]);

enhanceBox(nyx, [chaos], [
  [erebus, "Together with Erebus, she gave birth to many deities representing cosmic forces, such as Hypnos and Thanatos."],
  [zeus, "Even Zeus, the king of the gods, feared her immense power and mystery."]
]);

enhanceBox(erebus, [chaos], [
  [nyx, "Partnered with Nyx to produce deities of sleep, death, and other abstract forces."]
]);

enhanceBox(tartarus, [chaos], [
  [zeus, "Provided a prison for Zeus to imprison the defeated Titans after the Titanomachy."]
]);

enhanceBox(pontus, [gaia], [
  [nereus, "Fathered Nereus, the wise 'Old Man of the Sea,' known for his truthfulness and prophetic abilities."]
]);

enhanceBox(zeus, [cronus, rhea], [
  [hera, "Married to Hera, but their relationship was marked by conflict due to his many affairs."],
  [cronus, "Led the Olympians in the Titanomachy to overthrow Cronus and the Titans."],
  [tartarus, "Imprisoned the Titans in Tartarus after his victory."]
]);

enhanceBox(hera, [cronus, rhea], [
  [zeus, "Wife of Zeus, frequently punishes his lovers and their offspring out of jealousy."],
  [heracles, "Tormented Heracles throughout his life because he was a son of Zeus and a mortal woman."],
  [paris, "Instigated the Trojan War by seeking revenge on Paris for not naming her the fairest goddess."]
]);

enhanceBox(poseidon, [cronus, rhea], [
  [athena, "Competed with Athena for the patronage of Athens, losing when she offered the olive tree."],
  [odysseus, "Punished Odysseus by making his journey home arduous after the hero blinded his son, the Cyclops Polyphemus."],
  [apollo, "Worked with Apollo to build the walls of Troy, later seeking revenge when they were not paid for their labor."]
]);

enhanceBox(hades, [cronus, rhea], [
  [persephone, "Abducted Persephone to be his queen, leading to the creation of the seasons."],
  [heracles, "Allowed Heracles to borrow his watchdog Cerberus as part of the hero's Twelve Labors."],
  [orpheus, "Made a rare concession by allowing Orpheus to try to rescue his wife Eurydice from the underworld."]
]);

enhanceBox(athena, [zeus], [
  [poseidon, "Defeated Poseidon in a contest to become the patron of Athens by offering the olive tree."],
  [odysseus, "Guided and protected Odysseus during his long journey home from the Trojan War."],
  [arachne, "Turned the mortal Arachne into a spider for her hubris in a weaving contest."]
]);

enhanceBox(aphrodite, [zeus], [
  [ares, "Had a long-standing affair with Ares, the god of war, despite being married to Hephaestus."],
  [paris, "Influenced Paris to choose her as the fairest goddess by promising him Helen, leading to the Trojan War."],
  [pygmalion, "Brought the statue crafted by Pygmalion to life as the woman Galatea."]
]);

enhanceBox(heracles, [zeus], [
  [hera, "Suffered relentless persecution from Hera, who sought to destroy him."],
  [cerberus, "Captured Cerberus, the three-headed guard dog of the underworld, as one of his Twelve Labors."],
  [eurystheus, "Served King Eurystheus, who assigned him the Twelve Labors as penance."]
]);

// enhanceBox(achilles, [nereus], [
//   [patroclus, "Fought alongside his close companion Patroclus, whose death spurred his rage."],
//   [hector, "Killed Hector in revenge for Patroclus's death and desecrated his body."],
//   [agamemnon, "Quarreled with Agamemnon over the prize Briseis, leading to his temporary withdrawal from battle."]
// ]);

enhanceBox(odysseus, [zeus], [
  [poseidon, "Angered Poseidon by blinding his son Polyphemus, causing a long and arduous journey home."],
  [athena, "Protected and guided by Athena, who admired his cleverness."],
  [circe, "Spent a year with the enchantress Circe, who initially turned his men into swine."]
]);

enhanceBox(nereus, [pontus, gaia], [
  [heracles, "Assisted Heracles by revealing the location of the golden apples of the Hesperides."]
]);

enhanceBox(circe, [zeus], [
  [odysseus, "Turned Odysseus's men into swine, though later helped them on their journey."]
]);

enhanceBox(apollo, [zeus], [
  [daphne, "Chased after the nymph Daphne, who transformed into a laurel tree to escape him."],
  [asclepius, "Fathered Asclepius, the god of medicine, who could even raise the dead."]
]);
enhanceBox(ares, [zeus, hera], [
  [aphrodite, "Had an affair with Aphrodite, despite her marriage to Hephaestus."]
]);


// helpers
// enhanceBox(alcmene, [null],[[]]);
// enhanceBox(peleus, [null],[[]]);
// enhanceBox(thetis, [null],[[]]);
// enhanceBox(laertes, [null],[[]]);
// enhanceBox(anticleia, [null],[[]]);
// enhanceBox(helios, [null],[[]]);
// enhanceBox(leto, [null],[[]]);

enhanceBox(paris, [null],[[]]);
enhanceBox(persephone, [null],[[]]);
enhanceBox(orpheus, [null],[[]]);
enhanceBox(arachne, [null],[[]]);
enhanceBox(pygmalion, [null],[[]]);
enhanceBox(cerberus, [null],[[]]);
enhanceBox(eurystheus, [null],[[]]);
enhanceBox(patroclus, [null],[[]]);
enhanceBox(hector, [null],[[]]);
enhanceBox(agamemnon, [null],[[]]);
enhanceBox(daphne, [null],[[]]);
enhanceBox(asclepius, [null],[[]]);

//new helpers
enhanceBox(narcissus, [null],[[]]);
enhanceBox(hydra, [null],[[]]);
enhanceBox(helios, [null],[[]]);
enhanceBox(eos, [null],[[]]);
// enhanceBox(hyperion, [null],[[]]);
enhanceBox(chimera, [null],[[]]);


//news

// Enhanced Relationships
enhanceBox(typhon, [gaia], [
  [echidna, "Partnered with Echidna to sire many fearsome monsters, including Cerberus and the Chimera."],
  [zeus, "Fought Zeus in a fierce battle for control of the cosmos, ultimately defeated and trapped beneath Mount Etna."]
]);

enhanceBox(echidna, [typhon], [
  [cerberus, "Mothered Cerberus, the multi-headed guardian of the underworld."],
  [chimera, "Gave birth to Chimera, a terrifying hybrid creature."]
]);

enhanceBox(hecate, [zeus], [
  //[selene, "Often collaborated with Selene during rituals under the moon."],
  [persephone, "Assisted Persephone during her time in the underworld."]
]);

// enhanceBox(selene, [hyperion], [
//   [helios, "Sibling relationship with Helios, balancing the celestial cycle of day and night."],
//   [eos, "Collaborates with Eos to maintain the transition between night and dawn."]
// ]);

enhanceBox(nemesis, [zeus], [
  [ares, "Worked alongside Ares to punish hubris and enforce divine justice."],
  [narcissus, "Punished Narcissus for his vanity by causing him to fall in love with his reflection."]
]);








//console.log(paris)
//let notstructureBoxes = boxes.filter(box => (box.userData.children.length < 0 && box.userData.parents.length < 0))



// enhanceBox(paris, [chaos],[[]]);
// enhanceBox(persephone, [chaos],[[]]);
// enhanceBox(orpheus, [chaos],[[]]);
// enhanceBox(arachne, [chaos],[[]]);
// enhanceBox(pygmalion, [chaos],[[]]);
// enhanceBox(cerberus, [chaos],[[]]);
// enhanceBox(eurystheus, [chaos],[[]]);
// enhanceBox(patroclus, [chaos],[[]]);
// enhanceBox(hector, [chaos],[[]]);
// enhanceBox(agamemnon, [chaos],[[]]);
// enhanceBox(daphne, [chaos],[[]]);
// enhanceBox(asclepius, [chaos],[[]]);



// // for (let i = 0; i < 20; i++) {
// //   createBox(zE, child0110, white);
// // }

setTimeout(() => {
  
  structurePos();
  changeMode();

}, 1000)

});
