import Icon from './Icon.jsx';
import './SliderControls.css';

/** Prev/next round buttons used by the species and lodge carousels. */
export default function SliderControls({ scroller, label = 'Slide to explore', tone = 'light' }) {
  return (
    <div className={`eco-slider-controls eco-slider-controls--${tone}`}>
      <span>{label}</span>
      <button
        type="button"
        className="eco-icon-btn eco-icon-btn--prev"
        onClick={scroller.prev}
        disabled={!scroller.canPrev}
        aria-label="Previous"
      >
        <Icon name="chevronLeft" strokeWidth={2.2} />
      </button>
      <button
        type="button"
        className="eco-icon-btn eco-icon-btn--next"
        onClick={scroller.next}
        disabled={!scroller.canNext}
        aria-label="Next"
      >
        <Icon name="chevronRight" strokeWidth={2.2} />
      </button>
    </div>
  );
}
