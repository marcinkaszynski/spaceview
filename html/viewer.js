var objects = [
  { name:'Mercury', distance:0.3871 },
  { name:'Venus', distance:0.7233 },
  { name:'Earth', distance:1, color: 'green' },
  { name:'Mars', distance:1.5237, color: 'red' },
  { name:'Jupiter', distance:5.2028 },
  { name:'Saturn', distance:9.5550 },
  { name:'Uranus', distance:19.1914 },
  { name:'Neptune', distance:30.1094 },
]

var SCALE = 15;

function orbit(d) { return d.distance * SCALE; }
function color(d) { return d.color ? d.color : '#aaa'; }

var vis = null;

var orbits = null;

var current_craft = null;
var current_step_idx = null;
var auto_forward = false;

function update_preview() {
    $("#detail-view").fadeOut(50);
    if (current_step_idx != null) {
        var step = Crafts[current_craft]['path'][current_step_idx]; 
        $("#clicked-craft").html(current_craft);
        $("#clicked-date").html(step[0]);
        
        var image_urls = Crafts[current_craft]['image_urls'];
        var url = image_urls[current_step()[0]] || "-";
        
        $("#detail-view img").attr("src", url);
        $("#detail-view a").attr("href", url);
        $("#detail-view").stop(true).fadeIn(50);
    }
}

function x_from_step(step) { return step[1] * SCALE; }
function y_from_step(step) { return -step[2] * SCALE; }

function current_path() { return Crafts[current_craft]['path']; }
function current_step() { return current_path()[current_step_idx]; }

function update_marker() {
  d3.select("#stepMarker").remove();
  vis.append("ellipse").attr("id", "stepMarker")
     .attr("cx", x_from_step(current_step())).attr("cy", y_from_step(current_step())).attr("rx", 3).attr("ry", 3).attr("fill", "blue");
}

function set_current_step(idx) {
    current_step_idx = Math.min(current_path().length - 1, Math.max(0, idx));
    update_preview();
    update_marker();
}

function change_current(direction) {
  if (current_step_idx == null) {
    if (direction == -1) {
      set_current_step(current_path().length - 1);
    } else {
      set_current_step(0);
    }
  } else {
    set_current_step(current_step_idx + direction);
  }
}

function do_the_auto_forwarding() {
  if (auto_forward)
    change_current(1);
}
setInterval(do_the_auto_forwarding, 1000);

$(document).keydown(function(e){
    if (e.keyCode == 37) { 
       change_current(-1);
       return false;
    }
    if (e.keyCode == 38) { 
       change_current(-10);
       return false;
    }
    if (e.keyCode == 39) { 
       change_current(1);
       return false;
    }
    if (e.keyCode == 40) { 
       change_current(10);
       return false;
    }
    if (e.keyCode == 32) { 
       auto_forward = !auto_forward;
       return false;
    }
});

var Crafts = {};

function load_image_urls(name, on_done) {
    var image_urls = {};
    $.getJSON('urls_' + name + '.json', function(data) {
        for (var i = 0; i < data.length; i++) {
            var date_url = data[i];
            image_urls[date_url[0]] = date_url[1];
        }
        Crafts[name]['image_urls'] = image_urls;
        on_done();
    });
}

function load_path(name, on_done) {
    var path = [];
    $.getJSON('path_' + name + '.json', function(data) {
        Crafts[name]['path'] = data;
        console.log("LOADED", name, Crafts[name]);
        on_done();
    }).fail(function(jqXHR, textStatus, errorThrown) { alert("error" +  textStatus + " " + errorThrown); });
}

function show_craft(name) {
    var path = Crafts[name]['path'];
    var image_urls = Crafts[name]['image_urls'];
    var path_points = vis.selectAll('ellipse.step-' + name).data(path, function(p) { return p[0]; });

    function r_from_step(step) {
        if (image_urls[step[0]]) {
            return 3;
        } else {
            return 0.2;
        }
    }

    function on_step_click(step, idx) {
        current_craft = name;
        current_step_idx = idx;
        update_preview();
        update_marker();
        return false;
    }

    path_points
        .enter().append('ellipse').attr('class', 'step-' + name)
        .attr('cx', x_from_step).attr('cy', y_from_step).attr('rx', r_from_step).attr('ry', r_from_step)
        .attr('fill', 'green').attr('stroke', 'green')
        .attr('opacity', 1).classed('step', true)
        .on("mouseover",function(d,i) { d3.select(this).attr("fill","red"); }) 
        .on("mouseout",function(d,i) { d3.select(this).attr("fill","green"); })
        .on("click",on_step_click)
        .append('svg:title').text(function(p) { return p[0] + ": " + p[1] + "," + p[2];})
    ;
}

function load_craft(name) {
    Crafts[name] = {};
    load_image_urls(name, function () {
        load_path(name, function () {
            show_craft(name);
        });
    });
}

function start_viewer() {
    vis = d3.select("#view").append("svg").append('g').attr('transform','translate(200,350) rotate(-90)');

    orbits = vis.selectAll('ellipse.orbit').data(objects, function(d) { return d.name; });
    orbits
        .enter().append('ellipse').attr('cx',0).attr('cy',0).attr('rx',orbit).attr('ry',orbit)
        .attr('fill', 'none').attr('opacity',1).attr('stroke-width', 1).attr('stroke',color).classed('orbit',true);

    load_craft('vger1');
    load_craft('vger2');
    
    update_preview();    
}
