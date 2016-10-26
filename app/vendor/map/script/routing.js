var def_elements = window['mapDetails'].elements;
var def_links = window['mapDetails'].links;

var elements_types_style = {
    internet: {
       image : {
           "xlink:href" : 'images/internet.png',
           width : 56,
           height : 56,
           position: {x: '.1', y: '.1'}
       }
    },
    router: {
        image : {
            "xlink:href" : 'images/router.png',
            width : 56,
            height : 56,
            position: {x: '.1', y: '.1'}
        }
    },
    network: {
        image : {
            "xlink:href" : 'images/network.png',
            width : 54,
            height : 54,
            position: {x: '.1', y: '.2'}
        }
    },
    vm: {
        image : {
            "xlink:href" : 'images/vm-default.png',
            width : 56,
            height : 54,
            position: {x: '.1', y: '.1'}
        }
    }
}
joint.shapes.basic.DecoratedRect = joint.shapes.basic.Generic.extend({

    markup: '<g class="rotatable"><g class="scalable"><rect/></g><image/><text/></g>',

    defaults: joint.util.deepSupplement({

        type: 'basic.DecoratedRect',
        size: { width: 100, height: 100 },
        attrs: {
            //'rect': { fill: '#FFFFFF', stroke: 'black', width: 100, height: 60 },
            'text': { 'font-size': 14, text: '', 'ref-x': .7, 'ref-y': .5, ref: 'image', 'y-alignment': 'middle', 'x-alignment': 'middle', fill: 'black' },
            //'image': { 'ref-x': 2, 'ref-y': 2, ref: 'rect', width: 16, height: 16 }
        }

    }, joint.shapes.basic.Generic.prototype.defaults)
});

var graph = new joint.dia.Graph();
var paper = new joint.dia.Paper({el: $('#paper'), width: 1210, height: 728, gridSize: cellWidth, model: graph});
function createObj(def) {
    var source = new joint.shapes.basic.DecoratedRect({
        position: {x: def.x * cellWidth, y: def.y * cellWidth},
        size: {width: elements_types_style[def.type].image.width, height: elements_types_style[def.type].image.height},
        attrs: {
            rect: {
                fill: {
                    type: 'transparent',
                    stops: [{offset: '0%', color: '#f7a07b'}, {offset: '100%', color: '#fe8550'}],
                    attrs: {x1: '0%', y1: '0%', x2: '00%', y2: '100%'}
                },
                width: 1,
                height: 1,
                stroke: '#ed8661', 'stroke-width': 0,
            },
            /*,
            text: {
                text: def.name,
                'ref-x': elements_types_style[def.type].text.position.x,
                'ref-y': elements_types_style[def.type].text.position.y,
                fill: elements_types_style[def.type].text.color,
                'font-family': 'Verdana',
                'font-weight': 'lighter',
                'font-variant': 'small-caps',
                //style: {'transform': 'skewY(-10deg)'}
            },*/
            image : elements_types_style[def.type].image,
        },
        name: def.name
    });
    return source;
}

// Add elements
var elements = [];
var elementsId = {};

for (var i in def_elements) {
    var obj = createObj(def_elements[i])
    elements.push(obj)
    elementsId[i] = obj.id
}

// Add links
var links = [];
for (var i in def_links) {
    console.log(def_links[i])
    var link = new joint.dia.Link({
        source: { id: elementsId[def_links[i].from] },
        target: { id: elementsId[def_links[i].to] },
        router: {
            name: (def_links[i].connector ? def_links[i].connector : 'manhattan'),
            args: {
                endDirections: ["left"],
                startDirections: ["right"]
            }
        }, //manhattan, metro
        connector: { name: 'rounded' },
        attrs: {
            '.connection': {
                stroke: '#333333',
                'stroke-width': 1
            },
            '.marker-target': {
                fill: '#333333',
                d: 'M 10 0 L 0 5 L 10 10 z'
            },
            interactive: false
        },
        interactive: false
    });
    links.push(link);
}

graph.addCells(elements).addCells(links);


graph.on('change:position', function(cell) {

    // has an obstacle been moved? Then reroute the link.
    if (_.contains(elements, cell)) paper.findViewByModel(link).update();
});
$('#vm-map').on('mousewheel', function(event) {

    console.log(event.deltaX, event.deltaY, event.deltaFactor);
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
