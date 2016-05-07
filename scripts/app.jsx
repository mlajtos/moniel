// import Hello from './Hello';

function run() {
  ReactDOM.render(<Hello name="Moniel" />, document.getElementById('moniel'));
}

const loadedStates = ['complete', 'loaded', 'interactive'];

if (loadedStates.includes(document.readyState) && document.body) {
  run();
} else {
  window.addEventListener('DOMContentLoaded', run, false);
}