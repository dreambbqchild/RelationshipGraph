import React from 'react';

class EditEdge extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            name: '',
            strength: 0
        }
    }

    update = (key, value) =>{
        const val = {};
        val[key] = value;
        this.setState(val);
    }

    saveChanges = async () => {
        const {db, from, to} = this.props;
        var edgeId = await db.addEdgeAsync({
            from: from, 
            to: to, 
            relation: `${from}→${to}`,
            strength: this.state.strength
        });

        this.props.updateOccurred({op: 'add', type: 'edge', id: edgeId});
    }

    render(){
        return <div> 
            <div className="row">
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="nodeName">Relationship Strength</label>
                        <input id="nodeName" type="number" className="form-control" onChange={(e) => this.update('strength', e.target.value)} value={this.state.strength}/>
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

export default EditEdge;