import React from 'react';
import ReactDOM from 'react-dom/client';
import { Options } from './Options';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('#root not found');
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
);
