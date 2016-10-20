import React from 'react';
import { createDevTools } from 'redux-devtools';
import RemotedevSlider from 'remotedev-slider/lib/index';

const reports = [
  {
    "id": "0a69742a-e1c0-4b7a-b172-12820cd939b1",
    "title": "Test Report 1",
    "payload": "[{\"type\":\"ADD_TODO\",\"text\":\"Test Report 1\"},{\"type\":\"REPORT\"}]"
  },
  {
    "id": "dfdaa697-ad2e-450f-944d-e605a521a979",
    "title": "Test Report 2",
    "payload": "[{\"type\":\"COMPLETE_TODO\",\"id\":0},{\"type\":\"ADD_TODO\",\"text\":\"Test Report 2\"},{\"type\":\"COMPLETE_TODO\",\"id\":1},{\"type\":\"REPORT\"}]",
    "preloadedState": "{\"todos\":[{\"text\":\"Use Redux\",\"completed\":false,\"id\":0}]}"
  }
];

export default createDevTools(
  <RemotedevSlider fillColor="rgb(120, 144, 156)" reports={reports} />
);
