import * as THREE from 'three';
// import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import SpriteText from 'three-spritetext';
import gsap from 'gsap';

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true,});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

let markers = [];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );
const controls = new OrbitControls( camera, renderer.domElement );
controls.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE
};
const axesHelper = new THREE.AxesHelper( 1.5 );
scene.add( axesHelper )
// const controls = new FirstPersonControls( camera, renderer.domElement );

function updateAxesHelperPosition() {
    axesHelper.position.copy(controls.target);
}

function updateCoordinatesDisplay() {
    const coordinatesDiv = document.getElementById('coordinates');
    const { x, y, z } = controls.target;
    //y and z are swapped from game coordinates
    coordinatesDiv.innerHTML = `X: ${(x * 1000).toFixed(2)}, Y: ${(z * 1000).toFixed(2)}, Z: ${(y * 1000).toFixed(2)}`;
}

function animate() {
    // requestAnimationFrame( animate );
    controls.update();
    updateAxesHelperPosition();
	renderer.render( scene, camera );
}

// Import locations data
import data from './data.json';
import { update } from 'three/examples/jsm/libs/tween.module.js';

const colors = {
    "orange": 0xff7f00,
    "green": 0x00ff00,
    "blue": 0x0000ff,
    "yellow": 0xffff00,
    "magenta": 0xff00ff,
    "cyan": 0x00ffff,
    "red": 0xff0000,
    "white": 0xffffff,
    "black": 0x000000,
    "gray": 0x808080,
    "iron": 0x4AA0DC,
    "copper": 0x884D40,
    "gold": 0xE7C933,
    "silver": 0xc0c0c0,
    "quartz": 0x4bd28b,
};

scene.background = new THREE.Color(0x101010);

const light = new THREE.DirectionalLight( colors.white, 4 );
    light.position.set( 450, 300, -100 ).normalize();
    scene.add( light );

const light2 = new THREE.DirectionalLight( colors.white, 1 );
light2.position.set( -2000, -100, -2000 ).normalize();
scene.add( light2 );

const light3 = new THREE.DirectionalLight( colors.white, 1 );
light2.position.set( -200, 0, 150 ).normalize();
scene.add( light2 );

function loadLocations() {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const sphere = new THREE.SphereGeometry(2, 8, 8);
    const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const torus = new THREE.TorusGeometry(1, 0.4, 16, 100);
    const capsule = new THREE.CapsuleGeometry(1, 1, 32, 32);

    const cloudTexture = new THREE.TextureLoader().load('textures/toxiccloud.png', (texture) => {
        texture.name = "cloudTexture";
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set( 2, 2 );
    });

    const grey128Texture = new THREE.TextureLoader().load('textures/128grey.jpg', (texture) => {
        texture.name = "greyTransparentTexture";
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    });

    // Create objects for each location
    const locationList = document.getElementById('locationslist');
    data.locations.forEach((location, index) => {
        var material = new THREE.MeshLambertMaterial({ color: colors[location.color] });
        if(location.type == "Cloud") {
            material = new THREE.MeshBasicMaterial({color: colors[location.color], transparent: true, opacity: 0.5, map: cloudTexture, alphaMap: cloudTexture, alphaTest: 0.1, side: THREE.DoubleSide});
            material.needsUpdate = true;
        }

        let obj;
        if(location.shape === "sphere") {
            obj = new THREE.Mesh(sphere, material);
            if(location.type == "Dome") {
                const wireframe = new THREE.EdgesGeometry(sphere);
                const linemat = new THREE.LineBasicMaterial({color: colors[location.color]});
                const line = new THREE.LineSegments(wireframe, linemat);
                obj.add(line);
            }
        } else if(location.shape === "cylinder") {
            obj = new THREE.Mesh(cylinder, material);
        } else if(location.shape === "torus") {
            obj = new THREE.Mesh(torus, material);
        } else if(location.shape === "capsule") {
            obj = new THREE.Mesh(capsule, material);
        } else {
            obj = new THREE.Mesh(box, material);
        }

        if (location.type === "Cloud") {
            obj.renderOrder = 1;
        }

        if(location.rotate != undefined) {
            if(location.rotate.x) {
                obj.rotation.x = Math.PI/location.rotate.x;
            }
            if(location.rotate.y) {
                obj.rotation.y = Math.PI/location.rotate.y;
            }
            if(location.rotate.z) {
                obj.rotation.z = Math.PI/location.rotate.z;
            }
        }

        if(location.scale != undefined) {
            // var geo = obj.geometry.clone();
            // geo.scale.matrix.makeScale(location.scale.x, location.scale.y, location.scale.z);
            // obj.geometry = geo;
            obj.scale.set(location.scale.x, location.scale.y, location.scale.z);
        }

        obj.position.set(location.x/1000, location.z/1000, location.y/1000); //y and z are swapped from game coordinates
        // scene.add(obj);
        location.object = obj;

        // if(location.type === "cloud") {
        //     obj.shape.matrix.makeScale(new THREE.Vector3(100, 100, 100));
        // }
        
        // Add location to list
        const li = document.createElement('li');
        li.innerHTML = `<a>${location.name}</a>`;
        li.addEventListener('click', () => {
            locationListItemClick(location);
        });
        const btn = document.createElement('img');
        btn.classList.add('eye');
        btn.src = "images/eye.png";
        li.appendChild(btn);
        locationList.appendChild(li);

        // Add text to location
        const text = makeTextSprite(location.name, { fontsize: 32, textColor: { r:255, g:255, b:255, a:1.0 } });
        var verticalOffset = 2;
        if(location.type == "Dome") {
            verticalOffset = 3;
        }
        text.position.set((location.x/1000), (location.z/1000) + verticalOffset, (location.y/1000));
        if(location.scale != undefined) {
            var bbox = new THREE.Box3().setFromObject(obj);
            text.position.set((location.x/1000), bbox.max.y + verticalOffset, (location.y/1000));
        }
        // scene.add(text);
        const group = new THREE.Group();
        group.name = location.name;
        location.group = group;
        group.add(obj);
        group.add(text);
        scene.add(group);

        if(location.children != undefined) {
            location.children.forEach((child) => {
                var material = new THREE.MeshLambertMaterial({ color: colors[child.color] });
                if(child.transparent) {
                    material = new THREE.MeshBasicMaterial({color: colors[child.color], transparent: true, opacity: 0.5, map: grey128Texture, alphaMap: grey128Texture, alphaTest: 0.1, side: THREE.DoubleSide});
                    material.needsUpdate = true;
                }
                var geo = box;
                if(child.shape === "sphere") {
                    geo = sphere;
                } else if(child.shape === "cylinder") {
                    geo = cylinder;
                } else if(child.shape === "torus") {
                    geo = torus;
                } else if(child.shape === "capsule") {
                    geo = capsule;
                }
                var childObj = new THREE.Mesh(geo, material);
                childObj.position.set(child.x/1000, child.z/1000, child.y/1000); //y and z are swapped from game coordinates
                if(child.scale != undefined) {
                    childObj.scale.set(child.scale.x, child.scale.y, child.scale.z);
                }
                if(child.rotate != undefined) {
                    if(child.rotate.x) {
                        childObj.rotation.x = Math.PI/child.rotate.x;
                    }
                    if(child.rotate.y) {
                        childObj.rotation.y = Math.PI/child.rotate.y;
                    }
                    if(child.rotate.z) {
                        childObj.rotation.z = Math.PI/child.rotate.z;
                    }
                }
                if(child.transparent) {
                    childObj.renderOrder = 1;
                }
                group.add(childObj);
            });
        }

        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            toggleGroupVisibility(group);
            btn.classList.toggle('eyeinverted');
        });
        
    });
}

loadLocations();

function loadDeposits() {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const depositList = document.getElementById('depositslist');        

    Object.keys(data.deposits).forEach((dcategory, cindex) => {
        data.deposits[dcategory].forEach((deposit, index) => {
            // const obj = gltf.scene.clone();
            const obj = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: colors[dcategory] }));
            obj.position.set(deposit.x/1000, deposit.z/1000, deposit.y/1000); //y and z are swapped from game coordinates
            // obj.scale.set(20,20,20);

            // Apply tint to obj
            const tintColor = new THREE.Color(colors[dcategory]); // Red tint
            obj.traverse((child) => {
                if (child.isMesh) {
                    var mat = child.material.clone();
                    mat.color.set(tintColor);
                    child.material = mat;
                }
            });

            // scene.add( obj );
            var text = makeTextSprite(ucfirst(dcategory) + " Deposit", { fontsize: 24, textColor: { r:125, g:125, b:125, a:0.8 } });
            text.position.set((obj.position.x), (obj.position.y) + 2, (obj.position.z));
            text.parent = obj;
            // scene.add(text);
            
            const group = new THREE.Group();
            group.name = deposit.id;
            group.add(obj);
            group.add(text);
            scene.add(group);
            deposit.object = group;

        });
        const li = document.createElement('li');
        li.innerHTML = `<a>${ucfirst(dcategory)} (${data.deposits[dcategory].length})</a>`;
        li.addEventListener('click', () => {
            var idx = 0;
            if(li.dataset.idx != undefined) {
                idx = parseInt(li.dataset.idx);
            }
            depositListItemClick(data.deposits[dcategory][idx]);
            idx+=1;
            if(idx >= data.deposits[dcategory].length) {
                idx = 0;
            }
            li.dataset.idx = idx;
        });

        const btn = document.createElement('img');
        btn.classList.add('eye');
        btn.src = "images/eye.png";
        li.appendChild(btn);

        btn.addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();
            data.deposits[dcategory].forEach((deposit) => {
                toggleGroupVisibility(deposit.object);
            });
            btn.classList.toggle('eyeinverted');
        });
        depositList.appendChild(li);
    });
}

loadDeposits();

if(document.location.hash) {
    const q = new URLSearchParams(document.location.hash.slice(2));
    //wrap each q.get in parseFloat() to convert string to number
    
    camera.position.set(parseFloat(q.get('px')), parseFloat(q.get('py')), parseFloat(q.get('pz')));
    camera.rotation.set(parseFloat(q.get('rx')), parseFloat(q.get('ry')), parseFloat(q.get('rz')));
    controls.target.set(parseFloat(q.get('tx')), parseFloat(q.get('ty')), parseFloat(q.get('tz')));
    camera.lookAt(controls.target);
} else {
    controls.target.set(data.locations[0].object.position.x, data.locations[0].object.position.y, data.locations[0].object.position.z);
    camera.position.set(-268.46001541128123, 89.91119916230053, 8.49005248328114);
}

controls.update();
updateCoordinatesDisplay();


window.camera = camera;
window.controls = controls;
window.scene = scene;

loadMarkers();

controls.addEventListener('change', debounce(() => onCameraMove(), 250));
document.getElementById('locationTitle').addEventListener('click', () => {
    toggleHTMLVisibility(document.getElementById('locationslist'));
    document.querySelector('#locationTitle > .expander').style.transform = document.getElementById('locationslist').style.display != "none" ? "rotate(0deg)" : "rotate(180deg)";
});
document.getElementById('depositsTitle').addEventListener('click', () => {
    toggleHTMLVisibility(document.getElementById('depositslist'));
    document.querySelector('#depositsTitle > .expander').style.transform = document.getElementById('depositslist').style.display != "none" ? "rotate(0deg)" : "rotate(180deg)";
});
document.getElementById('customMarkersTitle').addEventListener('click', () => {
    toggleHTMLVisibility(document.getElementById('customMarkers'));
    document.querySelector('#customMarkersTitle > .expander').style.transform = document.getElementById('customMarkers').style.display != "none" ? "rotate(0deg)" : "rotate(180deg)";
});
document.getElementById('coordinates').addEventListener('click', () => {
    updateCoordinatesDisplay();
    //copy to clipboard?
});


function onCameraMove() {
    updateQueryString(camera, controls);
    updateCoordinatesDisplay();
}

window.addEventListener( 'resize', onWindowResize );
function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function makeTextSprite( message, parameters )
    {
        if ( parameters === undefined ) parameters = {};
        var fontface = parameters.hasOwnProperty("fontface") ? parameters["fontface"] : "Arial";
        var fontsize = parameters.hasOwnProperty("fontsize") ? parameters["fontsize"] : 18;
        var borderThickness = parameters.hasOwnProperty("borderThickness") ? parameters["borderThickness"] : 4;
        var borderColor = parameters.hasOwnProperty("borderColor") ?parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?parameters["backgroundColor"] : { r:0, g:0, b:255, a:1.0 };
        var textColor = parameters.hasOwnProperty("textColor") ?parameters["textColor"] : { r:0, g:0, b:0, a:1.0 };

        var sprite = new SpriteText(message,1);
        sprite.color = "#"+ new THREE.Color(textColor.r, textColor.g, textColor.b).getHexString();
        sprite.fontFace = fontface;
        sprite.transparent = true;
        sprite.backgroundColor = "rgba(220,220,220,0)";
        // sprite.color.setRGB( textColor.r, textColor.g, textColor.b );
        sprite.backgroundColor = false;
        // sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
        return sprite;  
}


const qparams = new URLSearchParams(window.location.search);
function updateQueryString(camera, controls) {
    qparams.set('px', Math.floor(camera.position.x));
    qparams.set('py', Math.floor(camera.position.y));
    qparams.set('pz', Math.floor(camera.position.z));

    qparams.set('rx', camera.rotation.x);
    qparams.set('ry', camera.rotation.y);
    qparams.set('rz', camera.rotation.z);

    qparams.set('tx', Math.floor(controls.target.x));
    qparams.set('ty', Math.floor(controls.target.y));
    qparams.set('tz', Math.floor(controls.target.z));

    window.history.replaceState({}, '', `${window.location.pathname}#\!${qparams.toString()}`);
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
        }
    };
}

function debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

function locationListItemClick(location) {
    var diff = getVectorDifference(camera.position, controls.target);
    controls.enabled = false;
    var ease = "sine.inOut";
    var objPosition = location.object.position;
    if(location.object.type == "Group") {
        objPosition = location.object.children[0].position;
    }
    gsap.to( camera.position, 
        { 
            x: objPosition.x + diff.x, 
            y: objPosition.y + diff.y,
            z: objPosition.z + diff.z,
            ease: ease,
            onUpdate: () => {
                camera.lookAt(objPosition);
            },
            onComplete: () => {

            }
        }
    );
    gsap.to( controls.target,
        {
            x: objPosition.x,
            y: objPosition.y,
            z: objPosition.z,
            ease: ease,
            onComplete: () => {
                controls.enabled = true;
            }
        }
    );
}

function depositListItemClick(deposit) {
    var diff = getVectorDifference(camera.position, controls.target);
    controls.enabled = false;
    var ease = "sine.inOut";
    gsap.to( camera.position, 
        { 
            x: deposit.object.children[0].position.x + diff.x, 
            y: deposit.object.children[0].position.y + diff.y,
            z: deposit.object.children[0].position.z + diff.z,
            ease: ease,
            onUpdate: () => {
                camera.lookAt(deposit.object.children[0].position);
            },
            onComplete: () => {

            }
        }
    );
    gsap.to( controls.target,
        {
            x: deposit.object.children[0].position.x,
            y: deposit.object.children[0].position.y,
            z: deposit.object.children[0].position.z,
            ease: ease,
            onComplete: () => {
                controls.enabled = true;
            }
        }
    );
}

function getVectorDifference(vector1, vector2) {
    return {
        x: vector1.x - vector2.x,
        y: vector1.y - vector2.y,
        z: vector1.z - vector2.z
    };
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function toggleHTMLVisibility(element) {
    if (element.style.display === "none") {
        element.style.display = "block";
    } else {
        element.style.display = "none";
    }
}

function toggleGroupVisibility(group) {
    group.visible = !group.visible;
}

function exportMarkers() {
    const markerData = localStorage.getItem('markers');
    document.getElementById('markerData').value = markerData;
}

function importMarkers() {
    const markerData = document.getElementById('markerData').value;
    try {
        var imported = JSON.parse(markerData);
        markers.push(...imported);
        // Add code to update the map with the new markers
        console.log('Markers imported:', markers);
        drawMarkers();
        saveMarkers();
    } catch (e) {
        alert('Invalid marker data');
    }
}

function saveMarkers() {
    var toStore = markers.map((marker) => {
        return {
            id: marker.id,
            x: marker.x,
            y: marker.y,
            z: marker.z,
            label: marker.label,
            color: marker.color
        };
    });
    localStorage.setItem('markers', JSON.stringify(toStore));
}

function loadMarkers() {
    const markerData = localStorage.getItem('markers');
    if(markerData) {
        try {
            markers = JSON.parse(markerData);
            drawMarkers();
        } catch (e) {
            console.error('Error loading markers:', e);
        }
    }
}

document.getElementById('importMarkers').addEventListener('click', () => {
    importMarkers();
});

document.getElementById('exportMarkers').addEventListener('click', () => {
    exportMarkers();
});

document.getElementById('addMarkerButton').addEventListener('click', () => {
    //round to 2 digits
    const x = Math.round(controls.target.x * 100) / 100;
    const y = Math.round(controls.target.y * 100) / 100;
    const z = Math.round(controls.target.z * 100) / 100;
    document.getElementById('createMarkerX').value = x;
    document.getElementById('createMarkerY').value = y;
    document.getElementById('createMarkerZ').value = z;

    document.getElementById('createMarkerPopup').style.display = "block";
});

document.getElementById('createMarkerButton').addEventListener('click', () => {
    const x = parseFloat(document.getElementById('createMarkerX').value);
    const y = parseFloat(document.getElementById('createMarkerY').value);
    const z = parseFloat(document.getElementById('createMarkerZ').value);
    const label = document.getElementById('createMarkerName').value;
    const color = document.getElementById('createMarkerColor').value;
    document.getElementById('createMarkerPopup').style.display = "none";
    addMarker(x, y, z, label, color);
});

// Example function to add a marker (to be expanded as needed)
function addMarker(x, y, z, label, color) {
    var id = Math.random().toString(36).substr(2, 9);
    markers.push({ id, x, y, z, label, color });
    drawMarkers();
    saveMarkers();
}

function drawMarkers() {
    const grey128Texture = new THREE.TextureLoader().load('textures/128grey.jpg', (texture) => {
        texture.name = "greyTransparentTexture";
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
    });
    const extrudeSettings = {
        steps: 2,
        depth: 0.01,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.1,
        bevelOffset: 0,
        bevelSegments: 1
    };
    markers.forEach(marker => {
        // Add code to visually place the marker on the map
        if(marker.object == undefined) {
            var shape = new THREE.Shape();
            shape.moveTo(-1, -0.5);
            shape.bezierCurveTo(-1.75, -0.5, -1.75, 0.5, -1, 0.5);
            // shape.lineTo(-1, 0.5);
            shape.lineTo(0,0);
            shape.lineTo(-1,-0.5);

            const geo = new THREE.ExtrudeGeometry(shape,extrudeSettings);
            geo.rotateZ((Math.PI/2)*3);
            var color = colors.red;
            if(marker.color != undefined) {
                color = (new THREE.Color(marker.color))
            }
            // const obj = new THREE.Sprite(new THREE.SpriteMaterial({map: grey128Texture}));
            // obj.geometry=new THREE.ShapeGeometry(shape);
            // obj.geometry.rotateZ((Math.PI/2)*3);
            
            const obj = new THREE.Mesh(geo,new THREE.MeshLambertMaterial({color: color}));
            obj.scale.set(0.5,0.5,0.5);

            obj.position.set(marker.x, marker.y, marker.z); //y and z are swapped from game coordinates

            // obj.scale.set(20,20,20);
            //add text to marker
            const text = makeTextSprite(marker.label, { fontsize: 24, textColor: { r:200, g:200, b:125, a:0.8 } });
            text.position.set((obj.position.x), (obj.position.y) + 1.5, (obj.position.z));
            var group = new THREE.Group();
            group.name = marker.label;
            group.add(obj);
            group.add(text);
            marker.object = group;
            scene.add( group );
        }
        if(document.getElementById('marker-' + marker.id) == null) {
            const li = document.createElement('li');
            li.id = 'marker-' + marker.id;
            li.innerHTML = `<a>${marker.label}</a>`;
            li.addEventListener('click', () => {
                locationListItemClick(marker);
            });

            const btn = document.createElement('img');
            btn.classList.add('eye');
            btn.src = "images/eye.png";
            li.appendChild(btn);
            document.getElementById('customMarkersList').appendChild(li);
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                toggleGroupVisibility(marker.object);
                btn.classList.toggle('eyeinverted');
            });
        }
    });
}