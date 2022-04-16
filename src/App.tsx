import * as React from 'react';
import WebglCanvas from './WebglCanvas';
import './App.css';

interface Props {
}
const App:React.FC<Props> = (props) => {
  return <WebglCanvas width={1000} height={1000}></WebglCanvas>
}

export default App;