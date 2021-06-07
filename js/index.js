const width = 1000;
const barWidth = 500;
const height = 500;
const margin = 30;

const yearLable = d3.select('#year');
const countryName = d3.select('#country-name');

const barChart = d3.select('#bar-chart')
            .attr('width', barWidth)
            .attr('height', height);

const scatterPlot  = d3.select('#scatter-plot')
            .attr('width', width)
            .attr('height', height);

const lineChart = d3.select('#line-chart')
            .attr('width', width)
            .attr('height', height);

let xParam = 'fertility-rate';
let yParam = 'child-mortality';
let rParam = 'gdp';
let year = '2000';
let param = 'child-mortality';
let lineParam = 'gdp';
let highlighted = '';
let selected;

const x = d3.scaleLinear().range([margin*2, width-margin]);
const y = d3.scaleLinear().range([height-margin, margin]);

const xBar = d3.scaleBand().range([margin*2, barWidth-margin]).padding(0.1);
const yBar = d3.scaleLinear().range([height-margin, margin])

const xAxis = scatterPlot.append('g').attr('transform', `translate(0, ${height-margin})`);
const yAxis = scatterPlot.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xLineAxis = lineChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yLineAxis = lineChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const xBarAxis = barChart.append('g').attr('transform', `translate(0, ${height-margin})`);
const yBarAxis = barChart.append('g').attr('transform', `translate(${margin*2}, 0)`);

const colorScale = d3.scaleOrdinal().range(['#DD4949', '#39CDA1', '#FD710C', '#A14BE5']);
const radiusScale = d3.scaleSqrt().range([10, 30]);

loadData().then(data => {

    colorScale.domain(d3.set(data.map(d=>d.region)).values());

    d3.select('#range').on('change', function(){ 
        year = d3.select(this).property('value');
        yearLable.html(year);
        updateScattePlot();
        updateBar();
    });

    d3.select('#radius').on('change', function(){ 
        rParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#x').on('change', function(){ 
        xParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#y').on('change', function(){ 
        yParam = d3.select(this).property('value');
        updateScattePlot();
    });

    d3.select('#param').on('change', function(){ 
        param = d3.select(this).property('value');
        updateBar();
    });

    d3.select('#p').on('change', function(){
        lineParam = d3.select(this).property('value');
        updateLinear();
    })

    function updateBar(){
        // task 3
        console.log(data)
        reg = d3.map(data, d => d['region']).keys();
        average = reg.map(
            region => d3.mean(
                    data.filter(d => d['region'] == region)
                        .flatMap(d => d[param][year])
            )
        );

        let averagereg = [];
        reg.forEach((key, i) => {let k= {"region": key, "mean": average[i]};
            averagereg.push(k);
        });

        console.log(averagereg)
        console.log(average)
        console.log(reg)

        xBar.domain(reg);
        yBar.domain([0,d3.max(average)]).range([height, 0]);
        xBarAxis.call(d3.axisBottom(xBar));
        yBarAxis.call(d3.axisLeft(yBar));

        barChart.selectAll('rect').remove()
        barChart.selectAll('rect').data(averagereg)
            .enter()
            .append('rect')
            .attr('width',xBar.bandwidth())
            .attr('height',d => height - yBar(d['mean']))
            .attr('x',d => xBar(d['region']))
            .attr('y',d => yBar(d['mean']) - margin)
            .attr('fill',d => colorScale(d['region']));

        // task 4
        d3.selectAll('rect').on('click', function (actual) {
            if (highlighted != this){
                d3.selectAll('rect').attr('opacity', 0.7);
                d3.select(this).attr('opacity', 1);
                updateScattePlot();
                d3.selectAll('circle').style('opacity', 0);
                d3.selectAll('circle').filter(d => d['region'] == actual.region).style('opacity', 1);
                highlighted = this;}
            else {
                d3.selectAll('rect').attr('r', 1);
                updateScattePlot();}
        })

            return;
    }

    function updateScattePlot(){
        //task 1,2
        let xRange = data.map(d => +d[xParam][year]);
        x.domain([d3.min(xRange), d3.max(xRange)]);

        let yRange = data.map(d => +d[yParam][year]);
        y.domain([d3.min(yRange), d3.max(yRange)]);

        let rRange = data.map(d => +d[rParam][year]);
        radiusScale.domain([d3.min(rRange), d3.max(rRange)]);

        xAxis.call(d3.axisBottom(x));
        yAxis.call(d3.axisLeft(y));

        scatterPlot.selectAll('circle').remove()
        scatterPlot.selectAll('circle')
            .data(data)
            .enter().append('circle')
            .attr("cx", d => x(d[xParam][year]))
            .attr("cy", d => y(d[yParam][year]))
            .attr("r", d => radiusScale(d[rParam][year]))
            .attr("fill", d => colorScale(d['region']))


        // task 5
        scatterPlot.selectAll('circle').on('click', function (actual, i) {
            d3.selectAll('circle').attr('stroke-width', 'default');
            d3.select(this).attr('stroke-width', 3);
            selected = actual['country'];
            updateLinear();
        })

        return;
    }

    function updateLinear(){
        if (selected != null){
            d3.select('.country-name').text(selected);
            let tmp = data.filter(d => d['country'] == selected)
                    .map(d => d[lineParam])[0];

            let datecountry = [];
            for (let i = 1800; i< 2021; i++)
                datecountry.push({"year": i, "value": parseFloat(tmp[i])})
            datecountry.splice(2021-1800, 5);

            let xRange = d3.range(1800, 2021);
            let yRange = d3.values(tmp).map(d => +d);
            x.domain([d3.min(xRange), d3.max(xRange)]);
            y.domain([d3.min(yRange), d3.max(yRange)]);
            xLineAxis.call(d3.axisBottom(x));
            yLineAxis.call(d3.axisLeft(y));

            lineChart.append('path')
                .attr('class', 'line')
                .datum(datecountry)
                .enter()
                .append('path');

            lineChart.selectAll('.line')
                .datum(datecountry)
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 4)
                .attr("d", d3.line()
                        .x(d => x(d.year))
                        .y(d => y(d.value))
                );
        }

        return;
    }

    updateBar();
    updateScattePlot();
});


async function loadData() {
    const data = { 
        'population': await d3.csv('data/population.csv'),
        'gdp': await d3.csv('data/gdp.csv'),
        'child-mortality': await d3.csv('data/cmu5.csv'),
        'life-expectancy': await d3.csv('data/life_expectancy.csv'),
        'fertility-rate': await d3.csv('data/fertility-rate.csv')
    };
    
    return data.population.map(d=>{
        const index = data.gdp.findIndex(item => item.geo == d.geo);
        return  {
            country: d.country,
            geo: d.geo,
            region: d.region,
            population: d,
            'gdp': data['gdp'][index],
            'child-mortality': data['child-mortality'][index],
            'life-expectancy': data['life-expectancy'][index],
            'fertility-rate': data['fertility-rate'][index]
        }
    })
}