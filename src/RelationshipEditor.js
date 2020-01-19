import React from 'react';

class DataGrid extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            initalStrength: 0,
            startAtPercentOfTimeline: 0
        }
        this.initalState =  {...this.state};
    }

    componentDidUpdate(prevProps) {
        if(this.props.editorState.label !== prevProps.editorState.label) {
            this.setState(this.initalState);
        }
    }

    update = (key, value) =>{
        const val = {};
        val[key] = value;
        this.setState(val);
    }

    addEdgeAsync = async () => {
        await this.props.addEdgeAsync({
            from: this.props.editorState.fromId, 
            to: this.props.editorState.toId, 
            strength: parseFloat(this.state.initalStrength), 
            startAtPercentOfTimeline: this.state.startAtPercentOfTimeline
        });
    }

    render() {
        var {label} = this.props.editorState;
        return <div className="h-25 overflow-auto">
            {label ? <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="h5 text-center">{label}</div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3">
                        <input type="number" className="form-control" onChange={(e) => this.update('initalStrength', e.target.value)} value={this.state.initalStrength}/>
                    </div>
                    <div className="col-3">
                        <input type="number" className="form-control" onChange={(e) => this.update('startAtPercentOfTimeline', Math.min(100, Math.max(0, e.target.value)))} value={this.state.startAtPercentOfTimeline}/>
                    </div>
                    <div className="col-3">
                        <button className="btn" onClick={this.addEdgeAsync}>Add/Edit Edge</button>
                    </div>
                </div>
            </div>
        : '' }
        </div>;
    }
}

export default DataGrid;