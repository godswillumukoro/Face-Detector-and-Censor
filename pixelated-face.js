const video = document.querySelector('.webcam');
const canvas = document.querySelector('.video');
const ctx = canvas.getContext('2d');
const faceCanvas = document.querySelector('.face');
const faceCtx = faceCanvas.getContext('2d');
const faceDetector = new FaceDetector();
const SIZE = 10;
const SCALE = 1;
const optionsInput = document.querySelectorAll('.controls input[type="range"]');
// console.log(optionsInput);

const options = {
    SIZE: 10,
    SCALE: 1.4,
};

function handleOption(event) {
    const {value, name} = event.currentTarget;
    options[name] = parseFloat(value);
}

optionsInput.forEach(input => input.addEventListener('input', handleOption));

// First, make a func that will populate the users video
async function populateVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
    });
    video.srcObject = stream;
    await video.play();

    // Make the video and canvases the same size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    faceCanvas.width = video.videoWidth;
    faceCanvas.height = video.videoHeight;
}

// Second, make a func to use FaceDetector and detect faces
async function godswill() {
    const faces = await faceDetector.detect(video);
    // console.log(faces.length);
    // use requestAnimationFrame to do something every time there is a change from the browser
    faces.forEach(drawface);
    faces.forEach(censor);
    requestAnimationFrame(godswill);
}

// Third, Draw a rectangle around the faces that are found
function drawface(face){
    const { width, height, top, left } = face.boundingBox;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1072B9';
    ctx.lineWidth = '4';
    ctx.strokeRect(left, top, width, height);   
}

// Pixelate the users face
function censor({boundingBox: face}){
    faceCtx.imageSmoothingEnabled = false;
    faceCtx.clearRect(0, 0, faceCanvas.width, faceCanvas.height);
    // draw the small face
    faceCtx.drawImage(
    // 5 source args
    video, //where is the source?
    face.x, //starting point
    face.y,
    face.width,
    face.height,
    // 4 draw implementing args
    face.x, //where should we start drawing? x and y
    face.y,
    options.SIZE, //how wide and how high should i draw?
    options.SIZE,
    );

    // draw the small face back on but scale up
    const width = face.width * options.SCALE;
    const height = face.height * options.SCALE;


    faceCtx.drawImage(
        faceCanvas, //where is the source?
        face.x, //starting point
        face.y,
        options.SIZE,
        options.SIZE,
        // 4 draw implementing args
        face.x - (width - face.width) / 2, //where should we start drawing? x and y
        face.y - (height - face.height) / 2,
        width, //how wide and how high should i draw?
        height,
    );


}

populateVideo().then(godswill);
// window.populateVideo = populateVideo();


 