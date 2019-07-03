import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './react-webcam.css';
import {
  withRouter
} from 'react-router-dom'
import OpenFoodFactsMpp from 'OpenFoodFactsMpp';

function hasGetUserMedia() {
  return !!(
    (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia
  );
}

const constrainStringType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.arrayOf(PropTypes.string),
  PropTypes.shape({
    exact: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
  PropTypes.shape({
    ideal: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }),
]);

const constrainBooleanType = PropTypes.oneOfType([
  PropTypes.shape({
    exact: PropTypes.bool,
  }),
  PropTypes.shape({
    ideal: PropTypes.bool,
  }),
]);

const constrainLongType = PropTypes.oneOfType([
  PropTypes.number,
  PropTypes.shape({
    exact: PropTypes.number,
    ideal: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number,
  }),
]);

const constrainDoubleType = constrainLongType;

const audioConstraintType = PropTypes.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  autoGainControl: constrainBooleanType,
  channelCount: constrainLongType,
  latency: constrainDoubleType,
  noiseSuppression: constrainBooleanType,
  sampleRate: constrainLongType,
  sampleSize: constrainLongType,
  volume: constrainDoubleType,
});

const videoConstraintType = PropTypes.shape({
  deviceId: constrainStringType,
  groupId: constrainStringType,
  aspectRatio: constrainDoubleType,
  facingMode: constrainStringType,
  frameRate: constrainDoubleType,
  height: constrainLongType,
  width: constrainLongType,
});

class Webcam extends Component {
  static defaultProps = {
    audio: true,
    className: '',
    height: 480,
    imageSmoothing: true,
    onUserMedia: () => {},
    onScanProduct: () => {},
    onUserMediaError: () => {},
    screenshotFormat: 'image/webp',
    width: 640,
    screenshotQuality: 0.92,
  };

  static propTypes = {
    audio: PropTypes.bool,
    onUserMedia: PropTypes.func,
    onScanProduct: PropTypes.func,
    onUserMediaError: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    screenshotFormat: PropTypes.oneOf([
      'image/webp',
      'image/png',
      'image/jpeg',
    ]),
    style: PropTypes.object,
    className: PropTypes.string,
    screenshotQuality: PropTypes.number,
    minScreenshotWidth: PropTypes.number,
    minScreenshotHeight: PropTypes.number,
    audioConstraints: audioConstraintType,
    videoConstraints: videoConstraintType,
    imageSmoothing: PropTypes.bool,
  };

  static mountedInstances = [];

  static userMediaRequested = false;

  constructor() {
    super();
    this.state = {
      hasUserMedia: false,
    };

    this.scanBarcode = this.scanBarcode.bind(this);
  }

  componentDidMount() {
    if (!hasGetUserMedia()) return;

    Webcam.mountedInstances.push(this);

    if (!this.state.hasUserMedia && !Webcam.userMediaRequested) {
      this.requestUserMedia();
    }
  }

  componentWillUpdate(nextProps) {
    if (
      JSON.stringify(nextProps.audioConstraints) !==
        JSON.stringify(this.props.audioConstraints) ||
      JSON.stringify(nextProps.videoConstraints) !==
        JSON.stringify(this.props.videoConstraints)
    ) {
      this.requestUserMedia();
    }
  }

  componentWillUnmount() {
    const index = Webcam.mountedInstances.indexOf(this);
    Webcam.mountedInstances.splice(index, 1);

    Webcam.userMediaRequested = false;
    if (Webcam.mountedInstances.length === 0 && this.state.hasUserMedia) {
      if (this.stream.getVideoTracks && this.stream.getAudioTracks) {
        this.stream.getVideoTracks().map(track => track.stop());
        this.stream.getAudioTracks().map(track => track.stop());
      } else {
        this.stream.stop();
      }
      window.URL.revokeObjectURL(this.state.src);
    }
  }

  scanBarcode() {
    if (window.reader) {
      let canvas = document.createElement('canvas');
      canvas.width = this.props.width;
      canvas.height = this.props.height
      let ctx = canvas.getContext('2d');
      ctx.drawImage(this.video, 0, 0, this.props.width, this.props.height);
      window.reader.decodeBuffer(
        ctx.getImageData(0, 0, canvas.width, canvas.height).data,
        canvas.width,
        canvas.height,
        canvas.width * 4,
        window.dynamsoft.BarcodeReader.EnumImagePixelFormat.IPF_ARGB_8888
      )
      .then((results) => {
        this.showResults(results);
      });
    }
    
  }

  showResults(results) {
    try {
      for (var i = 0; i < results.length; ++i) {
        if (results[i].LocalizationResult.ExtendedResultArray[0].Confidence >= 30) {
          const appController = OpenFoodFactsMpp.com.meetup.kotlin.paris.openfoodfacts.getApplicationController();
          appController.getProduct(results[i].BarcodeText, (result, error) => {
            this.props.onScanProduct(result);
            this.props.history.push('/product')
          })
        }
      }
      if(results.length < 1) {
        this.scanBarcode();
      }
    } catch (e) {
      this.scanBarcode();
    }
  }

  requestUserMedia() {
    navigator.getUserMedia =
      navigator.mediaDevices.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    const sourceSelected = (audioConstraints, videoConstraints) => {
      const constraints = {
        video: videoConstraints || true,
      };

      if (this.props.audio) {
        constraints.audio = audioConstraints || true;
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          Webcam.mountedInstances.forEach(instance =>
            instance.handleUserMedia(null, stream),
          );
        })
        .catch((e) => {
          Webcam.mountedInstances.forEach(instance =>
            instance.handleUserMedia(e),
          );
        });
    };

    if ('mediaDevices' in navigator) {
      sourceSelected(this.props.audioConstraints, this.props.videoConstraints);
    } else {
      const optionalSource = id => ({ optional: [{ sourceId: id }] });

      const constraintToSourceId = (constraint) => {
        const deviceId = (constraint || {}).deviceId;

        if (typeof deviceId === 'string') {
          return deviceId;
        } else if (Array.isArray(deviceId) && deviceId.length > 0) {
          return deviceId[0];
        } else if (typeof deviceId === 'object' && deviceId.ideal) {
          return deviceId.ideal;
        }

        return null;
      };

      MediaStreamTrack.getSources((sources) => {
        let audioSource = null;
        let videoSource = null;

        sources.forEach((source) => {
          if (source.kind === 'audio') {
            audioSource = source.id;
          } else if (source.kind === 'video') {
            videoSource = source.id;
          }
        });

        const audioSourceId = constraintToSourceId(this.props.audioConstraints);
        if (audioSourceId) {
          audioSource = audioSourceId;
        }

        const videoSourceId = constraintToSourceId(this.props.videoConstraints);
        if (videoSourceId) {
          videoSource = videoSourceId;
        }

        sourceSelected(
          optionalSource(audioSource),
          optionalSource(videoSource),
        );
      });
    }

    Webcam.userMediaRequested = true;
  }

  handleUserMedia(err, stream) {
    if (err) {
      this.setState({ hasUserMedia: false });
      this.props.onUserMediaError(err);

      return;
    }

    this.stream = stream;

    try {
      this.video.srcObject = stream;
      this.setState({ hasUserMedia: true });
    } catch (error) {
      this.setState({
        hasUserMedia: true,
        src: window.URL.createObjectURL(stream),
      });
    }

    this.props.onUserMedia();
  }

  render() {
    return (
      <div className={"webcamContainer"}>
        <div id='videoview' width="100%" height="100%">
          <video
            autoPlay
            width="100%" height="100%"
            src={this.state.src}
            muted={this.props.audio}
            className={this.props.className}
            playsInline
            style={this.props.style}
            ref={(ref) => {
              this.video = ref;
            }}
          />
          <canvas id="overlay" width="100%" height="100%"></canvas>
        </div>
        <div className={"buttonContainer"}>
          <button id="button" onClick={this.scanBarcode}></button>
        </div>
      </div>
    );
  }
}

export default withRouter(Webcam)
