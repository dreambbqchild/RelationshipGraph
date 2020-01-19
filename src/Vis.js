import React from 'react';

function mapToGraphNode(n) {
    return {
        id: n.id,
        label: n.name,
        shape: 'circle'
    };
}

function mapToGraphEdge(e) {
    return {
        id: e.id,
        from: e.from,
        to: e.to,
        width: e.strength,
        arrows: 'to'
    };
}

class Vis extends React.PureComponent {
    constructor(props) {
        super(props);
        this.network = null;
        this.data = null;
    }

    componentDidMount() {
        const options = {};
        this.data = {
            nodes: new window.vis.DataSet(this.props.graph.nodes.map(mapToGraphNode)),
            edges: new window.vis.DataSet(this.props.graph.edges),
        };

        const container = document.querySelector('vis-network');
        this.network = new window.vis.Network(container, this.data, options);

        var selectedNode = null;
        this.network.on('click', (params) => {
            if(params.nodes.length) {
                if(!selectedNode)
                    selectedNode = params.nodes[0];
                else if(selectedNode !== params.nodes[0]) {
                    this.props.editRelationship(selectedNode, params.nodes[0]);
                    this.network.setSelection({nodes:[selectedNode, params.nodes[0]], edges:[]});
                }
            }
            else {
                selectedNode = null;
                this.props.clearEdit();
            }
            
            if(params.edges.length) {

            }
        });
    }

    componentDidUpdate(prevProps) {
        const {nodes, edges} = prevProps.graph.keyMaster;

        var updates = [];
        this.props.graph.nodes.forEach(n => {
            if(nodes[n.id] === undefined)
                this.data.nodes.add(mapToGraphNode(n));        
            else
                updates.push(mapToGraphNode(n));    
        });

        if(updates.length)
            this.data.nodes.update(updates);

        updates = [];
        this.props.graph.edges.forEach(n => {
            if(edges[n.id] === undefined)
                this.data.edges.add(mapToGraphEdge(n));        
            else
                updates.push(mapToGraphEdge(n));    
        });

        if(updates.length)
            this.data.edges.update(updates);
    }

    addNew = async () => {
        var name = window.prompt('Name:', '');
        if(!name)
            return;
        
        this.props.addNodeAsync({name: name});
    }

    render() {
        return <div className="flex-grow-1 position-relative">
            <vis-network></vis-network>
            <div className="position-absolute" style={{bottom: '16px', right: '16px'}}>
                <button className="btn btn-primary" onClick={this.addNew}>+</button>
            </div>
        </div>;
    }

    componentWillUnmount(){
        if (this.network !== null) {
            this.network.destroy();
            this.network = null;
        }
    }
}

export default Vis;