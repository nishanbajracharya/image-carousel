const DEFAULT_TRANSITION = 500;
const DEFAULT_HOLD = 2000;
const DEFAULT_IMAGE_WIDTH = 0;
const FRAME_PACING = 1000 / 60;

class Carousel {
  constructor(props) {
    this.elementId = props.element;
    this.element = document.getElementById(props.element);

    this.imageWrapper = this.element.getElementsByClassName(
      'carousel-image-wrapper'
    )[0];
    this.images = [...this.imageWrapper.getElementsByTagName('img')];

    this.imageCount = this.images.length;
    this.imageWidth = props.imageWidth || DEFAULT_IMAGE_WIDTH;

    this.element.style.width = toPX(this.imageWidth);
    this.imageWrapper.style.width = toPX(this.imageWidth * this.imageCount);

    this.imageWrapper.classList.add('clearfix');

    this.transition = props.transition || DEFAULT_TRANSITION;
    this.hold = props.hold || DEFAULT_HOLD;

    this.currentIndex = 0;
    this.currentPosition = 0;

    this.animationRef = null;
    this.holdRef = null;

    this.frameCount = 0;
    this.transitioning = false;

    this.setHoldRef = this.setHoldRef.bind(this);
    this.clearHoldRef = this.clearHoldRef.bind(this);
    this.renderArrowControls = this.renderArrowControls.bind(this);
    this.renderIndicatorControls = this.renderIndicatorControls.bind(this);


    this.setHoldRef();
    this.renderArrowControls();
    this.renderIndicatorControls();
  }

  setHoldRef() {
    this.holdRef = requestTimeout(() => this.init(), this.hold);
  }

  clearHoldRef() {
    clearRequestTimeout(this.holdRef);
  }

  switchTo(index, onAnimationStart, onAnimationEnd) {
    onAnimationStart(this);

    const nextPosition = (index % this.imageCount) * this.imageWidth;
    const distance = nextPosition - this.currentPosition;
    const velocity = (distance / this.transition) * FRAME_PACING;

    this.animate(velocity, onAnimationEnd);
  };

  animate(velocity = 0, onAnimationEnd = f => f) {
    this.transitioning = true;
    this.frameCount += FRAME_PACING;

    if (this.frameCount < this.transition) {
      this.currentPosition += velocity;
      this.render();

      this.animationRef = window.requestAnimationFrame(() =>
        this.animate(velocity, onAnimationEnd)
      );
      return;
    }

    window.cancelAnimationFrame(this.animationRef);
    this.frameCount = 0;

    this.render(this.currentIndex * this.imageWidth);
    this.transitioning = false;

    onAnimationEnd(this);
  };

  render(newPosition) {
    if (newPosition !== undefined) {
      this.currentPosition = newPosition;
    }

    this.imageWrapper.style.transform = `translateX(-${toPX(
      this.currentPosition
    )})`;
  };

  init() {
    this.currentIndex = (this.currentIndex + 1) % this.imageCount;
    this.switchTo(this.currentIndex, this.clearHoldRef, this.setHoldRef);
  };

  renderArrowControls() {
    const leftArrow = document.createElement('button');
    leftArrow.innerHTML = 'Left';
    leftArrow.classList.add('carousel-arrow-left');

    this.element.appendChild(leftArrow);

    const rightArrow = document.createElement('button');
    rightArrow.innerHTML = 'Right';
    rightArrow.classList.add('carousel-arrow-right');

    this.element.appendChild(rightArrow);

    leftArrow.onclick = () => {
      if (!this.transitioning) {
        this.currentIndex = (() => {
          if (this.currentIndex === 0) return this.imageCount - 1;

          return this.currentIndex - 1;
        })();

        this.switchTo(this.currentIndex, this.clearHoldRef, this.setHoldRef);
      }
    }

    rightArrow.onclick = () => {
      if (!this.transitioning) {
        this.currentIndex = (this.currentIndex + 1) % this.imageCount;

        this.switchTo(this.currentIndex, this.clearHoldRef, this.setHoldRef);
      }
    }
  }

  renderIndicatorControls() {
    const indicatorWrapper = document.createElement('div');
    indicatorWrapper.classList.add('carousel-indicator-wrapper');

    for (let i = 0; i < this.imageCount; i++) {
      const indicator = document.createElement('button');
      indicator.innerHTML = i + 1;

      indicatorWrapper.appendChild(indicator);

      indicator.onclick = () => {
        if (!this.transitioning) {
          this.currentIndex = i;
          this.switchTo(this.currentIndex, this.clearHoldRef, this.setHoldRef);
        }
      }
    }

    this.element.appendChild(indicatorWrapper);
  }
}
