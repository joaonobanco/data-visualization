//global variables commom to all visualzations-------------------------------------------

var selection_number=0 
var genre1="none";
var genre2="none";
var year;
var heat=false;

var main_artist="none"
var title = "none"

var music = false; 

var dispatch_genreChange = d3.dispatch("genreChange");
var dispatch_genreChange_scatter = d3.dispatch("genreChange");
var dispatch_heat_rect = d3.dispatch("heat_rect");

var color_code = {'country':'yellow',
                  'edm':'orange',
                  'pop':'green',
                  'rap':'#87CEFA',
                  'rock':'red',
                  'r&b':'violet',
                  'r-b':'violet',
                  'unknown':'brown'}

main_background = "black"
second_background = "#111211"

//global variables----------------------------------------------------------------------

//line chart global variables
var lineFunction_linear;
var w_line=d3.select("#line_chart").node().getBoundingClientRect().width;
var h_line=d3.select("#line_chart").node().getBoundingClientRect().height-40;
var padding_line=35;

var tooltip_line;

var hscaleaxis2
var hscale2
var xscale2
var xscaleaxis2

//heat map global variables-------------------------------------------------------------
var dataset_heat;

var w_heat=d3.select("#heat_map").node().getBoundingClientRect().width;
var h_heat=d3.select("#heat_map").node().getBoundingClientRect().height-20;
var padding_heat=35;

var tooltip_heat;

//radial plot global variables-----------------------------------------------------------
var full_dataset_radial;
var data1_radial;
var data2_radial_radial;

var lineFunction;

var dim = 12;

var w_rad = 540;
var h_rad = 540;
var rad_rad = 210;

var tooltip_radial;

//scatter plot global variables-----------------------------------------------------------
var dataset_scatter, full_dataset_scatter;

var w_scatter = d3.select("#scatter_plot").node().getBoundingClientRect().width;
var h_scatter = d3.select("#scatter_plot").node().getBoundingClientRect().height-20;
var padding_scatter=35;
var gap_scatter=2; //gap so the points don't overlay the axis

var tooltip_scatter;

//scales and axes
var hscaleaxis
var hscales
var xscaleaxis
var xscale
var xaxis
var yaxis

//word cloud global variables--------------------------------------------
var selection_cloud="word";
var w_cloud = d3.select("#word_cloud").node().getBoundingClientRect().width;
var h_cloud = d3.select("#word_cloud").node().getBoundingClientRect().height;
var pad_cloud= 10;

var varx="valence"
var vary="energy" 

var tooltip_cloud;

//d3js main function-------------------------------------------------------------------
d3.json("aggregated.json").then(function (data_year) {
  d3.json("top_100_songs.json").then(function (data_month) {
    d3.json("aggregated_genre.json").then(function (data_genre) {
        
        //heat map init
        dataset_heat = data_year

        //radial plot init
        full_dataset_radial = data_genre;

        //scatter plot init
        full_dataset_scatter = data_month;
        dataset_scatter = data_month;

        //word cloud init
        full_dataset_cloud = data_genre;

        rel();
        gen_vis_heat_map();
        gen_line_chart();
        gen_vis_radial_plot();
        gen_vis_scatter_plot();
        gen_vis_word_cloud();
    });
  });
});

//dispatches--------------------------------
dispatch_genreChange.on("genreChange",function(d){

  music=false
  heat=false

  var genre = d.genre;
  var button_id = "#"+genre+"_button";

    if(genre1=="r&b"){genre1="r-b"}
    if(genre2=="r&b"){genre2="r-b"}
    if(genre=="r&b"){genre="r-b"}

    if (selection_number==0){
      genre1=genre
      selection_number=1;
    }
    else if (selection_number==1) {
      if(genre1=="none"){
        if(genre==genre2){
          genre2="none"
          selection_number=0;
        }
        else{
          genre1=genre;
          selection_number=2;
        }
      }
      else{
        if(genre==genre1){
          genre1="none"
          selection_number=0;
        }
        else{
          genre2=genre;
          selection_number=2;
        }
      }
    }

    else if (selection_number==2){
        if(genre==genre1)
        {
          genre1="none";
          selection_number = 1
        }
        else if(genre==genre2)
        {
          genre2="none";    
          selection_number = 1
        }
        else{
          genre2 = genre;

        }
    }

    if(genre1=="r-b"){genre1="r&b"}
    if(genre2=="r-b"){genre2="r&b"}

    refresh_global()
})

dispatch_genreChange_scatter.on("genreChange",function(d){

  music = true
  heat = false

  var genre = d.broad_genre;

  selection_cloud="word"
  selection_number =1
  genre1=genre
  genre2="none"

  main_artist=d.main_artist
  title= d.title

    refresh_line()
    refresh_radial();
    refresh_color_scatter();
    refresh_cloud(); 
    refresh_info();

  selection_number=0
  genre1="none"
  genre2="none"

  d3.selectAll(".btnsel")
    .style("background-color","gray")

  d3.select("#word")
    .style("background-color","#211d19")

   refresh_buttons(); 

})

dispatch_heat_rect.on("heat_rect",function(d){
 
  music = false;

  genre= d.genre
  year_old=year;
  year = d.year

  if((heat == true) & (genre==genre1) & (year==year_old)){
    clear_heat()
    selection_number=0;
    genre1="none"
    genre2="none"
    refresh_global(); 

  }
  else
  {
    data = dataset_heat.filter(function (a) { return  (a.year == year) ; });

    full_dataset_radial = data;
    full_dataset_cloud = data;

    selection_number=1;
    genre1=genre;
    genre2="none";

    clear_heat();

    d3.select("#heat_rect_"+genre+"_"+year)
      .style("stroke-width",3)
      .style("stroke",color_code[genre1])

    d3.select("#"+genre1+"_button")
      .style("fill", color_code[genre1])  

    if(genre1=="r-b"){genre1="r&b"}

    refresh_radial();
    refresh_color_scatter();
    refresh_cloud(); 
    refresh_info("year_data");
    refresh_line()

    if(genre1=="r&b"){genre1="r-b"}

    heat=true;
  }

})


//Auxiliary Functions - Radial Plot -----------------------------------------------------
function get_data_radial(data){
  data=data[0]

  data=[  data.duration_ms,
          data.key,      
          data.loudness,
          data.tempo,
          data.word_count,
          data.energy,
          data.acousticness,
          data.danceability,
          data.liveness,
          data.speechiness,
          data.valence,
          data.lex_complexity,
          ];

  return data;
}


function get_maximums()
{

  full_dataset =full_dataset_scatter;

  min_dur_scale =  d3.min(full_dataset, function(d) { return d.duration_ms;})*0.7;
  max_dur_scale =  d3.max(full_dataset, function(d) { return d.duration_ms;});

  min_key_scale = 0;
  max_key_scale =  d3.max(full_dataset, function(d) { return d.key;});

  min_loud_scale = d3.min(full_dataset, function(d) { return d.loudness;})
  max_loud_scale = d3.max(full_dataset, function(d) { return d.loudness;})


  min_tempo_scale = d3.min(full_dataset, function(d) { return d.tempo;})
  max_tempo_scale = d3.max(full_dataset, function(d) { return d.tempo;})

  min_word_scale = 0
  max_word_scale = d3.max(full_dataset, function(d) { return d.word_count;})

  min_energy_scale = d3.min(full_dataset, function(d) { return d.energy;})*0.7
  max_energy_scale = d3.max(full_dataset, function(d) { return d.energy;})

  min_acousticness_scale = 0
  max_acousticness_scale = 1
  
  min_danceability_scale = 0
  max_danceability_scale = 1
  
  min_liveness_scale = 0
  max_liveness_scale = 1

  min_speechiness_scale = 0
  max_speechiness_scale = 0.7
  
  min_valence_scale = 0
  max_valence_scale = 1

  min_lex_complexity_scale = 0
  max_lex_complexity_scale = 1

  mins= [d3.format("d")(min_dur_scale),d3.format("d")(min_key_scale),d3.format("d")(min_loud_scale),d3.format("d")(min_tempo_scale),
         d3.format("d")(min_word_scale),d3.format(".2g")(min_energy_scale),d3.format(".2g")(min_acousticness_scale),
         d3.format(".2g")(min_danceability_scale),d3.format(".2g")(min_liveness_scale), d3.format(".2g")(min_speechiness_scale),
         d3.format(".2g")(min_valence_scale),d3.format(".2g")(min_lex_complexity_scale)]

  maxs= [d3.format("d")(max_dur_scale),d3.format("d")(max_key_scale),d3.format("d")(max_loud_scale),d3.format("d")(max_tempo_scale),
         d3.format("d")(max_word_scale),d3.format(".2g")(max_energy_scale),d3.format(".2g")(max_acousticness_scale),
         d3.format(".2g")(max_danceability_scale),d3.format(".2g")(max_liveness_scale), d3.format(".2g")(max_speechiness_scale),
         d3.format(".2g")(max_valence_scale),d3.format(".2g")(max_lex_complexity_scale)]

  var meds= []

  for(i=0;i<12;++i)
  {
    meds[i]= (parseFloat(maxs[i])+parseFloat(mins[i]))/2
  }
  

  meds[0] =  d3.format("d")(meds[0])
  meds[6] =  d3.format(".2g")(meds[6])
  meds[7] =  d3.format(".2g")(meds[7])
  meds[8] =  d3.format(".2g")(meds[8])

  meds[10] = d3.format(".2g")(meds[10])
  meds[11] = d3.format(".2g")(meds[11])

  data = [mins,meds,maxs]           
  return data;
}

function process_data_radial(data,full_data="radial")
{
  full_dataset = full_dataset_scatter;

  data = get_data_radial(data);

  min_dur_scale =  d3.min(full_dataset, function(d) { return d.duration_ms;})*0.7;
  max_dur_scale =  d3.max(full_dataset, function(d) { return d.duration_ms;});
  var dur_scale = d3.scaleLinear()
                      .domain([min_dur_scale,max_dur_scale])
                      .range([0,1]);

  min_key_scale = 0;
  max_key_scale =  d3.max(full_dataset, function(d) { return d.key;});
  var key_scale = d3.scaleLinear()
                    .domain([min_key_scale,max_key_scale])
                    .range([0,1]);

  min_loud_scale = d3.min(full_dataset, function(d) { return d.loudness;})
  max_loud_scale = d3.max(full_dataset, function(d) { return d.loudness;})
  var loud_scale = d3.scaleLinear()
                     .domain([min_loud_scale,max_loud_scale])
                     .range([0,1]);

  min_tempo_scale = d3.min(full_dataset, function(d) { return d.tempo;})
  max_tempo_scale = d3.max(full_dataset, function(d) { return d.tempo;})
  var tempo_scale = d3.scaleLinear()
                .domain([min_tempo_scale,max_tempo_scale])
                .range([0,1]);

  min_word_scale = 0
  max_word_scale = d3.max(full_dataset, function(d) { return d.word_count;})
  var word_scale = d3.scaleLinear()
              .domain([min_word_scale,max_word_scale])
              .range([0,1]);

  min_energy_scale = d3.min(full_dataset, function(d) { return d.energy;})*0.7
  max_energy_scale = d3.max(full_dataset, function(d) { return d.energy;})
  var energy_scale = d3.scaleLinear()
              .domain([min_energy_scale,max_energy_scale])
              .range([0,1]);

  min_acousticness_scale = 0
  max_acousticness_scale = 1
  var acousticness_scale = d3.scaleLinear()
              .domain([min_acousticness_scale,max_acousticness_scale])
              .range([0,1]);
  
  min_danceability_scale = 0
  max_danceability_scale = 1
  var danceability_scale = d3.scaleLinear()
              .domain([min_danceability_scale,max_danceability_scale])
              .range([0,1]);
  
  min_liveness_scale = 0
  max_liveness_scale = 1
  var liveness_scale = d3.scaleLinear()
              .domain([min_liveness_scale,max_liveness_scale])
              .range([0,1]);
  
  min_speechiness_scale = 0
  max_speechiness_scale = 0.7
  var speechiness_scale = d3.scaleLinear()
              .domain([min_speechiness_scale,max_speechiness_scale])
              .range([0,1]);
  
  min_valence_scale = 0
  max_valence_scale = 1
  var valence_scale = d3.scaleLinear()
              .domain([min_valence_scale,max_valence_scale])
              .range([0,1]);

  min_lex_complexity_scale = 0
  max_lex_complexity_scale = 1
  var lex_complexity_scale = d3.scaleLinear()
              .domain([min_lex_complexity_scale,max_lex_complexity_scale])
              .range([0,1]);


  data_processed=[
          dur_scale(data[0]),
          key_scale(data[1]),      
          loud_scale(data[2]),
          tempo_scale(data[3]),
          word_scale(data[4]),
          energy_scale(data[5]),
          acousticness_scale(data[6]),
          danceability_scale(data[7]),
          liveness_scale(data[8]),
          speechiness_scale(data[9]),
          valence_scale(data[10]),
          lex_complexity_scale(data[11]),
          ];

  return data_processed;
}



//Auxiliary Functions - Scatter Plot -----------------------------------------------------

function update_color_code()
{
  var new_color_code;

  var color_code_selected = {'country':'yellow',
                  'edm':'orange',
                  'pop':'green',
                  'rap':'#87CEFA',
                  'rock':'red',
                  'r&b':'violet',
                  'r-b':'violet',
                  'unknown':'brown'}

  if(selection_number==0)
  {
    new_color_code=color_code_selected;
  }
  else
  {
     new_color_code = {'rock':second_background,
              'pop':second_background,
              'rap':second_background,
              'edm':second_background,
              'country':second_background,
              'r&b':second_background,
              'unknown':second_background} 

    new_color_code[genre1] = color_code_selected[genre1]; 
    new_color_code[genre2] = color_code_selected[genre2];
  }

   return new_color_code; 
}

function removeDups(names) {
  let unique = {};
  names.forEach(function(i) {
    if(!unique[i]) {
      unique[i] = true;
    }
  });
  return Object.keys(unique);
}

function reorder_dataset()
{

  genres = ['country','edm','pop','rap','rock','r-b','unknown']

  if(selection_number==1)
  {
    genres.unshift(genre1)
  }
  else if(selection_number==2)
  {
    genres.unshift(genre2)
    genres.unshift(genre1)
  }

  genres = removeDups(genres)
  var data = [];

  for(i=0;i<7;++i)
  {
     data[i] = full_dataset_scatter.filter(function (a) { return a.broad_genre == genres[i]; });

  }

  dataset_scatter = data[6].concat(data[5],data[4],data[3],data[2],data[1],data[0]);

  return dataset_scatter;
}


//Auxiliary Functions - word cloud -----------------------------------------------------

function process_data_cloud()
{

  if(music==false){
    var data= []
    var genres = []

    if(selection_number==1){
      if(genre1=="none"){
        genres = [genre2,]
      } 
      else{
        genres = [genre1,]  
      }
      
    }
    if(selection_number==2){
      genres = [genre1,genre2]
    }

    n = genres.length;

    for(i=0;i<n;++i)
    {
      data1 = full_dataset_cloud.filter(function (a) { return a.broad_genre === genres[i]; });
      data1 = data1[0];
      data.push(data1)
    }

  }
  else{
    data = dataset_scatter.filter(function (a) { return (a.main_artist == main_artist) & (a.title == title); });
    n=1
    genres=[genre1,]

  }

    var text_dict= [];  

    for(j=0;j<n;++j)
    {
      var data_temp=data[j];
      var size = [];

      for (i = 1; i < 11; ++i) {
        var search_string = "top_"+selection_cloud+"_"+i;
        var search_string_f = search_string + "_f"
        var size1 =  data_temp[search_string_f]
        size.push(size1) 
      }

      var scale_size = d3.scaleLinear()
                     .domain([d3.min(size),
                               d3.max(size)])
                     .range([10,30]);

        for (i = 1; i < 11; i++) { 
          var search_string = "top_"+selection_cloud+"_"+i;
          var search_string_f = search_string + "_f"
          var info = {"x":pad_cloud+w_cloud/n*j,"y":(((h_cloud-5)-2*pad_cloud)*i)/10 + pad_cloud,
                      "text": data_temp[search_string],"size": scale_size(size[i-1]),
                      "real_size":size[i-1], 
                      "genre":genres[j]}
        
          text_dict.push(info)
        }
    }
  return text_dict;
}


//refresh visualizations-------------------------------------------------------------------------------

function refresh_radial(){
  
  if(music==false){
     if(genre1=="none") {
          data1_radial = [0,0,0,0,0,0,0,0,0,0,0,0];
          realdata1 = []
        }
        if(genre2=="none") {
          data2_radial = [0,0,0,0,0,0,0,0,0,0,0,0];
          realdata2 = []
        }

        if(selection_number==1)
        {
          if(genre1=="none"){
            data2_radial = full_dataset_radial.filter(function (a) { return a.broad_genre == genre2; });
            realdata2 = get_data_radial(data2_radial);   
            data2_radial = process_data_radial(data2_radial)    
          }
          else{
            data1_radial = full_dataset_radial.filter(function (a) { return a.broad_genre == genre1; });
            realdata1 = get_data_radial(data1_radial);
            data1_radial = process_data_radial(data1_radial)  

          }
        }
        else if(selection_number==2){
          data1_radial = full_dataset_radial.filter(function (a) { return a.broad_genre == genre1; });
          realdata1 = get_data_radial(data1_radial);
          data1_radial = process_data_radial(data1_radial)
          data2_radial = full_dataset_radial.filter(function (a) { return a.broad_genre == genre2; });
          realdata2 = get_data_radial(data2_radial); 
          data2_radial = process_data_radial(data2_radial)
        }

  }
  else{
    data2_radial=[0,0,0,0,0,0,0,0,0,0,0,0];
    realdata2 = [];

    data1_radial = dataset_scatter.filter(function (a) { return (a.main_artist == main_artist) & (a.title == title); });
    realdata1 = get_data_radial(data1_radial);   
    data1_radial = process_data_radial(data1_radial,"scatter")  
  }


  var i;
  var poly_points1 = []; 
  var dots_points1 = [];

  for (i = 0; i < dim; i++) { 
    var dict1 = {"x":w_rad/2+(rad_rad*data1_radial[i])*Math.sin(2*i*Math.PI/dim),
                 "y":h_rad/2-(rad_rad*data1_radial[i])*Math.cos(2*i*Math.PI/dim),
                 "value": realdata1[i]}

    poly_points1.push(dict1)
    dots_points1.push(dict1)

  }

  poly_points1.push({"x":w_rad/2,"y":h_rad/2-(rad_rad*data1_radial[0])})

  d3.selectAll("#circle1")
     .data(dots_points1)
     .transition()
     .duration(1000)
     .attr("r",5)
     .attr("fill",color_code[genre1])
     .attr("stroke", "grey")
     .attr("stroke-width", 1)
     .attr("cx",function(d) {
        return d.x;
     })
     .attr("cy",function(d) {
        return d.y;
     })

  d3.select("#path1")
     .transition()
     .duration(1000)
     .attr("d", lineFunction(poly_points1))
     .attr("stroke", color_code[genre1])
     .attr("stroke-width", 3)
     .attr("fill",color_code[genre1])
     .style("fill-opacity",0.4);

  
  radial_svg = d3.select("#svg_radial")

  refresh_radial_text();

  var i;
  var poly_points2 = []; 
  var dots_points2 = [];

  for (i = 0; i < dim; i++) { 
    var dict1 = {"x":w_rad/2+(rad_rad*data2_radial[i])*Math.sin(2*i*Math.PI/dim),
                 "y":h_rad/2-(rad_rad*data2_radial[i])*Math.cos(2*i*Math.PI/dim),
                 "value": realdata2[i]}

    poly_points2.push(dict1)
    dots_points2.push(dict1)
  }
  poly_points2.push({"x":w_rad/2,"y":h_rad/2-(rad_rad*data2_radial[0])})

d3.selectAll("#circle2")
   .data(dots_points2)
   .transition()
   .duration(1000)
   .attr("r",5)
   .attr("fill",color_code[genre2])
   .attr("stroke", "grey")
   .attr("stroke-width", 1)
   .attr("cx",function(d) {
      return d.x;
   })
   .attr("cy",function(d) {
      return d.y;
   })

d3.select("#path2")
   .transition()
   .duration(1000)
   .attr("d", lineFunction(poly_points2))
   .attr("stroke", color_code[genre2])
   .attr("stroke-width", 3)
   .attr("fill",color_code[genre2])
   .style("fill-opacity",0.4)

}

function refresh_radial_text(){
  d3.selectAll(".metrics_text")
  .attr("fill","white")

  varx_temp = varx
  vary_temp = vary
  if(varx_temp=="speechiness"){varx_temp="speech"}
  if(vary_temp=="speechiness"){vary_temp="speech"}
  if(varx_temp=="duration_ms"){varx_temp="duration"}
  if(vary_temp=="duration_ms"){vary_temp="duration"}

  d3.select("#metrics_text_"+ varx_temp)
    .attr("fill","#969bcc")

  d3.select("#metrics_text_"+ vary_temp)
    .attr("fill","#d19790")
}

function refresh_color_scatter(){

  dataset_scatter = reorder_dataset()
  var new_color_code = update_color_code()

  d3.selectAll("#circle_scatter_points")
     .transition()
     .duration(1000)
     .attr("fill",function(d) {return new_color_code[d.broad_genre];})
}

function refresh_cloud(){

  if ((selection_number==0) & (music==false))
  {
      word_cloud_svg = d3.select("#word_cloud_svg")
      word_cloud_svg.selectAll("text")
     .remove();
  }
  else{
    refresh_cloud2(main_artist,title);
  }

}

function refresh_cloud2(){

  var textData = process_data_cloud(main_artist,title)

  word_cloud_svg = d3.select("#word_cloud_svg")
  word_cloud_svg.selectAll("text")
     .remove()

  var scale_size = d3.scaleLinear()
                     .domain([d3.min(textData, function(d) { return d.size;}),
                               d3.max(textData, function(d) { return d.size;})])
                     .range([10,30]);

  //Add SVG Text Element Attributes

  var text = word_cloud_svg.selectAll("text")
                       .data(textData)
                       .enter()
                       .append("text")
                         .on("mousemove", function(d) {   
                        tooltip_cloud.transition()    
                            .duration(200)    
                            .style("opacity", .9);    
                            tooltip_cloud.html("frequency: " + d.real_size)
                           .style("left", (d3.event.pageX) + "px")   
                           .style("top", (d3.event.pageY - 28) + "px");  
                        })          
                  .on("mouseout", function(d) {   
                        tooltip_cloud.transition()    
                            .duration(500)    
                            .style("opacity", 0)});


  var textLabels = text
                   .attr("x", function(d) { return d.x; })
                   .attr("y", function(d) { return d.y; })
                   .text( function (d) { return d.text; })
                   .attr("font-family", "calibri, arial, sans serif")
                   .attr("font-size", function(d) { return scale_size(d.size); })
                   .attr("fill", second_background)


  textLabels.transition()
            .duration(1000)
            .attr("fill",function(d) { return color_code[d.genre]; });
}


function refresh_scatter(){

  dataset_scatter    = reorder_dataset()
  color_code_new = update_color_code()

  var min_h = d3.min(dataset_scatter, function(d) { return d[vary];})
  var max_h = d3.max(dataset_scatter, function(d) { return d[vary];})

  var min_p = d3.min(dataset_scatter, function(d) { return d[varx];});
  var max_p = d3.max(dataset_scatter, function(d) { return d[varx];})

  hscaleaxis.domain([min_h,max_h])
  hscale.domain([min_h,max_h])
  xscaleaxis.domain([max_p,min_p])
  xscale.domain([max_p,min_p])
        
  xaxis.scale(xscaleaxis);

  var svg = d3.select("#scatter_svg")

  svg.selectAll("g.x.axis")
    .transition()
    .duration(1000)
        .call(xaxis);

  yaxis.scale(hscaleaxis);

  svg.select("g.y.axis")
     .transition()
     .duration(1000)
     .call(yaxis);

  svg.selectAll("circle")
    .transition()
    .duration(1000)
    .attr("cx",function(d) {
    return xscale(d[varx]);
    })
    .attr("cy",function(d) {
    return hscale(d[vary]);
    })

    refresh_radial_text()
}

function clear_heat(){

    d3.selectAll(".genre_buttons") 
    .style("fill", "grey")


  d3.selectAll(".heat_rect_country")
    .style("stroke-width",0);
      d3.selectAll(".heat_rect_edm")
    .style("stroke-width",0);
      d3.selectAll(".heat_rect_pop")
    .style("stroke-width",0);
      d3.selectAll(".heat_rect_rap")
    .style("stroke-width",0);
      d3.selectAll(".heat_rect_rock")
    .style("stroke-width",0);
      d3.selectAll(".heat_rect_r-b")
    .style("stroke-width",0);
          d3.selectAll(".heat_rect_unknown")
    .style("stroke-width",0);
}
function refresh_buttons(){


  if(genre1=="r&b"){genre1="r-b"}
  if(genre2=="r&b"){genre2="r-b"}

  clear_heat();

  if(selection_number>0){
    if(genre1=="none"){
      d3.select("#"+genre2+"_button")
        .style("fill", color_code[genre2])

      d3.selectAll(".heat_rect_"+genre2)
        .style("stroke-width",3)
        .style("stroke",color_code[genre2])

      if(selection_number==2){
        d3.select("#"+genre1+"_button")
          .style("fill", color_code[genre1])

        d3.selectAll(".heat_rect_"+genre1)
          .style("stroke-width",3)
          .style("stroke",color_code[genre1])
        }
    }
    else{
      d3.select("#"+genre1+"_button")
        .style("fill", color_code[genre1])  

      d3.selectAll(".heat_rect_"+genre1)
        .style("stroke-width",3)
        .style("stroke",color_code[genre1])

      if(selection_number==2){
        d3.select("#"+genre2+"_button")
        .style("fill", color_code[genre2])  

      d3.selectAll(".heat_rect_"+genre2)
        .style("stroke-width",3)
        .style("stroke",color_code[genre2])
      }
    }
  }
  

  if(genre1=="r-b"){genre1="r&b"}
  if(genre2=="r-b"){genre2="r&b"}

}

function refresh_info(type=""){
  var info = d3.select("#info")

  var text = ""
  if(music == true){
      text = "Showing " + title + " from " + main_artist
  }
  else if (type=="year_data"){
    text = "Showing " + genre1 +" for year " + year;
  }
  else{
    if(selection_number==0){
      text = ""
    }
    else if(selection_number==1){
      if(genre1!="none"){text = "Showing " + genre1}
      else{text = "Showing " + genre2}
    }
    else if(selection_number==2){
      text = "Comparing " + genre1 + " with " + genre2
    }
  }


  info.text(text)

}


function refresh_line(){

var svg = d3.select("#line_svg")

  var min_h = d3.min(dataset_heat, function(d) { return d[vary];})
  var max_h = d3.max(dataset_heat, function(d) { return d[vary];})

  hscaleaxis2.domain([min_h,max_h])
  hscale2.domain([min_h,max_h])


  yaxis.scale(hscaleaxis2);

  hscaleaxis2 = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_line-padding_line,20])


hscale2 = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_line-padding_line-gap_scatter,20])

  svg.select("g.y.axis")
     .transition()
     .duration(1000)
     .call(yaxis);

xscale2 = d3.scaleLinear()
        .domain([2018,1999])
        .range([w_line-padding_line/3,padding_line]);


if ((selection_number==0) | (music == true)) {
  svg.selectAll("#circle_line_points").remove()

    dataset_line1 = dataset_heat.filter(function (a) { return (a.broad_genre == "country") })
    dataset_line2 = dataset_heat.filter(function (a) { return (a.broad_genre ==  "edm") })
    dataset_line3 = dataset_heat.filter(function (a) { return (a.broad_genre == "pop") })
    dataset_line4 = dataset_heat.filter(function (a) { return (a.broad_genre == "rap") })
    dataset_line5 = dataset_heat.filter(function (a) { return (a.broad_genre == "rock") })
    dataset_line6 = dataset_heat.filter(function (a) { return (a.broad_genre == "r&b") })
    dataset_line7 = dataset_heat.filter(function (a) { return (a.broad_genre == "unknown") })

          var lineData1 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line1[i].year,"y":dataset_line1[i][vary]}
            lineData1.push(dict)
          }

          var lineData2 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line2[i].year,"y":dataset_line2[i][vary]}
            lineData2.push(dict)
          }

          var lineData3 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line3[i].year,"y":dataset_line3[i][vary]}
            lineData3.push(dict)
          }

          var lineData4 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line4[i].year,"y":dataset_line4[i][vary]}
            lineData4.push(dict)
          }

          var lineData5 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line5[i].year,"y":dataset_line5[i][vary]}
            lineData5.push(dict)
          }

          var lineData6 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line6[i].year,"y":dataset_line6[i][vary]}
            lineData6.push(dict)
          }

          var lineData7 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line7[i].year,"y":dataset_line7[i][vary]}
            lineData7.push(dict)
          }


          lineFunction_linear1 = d3.line()
                         .x(function(d) { return xscale2(d.x); })
                         .y(function(d) { return hscale2(d.y); })
                         .curve(d3.curveCardinal);

          d3.select("#line_path_1")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData1))
            .attr("stroke", color_code["country"])


          lineFunction_linear2 = d3.line()
                         .x(function(d) { return xscale2(d.x); })
                         .y(function(d) { return hscale2(d.y); })
                         .curve(d3.curveCardinal);

          d3.select("#line_path_2")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear2(lineData2))
            .attr("stroke", color_code["edm"])


          d3.select("#line_path_3")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData3))
            .attr("stroke", color_code["pop"])

          d3.select("#line_path_4")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear2(lineData4))
            .attr("stroke", color_code["rap"])

          d3.select("#line_path_5")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData5))
            .attr("stroke", color_code["rock"])

          d3.select("#line_path_6")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear2(lineData6))
            .attr("stroke", color_code["r&b"])

          d3.select("#line_path_7")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData7))
            .attr("stroke", color_code["unknown"])

        svg.selectAll("#circle_line_points").remove()

        svg.selectAll("line_plot_points1")
        .data(dataset_heat)
        .enter().append("circle")
        .attr("r",function(d) {return 3;})
        .attr("stroke", "gray")
        .attr("fill",function(d) {color_code[d.broad_genre];})
        .attr("cx",function(d) {
        return xscale2(d.year);
        })
        .attr("cy",function(d) {
        return hscale2(d[vary]);
        })
        .attr("id","circle_line_points")
        .on("click", function(d) {
          music = false
          heat = false
          selection_number=1;
          genre1=d.broad_genre
          refresh_global()
        })    
        .on("mousemove", function(d) {   
        tooltip_line.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip_line.html("genre: "+ d.broad_genre + "<br/> year: " + d.year + "<br/>" +  vary+ ": "+ d3.format(".2f")(d[vary]))
           .style("left", (d3.event.pageX) + "px")   
           .style("top", (d3.event.pageY - 28) + "px");  
        })          
        .on("mouseout", function(d) {   
        tooltip_line.transition()    
            .duration(500)    
            .style("opacity", 0)});


}
else{

  if (selection_number==2) {
    dataset_line = dataset_heat.filter(function (a) { return (a.broad_genre == genre1) | (a.broad_genre == genre2) })
    dataset_line1 = dataset_heat.filter(function (a) { return (a.broad_genre == genre1) })
    dataset_line2 = dataset_heat.filter(function (a) { return (a.broad_genre == genre2) })
  }
  if (selection_number==1) {
    if(genre1=="none"){genre=genre2}
    if(genre2=="none"){genre=genre1}
    dataset_line1 = dataset_heat.filter(function (a) { return (a.broad_genre == genre) })}
           

            if(selection_number==1){

          var lineData1 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line1[i].year,"y":dataset_line1[i][vary]}
            lineData1.push(dict)
          }


          lineFunction_linear1 = d3.line()
                         .x(function(d) { return xscale2(d.x); })
                         .y(function(d) { return hscale2(d.y); })
                         .curve(d3.curveCardinal);

          d3.select("#line_path_1")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData1))
            .attr("stroke", color_code[genre])


          d3.select("#line_path_2")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_3")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_4")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_5")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_6")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_7")
            .transition()
            .duration(1000)
            .attr("opacity",0)

        svg.selectAll("#circle_line_points").remove()

        svg.selectAll("line_plot_points1")
        .data(dataset_line1)
        .enter().append("circle")
        .attr("r",function(d) {return 3;})
        .attr("stroke", "gray")
        .attr("fill",function(d) {color_code[d.broad_genre];})
        .attr("cx",function(d) {
        return xscale2(d.year);
        })
        .attr("cy",function(d) {
        return hscale2(d[vary]);
        })
        .attr("id","circle_line_points")
        .on("click", function(d) {
          music = false
          heat = false
          selection_number=0;
          genre2="none"
          genre1="none"
          refresh_global();
        })      
        .on("mousemove", function(d) {   
        tooltip_line.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip_line.html("genre: "+ d.broad_genre + "<br/> year: " + d.year + "<br/>" +  vary+ ": "+ d3.format(".2f")(d[vary]))
           .style("left", (d3.event.pageX) + "px")   
           .style("top", (d3.event.pageY - 28) + "px");  
        })          
  .on("mouseout", function(d) {   
        tooltip_line.transition()    
            .duration(500)    
            .style("opacity", 0)});




      }
    

      if(selection_number==2){

          var lineData1 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line1[i].year,"y":dataset_line1[i][vary]}
            lineData1.push(dict)
          }

          var lineData2 = []
          for (i=0;i<18;++i){
            var dict = {"x":dataset_line2[i].year,"y":dataset_line2[i][vary]}
            lineData2.push(dict)
          }

          lineFunction_linear1 = d3.line()
                         .x(function(d) { return xscale2(d.x); })
                         .y(function(d) { return hscale2(d.y); })
                         .curve(d3.curveCardinal);

          d3.select("#line_path_1")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear1(lineData1))
            .attr("stroke", color_code[genre1])

          lineFunction_linear2 = d3.line()
                         .x(function(d) { return xscale2(d.x); })
                         .y(function(d) { return hscale2(d.y); })
                         .curve(d3.curveCardinal);

          d3.select("#line_path_2")
            .transition()
            .duration(1000)
            .attr("opacity",1)
            .attr("d", lineFunction_linear2(lineData2))
            .attr("stroke", color_code[genre2])

          d3.select("#line_path_3")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_4")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_5")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_6")
            .transition()
            .duration(1000)
            .attr("opacity",0)

          d3.select("#line_path_7")
            .transition()
            .duration(1000)
            .attr("opacity",0)

        svg.selectAll("#circle_line_points").remove()

        svg.selectAll("line_plot_points1")
        .data(dataset_line)
        .enter().append("circle")
        .attr("r",function(d) {return 3;})
        .attr("stroke", "gray")
        .attr("fill",function(d) {color_code[d.broad_genre];})
        .attr("cx",function(d) {
        return xscale2(d.year);
        })
        .attr("cy",function(d) {
        return hscale2(d[vary]);
        })
        .attr("id","circle_line_points")
        .on("click", function(d) {
          music = false
          heat = false
          selection_number=1;
          if(genre1 == d.broad_genre){genre2="none"}
          else{genre1="none"}
          refresh_global();
        })  
        .on("mousemove", function(d) {   
        tooltip_line.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip_line.html("genre: "+ d.broad_genre + "<br/> year: " + d.year + "<br/>" +  vary+ ": "+ d3.format(".2f")(d[vary]))
           .style("left", (d3.event.pageX) + "px")   
           .style("top", (d3.event.pageY - 28) + "px");  
        })          
        .on("mouseout", function(d) {   
        tooltip_line.transition()    
            .duration(500)    
            .style("opacity", 0)});


      }


}
}

function refresh_global(){
    refresh_buttons(); 
    refresh_radial();
    refresh_color_scatter();
    refresh_cloud(); 
    refresh_info();
    refresh_line();
}

//radial_plot_visualization
function gen_vis_radial_plot() {

  //initial data
  data1_radial=[0,0,0,0,0,0,0,0,0,0,0,0];
  data2_radial=[0,0,0,0,0,0,0,0,0,0,0,0];


  var svg = d3.select("#radial_plot")
              .append("svg")
              .attr("width",w_rad)
              .attr("height",h_rad)
              .attr("id","svg_radial")

  //big background grey circle
  svg.append("circle")
     .attr("cx", w_rad/2)
     .attr("cy", h_rad/2)
     .attr("r", rad_rad)
     .attr("stroke","grey")
     .attr("stroke-width","1")
     .style("fill", second_background);

  //small backgorund grey circle
  svg.append("circle")
     .attr("cx", w_rad/2)
     .attr("cy", h_rad/2)
     .attr("r", rad_rad/2)
     .attr("stroke","grey")
     .attr("stroke-width","1")
     .style("fill", second_background)
     .attr("id","scatter_circles");


  var rscale = d3.scaleLinear()
           .domain([0,1])
           .range([rad_rad,0]);

  var raxis = d3.axisLeft()
          .scale(rscale)
          .tickValues([0.5,1]);


  //calculate positions for axis,dots and line for first data
  var i;
  var poly_points1 = []; 
  var dots_points1 = [];
  var axis_points = [];
  var metrics_text = []
  
  var maximums = get_maximums(full_dataset_radial)[2];
  var meds = get_maximums(full_dataset_radial)[1];

  metrics = ["duration","key","loudness","tempo","word_count","energy",
           "acousticness","danceability","liveness","speech","valence","lex_complexity"]

  for (i = 0; i < dim; i++) { 
    var dict1 = {"x":w_rad/2+(rad_rad*data1_radial[i])*Math.sin(2*i*Math.PI/dim),
                 "y":h_rad/2-(rad_rad*data1_radial[i])*Math.cos(2*i*Math.PI/dim),
                 "value": 0}

    var dict3 = {"x1":w_rad/2+(rad_rad+20)*Math.sin(2*i*Math.PI/dim),
                 "y1":h_rad/2-(rad_rad+20)*Math.cos(2*i*Math.PI/dim)}

    var dict4 = {"x":w_rad/2+(rad_rad+25)*Math.sin(2*i*Math.PI/dim),
                 "y":h_rad/2-(rad_rad+25)*Math.cos(2*i*Math.PI/dim),
                 "text": metrics[i]}

    var dict5 = {"x":w_rad/2+(rad_rad-10)*Math.sin(2*i*Math.PI/dim),
             "y":h_rad/2-(rad_rad-10)*Math.cos(2*i*Math.PI/dim),
             "text": maximums[i]}

    var dict6 = {"x":w_rad/2+(rad_rad/2)*Math.sin(2*i*Math.PI/dim),
         "y":h_rad/2-(rad_rad/2)*Math.cos(2*i*Math.PI/dim),
         "text": meds[i]}         


    axis_points.push(dict3)
    poly_points1.push(dict1)
    dots_points1.push(dict1)
    metrics_text.push(dict4)
    metrics_text.push(dict5)
    metrics_text.push(dict6)
  }

  poly_points1.push({"x":w_rad/2,"y":h_rad/2-(rad_rad*data1_radial[0])})


//create radial lines
svg.selectAll("line")
   .data(axis_points)
   .enter().append("line")
   .attr("x1",function(d) {
      return d.x1;
   })
   .attr("y1",function(d) {
      return d.y1;
   })
   .attr("x2",w_rad/2)
   .attr("y2",h_rad/2)
   .attr("stroke","grey")
   .attr("stroke-width", 1);

//add metrics text
var text = svg.selectAll("text")
                       .data(metrics_text)
                       .enter()
                       .append("text")

var textLabels = text
                 .attr("x", function(d) { return d.x; })
                 .attr("y", function(d) { return d.y; })
                 .text( function (d) { return d.text; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size",10)
                 .attr("fill","white")
                 .attr("class","metrics_text")
                 .attr("id",function (d) { return "metrics_text_" + d.text; });

refresh_radial_text();

//define line Function
lineFunction = d3.line()
                         .x(function(d) { return d.x; })
                         .y(function(d) { return d.y; })
                         .curve(d3.curveCardinal);

//create tooltip
 tooltip_radial = d3.select("body").append("div") 
    .attr("class", "tooltip_radial")       
    .style("opacity", 0);

  //same for second data
    var i;
    var poly_points2 = []; 
    var dots_points2 = [];

    for (i = 0; i < dim; i++) { 

    var dict2 = {"x":w_rad/2+(rad_rad*data2_radial[i])*Math.sin(2*i*Math.PI/dim),
                "y":h_rad/2-(rad_rad*data2_radial[i])*Math.cos(2*i*Math.PI/dim)}

    poly_points2.push(dict2)
    dots_points2.push(dict2)
    }
    poly_points2.push({"x":w_rad/2,"y":h_rad/2-(rad_rad*data2_radial[0])})



//plot paths
var lineGraph = svg.append("path")
                   .attr("d", lineFunction(poly_points1))
                   .attr("stroke", "grey")
                   .attr("stroke-width", 3)
                   .attr("fill","black")
                   .style("fill-opacity",0.4)
                   .attr("id","path1")

var lineGraph = svg.append("path")
             .attr("d", lineFunction(poly_points2))
             .attr("stroke", "grey")  
             .attr("stroke-width", 3)
             .attr("fill","black")
             .style("fill-opacity",0.4)
             .attr("id","path2")
//plot circles


  svg.selectAll("circle1")
     .data(dots_points1)
     .enter().append("circle")
     .attr("r",5)
     .attr("fill","black")
     .attr("stroke", "grey")
     .attr("stroke-width", 1)
     .attr("cx",function(d) {
        return d.x;
     })
     .attr("cy",function(d) {
        return d.y;
     })
     .on("mousemove", function(d) {   
            tooltip_radial.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip_radial.html(d3.format(".2f")(d.value))
               .style("left", (d3.event.pageX) + "px")   
               .style("top", (d3.event.pageY - 28) + "px");  
            })          
        .on("mouseout", function(d) {   
            tooltip_radial.transition()    
                .duration(500)    
                .style("opacity", 0)})
     .attr("id","circle1");


    svg.selectAll("circle2")
     .data(dots_points2)
     .enter().append("circle")
     .attr("r",5)
     .attr("fill","black")
     .attr("stroke", "grey")
     .attr("stroke-width", 1)
     .attr("cx",function(d) {
        return d.x;
           })
     .attr("cy",function(d) {
        return d.y;
           })
      .on("mousemove", function(d) {   
        tooltip_radial.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip_radial.html(d3.format(".2f")(d.value))
           .style("left", (d3.event.pageX) + "px")   
           .style("top", (d3.event.pageY - 28) + "px");  
        })          
    .on("mouseout", function(d) {   
        tooltip_radial.transition()    
            .duration(500)    
            .style("opacity", 0)})
     .attr("id","circle2")      

  d3.select("#path1")
    .on("click", function() {

    if(selection_number ==2){
    selection_number=1;
    genre2="none";  
    }
    else if(selection_number ==1)
    {
    selection_number=0;
    genre1="none"
    genre2="none";  
    }
    else if(music == true)
    {
      music = false
    }

    refresh_global();

  })

  d3.select("#path2")
    .on("click", function() {
    if(selection_number ==2)
      {
      selection_number=1;
      genre1="none";
    }
    else if(selection_number==1)
    {
    selection_number=0;
    genre1="none"
    genre2="none";  
    }
    else if(music == true)
    {
      music = false
    }
    
    refresh_global();
  })

  //intereaction between radial plot and scatter plot
  text.on("click", function() {
    var_temp = this.innerHTML;
    if(var_temp=="speech"){var_temp="speechiness"}
    if(var_temp=="duration"){var_temp="duration_ms"}

    if(var_temp == varx){
      varx = vary
      d3.select("#selectx").property('value',varx)
    }
    else if(var_temp == vary){
      vary = varx
      d3.select("#selecty").property('value',vary) 
    }
    else if(varx==vary){
      varx=var_temp
      d3.select("#selectx").property('value',varx) 

    }
    else{
      vary=var_temp
      d3.select("#selecty").property('value',vary)
    }
    refresh_scatter();
    d3.select("#selectline").property('value',vary) 
    refresh_line();
  })

}


function gen_vis_scatter_plot() {


var svg = d3.select("#scatter_plot")
      .append("svg")
      .style("background-color", '#111211')
      .attr("width",w_scatter)
      .attr("height",h_scatter)
      .attr("id","scatter_svg"); 


var min_h = d3.min(dataset_scatter, function(d) { return d[vary];})
var max_h = d3.max(dataset_scatter, function(d) { return d[vary];})

var min_p = d3.min(dataset_scatter, function(d) { return d[varx];})
var max_p = d3.max(dataset_scatter, function(d) { return d[varx];})

hscaleaxis = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_scatter-padding_scatter,20])


hscale = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_scatter-padding_scatter-gap_scatter,20])

yaxis = d3.axisLeft()
        .scale(hscaleaxis)

 tooltip_scatter = d3.select("body").append("div") 
    .attr("class", "tooltip_scatter")       
    .style("opacity", 0);


svg.append("g")
   .attr("transform","translate("+padding_scatter +",0)")
   .style("color","#f4c7c6")
   .attr("class","y axis")
   .attr("id","scatter_axis")
   .call(yaxis);


xscaleaxis = d3.scaleLinear()
        .domain([max_p,min_p])
        .range([w_scatter-padding_scatter/3,padding_scatter]);


xscale = d3.scaleLinear()
        .domain([max_p,min_p])
        .range([w_scatter-padding_scatter/3,padding_scatter]);

xaxis = d3.axisLeft()
          .scale(xscaleaxis);

//create tooltip

svg.append("g")
  .attr("transform","translate(0," + (h_scatter-padding_scatter+1) + ") rotate(-90)")
  .style("color","#c3c7f4")
  .style("fill-opacity","white")
  .attr("class", "x axis")
  .attr("id","scatter_axis")
  .call(xaxis)

  //circle scatter size scle
  min_size = d3.min(dataset_scatter, function(d) { return d.frequency;})
  max_size = d3.max(dataset_scatter, function(d) { return d.frequency;})
  var circlesize_scale = d3.scaleLinear()
              .domain([min_size,max_size])
              .range([1,4]);

svg.selectAll("circle_scatter")
  .data(dataset_scatter)
  .enter().append("circle")
  .attr("r",function(d) {return circlesize_scale(d.frequency);})
  .attr("fill",function(d) {return color_code[d.broad_genre];})
  .attr("cx",function(d) {
  return xscale(d[varx]);
  })
  .attr("cy",function(d) {
  return hscale(d[vary]);
  })
  .attr("id","circle_scatter_points")
  .on("click", function(d){dispatch_genreChange_scatter.call("genreChange",d,d);})
  .on("mousemove", function(d) {   
        tooltip_scatter.transition()    
            .duration(200)    
            .style("opacity", .9);    
            tooltip_scatter.html(varx + ": " + d3.format(".2f")(d[varx]) + "; " + vary + ": " + d3.format(".2f")(d[vary]) + "<br/> artist: " + d.main_artist + "<br/>title: " + d.title)
           .style("left", (d3.event.pageX -200) + "px")   
           .style("top", (d3.event.pageY - 40) + "px");  
        })          
  .on("mouseout", function(d) {   
        tooltip_scatter.transition()    
            .duration(500)    
            .style("opacity", 0)});

d3.select("#selectx")
  .on("change", function() {
    selectValue = d3.select('#selectx').property('value')
    varx = selectValue
    refresh_scatter()
    refresh_line()
    d3.select("#selectline").property('value',vary) 

    });

d3.select("#selecty")
  .on("change", function() {
    selectValue = d3.select('#selecty').property('value')
    vary = selectValue
    refresh_scatter()
    refresh_line()
    d3.select("#selectline").property('value',vary) 

    });

}


function gen_vis_word_cloud() {


  //background svg
  var svg = d3.select("#word_cloud")
          .append("svg")
          .attr("width",w_cloud)
          .attr("height",h_cloud-60) 
          .attr("id","word_cloud_svg");

  //big background 
  svg.append("rect")
       .attr("x", 0)
       .attr("y", 0)
       .attr("width", w_cloud)
       .attr("height", h_cloud-60)
       .style("fill", second_background)
       .attr("id","box");

  tooltip_cloud = d3.select("body").append("div") 
                    .attr("class", "tooltip_cloud")       
                    .style("opacity", 0);

  refresh_cloud()

    d3.selectAll(".btnsel")
    .on("click", function() {

    if(music==false){
    d3.selectAll(".btnsel")
      .style("background-color","gray")

    d3.select("#"+this.id)
      .style("background-color","#211d19")

    selection_cloud = this.id;
    refresh_cloud();
    }


  })


}

function gen_vis_heat_map() {


  //background svg
  var svg = d3.select("#heat_map")
          .append("svg")
          .attr("width",w_heat)
          .attr("height",h_heat) 
          .attr("id","heat_map_svg");

 genres = ["","country","edm","pop","rap","rock","r-b","unknown"]
 genres2 = ["","country","edm","pop","rap","rock","r&b","unknown"]
 genre_text = ["","country","edm","pop","rap","rock","r&b","unkn"]

//genre buttons
  var genre_buttons = []
  for (i = 1; i < 8; i++) { 
    var dict = {"x":0, "y": h_heat/8*i, "genre": genres[i],"text": genre_text[i]}
    genre_buttons.push(dict)
  }


  svg.selectAll("genre_rect")
     .data(genre_buttons)
     .enter()
     .append("rect")
     .attr("x",function(d) { return d.x; })
     .attr("y",function(d) { return d.y+3; })
     .attr("width",2*w_heat/20-1)
     .attr("height",h_heat/8-3)
     .style("fill",function(d) { return "grey"; })
     .attr("id",   function(d) { return d.genre +"_button"; })
     .attr("class","genre_buttons")
     .on("click",  function(d){dispatch_genreChange.call("genreChange",d,d);});

//year buttons
  years = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17"]

  var year_buttons = []
  for (i = 2; i < 20; i++) { 
    var dict = {"x":i*w_heat/20, "y": 0, "year": years[i-2]}
    year_buttons.push(dict)
  }

  svg.selectAll("year_rec")
     .data(year_buttons)
     .enter()
     .append("rect")
     .attr("x",function(d) { return d.x+3; })
     .attr("y",function(d) { return d.y+15; })
     .attr("width", w_heat/20-3)
     .attr("height",20)
     .style("fill",function(d) { return "grey"; })
     .attr("id",   function(d) { return d.year +"_button"; })
     .attr("class","year_buttons")


//heat map rectangles

 tooltip_heat = d3.select("body").append("div") 
    .attr("class", "tooltip_heat")       
    .style("opacity", 0);

  var heat_map_rects = []

  for (i = 1; i < 8; i++) { 
    for(j=1; j< 19;j++){
      data = dataset_heat.filter(function (a) { return ((a.broad_genre == genres2[i]) & (a.year == 2000+j-1)) ; });
      data = data[0];
      var dict = {"x":(j+1)*w_heat/20, "y": h_heat/8*i, "genre": genres[i],"percentage": data["percentage"], "year": 2000+j-1}
      heat_map_rects.push(dict)
    }
  }

  var cscale = d3.scaleLinear()
        .domain([d3.min(dataset_heat, function(d) { return d.percentage;}),
                 d3.max(dataset_heat, function(d) { return d.percentage;})])
        .range(["#343638","#9fa3a8"]);  



    svg.selectAll("heat_rect")
     .data(heat_map_rects)
     .enter()
     .append("rect")
     .attr("x",function(d) { return d.x+3; })
     .attr("y",function(d) { return d.y+3; })
     .attr("width", w_heat/20-3)
     .attr("height",h_heat/8-3)
     .style("fill",function(d) { return cscale(d.percentage); })
     .attr("class",function(d) { return "heat_rect_" + d.genre; })
     .attr("id", function(d) { return "heat_rect_" + d.genre + "_" + d.year; })
     .on("mousemove", function(d) {   
            tooltip_heat.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip_heat.html("percentage: " + d3.format(".1f")(d.percentage*100) + "%" )
               .style("left", (d3.event.pageX) + "px")   
               .style("top", (d3.event.pageY - 28) + "px");  
            })          
     .on("mouseout", function(d) {   
            tooltip_heat.transition()    
                .duration(500)    
                .style("opacity", 0)})
      .on("click",  function(d){dispatch_heat_rect.call("heat_rect",d,d);});

  //text


     var text = svg.selectAll("text1")
                       .data(genre_buttons)
                       .enter()
                       .append("text")

     var textLabels = text
                 .attr("x", function(d) { return d.x+2; })
                 .attr("y", function(d) { return d.y+25; })
                 .text( function (d) { return d.text; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size",12)
                 .attr("fill","white")
                 .on("click",  function(d){dispatch_genreChange.call("genreChange",d,d);});

     var text2 = svg.selectAll("text2")
                       .data(year_buttons)
                       .enter()
                       .append("text")

     var textLabels2 = text2
                 .attr("x", function(d) { return d.x+5; })
                 .attr("y", function(d) { return d.y+28; })
                 .text( function (d) { return d.year; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size",12)
                 .attr("fill","white")
}

function rel(){

text=["The purpose of this project is to analyze popular music on The Billboard Hot 100 chart (which ranks the top 100 songs of the week based on sales, radio airplay, and streaming activity), as we aim to understand how music hits are changing over time and how different music genres compare in terms of a wide variety of music features. The heatmap below displays the perentage of songs of given genre on a specific year on the Billboard Chart <br/> <br/> Suggestion: Click on two genres on the heatmap below to visualize information about those genres",
"Line Chart <br/> <br/> You can choose which metrics to visualize over time using the selection box below. <br/> <br/> This idiom is useful to detect trends, for instance, you can see that rap songs are getting less energetic or that rock songs are getting more positive (higher valence) <br/> <br/> Suggestion: click on a point in a given curve to select the corresponding genre - the information on the radial chart and word cloud will be updated",
"Radar Chart <br/> <br/> In this radar chart the studied metrics are displayed in the radial axes. For the genres or music selected paths are created which allow to compare all music metrics at once. The metrics displayed are duration (min), key, loudness (in dB), tempo, word count, energy, acousticness, danceability, liveness, speechiness (measures the prencense of human voices), valence (measures the mood of a song, higher values means happier song) and Lexical Complexity (complexity of the lyrics)",
"Scatter Plot <br/> <br/> This idiom is useful to find correlations (or not) between different music metrics and to detect outlier songs <br/> <br/> You can select which metrics are displayed on the x and y axis. You can visualize that more energetic songs are louder <br/> <br/> Suggestion:  Click on the bubble and information about the corresponding song will be displayed on the radial chart and word cloud ",
"Word Cloud <br/> <br/> This idiom displays the top words, artists and hits of the selected genres or just the top words if a music is selected <br/> <br/> Click on the buttons to select what you want see. The text size scales proportional to how many times a given word appear on the lyrics, and how many times a given artists or hit appears on the chart. <br/> <br/> Suggestion: If you hover the mouse on top of the text you can see the frequency"]


 var tooltip2_main = d3.select("body").append("div") 
    .attr("class", "tooltip2")       
    .style("opacity", 0);

  d3.select("#info_title")
    .on("mousemove", function(d) {   
            tooltip2_main.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip2_main.html(text[0])
               .style("left", (d3.event.pageX-250) + "px")   
               .style("top", (d3.event.pageY ) + "px");  
            })          
    .on("mouseout", function(d) {   
            tooltip2_main.transition()    
                .duration(500)    
                .style("opacity", 0)})


 var tooltip2_line = d3.select("body").append("div") 
    .attr("class", "tooltip2")       
    .style("opacity", 0);

  d3.select("#info_line")
    .on("mousemove", function(d) {   
            tooltip2_line.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip2_line.html(text[1])
               .style("left", (d3.event.pageX-250) + "px")   
               .style("top", (d3.event.pageY ) + "px");  
            })          
    .on("mouseout", function(d) {   
            tooltip2_line.transition()    
                .duration(500)    
                .style("opacity", 0)})


 var tooltip2_radial = d3.select("body").append("div") 
    .attr("class", "tooltip2")       
    .style("opacity", 0);

  d3.select("#info_radial")
    .on("mousemove", function(d) {   
            tooltip2_radial.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip2_radial.html(text[2])
               .style("left", (d3.event.pageX-250) + "px")   
               .style("top", (d3.event.pageY ) + "px");  
            })          
    .on("mouseout", function(d) {   
            tooltip2_radial.transition()    
                .duration(500)    
                .style("opacity", 0)})

   var tooltip2_scatter = d3.select("body").append("div") 
                            .attr("class", "tooltip2")       
                            .style("opacity", 0);

  d3.select("#info_scatter")
    .on("mousemove", function(d) {   
            tooltip2_scatter.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip2_scatter.html(text[3])
               .style("left", (d3.event.pageX-250) + "px")   
               .style("top", (d3.event.pageY ) + "px");  
            })          
    .on("mouseout", function(d) {   
            tooltip2_scatter.transition()    
                .duration(500)    
                .style("opacity", 0)})

     var tooltip2_cloud = d3.select("body").append("div") 
                            .attr("class", "tooltip2")       
                            .style("opacity", 0);

  d3.select("#info_cloud")
    .on("mousemove", function(d) {   
            tooltip2_cloud.transition()    
                .duration(200)    
                .style("opacity", .9);    
            tooltip2_cloud.html(text[4])
               .style("left", (d3.event.pageX-250) + "px")   
               .style("top", (d3.event.pageY) + "px");  
            })          
    .on("mouseout", function(d) {   
            tooltip2_cloud.transition()    
                .duration(500)    
                .style("opacity", 0)})

}

function gen_line_chart(){


var svg = d3.select("#line_chart")
      .append("svg")
      .style("background-color", '#111211')
      .attr("width",w_line)
      .attr("height",h_line)
      .attr("id","line_svg"); 


var min_h = d3.min(dataset_heat, function(d) { return d[vary];})
var max_h = d3.max(dataset_heat, function(d) { return d[vary];})

var min_p = 1999
var max_p = 2018

hscaleaxis2 = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_line-padding_line,20])


hscale2 = d3.scaleLinear()
        .domain([min_h,max_h])
        .range([h_line-padding_line-gap_scatter,20])

yaxis = d3.axisLeft()
        .scale(hscaleaxis2)

 tooltip_line = d3.select("body").append("div") 
    .attr("class", "tooltip_line")       
    .style("opacity", 0);


svg.append("g")
   .attr("transform","translate("+padding_line +",0)")
   .style("color","#f4c7c6")
   .attr("class","y axis")
   .attr("id","line_axis")
   .call(yaxis);


xscaleaxis2 = d3.scaleLinear()
        .domain([max_p,min_p])
        .range([w_line-padding_line/3,padding_line]);


xscale2 = d3.scaleLinear()
        .domain([max_p,min_p])
        .range([w_line-padding_line/3,padding_line]);

xaxis = d3.axisLeft()
          .tickFormat(d3.format("d"))
          .scale(xscaleaxis2);

//create tooltip

svg.append("g")
  .attr("transform","translate(0," + (h_line-padding_scatter+1) + ") rotate(-90)")
  .style("color","#c3c7f4")
  .style("fill-opacity","white")
  .attr("class", "x axis")
  .attr("id","line_axis")
  .call(xaxis)
  .selectAll("text")  
  .attr("dx", "+1.5em")
  .attr("dy", "+1.5em")
  .attr("transform", "rotate(90)");

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)
             .attr("id","line_path_1")

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
              .attr("stroke-width",2)
             .attr("id","line_path_2");

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)             
             .attr("id","line_path_3");

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)             
             .attr("id","line_path_4");

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)
             .attr("id","line_path_5");

  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)
             .attr("id","line_path_6");


  var lineGraph = svg.append("path")
             .attr("opacity",0)
             .attr("fill", "none")
             .attr("stroke-width",2)
             .attr("id","line_path_7");

refresh_line();

d3.select("#selectline")
  .on("change", function() {
    selectValue = d3.select('#selectline').property('value')
    vary = selectValue
    d3.select("#selecty").property('value',vary)
    refresh_global()
    refresh_scatter()
    });


}
