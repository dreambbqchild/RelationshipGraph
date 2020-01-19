import React from 'react';

class EditNode extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            name: ''
        }
    }

    async componentDidMount() {
        const {db, nodeId} = this.props;
        this.node = await db.getNodeAsync(nodeId);
        this.setState({name: this.node.name});
    }

    componentDidUpdate(prevProps) {
        if(prevProps.nodeId !== this.props.nodeId)
            this.componentDidMount();
    }

    update = (key, value) =>{
        const val = {};
        val[key] = value;
        this.setState(val);
    }

    saveChanges = async () => {
        const {db, nodeId} = this.props;
        this.node.name = this.state.name;
        await db.updateNodeAsync(this.node);
        this.props.updateOccurred({op: 'edit', type: 'node', id: nodeId, props: ['name']});
    }

    render() {
        return <div> 
            <div className="row">
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="nodeName">Name</label>
                        <input id="nodeName" type="text" className="form-control" onChange={(e) => this.update('name', e.target.value)} value={this.state.name}/>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-3">
                    <button className="btn btn-primary" onClick={this.saveChanges}>Save Changes</button>
                </div>
            </div>
        </div>
    }
}

export default EditNode;