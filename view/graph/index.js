
function getNodes(data) {
  var res = [];
  data.forEach(element => {
    var id = element.A;
    if (!res.includes(id)) {
      res.push({ id: id });
    }
    id = element.B;
    if (!res.includes(id)) {
      res.push({ id: id });
    }
  });

  return res;
}

function getLinks(data) {
  var res = [];
  data.forEach(element => {
    var obj = { source: element.A, target: element.B, weight: 1 }
    res.push(obj);
  });
  //console.log(res);
  return res;
}
var g;
var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

svg
  .attr("viewBox", [0, 0, width, height]);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) { return d.id; }))
  .force("charge", d3.forceManyBody())
  .force("center", d3.forceCenter(width / 2, height / 2));

d3.csv("graph.csv", function (error, data) {
  if (error) throw error;
  var links = getLinks(data);
  var nodes = getNodes(data);
  graph = { links: links, nodes: nodes };

  g = svg.append("g")
    .attr("cursor", "grab");

  var link = g.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links)
    .enter().append("line")
    .attr("stroke-width", function (d) { return Math.sqrt(d.value); });

  var node = g.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graph.nodes)
    .enter().append("g")

  var circles = node.append("circle")
    .attr("r", 5)
    .attr("fill", function (d) { return color(d.group); });

  // Create a drag handler and append it to the node object instead
  var drag_handler = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  //g.call(drag);
  g.call(d3.zoom()
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 8])
    .on("zoom", zoomed));


  drag_handler(node);

  var labels = node.append("text")
    .text(function (d) {
      return d.id;
    })
    .attr('x', 6)
    .attr('y', 3);

  node.append("title")
    .text(function (d) { return d.id; });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function (d) { return d.source.x; })
      .attr("y1", function (d) { return d.source.y; })
      .attr("x2", function (d) { return d.target.x; })
      .attr("y2", function (d) { return d.target.y; });

    node
      .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
      })
  }
});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function zoomed(elem) {
  console.log(elem);
  g.attr("transform", transform);
}