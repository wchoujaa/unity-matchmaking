function getNodes(data) {
  var tmp = [];
  data.forEach(element => {
    var id = element.A;
    if (!tmp.includes(id)) {
      tmp.push(id);
    }
    id = element.B;
    if (!tmp.includes(id)) {
      tmp.push(id);
    }
  });
  var res = [];

  tmp.forEach(element => {

    res.push({ id: element });

  });
  return res;
}

function getLinks(data) {
  var res = [];
  data.forEach(element => {
    var obj = { source: element.A, target: element.B, weight: 1 }
    res.push(obj);
  });

  return res;
}

var svg = d3.select('#d3_selectable_force_directed_graph');

function getCountryDictionary() {
  d3.csv('graph.csv', function (error, data) {
  });
}

var dictionary = {};

async function LoadGraph() {
  try {
    const data = await d3.csv('graph.csv');

    var links = getLinks(data);
    var nodes = getNodes(data);

    graph = { links: links, nodes: nodes };

    countryList = await d3.csv('countries.csv');
    countryList.forEach(element => {
      dictionary[element.countryCode] = element;
    });
    //console.log(countries);

    createV4SelectableForceDirectedGraph(svg, graph);

  } catch (error) {
    console.log(error);
  }
}



LoadGraph();

