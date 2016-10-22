
var elements = {
    vm1: {
        x: 1,
        y: 1
    },
    vm1: {
        x: 1,
        y: 3
    },
    vm1: {
        x: 1,
        y: 5
    },
    db1: {
        x: 8,
        y: 4
    },
    db1: {
        x: 8,
        y: 4
    },
    db1: {
        x: 8,
        y: 4
    }
}
var links = [
    {
        from: "vm1",
        to: "db1",
        type: "bi"
    },
    {
        from: "vm1",
        to: "db1",
        type: "bi"
    },
    {
        from: "vm1",
        to: "db1",
        type: "bi"
    },
]

var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    width: 1000,
    height: 800,
    gridSize: 100,
    model: graph
});


var source = new joint.shapes.basic.Rect({
    position: { x: 100, y: 110 },
    size: { width: 85, height: 60 },
    attrs: {
        rect: {
            fill: {
                type: 'linearGradient',
                stops: [
                    { offset: '0%', color: '#f7a07b' },
                    { offset: '100%', color: '#fe8550' }
                ],
                attrs: { x1: '0%', y1: '0%', x2: '0%', y2: '100%' }
            },
            stroke: '#ed8661',
            'stroke-width': 2
        },
        text: {
            text: 'Source',
            fill: '#f0f0f0',
            'font-size': 18,
            'font-weight': 'lighter',
            'font-variant': 'small-caps'
        }
    }
});

var target = source.clone().translate(750, 400).attr('text/text', 'Target');

var link = new joint.dia.Link({
    source: { id: source.id },
    target: { id: target.id },
    router: { name: 'metro' }, //manhattan
    connector: { name: 'rounded' },
    attrs: {
        '.connection': {
            stroke: '#333333',
            'stroke-width': 3
        },
        '.marker-target': {
            fill: '#333333',
            d: 'M 10 0 L 0 5 L 10 10 z'
        }
    }
});

var obstacle = source.clone().translate(300, 100).attr({
    text: {
        text: 'Obstacle',
        fill: '#eee'
    },
    rect: {
        fill: {
            stops: [{ color: '#b5acf9' }, { color: '#9687fe' }]
        },
        stroke: '#8e89e5',
        'stroke-width': 2
    }
});

var obstacles = [
    obstacle,
    obstacle.clone().translate(200, 100),
    obstacle.clone().translate(-200, 150)
];

graph.addCells(obstacles).addCells([source, target, link]);

link.toBack();

graph.on('change:position', function(cell) {

    // has an obstacle been moved? Then reroute the link.
    if (_.contains(obstacles, cell)) paper.findViewByModel(link).update();
});

$('.router-switch').on('click', function(evt) {

    var router = $(evt.target).data('router');
    var connector = $(evt.target).data('connector');

    if (router) {
        link.set('router', { name: router });
    } else {
        link.unset('router');
    }

    link.set('connector', { name: connector });
});


