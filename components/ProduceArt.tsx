import { Icon } from './Icon';

export function ProduceArt() {
  return <div className="hero-art" role="img" aria-label="Illustrated crate of fresh citrus, carrots, leafy greens, and bread. A visual concept for food recovery.">
    <div className="art-grid" /><div className="orbit orbit-one" /><div className="orbit orbit-two" />
    <span className="art-label">ROOTED IN COMMUNITY</span>
    <div className="produce"><div className="leaf leaf-a" /><div className="leaf leaf-b" /><div className="leaf leaf-c" /><div className="leaf leaf-d" /><div className="carrot carrot-a" /><div className="carrot carrot-b" /><div className="orange orange-a" /><div className="orange orange-b" /><div className="tomato" /><div className="bread" /><div className="crate"><span>LEFTOVERS</span><small>GOOD FOOD GOES FURTHER.</small></div></div>
    <div className="art-sticker">A little less waste.<br /><strong>A lot more possibility.</strong><span><Icon name="arrow" width="23" height="23" /></span></div>
    <div className="vertical-label">FINDING VALUE EVERYWHERE</div>
  </div>;
}
