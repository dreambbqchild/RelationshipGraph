import React from 'react';
import EditNode from './EditNode.js';
import EditEdge from './EditEdge.js';

class RelationshipEditor extends React.PureComponent {
    renderPanel = () => {
        const {db, editorState, updateOccurred} = this.props;
        switch(editorState.key)
        {
            case 'node': return <EditNode db={db} nodeId={editorState.node.id} updateOccurred={updateOccurred}/>;
            case 'relationship': return <EditEdge db={db} from={editorState.relationship.from} to={editorState.relationship.to} updateOccurred={updateOccurred}/>;
            default: return '';
        }
    }

    render() {
        const {key} = this.props.editorState;
        const label = key === 'node' ? 'Edit Character' : 'Edit Relationship';
        return <div>
            {key ? <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="h5 text-center">{label}</div>
                    </div>
                </div>
                {this.renderPanel()}
            </div>
        : '' }
        </div>;
    }
}

export default RelationshipEditor;