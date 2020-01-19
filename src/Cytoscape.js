import React from 'react';

class Cytoscape extends React.PureComponent {

    componentDidMount() {
        var cy = window.cy = window.cytoscape({
            container: document.querySelector('graph-area'),
  
            layout: {
              name: 'concentric',
              concentric: function(n){ return n.id() === 'j' ? 200 : 0; },
              levelWidth: function(nodes){ return 100; },
              minNodeSpacing: 100
            },
  
            style: [
              {
                selector: 'node[name]',
                style: {
                  'content': 'data(name)'
                }
              },
  
              {
                selector: 'edge',
                style: {
                  'curve-style': 'bezier',
                  'target-arrow-shape': 'triangle',
                  'width': (edge) => edge.source().data('id') === 'j' ? 10 : 3
                }
              },
            ],
  
            elements: {
              nodes: [
                { data: { id: 'j', name: 'Jerry' } },
                { data: { id: 'e', name: 'Elaine' } },
                { data: { id: 'k', name: 'Kramer' } },
                { data: { id: 'g', name: 'George' } }
              ],
              edges: [
                { data: { source: 'j', target: 'e' } },
                { data: { source: 'j', target: 'k' } },
                { data: { source: 'j', target: 'g' } },
                { data: { source: 'e', target: 'j' } },
                { data: { source: 'e', target: 'k' } },
                { data: { source: 'k', target: 'j' } },
                { data: { source: 'k', target: 'e' } },
                { data: { source: 'k', target: 'g' } },
                { data: { source: 'g', target: 'j' } }
              ]
            }
          });
    }

    render() {
        return <div className="flex-grow-1 position-relative">
            <graph-area></graph-area>
        </div>
    }
}

export default Cytoscape;
