import React from 'react';

class TimeSlider extends React.PureComponent{
    constructor() {
        super();
        this.state = {
            value: 0
        }
    }

    updateValue(value) {
        this.setState({value: value});
        this.props.timeChanged(value);
    }

    render(){
        return <div>
            <div className="form-group">
                <label htmlFor="timeline">Timeline</label>
                <input id="timeline" type="range" min="0" max="100000" className="form-control" onChange={(e) => this.updateValue(parseInt(e.target.value))} value={this.state.value} />
            </div>
        </div>
    }
}

export default TimeSlider;