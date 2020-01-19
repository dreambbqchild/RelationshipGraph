import React from 'react';  
import RelationshipEditor from './RelationshipEditor.js'
import Db from './Data/RelationshipDb.js';
import './App.css';
import Cytoscape from './Cytoscape.js';

const relationshipDb = new Db('first-story');
class App extends React.PureComponent {
  constructor() {
      super();

      const init = async () => {
        const graph = {...this.state.graph};
        let i = 0;
        graph.nodes = await relationshipDb.getNodesGreaterThanOrEqualToId(1);

        for(i = 0; i < graph.nodes.length; i++) {
            graph.keyMaster.nodes[graph.nodes[i].id] = i;
            graph.keyMaster.maxNodeId = Math.max(graph.keyMaster.maxNodeId, graph.nodes[i].id);
        }

        graph.edges = await relationshipDb.getEdgesGreaterThanOrEqualToId(1);

        for(i = 0; i < graph.edges.length; i++) {
            graph.keyMaster.edges[graph.edges[i].id] = i;
            graph.keyMaster.maxEdgeId = Math.max(graph.keyMaster.maxEdgeId, graph.edges[i].id);
        }

        this.setState({graph: graph});
      }

      this.state = {
        graph: {
          nodes: [],
          edges: [],
          keyMaster: {
            nodes: {},
            edges: {},
            maxNodeId: 0,
            maxEdgeId: 0
          }
        },
        editor:{
          label: '',
          fromId: 0,
          toId: 0
        }
      };
      init();
  }

  addNodeAsync = async (n) => {
    if(!n.name)
      return;

    const graph = {...this.state.graph};
    await relationshipDb.addNodeAsync(n);
    const newItems = await relationshipDb.getNodesGreaterThanOrEqualToId(graph.keyMaster.maxNodeId);
    for(const item of newItems) {
      graph.keyMaster.nodes[item.id] = graph.nodes.length;
      graph.nodes.push(item);
      graph.keyMaster.maxNodeId = Math.max(item.id, graph.keyMaster.maxNodeId);
    }

    this.setState({graph: graph});
  }

  addEdgeAsync = async (e) => {
    const graph = {...this.state.graph};
    await relationshipDb.addEdgeAsync(e);
    const newItems = await relationshipDb.getEdgesGreaterThanOrEqualToId(graph.keyMaster.maxEdgeId);
    for(const item of newItems) {
      graph.keyMaster.edges[item.id] = graph.edges.length;
      graph.edges.push(item);
      graph.keyMaster.maxEdgeId = Math.max(item.id, graph.keyMaster.maxEdgeId);
    }

    this.setState({graph: graph});
  }

  clearEdit = () => this.setState({editor: {label:''}});

  editRelationship = (idFrom, idTo) => {
    const from = this.state.graph.nodes[this.state.graph.keyMaster.nodes[idFrom]];
    const to = this.state.graph.nodes[this.state.graph.keyMaster.nodes[idTo]];
    this.setState({
        editor: {
          label: `Editing Relationship from ${from.name} to ${to.name}`,
          fromId: idFrom,
          toId: idTo
        }
    });
  }

//<Vis graph={this.state.graph} addNodeAsync={this.addNodeAsync} editRelationship={this.editRelationship} clearEdit={this.clearEdit}/>

  render(){
    return (
      <div className="d-flex flex-column h-100">
          <Cytoscape/>
          <RelationshipEditor editorState={this.state.editor} addEdgeAsync={this.addEdgeAsync}/>
      </div>
    );
  }
}

export default App;
