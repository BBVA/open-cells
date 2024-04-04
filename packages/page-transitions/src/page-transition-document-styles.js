import pageTransitionStyles from './page-transitions.css.js';

const styles = pageTransitionStyles.cssText;

const headStyle = document.createElement('style');
headStyle.innerHTML = styles;
document.head.appendChild(headStyle);
