/** @type {AudioContext} */
let audioCtx;
/**
 * @param {MediaStream} stream
 * @param {HTMLCanvasElement} canvas
 * @see Adapted from {@link https://mdn.github.io/dom-examples/media/web-dictaphone/}
 * @returns {void}
 */
function visualize (stream, canvas) {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  const canvasCtx = /** @type {CanvasRenderingContext2D} */ (
    canvas.getContext('2d')
  );

  const source = audioCtx.createMediaStreamSource(stream);

  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 2048;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  // analyser.connect(audioCtx.destination);

  draw();

  /**
   * @returns {void}
   */
  function draw () {
    const WIDTH = canvas.width;
    const HEIGHT = canvas.height;

    requestAnimationFrame(draw);

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';

    canvasCtx.beginPath();

    const sliceWidth = WIDTH * 1 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128;
      const y = v * HEIGHT / 2;

      if (i === 0) {
        canvasCtx.moveTo(x, y);
      } else {
        canvasCtx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
  }
}


/**
 * @param {MediaStreamConstraints} constraints
 * @returns {Promise<MediaStream|null>}
 */
async function getUserMedia (constraints) {
  // eslint-disable-next-line no-useless-assignment -- ESLint bug
  let stream = null;
  try {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    /* istanbul ignore next */
    console.error('err', err);
    /* istanbul ignore next */
    return null;
  }
  return stream;
}

/**
 * @param {DisplayMediaStreamOptions|undefined} displayMediaOptions
 * @returns {Promise<MediaStream|null>}
 */
async function startScreenCapture (displayMediaOptions) {
  let captureStream = null;

  try {
    captureStream =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch (err) {
    /* istanbul ignore next */
    console.error(`Error: ${err}`);
  }
  return captureStream;
}

export {visualize, getUserMedia, startScreenCapture};
