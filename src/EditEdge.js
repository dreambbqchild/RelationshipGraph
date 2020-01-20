import React from 'react';

class EditEdge extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            points:[{
                index: 0,
                start: 1,
                end: 10
            }]
        }
        this.edge = null;
    }

    async componentDidMount(prevProps) {
        const { db, from, to } = this.props;
        this.edge = await db.getEdgeAsync(`${from}→${to}`);
        if (this.edge) {
            const points = this.edge.points ? this.edge.points : [{
                index: 0,
                start: 1,
                end: 10
            }];
            this.setState({ points: points });
        }
    }

    update = (key, value) => {
        const points = {...this.state.points};
        points[0][key] = Math.max(0, value);
        this.setState({points: points});
    }

    saveChanges = async () => {
        const { db, from, to } = this.props;
        var edgeId = `${from}→${to}`;
        var op = 'add';
        if(this.edge) {
            this.edge.points = this.state.points;
            op = 'edit';
            await db.updateEdgeAsync(this.edge);
        } else {
            await db.addEdgeAsync({
                from: from,
                to: to,
                relation: edgeId,
                points: this.state.points
            });
        }

        this.props.updateOccurred({ op: op, type: 'edge', id: edgeId, props: ['points'] });
    }

    render() {
        return <div>
            <div className="row">
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="nodeName">At Time:</label>
                        <input id="nodeName" type="number" className="form-control" onChange={(e) => this.update('index', e.target.value)} value={this.state.points[0].index} />
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="nodeName">Starting Strength:</label>
                        <input id="nodeName" type="number" className="form-control" onChange={(e) => this.update('start', e.target.value)} value={this.state.points[0].start} />
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="nodeName">Ending Strength:</label>
                        <input id="nodeName" type="number" className="form-control" onChange={(e) => this.update('end', e.target.value)} value={this.state.points[0].end} />
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