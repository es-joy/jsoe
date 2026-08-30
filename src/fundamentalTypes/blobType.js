import {jml, toStringTag} from '../vendor-imports.js';
import {$e} from '../utils/templateUtils.js';
import {visualize, getUserMedia, startScreenCapture} from '../utils/media.js';
import dialogs from '../utils/dialogs.js';

/**
 * @typedef {Blob|{
 *   size: string, type: string
 * }} BlobInfo
 */

/**
 * @typedef {(blob: BlobInfo) => void} SetValue
 */

/**
 * @param {HTMLButtonElement & {$value: Blob}} viewBinary
 * @param {{
 *   stringContents?: string,
 *   name?: string,
 *   type?: string
 * }} value
 * @returns {Blob}
 */
function newBlobForBinary (viewBinary, value) {
  const oldBlob = /** @type {Blob|undefined} */ (
    viewBinary.$value
  );
  // We actually want to allow creating `Blob`'s from scratch
  // if (
  //   !oldBlob ||
  //   Object.prototype.toString.call(
  //     oldBlob
  //   ).slice(8, -1) !== 'Blob'
  // ) {
  //   return false;
  // }
  const blob = new Blob(
    [
      value.stringContents === undefined
        ? oldBlob && Object.prototype.toString.call(
          oldBlob
        ).slice(8, -1) === 'Blob'
          ? oldBlob
          : ''
        : value.stringContents
    ],
    {
      type: value.type === undefined
        ? oldBlob?.type ?? ''
        : value.type
    }
  );
  viewBinary.$value = blob;
  return blob;
}

/**
 * @param {Blob} value
 * @param {boolean} [editable]
 * @returns {import('jamilih').JamilihArray}
 */
function binaryButton (value, editable) {
  return ['button', {
    class: 'viewBinary',
    $custom: {
      $value: value
    },
    $on: {
      /**
       * @param {Event} e
       */
      click (e) {
        // eslint-disable-next-line consistent-this -- Clarity
        const viewBinary = /** @type {HTMLButtonElement & {$value: Blob}} */ (
          this
        );
        e.preventDefault();
        if (
          !viewBinary.$value ||
          Object.prototype.toString.call(
            viewBinary.$value
          ).slice(8, -1) !== 'Blob'
        ) {
          // Non-editable shouldn't be empty
          // if (!editable) {
          //   dialogs.alert(
          //     'There is no blob chosen with binary data'
          //   );
          //   return;
          // }

          newBlobForBinary(viewBinary, {});
        }
        const reader = new FileReader();
        reader.addEventListener('load', async function () {
          const dialog = await dialogs.makeSubmitDialog({
            submitText: 'Save',
            submit () {
              const textarea = /** @type {HTMLTextAreaElement} */ (
                $e(dialog, '.view-binary')
              );
              const blob = newBlobForBinary(viewBinary, {
                stringContents: textarea.value
              });
              // May need to update size:
              /** @type {HTMLFieldSetElement & {$setValue: SetValue}} */
              (viewBinary.parentElement).$setValue(blob);
              dialog.close();
            },
            // @ts-expect-error TS bug
            children: [
              ['div', [
                'Binary source',
                ['br'],
                ['textarea', {
                  class: 'view-binary'
                }, [
                  /* istanbul ignore next */
                  /** @type {string|null} */ (reader.result) ?? ''
                ]]
              ]]
            ]
          });
        });
        // Seems not feasible to accurately simulate
        reader.addEventListener(
          'error',
          /* istanbul ignore next */
          async function () {
            /* istanbul ignore next */
            console.error(reader.error);
            /* istanbul ignore next */
            await dialogs.alert(/** @type {string} */ (
              /** @type {DOMException} */ (reader.error).message
            ));
          }
        );
        // eslint-disable-next-line sonarjs/deprecation -- Use readAsArrayBuffer then convert?
        reader.readAsBinaryString(viewBinary.$value);
      }
    }
  }, [
    editable
      ? 'Edit binary data'
      : 'View binary data'
  ]];
}

/**
 * @type {import('../types.js').TypeObject}
 */
const blobType = {
  option: ['Blob'],
  stringRegex: /^Blob\((.*)\)$/u,
  valueMatch (x) {
    return toStringTag(x) === 'Blob';
  },
  toValue (s) {
    const obj = JSON.parse(s);
    return {value: new Blob([obj.stringContents], {
      type: obj.type
    })};
  },
  getInput ({root}) {
    return /** @type {HTMLButtonElement} */ ($e(root, 'button.viewBinary'));
  },
  setValue ({root, value}) {
    /** @type {HTMLFieldSetElement & {$setValue: SetValue}} */
    ($e(root, 'fieldset.blobMetaData')).$setValue(value);
  },
  getValue ({root}) {
    // Get value attached to DOM element rather than input,
    //    so can be from preexisting blob too
    return /** @type {HTMLButtonElement & {$value: Blob}} */ (
      this.getInput({root})
    ).$value;
  },
  viewUI ({value, specificSchemaObject}) {
    return ['div', {dataset: {type: 'blob'}}, [
      ['b', {
        class: 'emphasis',
        title: specificSchemaObject?.description ? '(a Blob)' : undefined
      }, [
        specificSchemaObject?.description ?? 'Blob'
      ]],
      ['br'],
      ['br'],
      ['b', [
        'Size (in bytes) '
      ]],
      String(value.size),
      ['br'],
      ['b', [
        'Content type '
      ]],
      value.type,
      ['br'],
      value.type.startsWith('text/') || value.type === 'application/json'
        ? (() => {
          const div = jml('div');
          const reader = new FileReader();
          reader.addEventListener('load', function () {
            div.append(jml('div', [
              'Text source',
              ['br'],
              ['textarea', {class: 'view-text'}, [
                /* istanbul ignore next */
                /** @type {string|null} */ (reader.result) ?? ''
              ]]
            ]));
          });
          // Seems not feasible to accurately simulate
          reader.addEventListener(
            'error',
            /* istanbul ignore next */
            function () {
              /* istanbul ignore next */
              console.error(reader.error);
              /* istanbul ignore next */
              div.append(
                /** @type {DOMException} */ (reader.error).message
              );
            }
          );
          // eslint-disable-next-line sonarjs/deprecation -- Use readAsArrayBuffer then convert?
          reader.readAsBinaryString(value);
          return div;
        })()
        : binaryButton(value),
      value.type.startsWith('video/')
        ? (() => {
          const objURL = URL.createObjectURL(value);
          const video = jml('video', {
            src: objURL,
            class: 'video',
            $on: {
              loadeddata () {
                // Bug in Safari revoking the URL here
                if (!(/iPad|iPhone|iPod|Safari/u).test(navigator.userAgent)) {
                  URL.revokeObjectURL(objURL);
                }
              }
            }
          });

          return ['div', [
            video,
            ['button', {
              class: 'play',
              $on: {
                click (e) {
                  e.preventDefault();
                  video.play();
                }
              }
            }, [
              'Play'
            ]],
            ['button', {
              class: 'pause',
              $on: {
                click (e) {
                  e.preventDefault();
                  video.pause();
                }
              }
            }, [
              'Pause'
            ]],
            ['button', {
              class: 'replay',
              $on: {
                click (e) {
                  e.preventDefault();
                  video.pause();
                  video.currentTime = 0;
                  video.play();
                }
              }
            }, [
              'Replay'
            ]]
          ]];
        })()
        : '',
      value.type.startsWith('audio/')
        ? (() => {
          const objURL = URL.createObjectURL(value);
          const audio = jml('audio', {
            src: objURL,
            class: 'audio',
            $on: {
              loadeddata () {
                URL.revokeObjectURL(objURL);
              }
            }
          });
          return ['div', [
            audio,
            ['button', {
              class: 'play',
              $on: {
                click (e) {
                  e.preventDefault();
                  audio.play();
                }
              }
            }, [
              'Play'
            ]],
            ['button', {
              class: 'pause',
              $on: {
                click (e) {
                  e.preventDefault();
                  audio.pause();
                }
              }
            }, [
              'Pause'
            ]],
            ['button', {
              class: 'replay',
              $on: {
                click (e) {
                  e.preventDefault();
                  audio.pause();
                  audio.currentTime = 0;
                  audio.play();
                }
              }
            }, [
              'Replay'
            ]]
          ]];
        })()
        : '',
      value.type === 'application/pdf'
        ? (() => {
          const objURL = URL.createObjectURL(value);
          const iframe = jml('iframe', {
            class: 'PDF',
            src: objURL,
            $on: {
              load () {
                URL.revokeObjectURL(objURL);
              }
            }
          });
          return iframe;
        })()
        : '',
      value.type.startsWith('image/')
        ? ['img', {
          class: 'imageView',
          src: URL.createObjectURL(value),
          $on: {
            load () {
              URL.revokeObjectURL(
                /** @type {HTMLImageElement} */ (this).src
              );
            }
          }
        }]
        : ''
    ]];
  },
  editUI ({typeNamespace, specificSchemaObject, value = {}}) {
    // Todo: Could add way to preview blob in edit mode (whether
    //         recorded or uploaded)
    return ['div', {
      dataset: {type: 'blob'},
      title: specificSchemaObject?.description ?? 'Blob'
    }, [
      ['fieldset', {
        class: 'blobMetaData',
        $custom: {
          /**
           * @this {HTMLFieldSetElement}
           * @param {BlobInfo} blob
           */
          $setValue (blob) {
            // eslint-disable-next-line consistent-this -- Clarity
            const metadataFieldset = this;

            /** @type {HTMLInputElement} */ ($e(
              metadataFieldset,
              '.size'
            )).value = String(blob.size);

            /** @type {HTMLInputElement} */ ($e(
              metadataFieldset,
              '.contentType'
            )).value = blob.type;

            /** @type {HTMLButtonElement & {$value: Blob|undefined}} */ ($e(
              metadataFieldset,
              'button.viewBinary'
            )).$value = Object.prototype.toString.call(
              blob
            ).slice(8, -1) === 'Blob'
              ? /** @type {Blob} */ (blob)
              /* istanbul ignore next */
              : undefined;
          }
        }
      }, [
        ['legend', ['Current blob data']],
        ['label', [
          'Size (in bytes) ',
          ['input', {
            type: 'number', step: '1', disabled: true, class: 'size',
            value: String(value.size)
          }]
        ]],
        ['br'],
        ['label', [
          'Content type ',
          ['input', {
            class: 'contentType', value: value.type ?? '',
            $on: {
              change () {
                const viewBinary =
                  /**
                   * @type {HTMLButtonElement & {$value: Blob}}
                   */ (
                    $e(
                      /** @type {HTMLElement} */
                      (this.parentElement?.parentElement),
                      'button.viewBinary'
                    )
                  );

                const newContentType =
                  /** @type {HTMLInputElement} */ (this).value;
                newBlobForBinary(viewBinary, {
                  type: newContentType
                });
              }
            }
          }]
        ]],
        ['br'],
        binaryButton(value, true),
        ['button', {
          class: 'clearData',
          $on: {
            click (e) {
              e.preventDefault();
              /**
               * @type {HTMLFieldSetElement & {$setValue: SetValue}}
               */ (this.parentElement).$setValue({
                size: '',
                type: ''
              });
            }
          }
        }, [
          'Clear data'
        ]]
      ]],
      ['fieldset', [
        ['legend', ['Supply blob through upload']],
        ['label', [
          'Blob ',
          ['input', {
            $on: {
              change () {
                // eslint-disable-next-line consistent-this -- Clarity
                const input = /** @type {HTMLInputElement} */ (this);
                /* istanbul ignore if -- TS */
                if (!input.files) {
                  return;
                }
                const file = input.files[0];

                const blob = new Blob([file], {
                  type: file.type
                });

                const metadataFieldset =
                  /**
                   * @type {HTMLFieldSetElement & {
                   *   $setValue: SetValue
                   * }}
                   */ (/** @type {HTMLElement} */ (
                    this.parentElement?.parentElement
                  )?.previousElementSibling);
                metadataFieldset.$setValue(blob);
              }
            },
            name: `${typeNamespace}-blob`, type: 'file'
          }]
        ]]
      ]],
      ['fieldset', [
        ['legend', [
          'Supply blob through recording'
        ]],
        (() => {
          const select = jml('select', {
            class: 'device',
            $on: {
              async change () {
                const videoContainer = /** @type {HTMLDivElement} */ (
                  this.nextElementSibling?.nextElementSibling
                );

                const photo =
                  /**
                   * @type {HTMLCanvasElement}
                   */
                  ($e(videoContainer, 'img.photo'));
                photo.hidden = true;

                const oldVideo =
                  /**
                   * @type {HTMLVideoElement & {
                   *   $stream: MediaStream
                   * }}
                   */
                  ($e(
                    videoContainer,
                    'video.previewMedia'
                  ));

                // Drop preexisting listeners
                const previewMedia =
                  /**
                   * @type {HTMLVideoElement & {
                   *   $stream: MediaStream,
                   *   $screenShare: boolean
                   * }}
                   */ (
                    jml('video', {
                      class: 'previewMedia'
                    })
                  );

                if (oldVideo.$stream) {
                  const tracks = /** @type {MediaStream} */ (
                    oldVideo.$stream
                  ).getTracks();
                  tracks.forEach((track) => {
                    track.stop();
                  });
                  oldVideo.srcObject = null;
                }

                oldVideo.replaceWith(previewMedia);

                const takeSnapshot = /** @type {HTMLButtonElement} */ (
                  $e(/** @type {HTMLDivElement} */ (
                    select.nextElementSibling
                  ), '.takeSnapshot')
                );

                const recordMedia = /** @type {HTMLButtonElement} */ (
                  $e(/** @type {HTMLDivElement} */ (
                    select.nextElementSibling
                  ), '.recordMedia')
                );

                /** @type {HTMLDivElement} */ ($e(
                  /** @type {HTMLDivElement} */
                  (select.nextElementSibling?.
                    nextElementSibling),
                  'div.recordedMedia'
                )).hidden = true;

                const visualizer = /** @type {HTMLCanvasElement} */ (
                  $e(videoContainer, 'canvas.visualizer')
                );

                /**
                 * @type {{
                 *   video?: true,
                 *   audio?: true
                 * }|undefined}
                 */
                let constraints;
                let screenShareConstraints;

                previewMedia.$screenShare = false;
                switch (select.value) {
                case 'audio-and-video':
                  constraints = {video: true, audio: true};
                  previewMedia.hidden = false;
                  takeSnapshot.hidden = false;
                  recordMedia.textContent = 'Record video/audio';
                  break;
                case 'video':
                  constraints = {video: true};
                  previewMedia.hidden = false;
                  takeSnapshot.hidden = false;
                  recordMedia.textContent = 'Record video';
                  break;
                case 'audio':
                  constraints = {audio: true};
                  previewMedia.hidden = true;
                  takeSnapshot.hidden = true;
                  recordMedia.textContent = 'Record audio';
                  break;
                case 'screenShare':
                  screenShareConstraints = {video: true};
                  // Fallthrough
                case 'screenShareAndVideo':
                  if (!screenShareConstraints) {
                    screenShareConstraints = {video: true, audio: true};
                  }
                  previewMedia.$screenShare = true;
                  previewMedia.hidden = true;
                  takeSnapshot.hidden = true;
                  visualizer.hidden = true;
                  break;
                default:
                  return;
                }

                if (constraints) {
                  const mediaStream = await getUserMedia(constraints);
                  /* istanbul ignore if */
                  if (!mediaStream) {
                    await dialogs.alert('Error getting user media');
                    return;
                  }

                  videoContainer.hidden = false;
                  previewMedia.srcObject = mediaStream;

                  // Save as stream for later reuse as stream
                  previewMedia.$stream = mediaStream;

                  if (constraints.video) {
                    const canvas =
                      /**
                       * @type {HTMLCanvasElement}
                       */
                      ($e(
                        videoContainer,
                        'canvas.recordedImage'
                      ));
                    // https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos
                    previewMedia.addEventListener('canplay', () => {
                      canvas.setAttribute('width', String(
                        previewMedia.videoWidth
                      ));
                      canvas.setAttribute(
                        'height', String(previewMedia.videoHeight)
                      );
                    });
                  }

                  previewMedia.addEventListener('loadedmetadata', () => {
                    previewMedia.play();
                    if (constraints?.audio) {
                      visualizer.hidden = false;
                      visualize(
                        mediaStream,
                        visualizer
                      );
                    } else {
                      visualizer.hidden = true;
                    }
                  });
                } else if (screenShareConstraints) {
                  const mediaStream = await startScreenCapture(
                    screenShareConstraints
                  );
                  /* istanbul ignore if */
                  if (!mediaStream) {
                    await dialogs.alert('Error getting user media');
                    return;
                  }

                  videoContainer.hidden = false;
                  previewMedia.srcObject = mediaStream;

                  // Save as stream for later reuse as stream
                  previewMedia.$stream = mediaStream;
                }
              }
            }
          }, [
            ['option', {value: ''}, ['Please choose a device']]
          ]);

          (async () => {
            const devices = await navigator.mediaDevices.enumerateDevices();
            let hasAudioInput = false;
            let hasVideoInput = false;
            devices.forEach((device) => {
              switch (device.kind) {
              case 'audioinput':
                hasAudioInput = true;
                break;
              case 'videoinput':
                hasVideoInput = true;
                break;
              default:
                break;
              }
            });

            if (hasAudioInput) {
              jml('option', {value: 'audio'}, ['Microphone only'], select);
            }
            if (hasVideoInput) {
              jml('option', {value: 'video'}, ['Video camera only'], select);
            }
            if (hasAudioInput && hasVideoInput) {
              jml(
                'option',
                {value: 'audio-and-video'},
                ['Video camera and microphone'],
                select
              );
            }

            // Can't be feature detected for privacy reasons
            jml('option', {
              value: 'screenShare'
            }, ['Screen share'], select);
            jml('option', {
              value: 'screenShareAndVideo'
            }, ['Screen share and microphone'], select);
          })();

          return select;
        })(),
        ' ',
        ['div', [
          ['button', {
            class: 'recordMedia',
            $on: {
              /**
               * @param {Event} e
               */
              click (e) {
                e.preventDefault();
                const previewMedia =
                  /**
                   * @type {HTMLVideoElement & {$stream: MediaStream}}
                   */ ($e(
                    /** @type {HTMLDivElement} */
                    (this.parentElement?.nextElementSibling),
                    'video.previewMedia'
                  ));

                /* istanbul ignore if */
                if (!previewMedia.srcObject) {
                  dialogs.alert('No stream found to record');
                  return;
                }

                // Not interested in the photo now, so hide it
                const videoContainer = /** @type {HTMLDivElement} */ (
                  this.parentElement?.nextElementSibling
                );
                const photo =
                  /**
                   * @type {HTMLCanvasElement}
                   */
                  ($e(videoContainer, 'img.photo'));
                photo.hidden = true;

                // Todo: Could check codecs for allowable values
                //     as second argument
                //  see https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static
                // const mimeType = 'video/webm';
                const mimeType = 'video/mp4';

                const mediaRecorder = new MediaRecorder(previewMedia.$stream, {
                  mimeType
                });

                /** @type {Blob[]} */
                let chunks = [];
                mediaRecorder.addEventListener('dataavailable', (e) => {
                  chunks.push(e.data);
                });

                try {
                  mediaRecorder.start();
                /* istanbul ignore next */
                } catch {
                  /* istanbul ignore next */
                  dialogs.alert('Error starting media recorder');
                  /* istanbul ignore next */
                  return;
                }
                mediaRecorder.addEventListener('stop', () => {
                  const blob = new Blob(chunks, {
                    type: mimeType
                  });

                  const url = URL.createObjectURL(blob);

                  const recordedMedia = /** @type {HTMLVideoElement} */ ($e(
                    /** @type {HTMLDivElement} */
                    (this.parentElement?.nextElementSibling),
                    'video.recordedMedia'
                  // )).srcObject = blob;
                  ));
                  /** @type {HTMLDivElement} */ (
                    recordedMedia.parentElement
                  ).hidden = false;

                  recordedMedia.src = url;

                  recordedMedia.addEventListener('loadeddata', () => {
                    // Bug in Safari revoking the URL here
                    if (!(/iPad|iPhone|iPod|Safari/u).test(navigator.userAgent)) {
                      URL.revokeObjectURL(url);
                    }
                  });

                  const root = /** @type {HTMLDivElement} */
                    (this.closest('[data-type="blob"]'));
                  /**
                   * @type {HTMLFieldSetElement & {
                   *   $setValue: SetValue
                   * }}
                   */ ($e(
                    root, 'fieldset.blobMetaData'
                  )).$setValue(blob);

                  chunks = [];
                });

                (
                  /** @type {HTMLButtonElement & {$mediaRecorder: MediaRecorder}} */
                  (this)
                ).$mediaRecorder = mediaRecorder;

                // Todo: Could make option for front/back
                //         camera ("user"/"environment") and bringIntoFocus
              }
            }
          }, [
            'Record media'
          ]],
          ['button', {
            class: 'stopRecording',
            $on: {
              click (e) {
                e.preventDefault();
                /**
                 * @type {HTMLButtonElement & {$mediaRecorder: MediaRecorder}}
                 */ (
                  this.previousElementSibling
                ).$mediaRecorder.stop();

                // const previewMedia =
                //   /**
                //    * @type {HTMLVideoElement & {
                //    *   $stream: MediaStream,
                //    *   $screenShare: boolean
                //    * }}
                //    */ (
                //     $e(
                //       /** @type {HTMLDivElement} */
                //       (this.parentElement?.nextElementSibling),
                //       '.previewMedia'
                //     )
                //   );

                // Doesn't hurt to keep the normal video going as user
                //   may wish to re-record, but for screen-sharing, we
                //   may want to reenable this, at the cost that the
                //   screen sharing cannot be re-done
                // if (previewMedia.$screenShare) {
                //   const tracks = /** @type {MediaStream} */ (
                //     previewMedia.$stream
                //   ).getTracks();
                //   tracks.forEach((track) => {
                //     track.stop();
                //   });
                // }
                // previewMedia.srcObject = null;
              }
            }
          }, [
            'Stop recording'
          ]],
          ['button', {
            class: 'takeSnapshot',
            hidden: true
          }, {
            $on: {
              click (e) {
                e.preventDefault();

                const videoContainer = /** @type {HTMLDivElement} */
                  (this.parentElement?.nextElementSibling);

                // Not interested in this anymore
                /** @type {HTMLVideoElement} */
                ($e(videoContainer, '.recordedMedia')).hidden = true;

                const canvas =
                  /**
                   * @type {HTMLCanvasElement}
                   */
                  ($e(videoContainer, 'canvas.recordedImage'));

                const context = /** @type {CanvasRenderingContext2D} */ (
                  canvas.getContext('2d')
                );

                const previewMedia =
                  /**
                   * @type {HTMLVideoElement}
                   */
                  ($e(videoContainer, 'video.previewMedia'));
                context.drawImage(
                  previewMedia, 0, 0, canvas.width, canvas.height
                );
                const photo =
                  /**
                   * @type {HTMLCanvasElement}
                   */
                  ($e(videoContainer, 'img.photo'));

                canvas.toBlob((blob) => {
                  /* istanbul ignore if */
                  if (!blob) {
                    dialogs.alert('Error converting canvas to Blob');
                    return;
                  }
                  const newPhoto = jml('img', {
                    class: 'photo'
                  });
                  const url = URL.createObjectURL(blob);

                  newPhoto.addEventListener('load', () => {
                    // no longer need to read the blob so it's revoked
                    URL.revokeObjectURL(url);
                  });

                  const root = /** @type {HTMLDivElement} */
                    (this.closest('[data-type="blob"]'));
                  /**
                   * @type {HTMLFieldSetElement & {
                   *   $setValue: SetValue
                   * }}
                   */ ($e(
                    root, 'fieldset.blobMetaData'
                  )).$setValue(blob);

                  newPhoto.src = url;
                  photo.replaceWith(newPhoto);
                });
              }
            }
          }, [
            'Take and use snapshot as blob'
          ]]
        ]],
        ['div', {class: 'videoContainer', hidden: true}, [
          ['canvas', {class: 'visualizer', hidden: true}],
          ['br'],
          ['video', {class: 'previewMedia'}],
          ['div', [
            ['canvas', {hidden: true, class: 'recordedImage'}],
            ['img', {class: 'photo'}]
          ]],
          [
            'div',
            {class: 'recordedMedia'},
            [
              ...(() => {
                const recordedMedia = jml(
                  'video', {class: 'recordedMedia'}
                );
                return [
                  recordedMedia,
                  ['br'],
                  jml('button', {
                    class: 'play',
                    $on: {
                      click (e) {
                        e.preventDefault();
                        recordedMedia.play();
                      }
                    }
                  }, [
                    'Play'
                  ]),
                  jml('button', {
                    class: 'pause',
                    $on: {
                      click (e) {
                        e.preventDefault();
                        recordedMedia.pause();
                      }
                    }
                  }, [
                    'Pause'
                  ]),
                  jml('button', {
                    class: 'replay',
                    $on: {
                      click (e) {
                        e.preventDefault();
                        recordedMedia.pause();
                        recordedMedia.currentTime = 0;
                        recordedMedia.play();
                      }
                    }
                  }, [
                    'Replay'
                  ])
                ];
              })()
            ]
          ]
        ]]
      ]]
    ]];
  }
};

export default blobType;
