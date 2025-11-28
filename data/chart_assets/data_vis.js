// Load the data
const ridership = d3.csv("data/data/processed_ridership_delay.csv");  // Add data/ prefix

ridership.then(function(data){
    // Convert string values to numbers
    data.forEach(function(d){
        d.delay_minutes = +d.delay_minutes;
    });


    // Aggregate total delay by station
    const delayByStation = d3.rollup(
        data,
        v => d3.sum(v, d => d.delay_minutes),
        d => d.stop_name
    );

     // Convert to array and sort
     const aggregated = Array.from(delayByStation, ([stop_name, total_delay]) => ({
        stop_name,
        total_delay
    })).sort((a, b) => b.total_delay - a.total_delay);

    // Define the dimensions and margins for the SVG
    let width = 600,
        height = 400;

    let margin = {
        top: 40,
        bottom: 100,  
        left: 60,    
        right: 30
    };

    // Create the SVG container
    let svg = d3
        .select('#tab5 .visualization-area')  
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', '#ffffff');

    // Set up scales for x and y axes
    let yScale = d3.scaleLinear()
    .domain([
        d3.min(aggregated, d => d.total_delay),  
        d3.max(aggregated, d => d.total_delay)
    ])
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
        .domain(aggregated.map(d => d.stop_name))  
        .range([margin.left, width - margin.right])
        .padding(0.5);

    // Add bars
    svg.selectAll('.bar')
        .data(aggregated)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.stop_name))
        .attr('y', d => d.total_delay >= 0 ? yScale(d.total_delay) : yScale(0))  
        .attr('width', xScale.bandwidth())
        .attr('height', d => Math.abs(yScale(d.total_delay) - yScale(0))) 
        .attr('fill', d => d.total_delay >= 0 ? 'orange' : 'steelblue'); 

    // Add x-axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)  
        .call(d3.axisBottom(xScale))  
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    // Add y-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`) 
        .call(d3.axisLeft(yScale)); 
    
    // Add labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 5) 
        .style('text-anchor', 'middle')
        .text('Station');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15) 
        .style('text-anchor', 'middle')
        .text('Total Delay (minutes)');
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 20)  
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .text('Total Delay Time by Station');
});