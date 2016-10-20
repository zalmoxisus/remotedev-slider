import { createStore } from 'redux';
import rootReducer from '../reducers';
import * as actionCreators from '../actions/todos';
import DevTools from '../containers/DevTools';

export default function configureStore(initialState) {
  const store = createStore(rootReducer, initialState, DevTools.instrument());

  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextReducer = require('../reducers').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
