import React from 'react';  

import Db from './Data/RelationshipDb.js';
import './App.css';
import GraphEditor from './GraphEditor.js';

const relationshipDb = new Db('first-story');
class App extends React.PureComponent {

  render(){
    return (
          <GraphEditor db={relationshipDb}/>
    );
  }
}

export default App;
