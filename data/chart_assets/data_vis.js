// Load the data
const ridership = d3.csv("data/data/processed_ridership_delay.csv");

ridership.then(function(data){
    // Convert string values to numbers
    data.forEach(function(d){
        d.delay_minutes = +d.delay_minutes;
    });

    // Aggregate total delay by station and direction
    const delayByStationDirection = d3.rollup(
        data,
        v => d3.sum(v, d => d.delay_minutes),
        d => d.stop_name,
        d => d.direction
    );

    // Convert to array format
    const aggregated = [];
    delayByStationDirection.forEach((directions, stop_name) => {
        const nb_delay = directions.get('NB') || 0;
        const sb_delay = directions.get('SB') || 0;
        aggregated.push({
            stop_name,
            nb_delay,
            sb_delay,
            total_delay: nb_delay + sb_delay
        });
    });

    // Sort by total delay
    aggregated.sort((a, b) => b.total_delay - a.total_delay);

    // Define the dimensions and margins for the SVG
    let width = 800,
        height = 500;

    let margin = {
        top: 60,
        bottom: 150,  
        left: 80,    
        right: 150
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
            d3.min(aggregated, d => Math.min(d.nb_delay, d.sb_delay)) - 5,
            d3.max(aggregated, d => Math.max(d.nb_delay, d.sb_delay)) + 5
        ])
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleBand()
        .domain(aggregated.map(d => d.stop_name))  
        .range([margin.left, width - margin.right])
        .padding(0.2);

    // Add a sub-scale for the two bars (NB and SB)
    let xSubScale = d3.scaleBand()
        .domain(['NB', 'SB'])
        .range([0, xScale.bandwidth()])
        .padding(0.05);

    // Add NB bars
    svg.selectAll('.bar-nb')
        .data(aggregated)
        .enter()
        .append('rect')
        .attr('class', 'bar-nb')
        .attr('x', d => xScale(d.stop_name) + xSubScale('NB'))
        .attr('y', d => d.nb_delay >= 0 ? yScale(d.nb_delay) : yScale(0))
        .attr('width', xSubScale.bandwidth())
        .attr('height', d => Math.abs(yScale(d.nb_delay) - yScale(0)))
        .attr('fill', '#FF6B00');  // Orange for Northbound

    // Add SB bars
    svg.selectAll('.bar-sb')
        .data(aggregated)
        .enter()
        .append('rect')
        .attr('class', 'bar-sb')
        .attr('x', d => xScale(d.stop_name) + xSubScale('SB'))
        .attr('y', d => d.sb_delay >= 0 ? yScale(d.sb_delay) : yScale(0))
        .attr('width', xSubScale.bandwidth())
        .attr('height', d => Math.abs(yScale(d.sb_delay) - yScale(0)))
        .attr('fill', '#2196F3');  // Blue for Southbound

    // Add x-axis at zero
    svg.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(d3.axisBottom(xScale))  
        .selectAll('text')
        .attr('transform', 'rotate(-90)')
        .attr('dx', '-0.8em')
        .attr('dy', '-0.5em')
        .style('text-anchor', 'end')
        .style('font-size', '10px');
    
    // Add y-axis
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`) 
        .call(d3.axisLeft(yScale)); 
    
    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', '#FF6B00');

    legend.append('text')
        .attr('x', 25)
        .attr('y', 14)
        .style('font-size', '13px')
        .text('Northbound (NB)');

    legend.append('rect')
        .attr('x', 0)
        .attr('y', 25)
        .attr('width', 18)
        .attr('height', 18)
        .attr('fill', '#2196F3');

    legend.append('text')
        .attr('x', 25)
        .attr('y', 39)
        .style('font-size', '13px')
        .text('Southbound (SB)');
    
    // Add labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10) 
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Station');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 20) 
        .style('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Total Delay (minutes)');
    
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 25)  
        .style('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', 'bold')
        .text('Total Delay Time by Station (by Direction)');
});