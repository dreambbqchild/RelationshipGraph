import React from 'react';
import TimeSlider from './TimeSlider.js'
import RelationshipEditor from './RelationshipEditor.js'

//cy.style().selector('edge').style({width: 3}).update()
//cy.style().selector('edge[source = "k"]').style({width: 10}).update()

const toGraphNode = (n) => { return { data: { id: `node-${n.id}`, name: n.name } }; };
const toGraphEdge = (e) => { return { data: { id: `${e.from}_${e.to}`, source: `node-${e.from}`, target: `node-${e.to}` }, style: { width: e.points ? e.points[0].start : 1 } }; };

class Cytoscape extends React.PureComponent {
  constructor() {
    super();

    this.state = {
      editor: {
        key: '',
        node: { id: 0 },
        relationship: { from: 0, to: 0 }
      }
    };
    this.selectedId = null;
  }

  async componentDidMount() {
    const { db } = this.props;
    const nodes = await db.getAllNodes();
    const edges = await db.getAllEdges();

    this.cy = window.cy = window.cytoscape({
      container: document.querySelector('graph-area'),
      layout: {
        name: 'concentric',
        levelWidth: function (nodes) { return 100; },
        minNodeSpacing: 100
      },
      style: [{
        selector: 'node[name]',
        style: {
          'content': 'data(name)'
        }
      }, {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'target-arrow-shape': 'triangle'
        }
      },
      ],
      elements: {
        nodes: nodes.map(toGraphNode),
        edges: edges.map(toGraphEdge)
      }
    });

    this.cy.on('click', (e) => {
      if (e.target.group === undefined) {
        if (e.originalEvent.shiftKey)
          this.addNodeAsync(e.position);
        else
          this.clearEdit();

        return;
      }

      const group = e.target.group();
      if (group === 'nodes') {
        if (this.selectedId === null) {
          this.selectedId = parseInt(e.target.data('id').split('-')[1]);
          this.editNode(this.selectedId);
        }
        else {
          const toId = parseInt(e.target.data('id').split('-')[1]);
          if (toId === this.selectedId)
            return;

          window.setTimeout(() => this.cy.$(`#node-${this.selectedId},#node-${toId},#${this.selectedId}_${toId}`).select(), 0);
          this.editRelationship(this.selectedId, toId);
        }
      }
      else if (group === 'edges') {
        const fromId = parseInt(e.target.source().data('id').split('-')[1]);
        const toId = parseInt(e.target.target().data('id').split('-')[1]);
        window.setTimeout(() => this.cy.$(`#node-${fromId},#node-${toId}}`).select(), 0);
        this.editRelationship(fromId, toId);
      }
    });
  }

  editNode = (id) => {
    this.setState({ editor: { key: 'node', node: { id: id } } });
  }

  editRelationship = (fromId, toId) => {
    this.setState({ editor: { key: 'relationship', relationship: { from: fromId, to: toId } } });
  }

  clearEdit = () => {
    this.setState({ editor: { key: '' } });
    this.cy.$('*').unselect();
    this.selectedId = null;
  };

  addNodeAsync = async (atPosition) => {
    var name = window.prompt('Name:', '');
    if (!name)
      return;

    const { db } = this.props;
    const newKey = await db.addNodeAsync({ name: name });
    const node = await db.getNodeAsync(newKey);
    const graphNode = toGraphNode(node);
    graphNode.group = 'nodes';
    graphNode.position = atPosition;
    this.cy.add(graphNode);
  }

  updateOccurred = async (update) => {
    const { db } = this.props;

    if(update.type === 'edge') {
        const edge = await db.getEdgeAsync(update.id);
        if(update.op === 'add') {
          const edgeNode = toGraphEdge(edge);
          edgeNode.group = 'edges';
          this.cy.add(edgeNode);
        } else if(update.op === 'edit'){
          const edgeNode = this.cy.$(`#${edge.from}_${edge.to}`);  
          const data = {};
          const style = {};
          for (const key of update.props) {
            switch (key) {
              case 'points': style.width = edge.points[0].start; break;
              default: break;
            }
          }
          edgeNode.data(data);
          edgeNode.style(style);
        }

    } else if(update.type === 'node') {
      const node = await db.getNodeAsync(update.id);
      if(update.op === 'edit') {
        const graphNode = this.cy.$(`#node-${update.id}`);        
        const data = {};
        for (const key of update.props) {
          switch (key) {
            case 'name': data.name = node.name; break;
            default: break;
          }
        }
        graphNode.data(data);
      }
    }

    this.clearEdit();
  }

  timeChanged = async (timeStamp) => {
    const { db } = this.props;
    const edges = await db.getAllEdges();
    for(const edge of edges) {
      const edgeNode = this.cy.$(`#${edge.from}_${edge.to}`);
      const range = edge.points[0].end - edge.points[0].start;
      const percentComplete = timeStamp / 100000;
      const style = {width: edge.points[0].start + (percentComplete * range)};
      edgeNode.style(style);
    }
  }

  render() {
    const { db } = this.props;
    return <div className="d-flex flex-column h-100">
      <div className="flex-grow-1 position-relative">
        <graph-area></graph-area>
      </div>
      <div className="row">
        <div className="col-12">
          <TimeSlider timeChanged={this.timeChanged}/>
        </div>
      </div>
      <div className="h-25 overflow-auto">
        <RelationshipEditor db={db} editorState={this.state.editor} updateOccurred={this.updateOccurred} />
      </div>
    </div>
  }
}

export default Cytoscape;
