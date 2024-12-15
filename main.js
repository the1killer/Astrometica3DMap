import * as THREE from 'three';
// import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import gsap from 'gsap';

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true,});
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

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
    requestAnimationFrame( animate );
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
    "gray": 0x808080
};

scene.background = new THREE.Color(0x101010);

const light = new THREE.DirectionalLight( colors.white, 4 );
    light.position.set( 450, 300, -100 ).normalize();
    scene.add( light );

const light2 = new THREE.DirectionalLight( colors.white, 0.2 );
light2.position.set( -1000, -100, -1000 ).normalize();
scene.add( light2 );

const box = new THREE.BoxGeometry(1, 1, 1);
const sphere = new THREE.SphereGeometry(1, 32, 32);
const cylinder = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
const torus = new THREE.TorusGeometry(1, 0.4, 16, 100);
const capsule = new THREE.CapsuleGeometry(1, 1, 32, 32);
// Create objects for each location
const locationList = document.getElementById('locationslist');
data.locations.forEach((location, index) => {
    const material = new THREE.MeshLambertMaterial({ color: colors[location.color] });
    if(location.type == "cloud") {
        material.transparent = true;
        material.opacity = 0.5;
    }
    let obj;
    if(location.shape === "sphere") {
        obj = new THREE.Mesh(sphere, material);
    } else if(location.shape === "cylinder") {
        obj = new THREE.Mesh(cylinder, material);
    } else if(location.shape === "torus") {
        obj = new THREE.Mesh(torus, material);
    } else if(location.shape === "capsule") {
        obj = new THREE.Mesh(capsule, material);
    } else {
        obj = new THREE.Mesh(box, material);
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

    obj.position.set(location.x/1000, location.z/1000, location.y/1000); //y and z are swapped from game coordinates
    scene.add(obj);
    location.object = obj;

    if(location.type === "cloud") {
        obj.shape.matrix.makeScale(new THREE.Vector3(100, 100, 100));
    }
    
    // Add location to list
    const li = document.createElement('li');
    li.innerHTML = `<a>${location.name}</a>`;
    li.addEventListener('click', () => {
        locationListItemClick(location);
    });
    locationList.appendChild(li);

    // Add text to location
    const text = makeTextSprite(location.name, { fontsize: 32, textColor: { r:255, g:255, b:255, a:1.0 } });
    text.position.set((location.x/1000), (location.z/1000) + 0.1, (location.y/1000));
    scene.add(text);
    
});


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

// controls.addEventListener('change', throttle(() => onCameraMove(), 1000));
controls.addEventListener('change', debounce(() => onCameraMove(), 250));


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

        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
        var metrics = context.measureText( message );
        var textWidth = metrics.width;

        context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + "," + backgroundColor.b + "," + backgroundColor.a + ")";
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + "," + borderColor.b + "," + borderColor.a + ")";
        context.fillStyle = "rgba("+textColor.r+", "+textColor.g+", "+textColor.b+", 1.0)";
        context.fillText( message, borderThickness, fontsize + borderThickness);

        var texture = new THREE.Texture(canvas) 
        texture.needsUpdate = true;
        var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(0.5 * fontsize, 0.25 * fontsize, 0.75 * fontsize);
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
    gsap.to( camera.position, 
        { 
            x: location.object.position.x + diff.x, 
            y: location.object.position.y + diff.y,
            z: location.object.position.z + diff.z,
            ease: ease,
            onUpdate: () => {
                camera.lookAt(location.object.position);
            },
            onComplete: () => {

            }
        }
    );
    gsap.to( controls.target,
        {
            x: location.object.position.x,
            y: location.object.position.y,
            z: location.object.position.z,
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
