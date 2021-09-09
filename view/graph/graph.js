var gDraw
function createV4SelectableForceDirectedGraph(svg, graph) {
    // if both d3v3 and d3v4 are loaded, we'll assume
    // that d3v4 is called d3v4, otherwise we'll assume
    // that d3v4 is the default (d3)


    if (typeof d3v4 == 'undefined')
        d3v4 = d3;



    let parentWidth = d3v4.select('svg').node().parentNode.clientWidth;
    let parentHeight = d3v4.select('svg').node().parentNode.clientHeight;

    var svg = d3v4.select('svg')
        .attr('width', parentWidth)
        .attr('height', parentHeight)

    // remove any previous graphs
    svg.selectAll('.g-main').remove();

    var gMain = svg.append('g')
        .classed('g-main', true)
        .attr("transform", "translate(" + parentWidth / 2 + "," + 0 + ")");


    gDraw = gMain.append('g')
        .attr("class", "background");

    var padding = 100;

    console.log(parentWidth);
    gDraw.append("svg:image")
        .attr('x', -(parentWidth) / 2)
        .attr('y', 0)
        .attr('width', parentWidth)
        .attr('height', parentHeight)
        .attr("xlink:href", "image/world_map.jpg")
        .attr("preserveAspectRatio", "none")



    var zoom = d3v4.zoom()
        .on('zoom', zoomed)

    gMain.call(zoom);

    function zoomed() {
        gDraw.attr('transform', d3v4.event.transform);
    }

    var color = d3v4.scaleOrdinal(d3v4.schemeCategory20);

    if (!("links" in graph)) {
        console.log("Graph is missing links");
        return;
    }

    var nodes = {};

    var i;

    for (i = 0; i < graph.nodes.length; i++) {
        nodes[graph.nodes[i].id] = graph.nodes[i];
        graph.nodes[i].weight = 1.01;
    }

    var link = gDraw.append("g")
        .attr("class", "link")
        .selectAll("line")
        .data(graph.links)
        .enter().append("line")
        .attr("stroke-width", function (d) { return 1 });

    var node = gDraw.append("g")
        .attr("class", "node")
        .selectAll(".node")
        .data(graph.nodes).enter().append("g");

    node.append("circle").attr("r", 5)
        .attr("fill", function (d) { return color(d.group); });

    node.append("text")
        .text(function (d) { return d.id; }).attr("fill", "black")
        .attr("stroke", "black");

    node.each(function (d) {
        // your update code here as it was in your example
        var obj = d3.select(this); // Transform to d3 Object
        var country = dictionary[d.id];
        var { x, y } = latLonToOffsets(country.lat, country.lng);
        obj.attr("transform", "translate(" + x + "," + y + ")")
    });

    link.each(function (d) {
        var obj = d3.select(this);

        var country1 = dictionary[d.source];
        var coord1 = latLonToOffsets(country1.lat, country1.lng);

        var country2 = dictionary[d.target];
        var coord2 = latLonToOffsets(country2.lat, country2.lng);


        obj.attr("x1", coord1.x)
            .attr("y1", coord1.y)
            .attr("x2", coord2.x)
            .attr("y2", coord2.y);

    });

    function degreesToRadians(degrees) {
        return (degrees * Math.PI) / 180;
    }
    
    function latLonToOffsets(latitude, longitude) {
        const FE = 180; // false easting
        const FN = 0; // false north
        const radius = parentWidth / (2 * Math.PI);

        const latRad = degreesToRadians(latitude) + FN;
        const lonRad = degreesToRadians(longitude + FE);

        const x = lonRad * radius;

        const yFromEquator = radius * Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const y = parentHeight / 2 - yFromEquator;

        return { x, y };
    }



    var texts = ['Use the scroll wheel to zoom',
        'Hold the shift key to select nodes']

    svg.selectAll('text')
        .data(texts)
        .enter()
        .append('text')
        .attr('x', 900)
        .attr('y', function (d, i) { return 470 + i * 18; })
        .text(function (d) { return d; });

    return graph;
};